import React, { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, LogOut, Search } from "lucide-react";

const RAW_ENV =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof window !== "undefined" && window._env_ && window._env_.REACT_APP_BACKEND_URL) ||
  "";

const BASE_URL = RAW_ENV.replace(/\/+$/, "");

function normalizeBearer(token) {
  if (!token) return "";
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

function makeAuthHeaders(token) {
  const bearer = normalizeBearer(token);
  return {
    "Content-Type": "application/json",
    Authorization: bearer,     // some backends expect this
    "x-admin-token": token,    // some backends expect this
  };
}

async function fetchWithFallback(paths, token) {
  const headers = makeAuthHeaders(token);
  const errors = [];

  for (const path of paths) {
    const url = `${BASE_URL}${path}`;
    try {
      const res = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        const text = await res.text().catch(() => "");
        throw Object.assign(new Error("unauthorized"), { code: res.status, body: text });
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        errors.push(`${res.status} @ ${path} => ${text.slice(0, 200)}`);
        continue;
      }

      const json = await res.json();
      if (Array.isArray(json)) return json;
      if (json && Array.isArray(json.leads)) return json.leads;
      if (json && Array.isArray(json.data)) return json.data;

      errors.push(`Unexpected payload @ ${path}`);
    } catch (e) {
      errors.push(`${e.code || e.name || "ERR"} @ ${path}: ${e.message}`);
      if (e.message === "unauthorized" || e.code === 401 || e.code === 403) throw e;
    }
  }

  const err = new Error("All endpoints failed");
  err.details = errors;
  throw err;
}

function exportCSV(rows) {
  if (!rows?.length) return;
  const cols = Array.from(
    rows.reduce((s, r) => {
      Object.keys(r || {}).forEach((k) => s.add(k));
      return s;
    }, new Set())
  );

  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };

  const csv = [
    cols.join(","),
    ...rows.map((r) => cols.map((c) => esc(r[c])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const PAGE_SIZES = [10, 20, 50, 100];

const SimpleLeadsManager = ({ token, onLogout }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [course, setCourse] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const endpoints = useMemo(() => ["/api/leads", "/api/admin/leads", "/leads"], []);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      if (!BASE_URL) throw new Error("REACT_APP_BACKEND_URL is empty/unset");
      const data = await fetchWithFallback(endpoints, token);

      // normalize dates to Date for sorting/filter
      const withParsed = data.map((l) => ({
        ...l,
        _ts: new Date(l.createdAt || l.created_on || l.created || l._created || 0).getTime(),
      }));

      // default sort: newest first
      withParsed.sort((a, b) => (b._ts || 0) - (a._ts || 0));
      setLeads(withParsed);
    } catch (e) {
      console.warn("Lead fetch failed:", e.details || e);
      if (e.message === "unauthorized" || e.code === 401 || e.code === 403) {
        setErr("Session expired / invalid token. Please login again.");
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

  // unique course list from loaded leads
  const courseOptions = useMemo(() => {
    const set = new Set();
    leads.forEach((l) => {
      const c = l.course || l.interest || l.category;
      if (c) set.add(String(c));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [leads]);

  // filtered + sorted
  const filtered = useMemo(() => {
    let rows = leads;

    if (course !== "all") {
      rows = rows.filter((l) => String(l.course || l.interest || l.category) === course);
    }
    if (dateFrom) {
      const from = new Date(dateFrom).setHours(0, 0, 0, 0);
      rows = rows.filter((l) => (l._ts || 0) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).setHours(23, 59, 59, 999);
      rows = rows.filter((l) => (l._ts || 0) <= to);
    }
    if (q.trim()) {
      const term = q.toLowerCase();
      rows = rows.filter((l) =>
        Object.values(l || {}).some((v) => String(v ?? "").toLowerCase().includes(term))
      );
    }

    switch (sort) {
      case "date_asc":
        rows = [...rows].sort((a, b) => (a._ts || 0) - (b._ts || 0));
        break;
      case "name_asc":
        rows = [...rows].sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""))
        );
        break;
      case "name_desc":
        rows = [...rows].sort((a, b) =>
          String(b.name || "").localeCompare(String(a.name || ""))
        );
        break;
      default: // date_desc
        rows = [...rows].sort((a, b) => (b._ts || 0) - (a._ts || 0));
    }

    return rows;
  }, [leads, course, dateFrom, dateTo, q, sort]);

  // pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIdx = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);

  useEffect(() => {
    // reset to first page on filters change
    setPage(1);
  }, [course, dateFrom, dateTo, q, sort, pageSize]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        {/* header row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Leads</h1>
            <p className="text-xs text-gray-500">
              Backend: <code>{BASE_URL || "(not set)"}</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV(filtered)}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
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
              onClick={() => {
                localStorage.removeItem("simple_admin_token");
                onLogout?.();
              }}
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Search leads by name, email, phone, course…"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Courses</option>
            {courseOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* sort + paging bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-2 py-1 rounded border border-gray-300"
            >
              <option value="date_desc">Date ↓ (newest)</option>
              <option value="date_asc">Date ↑ (oldest)</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
            </select>

            <span className="ml-4 text-gray-600">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 rounded border border-gray-300"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {filtered.length} filtered • page {currentPage}/{pageCount}
          </div>
        </div>

        {/* error */}
        {err && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm whitespace-pre-wrap">
            {err}
          </div>
        )}

        {/* list */}
        <div className="grid gap-3">
          {loading ? (
            <div className="p-6 bg-white rounded-lg shadow">Loading…</div>
          ) : !pageRows.length ? (
            <div className="p-6 bg-white rounded-lg shadow">No leads found.</div>
          ) : (
            pageRows.map((l, idx) => (
              <div key={l.id || l._id || idx} className="p-4 bg-white rounded-lg shadow border border-gray-100">
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <div><span className="font-semibold">Name:</span> {l.name || "-"}</div>
                  <div><span className="font-semibold">Email:</span> {l.email || "-"}</div>
                  <div><span className="font-semibold">Phone:</span> {l.phone || l.mobile || "-"}</div>
                  <div><span className="font-semibold">Course:</span> {l.course || l.interest || l.category || "-"}</div>
                  <div><span className="font-semibold">Source:</span> {l.source || "-"}</div>
                  <div><span className="font-semibold">When:</span> {new Date(l._ts || Date.now()).toLocaleString()}</div>
                </div>
                {l.message && <div className="mt-2 text-gray-600 text-sm">{l.message}</div>}
              </div>
            ))
          )}
        </div>

        {/* pagination controls */}
        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
            >
              « First
            </button>
            <button
              className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ‹ Prev
            </button>
            <span className="text-sm text-gray-600 px-2">Page {currentPage} of {pageCount}</span>
            <button
              className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
            >
              Next ›
            </button>
            <button
              className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage(pageCount)}
              disabled={currentPage === pageCount}
            >
              Last »
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleLeadsManager;
