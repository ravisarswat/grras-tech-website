import React, { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, LogOut, Search } from "lucide-react";

const RAW_ENV = process.env.REACT_APP_BACKEND_URL
  || (typeof window !== "undefined" && window._env_ && window._env_.REACT_APP_BACKEND_URL)
  || "";

const BASE_URL = RAW_ENV.replace(/\/+$/, ""); // trim trailing slash

function normalizeBearer(token) {
  if (!token) return "";
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

function makeAuthHeaders(token) {
  const bearer = normalizeBearer(token);
  return {
    "Content-Type": "application/json",
    // try both — whichever your backend expects will work
    "Authorization": bearer,
    "x-admin-token": token,
  };
}

async function fetchWithFallback(pathList, token) {
  const headers = makeAuthHeaders(token);

  const errors = [];
  for (const path of pathList) {
    const url = `${BASE_URL}${path}`;
    try {
      const res = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include", // harmless if backend ignores cookies
      });

      if (res.status === 401 || res.status === 403) {
        // auth problem — bubble up immediately
        const text = await res.text().catch(() => "");
        throw Object.assign(new Error("unauthorized"), { code: res.status, body: text });
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        errors.push(`${res.status} @ ${path} => ${text.slice(0, 200)}`);
        continue;
      }

      const data = await res.json();
      // support {success, leads} or plain array
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.leads)) return data.leads;
      // some APIs: {success:true, data:[...]}
      if (data && Array.isArray(data.data)) return data.data;

      // unexpected shape — treat as error, but show once
      errors.push(`Unexpected payload @ ${path}`);
    } catch (e) {
      errors.push(`${e.code || e.name || "ERR"} @ ${path}: ${e.message}`);
      // for unauthorized we stop trying other paths
      if (e.message === "unauthorized" || e.code === 401 || e.code === 403) {
        throw e;
      }
    }
  }
  const err = new Error("All endpoints failed");
  err.details = errors;
  throw err;
}

function exportCSV(rows) {
  if (!rows || !rows.length) return;

  const keys = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r || {}).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );

  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
    };
  const csv = [
    keys.join(","),
    ...rows.map((r) => keys.map((k) => escape(r[k])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const SimpleLeadsManager = ({ token, onLogout }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const paths = useMemo(
    () => [
      "/api/leads",
      "/api/admin/leads",
      "/leads",
    ],
    []
  );

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      if (!BASE_URL) {
        throw new Error("REACT_APP_BACKEND_URL is empty/unset");
      }
      const data = await fetchWithFallback(paths, token);
      // newest first if there is createdAt/created_on
      data.sort((a, b) => {
        const aT = new Date(a.createdAt || a.created_on || a.created || a._created || 0).getTime();
        const bT = new Date(b.createdAt || b.created_on || b.created || b._created || 0).getTime();
        return bT - aT;
      });
      setLeads(data);
    } catch (e) {
      console.warn("Lead fetch failed:", e.details || e);
      if (e.message === "unauthorized" || e.code === 401 || e.code === 403) {
        setErr("Session expired / invalid token. Please login again.");
        // clean local token + kick back to login
        localStorage.removeItem("simple_admin_token");
        onLogout?.();
        return;
      }
      setErr(`Could not load leads. ${e.message}${e.details ? " • " + e.details.join(" | ") : ""}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    if (!q.trim()) return leads;
    const term = q.toLowerCase();
    return leads.filter((l) =>
      Object.values(l || {}).some((v) => String(v ?? "").toLowerCase().includes(term))
    );
  }, [leads, q]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Leads</h1>
            <p className="text-sm text-gray-500">
              Backend: <code>{BASE_URL || "(not set)"}</code>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportCSV(filtered)}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700"
              disabled={!filtered.length}
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => { localStorage.removeItem("simple_admin_token"); onLogout?.(); }}
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Search leads by name, email, phone, course..."
            />
          </div>
          <div className="text-sm text-gray-500">{filtered.length} of {leads.length}</div>
        </div>

        {err && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm whitespace-pre-wrap">
            {err}
          </div>
        )}

        <div className="grid gap-3">
          {loading ? (
            <div className="p-6 bg-white rounded-lg shadow">Loading…</div>
          ) : !filtered.length ? (
            <div className="p-6 bg-white rounded-lg shadow">No leads found.</div>
          ) : (
            filtered.map((l, idx) => (
              <div key={l.id || l._id || idx} className="p-4 bg-white rounded-lg shadow border border-gray-100">
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <div><span className="font-semibold">Name:</span> {l.name || "-"}</div>
                  <div><span className="font-semibold">Email:</span> {l.email || "-"}</div>
                  <div><span className="font-semibold">Phone:</span> {l.phone || l.mobile || "-"}</div>
                  <div><span className="font-semibold">Course:</span> {l.course || l.interest || "-"}</div>
                  <div><span className="font-semibold">Source:</span> {l.source || "-"}</div>
                  <div><span className="font-semibold">When:</span> {new Date(l.createdAt || l.created_on || l.created || Date.now()).toLocaleString()}</div>
                </div>
                {l.message && <div className="mt-2 text-gray-600 text-sm">{l.message}</div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleLeadsManager;
