import { useState, useEffect } from "react";

const RECIPIENT_EMAIL = "Patrick.Cassidy@fiserv.com";
const DUE_WARNING_DAYS = 3;

const DOMAINS = [
  { id: "perf-capacity",  name: "Performance & Capacity",      lead: "Perf & Capacity Team",  color: "#0057B8", responseSla: "4 business hours" },
  { id: "data-comm",      name: "Data Communication",          lead: "Data Comm Team",         color: "#00A3A1", responseSla: "2 business hours" },
  { id: "middleware",     name: "Middleware (MQ, CICS, WAS)",  lead: "Middleware Team",         color: "#6B3FA0", responseSla: "4 business hours" },
  { id: "modernization",  name: "Modernization / LinuxOne",    lead: "Modernization Team",      color: "#007A4D", responseSla: "1 business day"   },
  { id: "zos",            name: "z/OS",                        lead: "z/OS Team",               color: "#1A237E", responseSla: "2 business hours" },
  { id: "hardware",       name: "Hardware",                    lead: "Hardware Team",           color: "#546E7A", responseSla: "4 business hours" },
  { id: "security",       name: "Security",                    lead: "Security Ops",            color: "#C8102E", responseSla: "1 business hour"  },
  { id: "data-storage",   name: "Data Storage",                lead: "Storage Team",            color: "#FF6B00", responseSla: "4 business hours" },
  { id: "automation",     name: "Automation",                  lead: "Automation Team",         color: "#1565C0", responseSla: "1 business day"   },
  { id: "db2",            name: "DB2",                         lead: "DBA Team",                color: "#4A148C", responseSla: "4 business hours" },
  { id: "db2-apps",       name: "DB2 Applications",            lead: "DB2 App Dev Team",        color: "#AD1457", responseSla: "1 business day"   },
  { id: "latam",          name: "Latam",                       lead: "Latam Ops Team",          color: "#558B2F", responseSla: "1 business day"   },
  { id: "apac",           name: "APAC",                        lead: "APAC Ops Team",           color: "#00838F", responseSla: "1 business day"   },
];

const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const REQUEST_TYPES = [
  "New Work / Project", "Change Request", "Incident Support",
  "Performance Issue", "Access / Provisioning", "Other",
];

// SLAs here are for RESPONSE and ACCEPT/REJECT decisions, not completion time
const PRIORITY_CONFIG = {
  "Critical": { bg: "#FFEBEE", text: "#B71C1C", ackSla: "≤ 1 hour",          decisionSla: "≤ 4 hours"         },
  "High":     { bg: "#FFF3E0", text: "#E65100", ackSla: "≤ 4 hours",          decisionSla: "≤ 1 business day"  },
  "Medium":   { bg: "#E3F2FD", text: "#0D47A1", ackSla: "≤ 1 business day",   decisionSla: "≤ 3 business days" },
  "Low":      { bg: "#F1F8E9", text: "#33691E", ackSla: "≤ 2 business days",  decisionSla: "≤ 5 business days" },
};

const STATUS_CONFIG = {
  "In Progress":    { bg: "#E3F2FD", text: "#0D47A1", dot: "#1565C0" },
  "Pending Review": { bg: "#FFF8E1", text: "#F57F17", dot: "#F9A825" },
  "Completed":      { bg: "#E8F5E9", text: "#1B5E20", dot: "#2E7D32" },
  "Queued":         { bg: "#F3E5F5", text: "#4A148C", dot: "#7B1FA2" },
};

const SAMPLE_REQUESTS = [
  { id: "MF-001", domain: "perf-capacity",  title: "EOD batch job optimization",             priority: "High",     status: "In Progress",    submitter: "J.Martinez", submitted: "2026-02-28", targetDate: "2026-03-20", team: "Perf & Capacity Team" },
  { id: "MF-002", domain: "security",       title: "RACF profile review for new app",        priority: "Critical", status: "Pending Review", submitter: "T.Singh",    submitted: "2026-03-01", targetDate: "2026-03-10", team: "Security Ops"         },
  { id: "MF-003", domain: "db2",            title: "Query tuning for settlement process",    priority: "High",     status: "Completed",      submitter: "A.Chen",     submitted: "2026-02-25", targetDate: "2026-03-05", team: "DBA Team"             },
  { id: "MF-004", domain: "data-comm",      title: "AWS East routing latency investigation", priority: "Critical", status: "In Progress",    submitter: "P.Hannigan", submitted: "2026-03-02", targetDate: "2026-03-08", team: "Data Comm Team"       },
  { id: "MF-005", domain: "modernization",  title: "Payment module refactor",                priority: "Medium",   status: "Queued",         submitter: "R.Kim",      submitted: "2026-03-03", targetDate: "2026-03-25", team: "Modernization Team"   },
  { id: "MF-006", domain: "middleware",     title: "Transaction timeout threshold review",   priority: "High",     status: "Pending Review", submitter: "D.Okafor",   submitted: "2026-03-03", targetDate: "2026-03-12", team: "Middleware Team"      },
  { id: "MF-007", domain: "data-storage",   title: "DASD expansion for Q2 growth",           priority: "Medium",   status: "Queued",         submitter: "S.Patel",    submitted: "2026-03-04", targetDate: "2026-03-30", team: "Storage Team"         },
  { id: "MF-008", domain: "automation",     title: "New alert threshold for CPU spikes",     priority: "Low",      status: "Completed",      submitter: "L.Torres",   submitted: "2026-02-20", targetDate: "2026-02-28", team: "Automation Team"      },
  { id: "MF-009", domain: "perf-capacity",  title: "2026 H2 capacity forecast model",        priority: "Medium",   status: "In Progress",    submitter: "M.Johnson",  submitted: "2026-02-27", targetDate: "2026-03-15", team: "Perf & Capacity Team" },
  { id: "MF-010", domain: "automation",     title: "New regulatory reporting job",           priority: "High",     status: "Queued",         submitter: "C.Williams", submitted: "2026-03-04", targetDate: "2026-03-18", team: "Automation Team"      },
  { id: "MF-011", domain: "security",       title: "SOX audit remediation tasks",            priority: "Critical", status: "In Progress",    submitter: "B.Adams",    submitted: "2026-03-01", targetDate: "2026-03-12", team: "Security Ops"         },
  { id: "MF-012", domain: "db2-apps",       title: "Backup schedule optimization",           priority: "Low",      status: "Completed",      submitter: "F.Nguyen",   submitted: "2026-02-22", targetDate: "2026-03-01", team: "DB2 App Dev Team"     },
];

// ─── Email helper ─────────────────────────────────────────────────────────────
function openEmail(subject, body) {
  const url = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, "_blank");
}

function buildNewRequestEmail(id, entry, request, domain, priority) {
  const subject = `[MF Intake] New ${request.priority} Request – ${id}: ${request.title}`;
  const body = [
    `A new mainframe work request has been submitted and requires your attention.`,
    ``,
    `──────────────────────────────────────`,
    `REQUEST DETAILS`,
    `──────────────────────────────────────`,
    `Request ID    : ${id}`,
    `Title         : ${request.title}`,
    `Domain        : ${domain?.name}`,
    `Routed To     : ${domain?.lead}`,
    `Request Type  : ${request.requestType}`,
    `Priority      : ${request.priority}`,
    `Submitted By  : ${request.submitter || "Unknown"}`,
    `Submitted On  : ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
    request.targetDate ? `Target Date   : ${request.targetDate}` : "",
    ``,
    `Description:`,
    request.description,
    request.businessJustification ? `\nBusiness Justification:\n${request.businessJustification}` : "",
    ``,
    `──────────────────────────────────────`,
    `RESPONSE SLAs (${request.priority.toUpperCase()})`,
    `──────────────────────────────────────`,
    `Acknowledgment       : ${priority?.ackSla}`,
    `Accept / Reject By   : ${priority?.decisionSla}`,
    `Domain Response SLA  : ${domain?.responseSla}`,
    ``,
    `Please log in to the MF Intake Dashboard to review and action this request.`,
  ].filter(l => l !== undefined).join("\n");
  return { subject, body };
}

function buildDueAlertsEmail(alerts) {
  const pastDue = alerts.filter(a => a.isPastDue);
  const approaching = alerts.filter(a => !a.isPastDue);
  const subject = `[MF Intake] ⚠ ${alerts.length} Request(s) Past Due or Approaching Deadline`;
  const formatItem = r => {
    const label = r.isPastDue
      ? `PAST DUE — ${Math.abs(r.daysUntilDue)} day${Math.abs(r.daysUntilDue) !== 1 ? "s" : ""} overdue`
      : `Due in ${r.daysUntilDue} day${r.daysUntilDue !== 1 ? "s" : ""} (${r.targetDate})`;
    return `  • ${r.id} | ${r.title}\n    Team: ${r.team} | Priority: ${r.priority} | Status: ${r.status}\n    ${label}`;
  };
  const sections = [];
  if (pastDue.length) sections.push(`PAST DUE (${pastDue.length}):\n${pastDue.map(formatItem).join("\n\n")}`);
  if (approaching.length) sections.push(`APPROACHING DEADLINE (${approaching.length}):\n${approaching.map(formatItem).join("\n\n")}`);
  const body = [
    `The following mainframe requests require immediate attention.`,
    ``,
    `──────────────────────────────────────`,
    sections.join("\n\n──────────────────────────────────────\n"),
    `──────────────────────────────────────`,
    ``,
    `Please log in to the MF Intake Dashboard to review and take action.`,
  ].join("\n");
  return { subject, body };
}

// ─── Due-date helpers ─────────────────────────────────────────────────────────
function computeDueAlerts(requests) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return requests
    .filter(r => r.targetDate && r.status !== "Completed")
    .map(r => {
      const target = new Date(r.targetDate);
      const daysUntilDue = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
      return { ...r, daysUntilDue, isPastDue: daysUntilDue < 0, isApproaching: daysUntilDue >= 0 && daysUntilDue <= DUE_WARNING_DAYS };
    })
    .filter(r => r.isPastDue || r.isApproaching);
}

// ─── Main component ───────────────────────────────────────────────────────────
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
  const [dueAlerts, setDueAlerts] = useState([]);

  useEffect(() => {
    setDueAlerts(computeDueAlerts(requests));
  }, [requests]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = () => {
    const domain = DOMAINS.find(d => d.id === newRequest.domain);
    const priority = PRIORITY_CONFIG[newRequest.priority];
    const id = `MF-${String(requests.length + 1).padStart(3, "0")}`;
    const entry = {
      id,
      domain: newRequest.domain,
      title: newRequest.title,
      priority: newRequest.priority,
      status: "Queued",
      submitter: newRequest.submitter || "You",
      submitted: new Date().toISOString().split("T")[0],
      targetDate: newRequest.targetDate || "",
      team: domain?.lead || "Unassigned",
    };
    setRequests(prev => [entry, ...prev]);
    setSubmitted(true);
    showToast(`Request ${id} submitted → routed to ${domain?.lead}`);
    const { subject, body } = buildNewRequestEmail(id, entry, newRequest, domain, priority);
    openEmail(subject, body);
  };

  const handleSendDueAlerts = () => {
    const { subject, body } = buildDueAlertsEmail(dueAlerts);
    openEmail(subject, body);
    showToast(`Due-alert email drafted for ${dueAlerts.length} item(s)`);
  };

  const resetForm = () => {
    setNewRequest({ domain: "", title: "", requestType: "", priority: "", description: "", submitter: "", businessJustification: "", targetDate: "" });
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

  const maxCount = Math.max(...domainCounts.map(d => d.count), 1);

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif", background: "#F0F4F8", minHeight: "100vh" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "success" ? "#1B5E20" : "#B71C1C",
          color: "#fff", padding: "12px 20px", borderRadius: 8,
          fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          maxWidth: 400, animation: "slideIn 0.3s ease",
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

      <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* DASHBOARD VIEW */}
        {view === "dashboard" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0A1628", margin: 0 }}>Operations Dashboard</h2>
              <p style={{ color: "#607D8B", fontSize: 13, margin: "4px 0 0" }}>
                Live view across all 13 mainframe domains · As of {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>

            {/* Due Alerts Banner */}
            {dueAlerts.length > 0 && (
              <div style={{
                background: "#FFF3E0", border: "1.5px solid #FF6B00", borderRadius: 10,
                padding: "14px 20px", marginBottom: 20,
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>⚠</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#BF360C" }}>
                      {dueAlerts.filter(a => a.isPastDue).length > 0 && (
                        <span>{dueAlerts.filter(a => a.isPastDue).length} past-due · </span>
                      )}
                      {dueAlerts.filter(a => !a.isPastDue).length > 0 && (
                        <span>{dueAlerts.filter(a => !a.isPastDue).length} approaching deadline</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#E64A19", marginTop: 2 }}>
                      {dueAlerts.map(a => (
                        <span key={a.id} style={{ marginRight: 12 }}>
                          <strong>{a.id}</strong> · {a.title.length > 32 ? a.title.slice(0, 32) + "…" : a.title}
                          {" "}<em>({a.isPastDue ? `${Math.abs(a.daysUntilDue)}d overdue` : `due in ${a.daysUntilDue}d`})</em>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={handleSendDueAlerts}
                  style={{ background: "#BF360C", color: "#fff", border: "none", borderRadius: 7, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  ✉ Email Alert to Patrick
                </button>
              </div>
            )}

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
              {/* Work Volume by Domain */}
              <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Work Volume by Domain</h3>
                {domainCounts.map(d => (
                  <div key={d.id} style={{ marginBottom: 11 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#37474F" }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: d.color }}>{d.count}</span>
                    </div>
                    <div style={{ height: 5, background: "#ECEFF1", borderRadius: 3 }}>
                      <div style={{ height: 5, background: d.color, borderRadius: 3, width: d.count > 0 ? `${(d.count / maxCount) * 100}%` : "4px", transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Status Breakdown */}
                <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status Breakdown</h3>
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

                {/* Priority Response SLAs */}
                <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Priority Response SLAs</h3>
                  <div style={{ fontSize: 11, color: "#90A4AE", marginBottom: 10 }}>Acknowledgment · Accept/Reject decision — not completion targets</div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F5F7FA" }}>
                        {["Priority", "Acknowledge", "Decision"].map(h => (
                          <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#78909C", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PRIORITIES.map(p => {
                        const cfg = PRIORITY_CONFIG[p];
                        return (
                          <tr key={p} style={{ borderBottom: "1px solid #F0F4F8" }}>
                            <td style={{ padding: "7px 10px" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: cfg.text, background: cfg.bg, padding: "2px 8px", borderRadius: 4 }}>{p}</span>
                            </td>
                            <td style={{ padding: "7px 10px", fontSize: 12, color: "#37474F", fontWeight: 600 }}>{cfg.ackSla}</td>
                            <td style={{ padding: "7px 10px", fontSize: 12, color: "#37474F", fontWeight: 600 }}>{cfg.decisionSla}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Domain Response SLA Reference (full width) */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Team Initial Response SLAs</h3>
              <div style={{ fontSize: 11, color: "#90A4AE", marginBottom: 12 }}>Time from submission to first acknowledgment by the receiving team</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {DOMAINS.map(d => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#F5F7FA", borderRadius: 7, borderLeft: `3px solid ${d.color}` }}>
                    <span style={{ fontSize: 12, color: "#37474F", fontWeight: 600 }}>{d.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: d.color, marginLeft: 8, whiteSpace: "nowrap" }}>{d.responseSla}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Requests */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent Requests</h3>
                <button onClick={() => setView("tracker")} style={{ fontSize: 12, color: "#0057B8", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View All →</button>
              </div>
              <RequestTable requests={requests.slice(0, 5)} dueAlerts={dueAlerts} />
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
                <div style={{ background: "#0A1628", padding: "24px 32px" }}>
                  <div style={{ color: "#90A4AE", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>New Work Request</div>
                  <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Mainframe Job / Work Intake</h2>
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
              <RequestTable requests={filtered} full dueAlerts={dueAlerts} />
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

// ─── Request table ────────────────────────────────────────────────────────────
function RequestTable({ requests, full, dueAlerts = [] }) {
  const alertIds = new Set(dueAlerts.map(a => a.id));
  const alertMap = Object.fromEntries(dueAlerts.map(a => [a.id, a]));
  const headers = ["ID", "Domain", "Request Title", "Team", "Priority", "Status", "Submitted"];
  if (full) headers.push("Target Date");
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#F5F7FA" }}>
          {headers.map(h => (
            <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#78909C", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {requests.map((r, i) => {
          const domain = DOMAINS.find(d => d.id === r.domain);
          const sc = STATUS_CONFIG[r.status] || {};
          const pc = PRIORITY_CONFIG[r.priority] || {};
          const alert = alertMap[r.id];
          const rowBg = alert?.isPastDue ? "#FFF8F6" : alert?.isApproaching ? "#FFFDE7" : i % 2 === 0 ? "#fff" : "#FAFBFC";
          return (
            <tr key={r.id} style={{ borderBottom: "1px solid #F0F4F8", background: rowBg }}>
              <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 700, color: "#0057B8", fontFamily: "monospace" }}>
                {r.id}
                {alert && <span style={{ marginLeft: 6, fontSize: 12 }}>{alert.isPastDue ? "🔴" : "🟡"}</span>}
              </td>
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
              {full && (
                <td style={{ padding: "12px 14px", fontSize: 12 }}>
                  {r.targetDate ? (
                    <span style={{
                      fontWeight: 700,
                      color: alert?.isPastDue ? "#B71C1C" : alert?.isApproaching ? "#E65100" : "#546E7A",
                    }}>
                      {r.targetDate}
                      {alert && <span style={{ display: "block", fontSize: 10, fontWeight: 600 }}>
                        {alert.isPastDue ? `${Math.abs(alert.daysUntilDue)}d overdue` : `${alert.daysUntilDue}d left`}
                      </span>}
                    </span>
                  ) : <span style={{ color: "#B0BEC5" }}>—</span>}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Form steps ───────────────────────────────────────────────────────────────
function FormStep1({ data, onChange, onNext }) {
  const canProceed = data.domain && data.requestType && data.priority;
  const domain = DOMAINS.find(d => d.id === data.domain);
  const pc = data.priority ? PRIORITY_CONFIG[data.priority] : null;
  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", marginBottom: 20 }}>Step 1: Classify Your Request</h3>
      <FormField label="Domain / Team Area *" hint="Which mainframe domain does this work fall under?">
        <select value={data.domain} onChange={e => onChange(p => ({ ...p, domain: e.target.value }))} style={selectStyle}>
          <option value="">— Select Domain —</option>
          {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name} ({d.lead})</option>)}
        </select>
      </FormField>
      {domain && (
        <div style={{ background: "#E3F2FD", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#0D47A1" }}>
          ✓ Routed to <strong>{domain.lead}</strong> · Initial response SLA: <strong>{domain.responseSla}</strong>
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
      <FormField label="Priority *" hint="Sets response & decision SLAs — not completion timeline">
        <div style={{ display: "flex", gap: 8, marginBottom: pc ? 10 : 0 }}>
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
        {pc && (
          <div style={{ background: pc.bg, borderRadius: 7, padding: "9px 14px", fontSize: 12, color: pc.text, display: "flex", gap: 24 }}>
            <span><strong>Acknowledge:</strong> {pc.ackSla}</span>
            <span><strong>Accept/Reject:</strong> {pc.decisionSla}</span>
          </div>
        )}
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
        <input type="date" value={data.targetDate} onChange={e => onChange(p => ({ ...p, targetDate: e.target.value }))} style={inputStyle} />
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
  const pc = PRIORITY_CONFIG[data.priority];
  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", marginBottom: 6 }}>Step 3: Review & Submit</h3>
      <p style={{ color: "#607D8B", fontSize: 13, marginBottom: 20 }}>Confirm the details below before submitting.</p>
      <div style={{ background: "#F5F7FA", borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <ReviewRow label="Domain"       value={domain?.name} />
        <ReviewRow label="Routing To"   value={<span style={{ color: "#0057B8", fontWeight: 700 }}>{domain?.lead}</span>} />
        <ReviewRow label="Request Type" value={data.requestType} />
        <ReviewRow label="Priority"     value={<span style={{ color: pc?.text, fontWeight: 700 }}>{data.priority}</span>} />
        <ReviewRow label="Title"        value={data.title} />
        <ReviewRow label="Submitter"    value={data.submitter || "—"} />
        {data.targetDate && <ReviewRow label="Target Date" value={data.targetDate} />}
        <ReviewRow label="Description"  value={data.description} last />
      </div>
      {pc && (
        <div style={{ background: pc.bg, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: pc.text }}>
          <strong>Response SLAs ({data.priority}):</strong>&nbsp;&nbsp;
          Acknowledgment: <strong>{pc.ackSla}</strong>&nbsp;&nbsp;·&nbsp;&nbsp;
          Accept/Reject: <strong>{pc.decisionSla}</strong>
        </div>
      )}
      <div style={{ background: "#E8F5E9", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#1B5E20" }}>
        ✉ On submission: request logged to <strong>SharePoint · MF-Intake-Central</strong>, notification sent to <strong>{domain?.lead}</strong> via Teams, and an email will open to <strong>{RECIPIENT_EMAIL}</strong>.
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
  const pc = PRIORITY_CONFIG[request.priority];
  const id = `MF-${String(requests.length).padStart(3, "0")}`;
  return (
    <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 40, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, background: "#E8F5E9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>✓</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1B5E20", margin: "0 0 8px" }}>Request Submitted</h2>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#0057B8", margin: "8px 0 4px", fontFamily: "monospace" }}>{id}</div>
      <p style={{ color: "#607D8B", fontSize: 14, margin: "0 0 24px" }}>Your request has been logged and routed. An email notification has been opened.</p>
      <div style={{ background: "#F5F7FA", borderRadius: 10, padding: 20, textAlign: "left", marginBottom: 20 }}>
        <ReviewRow label="Routed To"    value={<span style={{ color: "#0057B8", fontWeight: 700 }}>{domain?.lead}</span>} />
        <ReviewRow label="Response SLA" value={domain?.responseSla} />
        <ReviewRow label="Acknowledge"  value={pc?.ackSla} />
        <ReviewRow label="Decision By"  value={pc?.decisionSla} />
        <ReviewRow label="Logged In"    value="SharePoint · MF-Intake-Central" />
        <ReviewRow label="Email To"     value={RECIPIENT_EMAIL} last />
      </div>
      <button onClick={onReset} style={{ ...btnStyle, background: "#0057B8", color: "#fff" }}>← Return to Dashboard</button>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
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
      <span style={{ fontSize: 12, fontWeight: 700, color: "#78909C", width: 120, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#37474F" }}>{value}</span>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
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
