# Mainframe Work Intake — Power Apps Build Guide

Replicates the full POC (Dashboard · Intake Form · All Requests tracker) as a
Canvas App backed by a SharePoint list, with a Power Automate flow for email
notifications.

---

## Architecture at a Glance

```
Power Apps Canvas App
├── Screen 1 – Dashboard        (KPIs · domain chart · due alerts · recent requests)
├── Screen 2 – Intake Form      (3-step wizard, submits to SharePoint + triggers flow)
└── Screen 3 – All Requests     (filterable gallery with due-date highlighting)

SharePoint List
└── MF-Intake-Requests          (one list, all request records)

Power Automate Flow
└── "MF Intake – Email Notification"   (triggered by Power Apps on submit)
```

---

## Part 1 — SharePoint List Setup

### 1.1 Create the list

1. Go to your SharePoint site → **New → List → Blank list**
2. Name: **`MF-Intake-Requests`**
3. Add the columns below (the built-in *Title* column becomes **RequestTitle**
   — rename it).

### 1.2 Column schema

| Display Name         | Internal Name         | Type                   | Required | Notes / Choices |
|----------------------|-----------------------|------------------------|----------|-----------------|
| Request Title        | `Title`               | Single line of text    | Yes      | Rename built-in Title |
| Request ID           | `RequestID`           | Single line of text    | No       | Set by Power Apps on submit |
| Domain               | `Domain`              | Choice                 | Yes      | See Domain choices below |
| Team                 | `Team`                | Single line of text    | No       | Auto-set from Domain |
| Request Type         | `RequestType`         | Choice                 | Yes      | See Request Type choices |
| Priority             | `Priority`            | Choice                 | Yes      | Critical · High · Medium · Low |
| Status               | `Status`              | Choice                 | Yes      | Queued · In Progress · Pending Review · Completed |
| Description          | `Description`         | Multiple lines of text | Yes      | Plain text |
| Business Justification | `BusinessJustification` | Multiple lines of text | No   | Plain text |
| Submitter            | `Submitter`           | Single line of text    | No       | |
| Submitted Date       | `SubmittedDate`       | Date and Time          | No       | Date Only format |
| Target Date          | `TargetDate`          | Date and Time          | No       | Date Only format |

**Domain choices:**
```
Performance & Capacity
Data Communication
Middleware (MQ, CICS, WAS)
Modernization / LinuxOne
z/OS
Hardware
Security
Data Storage
Automation
DB2
DB2 Applications
Latam
APAC
```

**Request Type choices:**
```
New Work / Project
Change Request
Incident Support
Performance Issue
Access / Provisioning
Other
```

---

## Part 2 — Power Apps Canvas App

### 2.1 Create the app

1. Go to **make.powerapps.com** → **Create → Canvas app from blank**
2. Name: **Mainframe Work Intake**
3. Format: **Tablet** (landscape, 1366 × 768)
4. Connect to data: **SharePoint** → select your site → select `MF-Intake-Requests`

### 2.2 App-level settings

In **Settings → Display**:
- Scale to fit: **On**
- Lock aspect ratio: **On**
- Lock orientation: Landscape

### 2.3 Rename screens

Rename the three screens:
- `scrDashboard`
- `scrIntake`
- `scrTracker`

---

## Part 3 — Global Variables & Collections (App OnStart)

Paste this into **App → OnStart**:

```powerfx
// Load all requests from SharePoint
ClearCollect(
    colRequests,
    'MF-Intake-Requests'
);

// Domain metadata table (used for color-coding and SLA display)
ClearCollect(
    colDomains,
    {id:"perf-capacity",  name:"Performance & Capacity",    lead:"Perf & Capacity Team",  color:"#0057B8", responseSla:"4 business hours"},
    {id:"data-comm",      name:"Data Communication",        lead:"Data Comm Team",         color:"#00A3A1", responseSla:"2 business hours"},
    {id:"middleware",     name:"Middleware (MQ, CICS, WAS)",lead:"Middleware Team",         color:"#6B3FA0", responseSla:"4 business hours"},
    {id:"modernization",  name:"Modernization / LinuxOne",  lead:"Modernization Team",     color:"#007A4D", responseSla:"1 business day"},
    {id:"zos",            name:"z/OS",                      lead:"z/OS Team",               color:"#1A237E", responseSla:"2 business hours"},
    {id:"hardware",       name:"Hardware",                  lead:"Hardware Team",           color:"#546E7A", responseSla:"4 business hours"},
    {id:"security",       name:"Security",                  lead:"Security Ops",            color:"#C8102E", responseSla:"1 business hour"},
    {id:"data-storage",   name:"Data Storage",              lead:"Storage Team",            color:"#FF6B00", responseSla:"4 business hours"},
    {id:"automation",     name:"Automation",                lead:"Automation Team",         color:"#1565C0", responseSla:"1 business day"},
    {id:"db2",            name:"DB2",                       lead:"DBA Team",                color:"#4A148C", responseSla:"4 business hours"},
    {id:"db2-apps",       name:"DB2 Applications",          lead:"DB2 App Dev Team",        color:"#AD1457", responseSla:"1 business day"},
    {id:"latam",          name:"Latam",                     lead:"Latam Ops Team",          color:"#558B2F", responseSla:"1 business day"},
    {id:"apac",           name:"APAC",                      lead:"APAC Ops Team",           color:"#00838F", responseSla:"1 business day"}
);

// Priority metadata
ClearCollect(
    colPriorityConfig,
    {priority:"Critical", bgColor:"#FFEBEE", textColor:"#B71C1C", ackSla:"≤ 1 hour",         decisionSla:"≤ 4 hours"},
    {priority:"High",     bgColor:"#FFF3E0", textColor:"#E65100", ackSla:"≤ 4 hours",         decisionSla:"≤ 1 business day"},
    {priority:"Medium",   bgColor:"#E3F2FD", textColor:"#0D47A1", ackSla:"≤ 1 business day",  decisionSla:"≤ 3 business days"},
    {priority:"Low",      bgColor:"#F1F8E9", textColor:"#33691E", ackSla:"≤ 2 business days", decisionSla:"≤ 5 business days"}
);

// Due-alert collection (items past due or within 3 days)
ClearCollect(
    colDueAlerts,
    Filter(
        colRequests,
        Status <> "Completed" &&
        !IsBlank(TargetDate) &&
        DateDiff(Today(), TargetDate, TimeUnit.Days) <= 3
    )
);

// Initialize form state
Set(gblFormStep, 1);
Set(gblToastMsg, "");
Set(gblToastVisible, false);

// Navigate to dashboard
Navigate(scrDashboard);
```

---

## Part 4 — Screen 1: Dashboard (`scrDashboard`)

### 4.1 Header bar

Add a **Rectangle** spanning the full width, height 64, fill `RGBA(10,22,40,1)`.

Add **Text labels**:
- `"Mainframe Work Intake"` — white, bold, 15pt
- `"Fiserv Technology · Unified Request Management"` — `#90A4AE`, 11pt

Add **three navigation Buttons** (Dashboard / New Request / All Requests):

| Property | Formula |
|----------|---------|
| Fill     | `If(App.ActiveScreen.Name = "scrDashboard", RGBA(0,87,184,1), RGBA(0,0,0,0))` |
| Color    | `If(App.ActiveScreen.Name = "scrDashboard", White, RGBA(144,164,174,1))` |
| OnSelect | `Navigate(scrDashboard)` / `Navigate(scrIntake)` / `Navigate(scrTracker)` |

### 4.2 Due-alerts banner

Add a **Rectangle** with:
```powerfx
// Visible property
CountRows(colDueAlerts) > 0
```

Add a **Label** inside for the alert text:
```powerfx
// Text property
Concatenate(
    Text(CountIf(colDueAlerts, DateDiff(Today(), TargetDate, TimeUnit.Days) < 0)) & " past-due  ·  ",
    Text(CountIf(colDueAlerts, DateDiff(Today(), TargetDate, TimeUnit.Days) >= 0)) & " approaching deadline"
)
```

Add **"Email Alert to Patrick" Button** → OnSelect:
```powerfx
// Trigger Power Automate flow (see Part 7)
'MFIntakeEmailNotification'.Run(
    "[MF Intake] ⚠ Due-Alert: " & CountRows(colDueAlerts) & " item(s) require attention",
    Concat(
        colDueAlerts,
        RequestID & " | " & Title & " | " & Priority & " | Due: " & Text(TargetDate, "yyyy-mm-dd") & Char(10)
    ),
    "Patrick.Cassidy@fiserv.com"
);
Set(gblToastMsg, "Due-alert email sent for " & CountRows(colDueAlerts) & " item(s)");
Set(gblToastVisible, true);
```

### 4.3 KPI cards

Add 6 **Rectangle + Label** pairs. Each card uses a CountIf formula:

| Card Label       | Count Formula |
|------------------|--------------|
| Total Requests   | `CountRows(colRequests)` |
| In Progress      | `CountIf(colRequests, Status = "In Progress")` |
| Pending Review   | `CountIf(colRequests, Status = "Pending Review")` |
| Queued           | `CountIf(colRequests, Status = "Queued")` |
| Completed        | `CountIf(colRequests, Status = "Completed")` |
| Critical         | `CountIf(colRequests, Priority = "Critical")` |

Arrange them in a horizontal row using X position increments of `(Parent.Width - 64) / 6`.

### 4.4 Work Volume by Domain — horizontal bar chart

Add a **Vertical Gallery** (`galDomainBars`) with:
```powerfx
// Items property
Sort(
    AddColumns(
        colDomains,
        "RequestCount", CountIf(colRequests, Domain = name)
    ),
    RequestCount,
    SortOrder.Descending
)
```

Inside the gallery template, add:
- **Label** for domain name: `ThisItem.name`
- **Label** for count: `Text(ThisItem.RequestCount)`
- **Background bar rectangle**: Width = `Parent.Width - 20`, Height = 5, Fill = `RGBA(236,239,241,1)`
- **Filled bar rectangle**:
  ```powerfx
  Width = If(
      Max(galDomainBars.AllItems, RequestCount) > 0,
      (ThisItem.RequestCount / Max(galDomainBars.AllItems, RequestCount)) * (Parent.Width - 20),
      4
  )
  Fill = ColorValue(ThisItem.color)
  ```

### 4.5 Status Breakdown — 2×2 grid

Add a **Gallery** (`galStatusBreakdown`) with:
```powerfx
// Items
Table(
    {status:"In Progress",    bg:"#E3F2FD", dot:"#1565C0", textColor:"#0D47A1"},
    {status:"Pending Review", bg:"#FFF8E1", dot:"#F9A825", textColor:"#F57F17"},
    {status:"Completed",      bg:"#E8F5E9", dot:"#2E7D32", textColor:"#1B5E20"},
    {status:"Queued",         bg:"#F3E5F5", dot:"#7B1FA2", textColor:"#4A148C"}
)
```

In the template:
- Count label: `CountIf(colRequests, Status = ThisItem.status)`
- Percent label: `Text(CountIf(colRequests, Status = ThisItem.status) / CountRows(colRequests), "0%") & " of total"`

Set the Gallery `WrapCount` property to **2** for the 2-column grid layout.

### 4.6 Recent Requests gallery

Add a **Vertical Gallery** (`galRecentRequests`) with:
```powerfx
// Items
FirstN(
    SortByColumns(colRequests, "SubmittedDate", SortOrder.Descending),
    5
)
```

Add a **"View All →" Button** → OnSelect: `Navigate(scrTracker)`

---

## Part 5 — Screen 2: Intake Form (`scrIntake`)

### 5.1 Step indicator

Use a **Label** whose text changes with the step variable:
```powerfx
// Step indicator text
Switch(
    gblFormStep,
    1, "Step 1 of 3 — Classification",
    2, "Step 2 of 3 — Details",
    3, "Step 3 of 3 — Review & Submit"
)
```

Show/hide step panels using each panel's **Visible** property:
- Panel 1: `gblFormStep = 1`
- Panel 2: `gblFormStep = 2`
- Panel 3: `gblFormStep = 3`

### 5.2 Step 1 — Classification

**Domain Dropdown** (`ddlDomain`):
```powerfx
Items = colDomains
DisplayFields = ["name"]
```

After domain selection, show a routing hint label:
```powerfx
// Visible
!IsBlank(ddlDomain.Selected.name)

// Text
"✓ Routed to " & ddlDomain.Selected.lead & "  ·  Response SLA: " & ddlDomain.Selected.responseSla
```

**Request Type** — use a **Gallery** in a 2-column grid:
```powerfx
Items = Table(
    {rt:"New Work / Project"}, {rt:"Change Request"},
    {rt:"Incident Support"}, {rt:"Performance Issue"},
    {rt:"Access / Provisioning"}, {rt:"Other"}
)
```
Each item is a **Button** whose `OnSelect` sets: `Set(gblRequestType, ThisItem.rt)`
Highlight selected: `If(gblRequestType = ThisItem.rt, RGBA(0,87,184,1), White)`

**Priority Buttons** — four buttons side by side:
```powerfx
// Each button OnSelect
Set(gblPriority, "Critical")  // or High / Medium / Low

// Fill (example for Critical button)
If(gblPriority = "Critical", RGBA(255,235,238,1), White)

// Border color
If(gblPriority = "Critical", RGBA(183,28,28,1), RGBA(224,224,224,1))
```

**SLA hint label** (shows after priority selected):
```powerfx
// Visible
!IsBlank(gblPriority)

// Text — looks up from colPriorityConfig
"Acknowledge: " &
LookUp(colPriorityConfig, priority = gblPriority, ackSla) &
"   ·   Accept/Reject: " &
LookUp(colPriorityConfig, priority = gblPriority, decisionSla)
```

**"Continue →" Button**:
```powerfx
// DisplayMode
If(
    !IsBlank(ddlDomain.Selected.name) && !IsBlank(gblRequestType) && !IsBlank(gblPriority),
    DisplayMode.Edit,
    DisplayMode.Disabled
)

// OnSelect
Set(gblFormStep, 2)
```

### 5.3 Step 2 — Details

**Text inputs** (set `Default` to `""` and `Reset` on form reset):

| Control Name    | Label                    | Mode           |
|-----------------|--------------------------|----------------|
| `txtTitle`      | Request Title *          | SingleLine     |
| `txtSubmitter`  | Your Name                | SingleLine     |
| `txtDescription`| Description *            | MultiLine      |
| `txtBizJust`    | Business Justification   | MultiLine      |
| `dpTargetDate`  | Target Completion Date   | DatePicker     |

**"Review →" Button**:
```powerfx
DisplayMode = If(!IsBlank(txtTitle.Text) && !IsBlank(txtDescription.Text), DisplayMode.Edit, DisplayMode.Disabled)
OnSelect = Set(gblFormStep, 3)
```

**"← Back" Button**: `OnSelect = Set(gblFormStep, 1)`

### 5.4 Step 3 — Review & Submit

Display a summary using Labels bound to the global variables and input controls. Example:

| Field       | Formula |
|-------------|---------|
| Domain      | `ddlDomain.Selected.name` |
| Routing To  | `ddlDomain.Selected.lead` |
| Request Type | `gblRequestType` |
| Priority    | `gblPriority` |
| Title       | `txtTitle.Text` |
| Submitter   | `If(IsBlank(txtSubmitter.Text), "—", txtSubmitter.Text)` |
| Target Date | `If(IsBlank(dpTargetDate.SelectedDate), "—", Text(dpTargetDate.SelectedDate, "yyyy-mm-dd"))` |
| Description | `txtDescription.Text` |

**"Submit Request ✓" Button → OnSelect**:
```powerfx
// 1. Generate next Request ID
Set(
    gblNextID,
    "MF-" & Text(CountRows('MF-Intake-Requests') + 1, "000")
);

// 2. Patch to SharePoint
Patch(
    'MF-Intake-Requests',
    Defaults('MF-Intake-Requests'),
    {
        Title:                 txtTitle.Text,
        RequestID:             gblNextID,
        Domain:                ddlDomain.Selected.name,
        Team:                  ddlDomain.Selected.lead,
        RequestType:           gblRequestType,
        Priority:              {Value: gblPriority},
        Status:                {Value: "Queued"},
        Description:           txtDescription.Text,
        BusinessJustification: txtBizJust.Text,
        Submitter:             If(IsBlank(txtSubmitter.Text), User().FullName, txtSubmitter.Text),
        SubmittedDate:         Today(),
        TargetDate:            If(IsBlank(dpTargetDate.SelectedDate), Blank(), dpTargetDate.SelectedDate)
    }
);

// 3. Refresh local collection
ClearCollect(colRequests, 'MF-Intake-Requests');

// 4. Trigger email flow
'MFIntakeEmailNotification'.Run(
    "[MF Intake] New " & gblPriority & " Request – " & gblNextID & ": " & txtTitle.Text,
    "Request ID: " & gblNextID &
    Char(10) & "Domain: " & ddlDomain.Selected.name &
    Char(10) & "Priority: " & gblPriority &
    Char(10) & "Submitted by: " & txtSubmitter.Text &
    Char(10) & Char(10) & txtDescription.Text,
    "Patrick.Cassidy@fiserv.com"
);

// 5. Show success state
Set(gblSubmittedID, gblNextID);
Set(gblSubmitted, true);

// 6. Show toast
Set(gblToastMsg, gblNextID & " submitted → routed to " & ddlDomain.Selected.lead);
Set(gblToastVisible, true)
```

**Success panel** (Visible = `gblSubmitted`):
- Show `gblSubmittedID` in large text
- Show routing info from `ddlDomain.Selected.*`
- **"← Return to Dashboard" Button**:
  ```powerfx
  Set(gblSubmitted, false);
  Set(gblFormStep, 1);
  Reset(txtTitle); Reset(txtSubmitter); Reset(txtDescription);
  Reset(txtBizJust); Reset(dpTargetDate);
  Set(gblRequestType, ""); Set(gblPriority, "");
  Navigate(scrDashboard)
  ```

---

## Part 6 — Screen 3: All Requests (`scrTracker`)

### 6.1 Filter controls

**Status Dropdown** (`ddlFilterStatus`):
```powerfx
Items = ["All", "In Progress", "Pending Review", "Completed", "Queued"]
```

**Domain Dropdown** (`ddlFilterDomain`):
```powerfx
Items = Ungroup(Table({val:"All"}), "val").val
// Simpler: hardcode the domain name list or use colDomains
```

**"+ New Request" Button**: `OnSelect = Navigate(scrIntake)`

### 6.2 Requests gallery (`galAllRequests`)

```powerfx
// Items — filtered collection
Filter(
    colRequests,
    (ddlFilterStatus.Selected.Value = "All" || Status = ddlFilterStatus.Selected.Value) &&
    (ddlFilterDomain.Selected.Value = "All" || Domain = ddlFilterDomain.Selected.Value)
)
```

**Row count label**: `Text(CountRows(galAllRequests.AllItems)) & " of " & CountRows(colRequests) & " shown"`

### 6.3 Due-date highlighting in the gallery

For each row's **Fill** (rectangle behind the row):
```powerfx
If(
    !IsBlank(ThisItem.TargetDate) &&
    ThisItem.Status <> "Completed" &&
    DateDiff(Today(), ThisItem.TargetDate, TimeUnit.Days) < 0,
    RGBA(255,248,246,1),      // past due — pale red
    !IsBlank(ThisItem.TargetDate) &&
    ThisItem.Status <> "Completed" &&
    DateDiff(Today(), ThisItem.TargetDate, TimeUnit.Days) <= 3,
    RGBA(255,253,231,1),      // approaching — pale yellow
    If(Mod(ThisItem.ItemNumber, 2) = 0, RGBA(250,251,252,1), White)
)
```

**Due-date label** in each row:
```powerfx
// Text
If(
    IsBlank(ThisItem.TargetDate) || ThisItem.Status = "Completed",
    "—",
    If(
        DateDiff(Today(), ThisItem.TargetDate, TimeUnit.Days) < 0,
        Text(ThisItem.TargetDate, "yyyy-mm-dd") & " (" &
            Text(Abs(DateDiff(Today(), ThisItem.TargetDate, TimeUnit.Days))) & "d overdue)",
        Text(ThisItem.TargetDate, "yyyy-mm-dd") & " (" &
            Text(DateDiff(Today(), ThisItem.TargetDate, TimeUnit.Days)) & "d left)"
    )
)

// Color
If(
    !IsBlank(ThisItem.TargetDate) &&
    DateDiff(Today(), ThisItem.TargetDate, TimeUnit.Days) < 0,
    RGBA(183,28,28,1),
    If(
        !IsBlank(ThisItem.TargetDate) &&
        DateDiff(Today(), ThisItem.TargetDate, TimeUnit.Days) <= 3,
        RGBA(230,81,0,1),
        RGBA(84,110,122,1)
    )
)
```

---

## Part 7 — Power Automate Flow (Email Notifications)

### 7.1 Create the flow

1. Go to **flow.microsoft.com** → **New flow → Instant cloud flow**
2. Name: **MF Intake – Email Notification**
3. Trigger: **Power Apps (V2)**

### 7.2 Flow inputs

Add three inputs in the trigger:
| Name      | Type   |
|-----------|--------|
| `Subject` | Text   |
| `Body`    | Text   |
| `To`      | Text   |

### 7.3 Flow action

Add action: **Office 365 Outlook – Send an email (V2)**
- **To**: `triggerBody()['text']` (the `To` input)
  *Or hard-code `Patrick.Cassidy@fiserv.com` if it never changes*
- **Subject**: `triggerBody()['text_1']` (the `Subject` input)
- **Body**: `triggerBody()['text_2']` (the `Body` input)

Save the flow.

### 7.4 Connect flow to Power Apps

1. In Power Apps, open the app → **Data → Power Automate → Add flow**
2. Select **MF Intake – Email Notification**
3. The flow becomes available as `'MFIntakeEmailNotification'` in your formulas

---

## Part 8 — Toast Notification (Global)

Add a **Rectangle + Label** at the top of each screen (or in the App overlay if
using Power Apps containers). Place them above everything else with a high Z-index.

```powerfx
// Rectangle Fill
RGBA(27,94,32,1)    // success green

// Label Text
"✓ " & gblToastMsg

// Visible (both)
gblToastVisible
```

To auto-hide after 3 seconds, use a **Timer** control:
```powerfx
// Timer Duration
3000

// AutoStart
gblToastVisible

// OnTimerEnd
Set(gblToastVisible, false); Set(gblToastMsg, "")
```

---

## Part 9 — Priority & Status Badge Styling

Reuse this pattern throughout the app to render colored badges:

**Priority badge background color**:
```powerfx
Switch(
    ThisItem.Priority,
    "Critical", RGBA(255,235,238,1),
    "High",     RGBA(255,243,224,1),
    "Medium",   RGBA(227,242,253,1),
    "Low",      RGBA(241,248,233,1),
    RGBA(245,247,250,1)
)
```

**Priority badge text color**:
```powerfx
Switch(
    ThisItem.Priority,
    "Critical", RGBA(183,28,28,1),
    "High",     RGBA(230,81,0,1),
    "Medium",   RGBA(13,71,161,1),
    "Low",      RGBA(51,105,30,1),
    RGBA(96,125,139,1)
)
```

**Status badge background color**:
```powerfx
Switch(
    ThisItem.Status,
    "In Progress",    RGBA(227,242,253,1),
    "Pending Review", RGBA(255,248,225,1),
    "Completed",      RGBA(232,245,233,1),
    "Queued",         RGBA(243,229,245,1),
    RGBA(245,247,250,1)
)
```

---

## Part 10 — Refresh Strategy

Add a **Refresh button** on the Dashboard and Tracker screens:
```powerfx
// OnSelect
ClearCollect(colRequests, 'MF-Intake-Requests');
ClearCollect(
    colDueAlerts,
    Filter(
        colRequests,
        Status <> "Completed" &&
        !IsBlank(TargetDate) &&
        DateDiff(Today(), TargetDate, TimeUnit.Days) <= 3
    )
)
```

For automatic refresh, add a **Timer** control with:
- Duration: `300000` (5 minutes)
- Repeat: `true`
- AutoStart: `true`
- OnTimerEnd: same ClearCollect formulas above

---

## Part 11 — Testing Checklist

- [ ] SharePoint list created with all columns and choice values
- [ ] App loads and `colRequests` populates from SharePoint
- [ ] Dashboard KPI counts match SharePoint data
- [ ] Domain bar chart renders proportional bars
- [ ] Due-alert banner appears for items ≤ 3 days or past due
- [ ] Intake form Step 1 → Continue disabled until all 3 fields selected
- [ ] Domain selection shows correct routing/SLA hint
- [ ] Step 2 → Review disabled until Title and Description filled
- [ ] Submitting creates a new row in SharePoint with correct RequestID (MF-XXX)
- [ ] Email flow triggers and arrives in Patrick's inbox
- [ ] Success screen shows correct ID, routing team, and SLAs
- [ ] All Requests screen filters by status and domain
- [ ] Row colors highlight past-due (red) and approaching (yellow) items
- [ ] Toast notification appears and auto-hides after ~3 seconds

---

## Quick Reference — Key Global Variables

| Variable           | Type       | Purpose |
|--------------------|------------|---------|
| `colRequests`      | Collection | All SharePoint records (local cache) |
| `colDomains`       | Collection | Domain metadata (name, lead, color, SLA) |
| `colPriorityConfig`| Collection | Priority SLA lookup table |
| `colDueAlerts`     | Collection | Items past due or within 3 days |
| `gblFormStep`      | Number     | 1 / 2 / 3 — controls which form panel is visible |
| `gblRequestType`   | Text       | Selected request type in intake form |
| `gblPriority`      | Text       | Selected priority in intake form |
| `gblSubmitted`     | Boolean    | Shows success screen when true |
| `gblSubmittedID`   | Text       | ID of the just-submitted request |
| `gblToastMsg`      | Text       | Toast notification message |
| `gblToastVisible`  | Boolean    | Controls toast visibility |
| `gblNextID`        | Text       | Computed MF-XXX ID on submit |
