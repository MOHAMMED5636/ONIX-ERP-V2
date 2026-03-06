# 📊 Payroll Process - Complete Explanation

## 🎯 Overview

The Payroll system automatically calculates employee salaries by combining:
- **Employee salary data** (from Employees module)
- **Attendance records** (from Attendance module)
- **Leave records** (from Leaves module)
- **Deduction rules** (from Payroll Settings)

---

## 🔄 Complete Payroll Process Flow

### **STEP 1: Configuration (One-Time Setup)**

**What happens:**
- Admin/HR configures deduction rules in **Payroll Settings**

**Settings include:**
- ✅ **Grace Period**: How many minutes late before deduction starts (e.g., 15 minutes)
- ✅ **Late Deduction**: Amount deducted per minute late (e.g., 0.5 AED per minute)
- ✅ **Absence Deduction**: How to deduct for absent days (Daily Rate or Percentage)
- ✅ **Unpaid Leave Deduction**: How to deduct for unpaid leave days

**Example:**
```
Grace Period: 15 minutes
Late Deduction: 0.5 AED per minute
Absence Deduction: Daily Rate (1.0 = full daily rate)
Unpaid Leave: Daily Rate (1.0 = full daily rate)
```

---

### **STEP 2: Create Payroll Run**

**What happens:**
1. Admin/HR navigates to **Payroll** → **New Payroll Run**
2. Selects **Month** and **Year** (e.g., February 2026)
3. System calculates period dates:
   - Start: February 1, 2026
   - End: February 28, 2026

**What the system does:**
- Creates a new **Payroll Run** record with status = **DRAFT**
- Period is locked (cannot create duplicate payroll for same month/year)

---

### **STEP 3: Automatic Payroll Calculation**

**When:** After creating payroll run, system automatically:

#### **3.1 Fetch Active Employees**
- Gets all employees with status = "ACTIVE"
- Filters employees who joined before period end date

#### **3.2 Snapshot Employee Data**
For each employee, system saves a snapshot:
- ✅ Basic Salary
- ✅ Total Allowances
- ✅ Employee ID
- ✅ Department
- ✅ Joining Date

**Why snapshot?** Prevents future salary changes from affecting past payrolls.

#### **3.3 Fetch Attendance Records**
For each employee, system fetches attendance for the period:
- ✅ Working days (present)
- ✅ Absent days
- ✅ Late instances
- ✅ Total late minutes
- ✅ Early leave minutes (if applicable)

**Example:**
```
Employee: John Doe
Period: Feb 1-28, 2026
- Working Days: 20
- Absent Days: 2
- Late Instances: 3
- Total Late Minutes: 45 minutes
```

#### **3.4 Fetch Leave Records**
For each employee, system fetches approved leaves:
- ✅ Paid Leave Days (no deduction)
- ✅ Unpaid Leave Days (deduction applies)

**Example:**
```
Employee: John Doe
- Paid Leave: 2 days
- Unpaid Leave: 1 day
```

#### **3.5 Calculate Deductions**

**For each employee, system calculates:**

**A. Late Deduction:**
```
Late Minutes = 45 minutes
Grace Period = 15 minutes
Deductible Minutes = 45 - 15 = 30 minutes
Late Deduction = 30 × 0.5 AED = 15 AED
```

**B. Absence Deduction:**
```
Absent Days = 2 days
Daily Rate = (Basic + Allowances) ÷ Working Days in Month
Absence Deduction = 2 × Daily Rate
```

**C. Unpaid Leave Deduction:**
```
Unpaid Leave Days = 1 day
Daily Rate = (Basic + Allowances) ÷ Working Days in Month
Unpaid Leave Deduction = 1 × Daily Rate
```

**D. Manual Adjustments:**
- HR/Admin can add manual adjustments (bonus or penalty)
- Example: +500 AED bonus or -200 AED penalty

**Total Deductions = Late + Absence + Unpaid Leave + Manual Adjustments**

#### **3.6 Calculate Net Salary**

**For each employee:**
```
Gross Salary = Basic Salary + Allowances
Total Deductions = Late + Absence + Unpaid Leave + Manual Adjustments
Net Salary = Gross Salary - Total Deductions
```

**Example Calculation:**
```
Employee: John Doe
Basic Salary: 5,000 AED
Allowances: 1,000 AED
Gross Salary: 6,000 AED

Deductions:
- Late: 15 AED
- Absence: 400 AED (2 days × 200 AED/day)
- Unpaid Leave: 200 AED (1 day × 200 AED/day)
- Manual Adjustments: 0 AED
Total Deductions: 615 AED

Net Salary: 6,000 - 615 = 5,385 AED
```

#### **3.7 Create Payroll Lines**

System creates one **PayrollLine** record for each employee:
- ✅ Employee ID
- ✅ Gross Salary
- ✅ All deduction breakdowns
- ✅ Net Salary
- ✅ Attendance summary
- ✅ Leave summary
- ✅ Snapshot data

#### **3.8 Calculate Totals**

System calculates payroll run totals:
- ✅ Total Employees
- ✅ Total Gross Salary (sum of all gross salaries)
- ✅ Total Deductions (sum of all deductions)
- ✅ Total Net Salary (sum of all net salaries)

**Status:** Payroll Run remains in **DRAFT** status

---

### **STEP 4: Review & Manual Adjustments**

**What happens:**
1. Admin/HR opens the payroll run details page
2. Reviews all employee payroll lines
3. Can make manual adjustments:
   - Click "Adjust" button on any employee line
   - Add positive amount (bonus) or negative amount (penalty)
   - Add notes explaining the adjustment
   - Save adjustment

**Example:**
```
Employee: John Doe
Original Net: 5,385 AED
Manual Adjustment: +500 AED (Performance Bonus)
New Net: 5,885 AED
```

**Status:** Still **DRAFT** (can be edited)

---

### **STEP 5: Approval Workflow**

Payroll must pass through **3 approval stages**:

#### **5.1 HR Approval**
- **Who:** HR Manager
- **Action:** Reviews payroll for accuracy
- **Can:** Approve or request changes
- **After Approval:** Status changes to **HR_APPROVED**

#### **5.2 Finance Approval**
- **Who:** Finance Manager/Admin
- **Action:** Reviews financial totals and deductions
- **Can:** Approve or request changes
- **After Approval:** Status changes to **FINANCE_APPROVED**

#### **5.3 Final Approval**
- **Who:** Admin/CEO
- **Action:** Final review before locking
- **Can:** Approve or request changes
- **After Approval:** Status changes to **FINAL_APPROVED**

**Note:** At any stage, approver can add comments explaining their decision.

---

### **STEP 6: Lock Payroll**

**What happens:**
- After **Final Approval**, Admin clicks **"Lock Payroll"** button
- System locks the payroll run:
  - ✅ Status changes to **LOCKED**
  - ✅ No more edits allowed
  - ✅ No more adjustments allowed
  - ✅ Payroll is finalized

**Why lock?** Prevents accidental changes to finalized payrolls.

---

### **STEP 7: Generate Outputs**

**After locking, system can generate:**

#### **7.1 Individual Payslips**
- Click "Generate Payslip" on any employee line
- System creates PDF payslip showing:
  - ✅ Employee details
  - ✅ Period dates
  - ✅ Gross salary breakdown
  - ✅ Deduction breakdown
  - ✅ Net salary
  - ✅ Attendance summary
  - ✅ Leave summary

#### **7.2 Payroll Register**
- Click "Download Register" button
- System creates PDF report showing:
  - ✅ All employees in payroll run
  - ✅ Summary totals
  - ✅ Individual line items
  - ✅ Grand totals

---

## 📊 Visual Process Flow

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Configure Settings                             │
│ ─────────────────────────────────────────────────────── │
│ Admin sets deduction rules                              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Create Payroll Run                             │
│ ─────────────────────────────────────────────────────── │
│ Select Month/Year → System creates DRAFT payroll      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Automatic Calculation                         │
│ ─────────────────────────────────────────────────────── │
│ 1. Fetch Active Employees                              │
│ 2. Snapshot Salary Data                                │
│ 3. Fetch Attendance Records                            │
│ 4. Fetch Leave Records                                 │
│ 5. Calculate Deductions                                │
│ 6. Calculate Net Salary                                │
│ 7. Create Payroll Lines                                │
│ 8. Calculate Totals                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Review & Adjust                                │
│ ─────────────────────────────────────────────────────── │
│ HR reviews lines → Makes manual adjustments if needed   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Approval Workflow                               │
│ ─────────────────────────────────────────────────────── │
│ HR Approval → Finance Approval → Final Approval        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Lock Payroll                                    │
│ ─────────────────────────────────────────────────────── │
│ Admin locks payroll → Status = LOCKED                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 7: Generate Outputs                                │
│ ─────────────────────────────────────────────────────── │
│ Generate Payslips & Payroll Register PDFs              │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Key Concepts

### **1. Snapshot System**
- When payroll is created, system saves a snapshot of:
  - Employee salary data
  - Payroll settings used
- **Why?** Prevents future changes from affecting past payrolls
- **Example:** If employee gets salary increase in March, February payroll remains unchanged

### **2. Deduction Rules**
- **Late Deduction:** Based on minutes late (after grace period)
- **Absence Deduction:** Based on daily rate or percentage
- **Unpaid Leave:** Based on daily rate or percentage
- All rules are configurable in Settings

### **3. Approval Workflow**
- **3 stages:** HR → Finance → Final
- **Purpose:** Ensure accuracy before finalizing
- **Comments:** Approvers can add notes
- **Audit Trail:** System records who approved and when

### **4. Locking Mechanism**
- After final approval, payroll is locked
- **Cannot edit** locked payrolls
- **Cannot adjust** locked payrolls
- **Purpose:** Maintain data integrity

---

## 📋 Example Scenario

**Scenario:** Process payroll for February 2026

**Employee:** Sarah Ahmed
- **Basic Salary:** 8,000 AED
- **Allowances:** 2,000 AED
- **Total Gross:** 10,000 AED

**Attendance (Feb 1-28):**
- Working Days: 22
- Absent Days: 1
- Late Instances: 2
- Late Minutes: 30 minutes

**Leaves:**
- Paid Leave: 1 day
- Unpaid Leave: 0 days

**Calculation:**
```
Daily Rate = 10,000 ÷ 22 = 454.55 AED/day

Deductions:
- Late: (30 - 15) × 0.5 = 7.5 AED
- Absence: 1 × 454.55 = 454.55 AED
- Unpaid Leave: 0 AED
- Manual Adjustments: 0 AED
Total Deductions: 462.05 AED

Net Salary: 10,000 - 462.05 = 9,537.95 AED
```

**Result:** Sarah receives 9,537.95 AED for February 2026

---

## ✅ Summary

**Payroll Process =**
1. **Configure** deduction rules (one-time)
2. **Create** payroll run for period
3. **System calculates** automatically:
   - Fetches employee data
   - Fetches attendance
   - Fetches leaves
   - Calculates deductions
   - Calculates net salary
4. **Review** and make adjustments
5. **Approve** through 3 stages (HR → Finance → Final)
6. **Lock** payroll
7. **Generate** payslips and reports

**The entire process is automated except for:**
- Initial settings configuration
- Manual adjustments (optional)
- Approval workflow
- Locking payroll

---

## 🎯 Benefits

✅ **Automated:** Reduces manual calculation errors
✅ **Accurate:** Uses real attendance and leave data
✅ **Transparent:** Shows breakdown of all deductions
✅ **Auditable:** Complete audit trail of approvals
✅ **Secure:** Locked payrolls cannot be changed
✅ **Efficient:** Processes all employees at once

---

**That's the complete Payroll process!** 🎉
