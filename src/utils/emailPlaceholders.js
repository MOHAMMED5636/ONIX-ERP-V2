export const EMAIL_PLACEHOLDER_GROUPS = [
  {
    group: "INVOICE",
    items: [
      { key: "Balance", label: "Balance" },
      { key: "InvoiceIssueDate", label: "Invoice Issue Date" },
      { key: "Subject", label: "Subject" },
      { key: "Adjustment", label: "Adjustment" },
      { key: "ProfileName", label: "Profile Name" },
      { key: "CreatedBy", label: "Created By" },
      { key: "Section", label: "Section" },
      { key: "DueDate", label: "DueDate" },
      { key: "InvoiceNumber", label: "InvoiceNumber" },
      { key: "PONumber", label: "P.O. Number" },
      { key: "OverdueDays", label: "OverdueDays" },
      { key: "ProjectName", label: "Project Name" },
      { key: "OutstandingInvoices", label: "Outstanding Invoices" },
      { key: "PaymentLink", label: "Payment Link" },
      { key: "InvoiceDate", label: "InvoiceDate" },
      { key: "InvoiceURL", label: "Invoice URL" },
      { key: "ShippingCharge", label: "Shipping charge" },
      { key: "Total", label: "Total" },
      { key: "InvoicePaymentLink", label: "Invoice Payment Link" },
      { key: "Branches", label: "Branches" },
    ],
  },
  {
    group: "CUSTOMER",
    items: [
      { key: "CompanyName", label: "Company Name" },
      { key: "Website", label: "Website" },
      { key: "FirstName", label: "FirstName" },
      { key: "Designation", label: "Designation" },
      { key: "CreditLimit", label: "Credit Limit" },
      { key: "Salutation", label: "Salutation" },
      { key: "OutstandingBalance", label: "Outstanding Balance" },
      { key: "LastName", label: "LastName" },
      { key: "CustomerEmail", label: "Customer Email" },
      { key: "CustomerBalanceTable", label: "Customer Balance Table" },
      { key: "CustomerBalance", label: "Customer Balance" },
      { key: "CustomerName", label: "Customer Name" },
      { key: "Department", label: "Department" },
      { key: "CreatedBy", label: "Created By" },
      { key: "CustomerNumber", label: "Customer Number" },
    ],
  },
  {
    group: "ORGANIZATION",
    items: [
      { key: "Name", label: "Name" },
      { key: "Email", label: "Email" },
      { key: "Website", label: "Website" },
      { key: "User", label: "User" },
      { key: "Phone", label: "Phone#" },
      { key: "PortalURL", label: "Portal URL" },
      { key: "UserRole", label: "User Role" },
      { key: "Fax", label: "Fax#" },
    ],
  },
  // Existing ERP variables you already use in other flows (kept for compatibility)
  {
    group: "ERP",
    items: [
      { key: "EmployeeName", label: "Employee Name" },
      { key: "Password", label: "Password" },
      { key: "LoginURL", label: "Login URL" },
    ],
  },
];

export function flattenEmailPlaceholders() {
  const out = [];
  for (const g of EMAIL_PLACEHOLDER_GROUPS) {
    for (const it of g.items) out.push({ ...it, group: g.group });
  }
  return out;
}

