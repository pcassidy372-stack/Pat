# =============================================================================
# provision-sharepoint-list.ps1
# Creates the "Mainframe Intake Requests" SharePoint list with all columns
# Requires: PnP.PowerShell module (Install-Module PnP.PowerShell)
# =============================================================================

param(
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,    # e.g. "https://contoso.sharepoint.com/sites/MainframeOps"

    [string]$ListName = "Mainframe Intake Requests"
)

# ── Connect to SharePoint ────────────────────────────────────────────────────
Write-Host "Connecting to $SiteUrl ..." -ForegroundColor Cyan
Connect-PnPOnline -Url $SiteUrl -Interactive

# ── Create the list ──────────────────────────────────────────────────────────
Write-Host "Creating list: $ListName" -ForegroundColor Cyan
$list = Get-PnPList -Identity $ListName -ErrorAction SilentlyContinue
if ($null -eq $list) {
    New-PnPList -Title $ListName -Template GenericList -EnableVersioning
    Write-Host "  List created." -ForegroundColor Green
} else {
    Write-Host "  List already exists, adding missing columns." -ForegroundColor Yellow
}

# ── Helper: add a field only if it doesn't exist ─────────────────────────────
function Add-FieldIfMissing {
    param(
        [string]$DisplayName,
        [string]$InternalName,
        [string]$FieldType,
        [string[]]$Choices = @(),
        [bool]$Required = $false,
        [string]$DefaultValue = ""
    )

    $existing = Get-PnPField -List $ListName -Identity $InternalName -ErrorAction SilentlyContinue
    if ($null -ne $existing) {
        Write-Host "  [$InternalName] already exists, skipping." -ForegroundColor DarkGray
        return
    }

    $params = @{
        List         = $ListName
        DisplayName  = $DisplayName
        InternalName = $InternalName
        Type         = $FieldType
        Required     = $Required
    }

    if ($FieldType -eq "Choice" -and $Choices.Count -gt 0) {
        $params["Choices"] = $Choices
    }

    Add-PnPField @params | Out-Null

    if ($DefaultValue -ne "") {
        $field = Get-PnPField -List $ListName -Identity $InternalName
        $field.DefaultValue = $DefaultValue
        $field.Update()
        Invoke-PnPQuery
    }

    Write-Host "  [$InternalName] added ($FieldType)." -ForegroundColor Green
}

# ── Add columns ──────────────────────────────────────────────────────────────

Add-FieldIfMissing -DisplayName "Requestor Name" `
    -InternalName "RequestorName" `
    -FieldType "Text" `
    -Required $true

Add-FieldIfMissing -DisplayName "Requestor Email" `
    -InternalName "RequestorEmail" `
    -FieldType "Text" `
    -Required $true

Add-FieldIfMissing -DisplayName "Department" `
    -InternalName "Department" `
    -FieldType "Choice" `
    -Choices @("Finance","Operations","IT Infrastructure",
               "Application Development","Risk & Compliance",
               "HR","Customer Service","Other") `
    -Required $true

Add-FieldIfMissing -DisplayName "Request Type" `
    -InternalName "RequestType" `
    -FieldType "Choice" `
    -Choices @("New Job Scheduling","Job Modification","Access Request",
               "Capacity Change","Incident / Break-Fix","Decommission",
               "Data Migration","Performance Tuning","Security Review","Other") `
    -Required $true

Add-FieldIfMissing -DisplayName "Priority" `
    -InternalName "Priority" `
    -FieldType "Choice" `
    -Choices @("Critical","High","Medium","Low") `
    -Required $true `
    -DefaultValue "Medium"

Add-FieldIfMissing -DisplayName "Mainframe Environment" `
    -InternalName "MainframeEnvironment" `
    -FieldType "Choice" `
    -Choices @("Production","Pre-Production","QA","Development","Disaster Recovery") `
    -Required $true

Add-FieldIfMissing -DisplayName "Systems Affected" `
    -InternalName "SystemsAffected" `
    -FieldType "Note"

Add-FieldIfMissing -DisplayName "Description" `
    -InternalName "Description" `
    -FieldType "Note" `
    -Required $true

Add-FieldIfMissing -DisplayName "Business Justification" `
    -InternalName "BusinessJustification" `
    -FieldType "Note"

Add-FieldIfMissing -DisplayName "Requested Completion Date" `
    -InternalName "RequestedCompletionDate" `
    -FieldType "DateTime"

Add-FieldIfMissing -DisplayName "Status" `
    -InternalName "Status" `
    -FieldType "Choice" `
    -Choices @("Draft","Submitted","Under Review","Approved",
               "In Progress","On Hold","Completed","Rejected","Cancelled") `
    -Required $true `
    -DefaultValue "Draft"

Add-FieldIfMissing -DisplayName "Assigned To" `
    -InternalName "AssignedTo" `
    -FieldType "Text"

Add-FieldIfMissing -DisplayName "Approver Name" `
    -InternalName "ApproverName" `
    -FieldType "Text"

Add-FieldIfMissing -DisplayName "Approval Date" `
    -InternalName "ApprovalDate" `
    -FieldType "DateTime"

Add-FieldIfMissing -DisplayName "Completion Date" `
    -InternalName "CompletionDate" `
    -FieldType "DateTime"

Add-FieldIfMissing -DisplayName "Notes" `
    -InternalName "Notes" `
    -FieldType "Note"

# ── Create default list view ────────────────────────────────────────────────
Write-Host "`nCreating dashboard view..." -ForegroundColor Cyan

$viewFields = @(
    "ID", "Title", "RequestorName", "Department", "RequestType",
    "Priority", "MainframeEnvironment", "Status", "AssignedTo", "Created"
)

$existingView = Get-PnPView -List $ListName -Identity "Dashboard View" -ErrorAction SilentlyContinue
if ($null -eq $existingView) {
    Add-PnPView -List $ListName `
        -Title "Dashboard View" `
        -Fields $viewFields `
        -SetAsDefault `
        -Query "<OrderBy><FieldRef Name='Created' Ascending='FALSE'/></OrderBy>"
    Write-Host "  Dashboard view created." -ForegroundColor Green
} else {
    Write-Host "  Dashboard view already exists." -ForegroundColor Yellow
}

# ── Summary ──────────────────────────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " SharePoint list provisioned successfully" -ForegroundColor Green
Write-Host " Site: $SiteUrl" -ForegroundColor White
Write-Host " List: $ListName" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext steps:"
Write-Host "  1. Open PowerApps Studio"
Write-Host "  2. Add '$ListName' as a data source"
Write-Host "  3. Import the screen YAML files from src/screens/"
Write-Host "  4. Import the approval flow from src/flows/ApprovalFlow.json"
Write-Host ""

Disconnect-PnPOnline
