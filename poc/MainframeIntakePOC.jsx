import { useState, useEffect } from "react";

const DOMAINS = [
  { id: "batch",      name: "Batch Processing",       lead: "Batch Ops Team",  color: "#0057B8", sla: "3 business days" },
  { id: "storage",    name: "Storage & DASD",          lead: "Storage Team",    color: "#00A3A1", sla: "5 business days" },
  { id: "network",    name: "Network & Connectivity",  lead: "Network Team",    color: "#6B3FA0", sla: "2 business days" },
  { id: "security",   name: "Security & Compliance",   lead: "Security Ops",    color: "#C8102E", sla: "1 business day"  },
  { id: "db2",        name: "DB2 & Databases",         lead: "DBA Team",        color: "#FF6B00", sla: "4 business days" },
  { id: "cics",       name: "CICS & Transactions",     lead: "CICS Team",       color: "#007A4D", sla: "3 business days" },
  { id: "cobol",      name: "COBOL Development",       lead: "App Dev Group",   color: "#8B4513", sla: "5 business days" },
  { id: "monitoring", name: "Monitoring & Alerts",     lead: "Ops Center",      color: "#1565C0", sla: "1 business day"  },
  { id: "capacity",   name: "Capacity Planning",       lead: "Capacity Team",   color: "#4A148C", sla: "7 business days" },
];

const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const REQUEST_TYPES = [
  "New Work / Project",
  "Change Request",
  "Incident Support",
  "Performance Issue",
  "Access / Provisioning",
  "Other",
];

const SAMPLE_REQUESTS = [
  { id: "MF-001", domain: "batch",      title: "EOD batch job optimization",             priority: "High",     status: "In Progress",    submitter: "J.Martinez", submitted: "2026-02-28", team: "Batch Ops Team" },
  { id: "MF-002", domain: "security",   title: "RACF profile review for new app",        priority: "Critical", status: "Pending Review", submitter: "T.Singh",    submitted: "2026-03-01", team: "Security Ops"   },
  { id: "MF-003", domain: "db2",        title: "Query tuning for settlement process",    priority: "High",     status: "Completed",      submitter: "A.Chen",     submitted: "2026-02-25", team: "DBA Team"       },
  { id: "MF-004", domain: "network",    title: "AWS East routing latency investigation", priority: "Critical", status: "In Progress",    submitter: "P.Hannigan", submitted: "2026-03-02", team: "Network Team"   },
  { id: "MF-005", domain: "cobol",      title: "Payment module refactor",                priority: "Medium",   status: "Queued",         submitter: "R.Kim",      submitted: "2026-03-03", team: "App Dev Group"  },
  { id: "MF-006", domain: "cics",       title: "Transaction timeout threshold review",   priority: "High",     status: "Pending Review", submitter: "D.Okafor",   submitted: "2026-03-03", team: "CICS Team"      },
  { id: "MF-007", domain: "storage",    title: "DASD expansion for Q2 growth",           priority: "Medium",   status: "Queued",         submitter: "S.Patel",    submitted: "2026-03-04", team: "Storage Team"   },
  { id: "MF-008", domain: "monitoring", title: "New alert threshold for CPU spikes",     priority: "Low",      status: "Completed",      submitter: "L.Torres",   submitted: "2026-02-20", team: "Ops Center"     },
  { id: "MF-009", domain: "capacity",   title: "2026 H2 capacity forecast model",        priority: "Medium",   status: "In Progress",    submitter: "M.Johnson",  submitted: "2026-02-27", team: "Capacity Team"  },
  { id: "MF-010", domain: "batch",      title: "New regulatory reporting job",           priority: "High",     status: "Queued",         submitter: "C.Williams", submitted: "2026-03-04", team: "Batch Ops Team" },
  { id: "MF-011", domain: "security",   title: "SOX audit remediation tasks",            priority: "Critical", status: "In Progress",    submitter: "B.Adams",    submitted: "2026-03-01", team: "Security Ops"   },
  { id: "MF-012", domain: "db2",        title: "Backup schedule optimization",           priority: "Low",      status: "Completed",      submitter: "F.Nguyen",   submitted: "2026-02-22", team: "DBA Team"       },
];

const STATUS_CONFIG = {
  "In Progress":    { bg: "#E3F2FD", text: "#0D47A1", dot: "#1565C0" },
  "Pending Review": { bg: "#FFF8E1", text: "#F57F17", dot: "#F9A825" },
  "Completed":      { bg: "#E8F5E9", text: "#1B5E20", dot: "#2E7D32" },
  "Queued":         { bg: "#F3E5F5", text: "#4A148C", dot: "#7B1FA2" },
};

const PRIORITY_CONFIG = {
  "Critical": { bg: "#FFEBEE", text: "#B71C1C" },
  "High":     { bg: "#FFF3E0", text: "#E65100" },
  "Medium":   { bg: "#E3F2FD", text: "#0D47A1" },
  "Low":      { bg: "#F1F8E9", text: "#33691E" },
};

export default function MainframeIntakePOC() {
  const [view, setView] = useState("dashboard");
  const [requests, setRequests] = useState(SAMPLE_REQUESTS);
  const [formStep, setFormStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [newRequest, setNewRequest] = useState({
    domain: "", title: "", requestType: "", priority: "", description: "",
    submitter: "", businessJustification: "", targetDate: "",
  });
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDomain, setFilterDomain] = useState("All");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = () => {
    const domain = DOMAINS.find(d => d.id === newRequest.domain);
    const id = `MF-${String(requests.length + 1).padStart(3, "0")}`;
    const entry = {
      id,
      domain: newRequest.domain,
      title: newRequest.title,
      priority: newRequest.priority,
      status: "Queued",
      submitter: newRequest.submitter || "You",
      submitted: new Date().toISOString().split("T")[0],
      team: domain?.lead || "Unassigned",
    };
    setRequests(prev => [entry, ...prev]);
    setSubmitted(true);
    showToast(`Request ${id} submitted → routed to ${domain?.lead}`);
  };

  const resetForm = () => {
    setNewRequest({
      domain: "", title: "", requestType: "", priority: "", description: "",
      submitter: "", businessJustification: "", targetDate: "",
    });
    setFormStep(1);
    setSubmitted(false);
    setView("dashboard");
  };

  const filtered = requests.filter(r => {
    const statusMatch = filterStatus === "All" || r.status === filterStatus;
    const domainMatch = filterDomain === "All" || r.domain === filterDomain;
    return statusMatch && domainMatch;
  });

  const stats = {
    total:      requests.length,
    inProgress: requests.filter(r => r.status === "In Progress").length,
    pending:    requests.filter(r => r.status === "Pending Review").length,
    queued:     requests.filter(r => r.status === "Queued").length,
    completed:  requests.filter(r => r.status === "Completed").length,
    critical:   requests.filter(r => r.priority === "Critical").length,
  };

  const domainCounts = DOMAINS.map(d => ({
    ...d,
    count: requests.filter(r => r.domain === d.id).length,
  })).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...domainCounts.map(d => d.count));

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif", background: "#F0F4F8", minHeight: "100vh" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "success" ? "#1B5E20" : "#B71C1C",
          color: "#fff", padding: "12px 20px", borderRadius: 8,
          fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          maxWidth: 380, animation: "slideIn 0.3s ease",
        }}>
          ✓ {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#0A1628", borderBottom: "3px solid #0057B8", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 36, height: 36, background: "#0057B8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⬡</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "0.02em" }}>Mainframe Work Intake</div>
              <div style={{ color: "#90A4AE", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase" }}>Fiserv Technology · Unified Request Management</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 4 }}>
            {[["dashboard", "📊 Dashboard"], ["intake", "➕ New Request"], ["tracker", "📋 All Requests"]].map(([v, label]) => (
              <button key={v} onClick={() => { setView(v); setSubmitted(false); setFormStep(1); }}
                style={{
                  background: view === v ? "#0057B8" : "transparent",
                  color: view === v ? "#fff" : "#90A4AE",
                  border: "none", borderRadius: 6, padding: "8px 16px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                }}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1280, margin: "0 auto" }}>

        {/* DASHBOARD VIEW */}
        {view === "dashboard" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0A1628", margin: 0 }}>Operations Dashboard</h2>
              <p style={{ color: "#607D8B", fontSize: 13, margin: "4px 0 0" }}>
                Live view across all 9 mainframe domains · As of {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>

            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Requests",  value: stats.total,      color: "#0057B8", icon: "📁" },
                { label: "In Progress",     value: stats.inProgress, color: "#1565C0", icon: "⚙️" },
                { label: "Pending Review",  value: stats.pending,    color: "#F57F17", icon: "🕐" },
                { label: "Queued",          value: stats.queued,     color: "#7B1FA2", icon: "📌" },
                { label: "Completed",       value: stats.completed,  color: "#2E7D32", icon: "✅" },
                { label: "Critical",        value: stats.critical,   color: "#C62828", icon: "🚨" },
              ].map(kpi => (
                <div key={kpi.label} style={{
                  background: "#fff", borderRadius: 10, padding: "16px 18px",
                  borderTop: `3px solid ${kpi.color}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{kpi.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
                  <div style={{ fontSize: 11, color: "#78909C", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{kpi.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {/* Volume by Domain */}
              <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: "0 0 20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Work Volume by Domain</h3>
                {domainCounts.map(d => (
                  <div key={d.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#37474F" }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: d.color }}>{d.count}</span>
                    </div>
                    <div style={{ height: 6, background: "#ECEFF1", borderRadius: 3 }}>
                      <div style={{ height: 6, background: d.color, borderRadius: 3, width: `${(d.count / maxCount) * 100}%`, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Status Breakdown */}
                <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status Breakdown</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                      const count = requests.filter(r => r.status === status).length;
                      const pct = Math.round((count / requests.length) * 100);
                      return (
                        <div key={status} style={{ background: cfg.bg, borderRadius: 8, padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.text, textTransform: "uppercase", letterSpacing: "0.04em" }}>{status}</span>
                          </div>
                          <div style={{ fontSize: 24, fontWeight: 800, color: cfg.text }}>{count}</div>
                          <div style={{ fontSize: 11, color: cfg.text, opacity: 0.7 }}>{pct}% of total</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SLA Reference */}
                <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Team SLA Reference</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {DOMAINS.slice(0, 5).map(d => (
                      <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #ECEFF1" }}>
                        <span style={{ fontSize: 12, color: "#546E7A" }}>{d.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: d.color, background: "#F5F5F5", padding: "2px 8px", borderRadius: 4 }}>{d.sla}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Requests */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent Requests</h3>
                <button onClick={() => setView("tracker")} style={{ fontSize: 12, color: "#0057B8", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View All →</button>
              </div>
              <RequestTable requests={requests.slice(0, 5)} />
            </div>
          </div>
        )}

        {/* INTAKE FORM VIEW */}
        {view === "intake" && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {submitted ? (
              <SuccessScreen request={newRequest} requests={requests} onReset={resetForm} />
            ) : (
              <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                {/* Form Header */}
                <div style={{ background: "#0A1628", padding: "24px 32px" }}>
                  <div style={{ color: "#90A4AE", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>New Work Request</div>
                  <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Mainframe Job / Work Intake</h2>
                  {/* Step indicator */}
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    {[1, 2, 3].map(s => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: formStep >= s ? "#0057B8" : "#263A50",
                          color: formStep >= s ? "#fff" : "#607D8B",
                          fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>{s}</div>
                        <span style={{ fontSize: 11, color: formStep >= s ? "#90CAF9" : "#607D8B", fontWeight: 600 }}>
                          {["Classification", "Details", "Review"][s - 1]}
                        </span>
                        {s < 3 && <span style={{ color: "#263A50", fontSize: 16 }}>›</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: "28px 32px" }}>
                  {formStep === 1 && <FormStep1 data={newRequest} onChange={setNewRequest} onNext={() => setFormStep(2)} />}
                  {formStep === 2 && <FormStep2 data={newRequest} onChange={setNewRequest} onBack={() => setFormStep(1)} onNext={() => setFormStep(3)} />}
                  {formStep === 3 && <FormStep3 data={newRequest} onBack={() => setFormStep(2)} onSubmit={handleSubmit} />}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ALL REQUESTS VIEW */}
        {view === "tracker" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0A1628", margin: 0 }}>All Requests</h2>
                <p style={{ color: "#607D8B", fontSize: 13, margin: "4px 0 0" }}>Unified view across all domains · {filtered.length} of {requests.length} shown</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #CFD8DC", fontSize: 13, background: "#fff", color: "#37474F" }}>
                  <option value="All">All Statuses</option>
                  {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                </select>
                <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #CFD8DC", fontSize: 13, background: "#fff", color: "#37474F" }}>
                  <option value="All">All Domains</option>
                  {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button onClick={() => setView("intake")}
                  style={{ background: "#0057B8", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  + New Request
                </button>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <RequestTable requests={filtered} full />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        select:focus, input:focus, textarea:focus { outline: 2px solid #0057B8; outline-offset: 1px; }
      `}</style>
    </div>
  );
}

function RequestTable({ requests, full }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#F5F7FA" }}>
          {["ID", "Domain", "Request Title", "Team", "Priority", "Status", "Submitted"].map(h => (
            <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#78909C", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {requests.map((r, i) => {
          const domain = DOMAINS.find(d => d.id === r.domain);
          const sc = STATUS_CONFIG[r.status] || {};
          const pc = PRIORITY_CONFIG[r.priority] || {};
          return (
            <tr key={r.id} style={{ borderBottom: "1px solid #F0F4F8", background: i % 2 === 0 ? "#fff" : "#FAFBFC" }}>
              <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 700, color: "#0057B8", fontFamily: "monospace" }}>{r.id}</td>
              <td style={{ padding: "12px 14px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: domain?.color || "#607D8B", background: "#F5F7FA", padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap" }}>
                  {domain?.name || r.domain}
                </span>
              </td>
              <td style={{ padding: "12px 14px", fontSize: 13, color: "#263238", maxWidth: 220 }}>{r.title}</td>
              <td style={{ padding: "12px 14px", fontSize: 12, color: "#546E7A" }}>{r.team}</td>
              <td style={{ padding: "12px 14px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: pc.text, background: pc.bg, padding: "2px 8px", borderRadius: 4 }}>{r.priority}</span>
              </td>
              <td style={{ padding: "12px 14px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: sc.text, background: sc.bg, padding: "3px 10px", borderRadius: 20 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />
                  {r.status}
                </span>
              </td>
              <td style={{ padding: "12px 14px", fontSize: 12, color: "#78909C" }}>{r.submitted}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function FormStep1({ data, onChange, onNext }) {
  const canProceed = data.domain && data.requestType && data.priority;
  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", marginBottom: 20 }}>Step 1: Classify Your Request</h3>
      <FormField label="Domain / Team Area *" hint="Which mainframe domain does this work fall under?">
        <select value={data.domain} onChange={e => onChange(p => ({ ...p, domain: e.target.value }))}
          style={selectStyle}>
          <option value="">— Select Domain —</option>
          {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name} ({d.lead})</option>)}
        </select>
      </FormField>
      {data.domain && (
        <div style={{ background: "#E3F2FD", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#0D47A1" }}>
          ✓ This request will be routed to <strong>{DOMAINS.find(d => d.id === data.domain)?.lead}</strong> · SLA: <strong>{DOMAINS.find(d => d.id === data.domain)?.sla}</strong>
        </div>
      )}
      <FormField label="Request Type *">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {REQUEST_TYPES.map(rt => (
            <label key={rt} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              border: `2px solid ${data.requestType === rt ? "#0057B8" : "#E0E0E0"}`,
              borderRadius: 8, cursor: "pointer", background: data.requestType === rt ? "#E3F2FD" : "#fff",
              fontSize: 13, fontWeight: data.requestType === rt ? 700 : 400, color: data.requestType === rt ? "#0057B8" : "#546E7A",
            }}>
              <input type="radio" name="requestType" value={rt} checked={data.requestType === rt}
                onChange={() => onChange(p => ({ ...p, requestType: rt }))} style={{ display: "none" }} />
              {rt}
            </label>
          ))}
        </div>
      </FormField>
      <FormField label="Priority *" hint="Critical = production impact or regulatory deadline">
        <div style={{ display: "flex", gap: 8 }}>
          {PRIORITIES.map(p => {
            const cfg = PRIORITY_CONFIG[p];
            return (
              <button key={p} onClick={() => onChange(prev => ({ ...prev, priority: p }))}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700,
                  border: `2px solid ${data.priority === p ? cfg.text : "#E0E0E0"}`,
                  background: data.priority === p ? cfg.bg : "#fff",
                  color: data.priority === p ? cfg.text : "#90A4AE",
                }}>
                {p}
              </button>
            );
          })}
        </div>
      </FormField>
      <button onClick={onNext} disabled={!canProceed}
        style={{ ...btnStyle, background: canProceed ? "#0057B8" : "#CFD8DC", color: "#fff", cursor: canProceed ? "pointer" : "not-allowed", marginTop: 8 }}>
        Continue →
      </button>
    </div>
  );
}

function FormStep2({ data, onChange, onBack, onNext }) {
  const canProceed = data.title && data.description;
  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", marginBottom: 20 }}>Step 2: Request Details</h3>
      <FormField label="Request Title *">
        <input value={data.title} onChange={e => onChange(p => ({ ...p, title: e.target.value }))}
          placeholder="Brief, descriptive title (e.g., 'EOD batch job optimization for settlement')"
          style={inputStyle} />
      </FormField>
      <FormField label="Your Name">
        <input value={data.submitter} onChange={e => onChange(p => ({ ...p, submitter: e.target.value }))}
          placeholder="Your name or team" style={inputStyle} />
      </FormField>
      <FormField label="Description *" hint="What needs to be done and why?">
        <textarea value={data.description} onChange={e => onChange(p => ({ ...p, description: e.target.value }))}
          placeholder="Describe the work required, current state, desired outcome, and any dependencies…"
          style={{ ...inputStyle, height: 100, resize: "vertical" }} />
      </FormField>
      <FormField label="Business Justification">
        <textarea value={data.businessJustification} onChange={e => onChange(p => ({ ...p, businessJustification: e.target.value }))}
          placeholder="Business impact, compliance requirement, revenue impact, etc."
          style={{ ...inputStyle, height: 70, resize: "vertical" }} />
      </FormField>
      <FormField label="Target Completion Date">
        <input type="date" value={data.targetDate} onChange={e => onChange(p => ({ ...p, targetDate: e.target.value }))}
          style={inputStyle} />
      </FormField>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={onBack} style={{ ...btnStyle, background: "#ECEFF1", color: "#546E7A" }}>← Back</button>
        <button onClick={onNext} disabled={!canProceed}
          style={{ ...btnStyle, flex: 1, background: canProceed ? "#0057B8" : "#CFD8DC", color: "#fff", cursor: canProceed ? "pointer" : "not-allowed" }}>
          Review →
        </button>
      </div>
    </div>
  );
}

function FormStep3({ data, onBack, onSubmit }) {
  const domain = DOMAINS.find(d => d.id === data.domain);
  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", marginBottom: 6 }}>Step 3: Review & Submit</h3>
      <p style={{ color: "#607D8B", fontSize: 13, marginBottom: 20 }}>Confirm the details below before submitting.</p>
      <div style={{ background: "#F5F7FA", borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <ReviewRow label="Domain"       value={domain?.name} />
        <ReviewRow label="Routing To"   value={<span style={{ color: "#0057B8", fontWeight: 700 }}>{domain?.lead}</span>} />
        <ReviewRow label="SLA"          value={domain?.sla} />
        <ReviewRow label="Request Type" value={data.requestType} />
        <ReviewRow label="Priority"     value={<span style={{ color: PRIORITY_CONFIG[data.priority]?.text, fontWeight: 700 }}>{data.priority}</span>} />
        <ReviewRow label="Title"        value={data.title} />
        <ReviewRow label="Submitter"    value={data.submitter || "—"} />
        {data.targetDate && <ReviewRow label="Target Date" value={data.targetDate} />}
        <ReviewRow label="Description"  value={data.description} last />
      </div>
      <div style={{ background: "#E8F5E9", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#1B5E20" }}>
        📋 On submission: this request will be logged to <strong>SharePoint · MF-Intake-Central</strong> and a notification sent to <strong>{domain?.lead}</strong> via Teams.
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ ...btnStyle, background: "#ECEFF1", color: "#546E7A" }}>← Back</button>
        <button onClick={onSubmit} style={{ ...btnStyle, flex: 1, background: "#0057B8", color: "#fff" }}>Submit Request ✓</button>
      </div>
    </div>
  );
}

function SuccessScreen({ request, requests, onReset }) {
  const domain = DOMAINS.find(d => d.id === request.domain);
  const id = `MF-${String(requests.length).padStart(3, "0")}`;
  return (
    <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 40, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, background: "#E8F5E9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>✓</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1B5E20", margin: "0 0 8px" }}>Request Submitted</h2>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#0057B8", margin: "8px 0 4px", fontFamily: "monospace" }}>{id}</div>
      <p style={{ color: "#607D8B", fontSize: 14, margin: "0 0 24px" }}>Your request has been logged and routed.</p>
      <div style={{ background: "#F5F7FA", borderRadius: 10, padding: 20, textAlign: "left", marginBottom: 24 }}>
        <ReviewRow label="Routed To"    value={<span style={{ color: "#0057B8", fontWeight: 700 }}>{domain?.lead}</span>} />
        <ReviewRow label="Logged In"    value="SharePoint · MF-Intake-Central" />
        <ReviewRow label="Notification" value="Teams channel alert sent" />
        <ReviewRow label="SLA"          value={domain?.sla} last />
      </div>
      <button onClick={onReset} style={{ ...btnStyle, background: "#0057B8", color: "#fff" }}>← Return to Dashboard</button>
    </div>
  );
}

function FormField({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#37474F", marginBottom: 4 }}>{label}</label>
      {hint && <div style={{ fontSize: 11, color: "#90A4AE", marginBottom: 6 }}>{hint}</div>}
      {children}
    </div>
  );
}

function ReviewRow({ label, value, last }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: last ? "none" : "1px solid #ECEFF1" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#78909C", width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#37474F" }}>{value}</span>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #CFD8DC",
  fontSize: 13, color: "#263238", background: "#FAFBFC", boxSizing: "border-box",
  fontFamily: "inherit",
};

const selectStyle = {
  ...inputStyle, appearance: "none", cursor: "pointer",
};

const btnStyle = {
  padding: "12px 24px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s",
};
