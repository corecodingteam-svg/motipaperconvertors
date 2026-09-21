const XLSX = require("xlsx");

const data = [
  // Header row
  ["#", "Category", "Feature / Fix", "Type", "Status"],

  // Job Card Management
  ["", "Job Card Management", "", "", ""],
  [1,  "Job Cards", "Job card rows are clickable — opens full detail popup", "New Feature", "✅ Done"],
  [2,  "Job Cards", "Card-style job listing with status color, elevation & rounded corners", "Enhancement", "✅ Done"],
  [3,  "Job Cards", "New jobs saved as Draft by default — invisible to staff until published", "New Feature", "✅ Done"],
  [4,  "Job Cards", "Next button on each step auto-saves as draft", "New Feature", "✅ Done"],
  [5,  "Job Cards", "Final step (Step 6) publishes the job card in one click", "New Feature", "✅ Done"],
  [6,  "Job Cards", "Draft jobs can be Discarded (deleted) from the listing", "New Feature", "✅ Done"],
  [7,  "Job Cards", "Edit button scrolls screen to top automatically", "Fix", "✅ Done"],
  [8,  "Job Cards", "Print button added inside the job card detail popup", "Enhancement", "✅ Done"],
  [9,  "Job Cards", "Company name and contact number visible in detail popup", "Fix", "✅ Done"],
  [10, "Job Cards", "Company name shown in job card listing (replacing personal name)", "Enhancement", "✅ Done"],
  [11, "Job Cards", "Due date cannot be set before today's date", "Fix", "✅ Done"],
  [12, "Job Cards", "Created date shown in listing and detail view", "Enhancement", "✅ Done"],
  [13, "Job Cards", "Color-coded rows by job status (enquiry, design, print, etc.)", "Enhancement", "✅ Done"],

  // Reports
  ["", "Reports", "", "", ""],
  [14, "Reports", "Reports split into 8 tabs (Monthly Revenue, Pipeline, Clients, Outstanding, Profitability, Paper Usage, Machines, Staff Output)", "New Feature", "✅ Done"],
  [15, "Reports", "Global date range filter applies to all report tabs", "New Feature", "✅ Done"],
  [16, "Reports", "All charts and cards are clickable — opens detail list for that item", "New Feature", "✅ Done"],
  [17, "Reports", "Click a status bar → see all jobs with that status", "New Feature", "✅ Done"],
  [18, "Reports", "Click a client row → see all their invoices", "New Feature", "✅ Done"],
  [19, "Reports", "Click a machine card → see all jobs on that machine", "New Feature", "✅ Done"],
  [20, "Reports", "Click a staff card → see jobs assigned to that operator", "New Feature", "✅ Done"],
  [21, "Reports", "Click a month on revenue chart → see invoices for that month", "New Feature", "✅ Done"],
  [22, "Reports", "Each drill-down has its own CSV export", "New Feature", "✅ Done"],

  // Inventory
  ["", "Inventory", "", "", ""],
  [23, "Inventory", "Paper stock edit now saves correctly (fixed column name bug)", "Fix", "✅ Done"],
  [24, "Inventory", "Ink/Plates form — removed unnecessary Reorder Level field", "Enhancement", "✅ Done"],
  [25, "Inventory", "Daily Paper Rate popup — appears once per day on first login", "New Feature", "✅ Done"],
  [26, "Inventory", "Paper rates auto-calculate cost per unit from rate per ream", "New Feature", "✅ Done"],
  [27, "Inventory", "Paper Rates button on Dashboard for manual access anytime", "New Feature", "✅ Done"],

  // Staff & Sub Admin
  ["", "Staff & Sub Admin", "", "", ""],
  [28, "Staff", "Deactivated staff cannot login or be assigned to job cards", "New Feature", "✅ Done"],
  [29, "Staff", "Delete option for inactive staff (soft delete — data preserved)", "New Feature", "✅ Done"],
  [30, "Staff", "Admin can change password of any staff or sub admin", "New Feature", "✅ Done"],
  [31, "Sub Admin", "Sub Admins can be created directly (no invite email needed)", "Enhancement", "✅ Done"],
  [32, "Sub Admin", "Permission matrix loads existing permissions correctly", "Fix", "✅ Done"],
  [33, "Sub Admin", "Activity Log permission added to sub admin options", "Enhancement", "✅ Done"],

  // Permissions
  ["", "Roles & Permissions", "", "", ""],
  [34, "Permissions", "UI hides features based on permissions — sub admins see only allowed modules", "New Feature", "✅ Done"],
  [35, "Permissions", "Sidebar navigation hides restricted modules per role", "New Feature", "✅ Done"],
  [36, "Permissions", "Add/Edit/Delete buttons hidden based on per-module permissions", "New Feature", "✅ Done"],

  // Activity Log
  ["", "Activity Log", "", "", ""],
  [37, "Activity Log", "New centralized Activity Log page — tracks all actions in the system", "New Module", "✅ Done"],
  [38, "Activity Log", "Logs: logins, logouts, failed logins, job changes, status changes, billing, inventory", "New Feature", "✅ Done"],
  [39, "Activity Log", "5 summary cards: Total, Today, Unique Users, Failed, Security Events", "New Feature", "✅ Done"],
  [40, "Activity Log", "Dashboard: 7-day activity chart and top modules chart", "New Feature", "✅ Done"],
  [41, "Activity Log", "Search across: user, email, action, entity, IP address, description", "New Feature", "✅ Done"],
  [42, "Activity Log", "Filters: date range, category, module, action, source, status", "New Feature", "✅ Done"],
  [43, "Activity Log", "Expandable rows with full detail side drawer (before/after diff viewer)", "New Feature", "✅ Done"],
  [44, "Activity Log", "CSV export with active filters", "New Feature", "✅ Done"],
  [45, "Activity Log", "Sensitive data (passwords, tokens) automatically masked", "Security", "✅ Done"],

  // UI/UX
  ["", "UI / UX", "", "", ""],
  [46, "UI/UX", "All action buttons converted to icon-only with tooltips (✏️ 🗑️ 🔑 🔴 🟢)", "Enhancement", "✅ Done"],
  [47, "UI/UX", "Shimmer loading animation on all listing pages", "Enhancement", "✅ Done"],
  [48, "UI/UX", "All dates standardized to DD/MM/YYYY format across all screens", "Fix", "✅ Done"],
  [49, "UI/UX", "Session stays logged in for 30 minutes (extended from 15 minutes)", "Fix", "✅ Done"],
  [50, "UI/UX", "Print option added to all listing pages", "Enhancement", "✅ Done"],

  // Bug Fixes
  ["", "Bug Fixes", "", "", ""],
  [51, "Bug Fix", "Auto-logout issue fixed (token refresh race condition resolved)", "Fix", "✅ Done"],
  [52, "Bug Fix", "Inventory paper & ink/plates edit now saves correctly", "Fix", "✅ Done"],
  [53, "Bug Fix", "Sub admin permission matrix was showing empty — now loads correctly", "Fix", "✅ Done"],
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(data);

// Column widths
ws["!cols"] = [
  { wch: 4 },   // #
  { wch: 22 },  // Category
  { wch: 80 },  // Feature/Fix
  { wch: 16 },  // Type
  { wch: 10 },  // Status
];

// Style header row
const headerStyle = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "3B5BDB" } }, alignment: { horizontal: "center" } };
["A1","B1","C1","D1","E1"].forEach(cell => {
  if (ws[cell]) ws[cell].s = headerStyle;
});

// Style category rows
data.forEach((row, i) => {
  if (row[0] === "" && row[1] !== "") {
    const rowNum = i + 1;
    ["A","B","C","D","E"].forEach(col => {
      const cell = col + rowNum;
      if (!ws[cell]) ws[cell] = { v: "", t: "s" };
      ws[cell].s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "374151" } } };
    });
  }
});

XLSX.utils.book_append_sheet(wb, ws, "Changes 15-19 Aug 2026");
XLSX.writeFile(wb, "MotiPaper_Changes_15-19Aug2026.xlsx");
console.log("✅ Excel file created: MotiPaper_Changes_15-19Aug2026.xlsx");
