# Mainframe Intake Dashboard — PowerApps

An internal PowerApps Canvas App for submitting, tracking, and approving mainframe work requests. Built on SharePoint as the data backend with Power Automate handling the approval workflow.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PowerApps Canvas App                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Dashboard   │  │  Intake Form │  │ Request Detail│  │
│  │  (KPIs +     │→ │  (New/Edit)  │→ │ (View/Admin)  │  │
│  │   List)      │  │              │  │               │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
    ┌─────────────┐ ┌───────────┐ ┌──────────────┐
    │ SharePoint  │ │  Power    │ │ Office 365   │
    │ List        │ │  Automate │ │ Connectors   │
    │ (Data)      │ │ (Approval)│ │ (Users/Mail) │
    └─────────────┘ └───────────┘ └──────────────┘
```

## Screens

| Screen | Purpose |
|---|---|
| **DashboardScreen** | KPI cards (open, critical, awaiting approval, completed this month), filterable request gallery with search, status/priority/department filters |
| **IntakeFormScreen** | New/edit form with requestor info, request details (type, priority, environment, subsystems), description, justification, attachments |
| **RequestDetailScreen** | Read-only view with admin panel for assignment, status updates, notes, and audit trail |

## Request Lifecycle

```
Draft → Submitted → Under Review → Approved → In Progress → Completed
                         ↓                        ↓
                      Rejected                  On Hold
```

## Setup

### 1. Provision the SharePoint List

```powershell
# Install PnP PowerShell if needed
Install-Module PnP.PowerShell -Scope CurrentUser

# Run the provisioning script
./scripts/provision-sharepoint-list.ps1 -SiteUrl "https://<tenant>.sharepoint.com/sites/MainframeOps"
```

This creates the **Mainframe Intake Requests** list with all required columns, choice values, and a default dashboard view.

### 2. Create the PowerApps Canvas App

1. Go to [make.powerapps.com](https://make.powerapps.com)
2. Create a new **Canvas App** (tablet layout recommended)
3. Add the SharePoint list as a data source:
   - Data → Add data → SharePoint → enter your site URL → select **Mainframe Intake Requests**
4. Add connectors:
   - **Office365Users** (for user search in assignment dropdown)
   - **Office365Outlook** (optional, for in-app email)

### 3. Import Screens

For each YAML file in `src/screens/`:
1. Open the YAML file
2. In PowerApps Studio, recreate the screen layout following the YAML structure
3. Copy the Power Fx formulas from the `Properties` values into each control

Configure app-level settings from `src/components/AppConfig.yaml`:
- Paste the `OnStart` formula into **App → OnStart**
- Set **App → StartScreen** to `DashboardScreen`

### 4. Import the Approval Flow

1. Go to [make.powerautomate.com](https://make.powerautomate.com)
2. Create a new **Automated Cloud Flow**
3. Configure using the structure in `src/flows/ApprovalFlow.json`:
   - Trigger: SharePoint — When an item is created or modified
   - Filter: Only fire when Status = "Submitted"
   - Approval action with priority-based routing
   - Status update + email notification on approve/reject

### 5. Customize

- **Admin emails**: Update `varIsAdmin` in `AppConfig.yaml` and `RequestDetailScreen.yaml` with your mainframe team emails or security group
- **Approval routing**: Update `ApprovalFlow.json` approver addresses
- **Branding**: Modify `varColorPrimary` and other theme variables in `AppConfig.yaml`

## Project Structure

```
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.yaml       # Main dashboard with KPIs and request list
│   │   ├── IntakeFormScreen.yaml      # New/edit request form
│   │   └── RequestDetailScreen.yaml   # Request detail + admin actions
│   ├── components/
│   │   └── AppConfig.yaml             # App.OnStart, theme, data sources
│   ├── data/
│   │   ├── schema.json                # JSON Schema for the intake request record
│   │   └── enums.json                 # Dropdown/choice values reference
│   └── flows/
│       └── ApprovalFlow.json          # Power Automate approval flow definition
├── scripts/
│   └── provision-sharepoint-list.ps1  # PnP PowerShell list provisioning
└── README.md
```

## Data Source

The SharePoint list **Mainframe Intake Requests** contains these columns:

| Column | Type | Required |
|---|---|---|
| Title | Single line text | Yes |
| RequestorName | Single line text | Yes |
| RequestorEmail | Single line text | Yes |
| Department | Choice | Yes |
| RequestType | Choice | Yes |
| Priority | Choice (default: Medium) | Yes |
| MainframeEnvironment | Choice | Yes |
| SystemsAffected | Multi-line text | No |
| Description | Multi-line text | Yes |
| BusinessJustification | Multi-line text | No |
| RequestedCompletionDate | Date | No |
| Status | Choice (default: Draft) | Yes |
| AssignedTo | Single line text | No |
| ApproverName | Single line text | No |
| ApprovalDate | Date/Time | No |
| CompletionDate | Date/Time | No |
| Notes | Multi-line text | No |

## Connectors Required

| Connector | Purpose |
|---|---|
| SharePoint | CRUD operations on the intake list |
| Office365Users | User search for the assignment dropdown |
| Office365Outlook | Email notifications (optional) |
| Approvals | Power Automate approval actions |
