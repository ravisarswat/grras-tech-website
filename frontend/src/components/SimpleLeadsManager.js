import React, { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, LogOut, Search } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SimpleLeadsManager = ({ token, onLogout }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const endpoints = useMemo(
    () => [
      `${BACKEND_URL}/api/admin/leads`,
      `${BACKEND_URL}/api/leads`,
    ],
    []
  );

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      "x-admin-token": token || "",
    }),
    [token]
  );

  const normalize = (item) => ({
    id: item.id || item._id || item.uuid || Math.random().toString(36).slice(2),
    name: item.name || item.fullName || "",
    email: item.email || "",
    phone: item.phone || item.mobile || "",
    course: item.course || item.interest || item.category || "",
    source: item.source || item.utm_source || "",
    notes: item.message || item.notes || "",
    createdAt: item.createdAt || item.created_at || item.timestamp || item.date || new Date().toISOString(),
  });

  const load = async (isRefresh = false) => {
    setError("");
    isRefresh ? setRefreshing(true) : setLoading(true);

    for (const url of endpoints) {
      try {
        const res = await fetch(url, { headers: authHeaders, method: "GET" });

        if (res.status === 401) {
          // token invalid/expired
          localStorage.removeItem("simple_admin_token");
          setError("Session expired. Please log in again.");
          onLogout?.();
          break;
        }

        if (!res.ok) {
          // Try next endpoint
          continue;
        }

        const data = await res.json();
        const list = Array.isArray(data?.leads) ? data.leads : Array.isArray(data) ? data : [];
        setLeads(list.map(normalize));
        isRefresh ? setRefreshing(false) : setLoading(false);
        return;
      } catch (e) {
        // try next endpoint
      }
    }

    setError(`Unable to fetch leads from backend: ${BACKEND_URL}`);
    isRefresh ? setRefreshing(false) : setLoading(false);
  };

  useEffect(() => {
    if (!token) return;
    load();
  }, [token]); // <- no eslint disable comment here

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = !s
      ? leads
      : leads.filter((l) =>
          [l.name, l.email, l.phone, l.course, l.source, l.notes]
            .join(" ")
            .toLowerCase()
            .includes(s)
        );

    const sorted = [...base].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "createdAt") {
        return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
      }
      const av = String(a[sortKey] || "").toLowerCase();
      const bv = String(b[sortKey] || "").toLowerCase();
      return av.localeCompare(bv) * dir;
    });

    return sorted;
  }, [leads, q, sortKey, sortDir]);

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ["Name", "Email", "Phone", "Course", "Source", "Notes", "Created At"];
    const rows = filtered.map((l) => [
      l.name,
      l.email,
      l.phone,
      l.course,
      l.source,
      (l.notes || "").replace(/\n/g, " "),
      new Date(l.createdAt).toLocaleString(),
    ]);
    const csv =
      [headers, ...rows]
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900">Leads</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={exportCSV}
              disabled={!filtered.length}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("simple_admin_token");
                onLogout?.();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-black"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* search & sort */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="col-span-2">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search leads by name, email, phone, course, source…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="createdAt">Sort: Date</option>
              <option value="name">Sort: Name</option>
              <option value="course">Sort: Course</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="desc">↓</option>
              <option value="asc">↑</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center text-gray-600">Loading leads…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-600">No leads found.</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-7 gap-3 px-4 py-3 text-xs font-semibold text-gray-500 bg-gray-50">
              <div>Name</div>
              <div>Email</div>
              <div>Phone</div>
              <div>Course</div>
              <div>Source</div>
              <div>Notes</div>
              <div>Created</div>
            </div>
            <div className="divide-y">
              {filtered.map((l) => (
                <div key={l.id} className="grid grid-cols-7 gap-3 px-4 py-3 text-sm">
                  <div className="font-medium text-gray-900 break-words">{l.name || "—"}</div>
                  <div className="text-gray-700 break-words">{l.email || "—"}</div>
                  <div className="text-gray-700 break-words">{l.phone || "—"}</div>
                  <div className="text-gray-700 break-words">{l.course || "—"}</div>
                  <div className="text-gray-700 break-words">{l.source || "—"}</div>
                  <div className="text-gray-600 break-words line-clamp-2">{l.notes || "—"}</div>
                  <div className="text-gray-600">{new Date(l.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleLeadsManager;
