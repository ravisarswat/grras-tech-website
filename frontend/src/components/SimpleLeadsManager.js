import React, { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, LogOut, Search, Bug, Trash2, Trash } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SimpleLeadsManager = ({ token, onLogout }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [debugOpen, setDebugOpen] = useState(false);
  const [attemptLog, setAttemptLog] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [deleting, setDeleting] = useState(false);

  // ---- Endpoints to try (common patterns) ----
  const endpoints = useMemo(
    () => [
      "/api/simple-leads",          // ✅ Primary endpoint that works  
      "/api/admin/leads",
      "/api/leads", 
      "/api/admin/leads/all",
      "/api/leads/all",
      "/leads",
      "/leads/all",
    ].map((p) => `${BACKEND_URL}${p}`),
    []
  );

  const normalize = (it) => ({
    id: it.id || it._id || it.uuid || crypto.randomUUID?.() || Math.random().toString(36).slice(2),
    name: it.name || it.fullName || "",
    email: it.email || "",
    phone: it.phone || it.mobile || "",
    course: it.course || it.interest || it.category || "",
    source: it.source || it.utm_source || "",
    notes: it.message || it.notes || "",
    createdAt: it.createdAt || it.created_at || it.timestamp || it.date || new Date().toISOString(),
  });

  const tryOnce = async (label, url, init) => {
    const withBypass = url + (url.includes("?") ? "&" : "?") + "nocache=" + Date.now(); // SW/cache bypass
    try {
      const res = await fetch(withBypass, {
        cache: "no-store",
        credentials: "omit",
        ...init,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });

      const text = await res.text();
      let json;
      try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

      const entry = { label, url, method: init?.method || "GET", status: res.status, ok: res.ok, body: json };
      setAttemptLog((prev) => [...prev, entry]);
      console.log("[Leads] Attempt:", entry);

      if (!res.ok) return { ok: false, body: json, status: res.status };
      const list = Array.isArray(json?.leads) ? json.leads : Array.isArray(json) ? json : [];
      return { ok: true, data: list.map(normalize) };
    } catch (e) {
      const entry = { label, url, method: init?.method || "GET", error: e?.message || String(e) };
      setAttemptLog((prev) => [...prev, entry]);
      console.warn("[Leads] Fetch error:", entry);
      return { ok: false, error: e };
    }
  };

  const load = async (isRefresh = false) => {
    if (!BACKEND_URL) {
      setError("REACT_APP_BACKEND_URL is not set in environment.");
      return;
    }

    setAttemptLog([]);
    setError("");
    isRefresh ? setRefreshing(true) : setLoading(true);

    // All fallbacks (headers + query + POST body)
    const headerAuth = {
      Authorization: token ? `Bearer ${token}` : "",
      "x-admin-token": token || "",
    };

    for (const url of endpoints) {
      // 1) GET with headers
      let r = await tryOnce("GET + headers", url, { method: "GET", headers: headerAuth });
      if (r.ok) { setLeads(r.data); setLoading(false); setRefreshing(false); return; }
      if (r.status === 401 || r.status === 403) break; // invalid token

      // 2) GET with token in query
      const qUrl = url + (url.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(token || "");
      r = await tryOnce("GET + ?token", qUrl, { method: "GET" });
      if (r.ok) { setLeads(r.data); setLoading(false); setRefreshing(false); return; }

      // 3) POST with headers only
      r = await tryOnce("POST + headers", url, { method: "POST", headers: headerAuth });
      if (r.ok) { setLeads(r.data); setLoading(false); setRefreshing(false); return; }

      // 4) POST JSON {token}
      r = await tryOnce("POST {token}", url, { method: "POST", body: JSON.stringify({ token }) });
      if (r.ok) { setLeads(r.data); setLoading(false); setRefreshing(false); return; }
    }

    // If we reached here, everything failed
    if (attemptLog.some((a) => a.status === 401 || a.status === 403)) {
      localStorage.removeItem("simple_admin_token");
      onLogout?.();
      setError("Session expired / unauthorized. Please log in again.");
    } else {
      setError(`Unable to fetch leads from backend: ${BACKEND_URL}`);
    }
    isRefresh ? setRefreshing(false) : setLoading(false);
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  // Delete functions
  const deleteSingleLead = async (leadId) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove from local state
        setLeads(leads.filter(lead => lead.id !== leadId));
        alert("Lead deleted successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to delete lead: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error deleting lead: ${error.message}`);
    }
    setDeleting(false);
  };

  const bulkDeleteLeads = async () => {
    if (selectedLeads.length === 0) {
      alert("Please select leads to delete");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedLeads.length} selected leads?`)) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/leads/bulk`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lead_ids: selectedLeads
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Remove deleted leads from local state
        setLeads(leads.filter(lead => !selectedLeads.includes(lead.id)));
        setSelectedLeads([]);
        alert(`Successfully deleted ${result.deleted_count} leads!`);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete leads: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error deleting leads: ${error.message}`);
    }
    setDeleting(false);
  };

  const toggleSelectLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const selectAllLeads = () => {
    if (selectedLeads.length === filtered.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filtered.map(lead => lead.id));
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = !s
      ? leads
      : leads.filter((l) =>
          [l.name, l.email, l.phone, l.course, l.source, l.notes].join(" ").toLowerCase().includes(s)
        );

    const dir = sortDir === "asc" ? 1 : -1;
    return [...base].sort((a, b) => {
      if (sortKey === "createdAt") {
        return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
        }
      const av = String(a[sortKey] || "").toLowerCase();
      const bv = String(b[sortKey] || "").toLowerCase();
      return av.localeCompare(bv) * dir;
    });
  }, [leads, q, sortKey, sortDir]);

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ["Name", "Email", "Phone", "Course", "Source", "Notes", "Created At"];
    const rows = filtered.map((l) => [
      l.name, l.email, l.phone, l.course, l.source,
      (l.notes || "").replace(/\n/g, " "),
      new Date(l.createdAt).toLocaleString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
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
              onClick={() => setDebugOpen((v) => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              title="Toggle debug details"
            >
              <Bug className="h-4 w-4" />
              Debug
            </button>
            <button
              onClick={() => { localStorage.removeItem("simple_admin_token"); onLogout?.(); }}
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

        {debugOpen && (
          <div className="mb-4 p-3 rounded-lg border border-gray-300 bg-white text-xs overflow-auto max-h-64">
            <pre className="whitespace-pre-wrap">{JSON.stringify(attemptLog, null, 2)}</pre>
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
