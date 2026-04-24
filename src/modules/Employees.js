import React, { useState, createContext, useContext, useEffect, useMemo, useCallback } from "react";
import { UserIcon, EnvelopeIcon, PhoneIcon, BriefcaseIcon, MapPinIcon, IdentificationIcon, DocumentPlusIcon, CheckCircleIcon, CalendarIcon, AcademicCapIcon, UsersIcon, ClipboardDocumentListIcon, ArrowLeftIcon, CheckIcon, Cog6ToothIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ClockIcon, XMarkIcon, CurrencyDollarIcon, DocumentTextIcon, BanknotesIcon, CalculatorIcon, TrashIcon, ArrowPathIcon, KeyIcon, EyeIcon, EyeSlashIcon, PencilSquareIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompanySelection } from '../context/CompanySelectionContext';
import { useAuth } from '../contexts/AuthContext';
import { getEmployees, getEmployeeById, getEmployeeChangeHistory, getEmployeeStatistics, createEmployee, updateEmployee, deleteEmployee, restoreEmployee, checkEmployeeAvailability, getAttendancePrograms, createAttendanceProgram, updateAttendanceProgram, deleteAttendanceProgram, assignEmployeeToOrgPosition, downloadEmployeeTemplate, importEmployeesExcel, exportEmployeesExcel } from '../services/employeeAPI';
import { getCompanies } from '../services/companiesAPI';
import { getCompanyDepartments, getAllPositions, updatePosition } from '../services/departmentAPI';
import SetPasswordModal from '../components/SetPasswordModal';
import { API_BASE_URL } from '../utils/apiClient';

/** When the API has no positions yet, or the user lacks HR access — local-only rows use string ids starting with "local-". */
const FALLBACK_JOB_TITLE_ROWS = [
  { title: 'Manager', department: 'All', description: 'Management role' },
  { title: 'Developer', department: 'IT', description: 'Software development' },
  { title: 'Accountant', department: 'Finance', description: 'Financial management' },
  { title: 'Sales Rep', department: 'Sales', description: 'Sales and marketing' },
];

function buildFallbackJobTitlesList() {
  return FALLBACK_JOB_TITLE_ROWS.map((x, i) => ({
    ...x,
    id: `local-fallback-${i + 1}`,
    fromApi: false,
  }));
}

/** Job title is assignable only when position + sub-department + parent department are ACTIVE (API rows). */
function isAssignableOrgPosition(job) {
  if (!job || !job.fromApi) return true;
  return (
    job.positionStatus === 'ACTIVE' &&
    job.subDepartmentStatus === 'ACTIVE' &&
    job.departmentStatus === 'ACTIVE'
  );
}

/**
 * Options for employee job-title selects: active org path only, plus current value if it sits on an inactive path
 * (disabled) or is a legacy free-text title not in the catalog.
 */
function buildJobTitlePickerOptions(jobTitles, currentValue) {
  const list = Array.isArray(jobTitles) ? jobTitles : [];
  const cur = (currentValue || '').trim();
  const assignable = list.filter(isAssignableOrgPosition);
  const assignableValues = new Set(
    assignable.map((j) => (j.title || j.name || '').trim()).filter(Boolean)
  );
  const out = [];
  if (cur && !assignableValues.has(cur)) {
    const apiRow = list.find((j) => (j.title || j.name || '').trim() === cur);
    if (apiRow && !isAssignableOrgPosition(apiRow)) {
      out.push({ ...apiRow, _inactiveOrgPath: true });
    } else if (!apiRow) {
      out.push({ id: `legacy-title-${cur}`, title: cur, name: cur, fromApi: false });
    }
  }
  out.push(...assignable);
  return out;
}

/** Attendance program: Mon–Sun schedule; templates are stored per company on the server; employees keep program name on their record. */
const ATT_WEEKDAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const ATT_WEEKDAY_LABELS = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

function attWeekRow(enabled, clockIn = '09:00', clockOut = '17:00') {
  return { enabled: Boolean(enabled), clockIn, clockOut };
}

function createDefaultWeeklySchedule() {
  return {
    mon: attWeekRow(true),
    tue: attWeekRow(true),
    wed: attWeekRow(true),
    thu: attWeekRow(true),
    fri: attWeekRow(true),
    sat: attWeekRow(false),
    sun: attWeekRow(false),
  };
}

function mergeWeeklySchedule(raw) {
  const base = createDefaultWeeklySchedule();
  if (!raw || typeof raw !== 'object') return base;
  const out = { ...base };
  for (const k of ATT_WEEKDAY_ORDER) {
    const r = raw[k];
    if (r && typeof r === 'object') {
      out[k] = {
        enabled: Boolean(r.enabled),
        clockIn: String(r.clockIn ?? '09:00').slice(0, 5),
        clockOut: String(r.clockOut ?? '17:00').slice(0, 5),
      };
    }
  }
  return out;
}

function formatWeeklyScheduleSummary(schedule) {
  const s = mergeWeeklySchedule(schedule);
  return ATT_WEEKDAY_ORDER.map((key) => {
    const d = s[key];
    const short = ATT_WEEKDAY_LABELS[key].slice(0, 3);
    if (!d.enabled) return `${short} off`;
    return `${short} ${d.clockIn}–${d.clockOut}`;
  }).join(' · ');
}

function validateWeeklySchedule(schedule) {
  const s = mergeWeeklySchedule(schedule);
  let workDays = 0;
  for (const key of ATT_WEEKDAY_ORDER) {
    const d = s[key];
    if (d.enabled) {
      workDays += 1;
      const cin = (d.clockIn || '').trim();
      const cout = (d.clockOut || '').trim();
      if (!cin || !cout) {
        return {
          ok: false,
          message: `Set clock-in and clock-out for ${ATT_WEEKDAY_LABELS[key]} (or turn that day OFF).`,
        };
      }
    }
  }
  if (workDays === 0) {
    return { ok: false, message: 'Turn at least one day ON and set its clock-in and clock-out times.' };
  }
  return { ok: true };
}

function attendanceProgramSearchText(p) {
  const sched = formatWeeklyScheduleSummary(p.weeklySchedule);
  return [p.name, p.hours, p.description, sched].filter(Boolean).join(' ').toLowerCase();
}

function AttendanceWeeklyScheduleEditor({ value, onChange, disabled }) {
  const s = mergeWeeklySchedule(value);
  const setDay = (key, patch) => {
    if (disabled) return;
    onChange({ ...s, [key]: { ...s[key], ...patch } });
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-100/80">
        <p className="text-xs font-medium text-slate-700">Weekly schedule</p>
        <p className="text-[11px] text-slate-500 mt-0.5">OFF = non-working day. ON = required clock-in / clock-out.</p>
      </div>
      <ul className="divide-y divide-slate-100 list-none m-0 p-0 max-h-[min(52vh,340px)] overflow-y-auto">
        {ATT_WEEKDAY_ORDER.map((key) => {
          const d = s[key];
          const on = d.enabled;
          return (
            <li key={key} className="px-2.5 py-2 sm:px-3">
              <div className="grid grid-cols-1 sm:grid-cols-[7.5rem_4rem_1fr_1fr] gap-2 sm:gap-2 sm:items-center">
                <span className="text-xs font-medium text-slate-800 sm:pt-0 pt-1">{ATT_WEEKDAY_LABELS[key]}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  disabled={disabled}
                  onClick={() => setDay(key, { enabled: !on })}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 disabled:opacity-50 ${
                    on ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                      on ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                  <span className="sr-only">{on ? 'ON' : 'OFF'}</span>
                </button>
                <input
                  type="time"
                  value={d.clockIn}
                  disabled={disabled || !on}
                  onChange={(e) => setDay(key, { clockIn: e.target.value })}
                  className="w-full min-w-0 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white disabled:opacity-45 disabled:cursor-not-allowed"
                />
                <input
                  type="time"
                  value={d.clockOut}
                  disabled={disabled || !on}
                  onChange={(e) => setDay(key, { clockOut: e.target.value })}
                  className="w-full min-w-0 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white disabled:opacity-45 disabled:cursor-not-allowed"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Custom styles for PhoneInput integration
const phoneInputStyles = `
  .react-tel-input .form-control {
    width: 100% !important;
    height: 42px !important;
    border: 1px solid #d1d5db !important;
    border-radius: 0.375rem !important;
    padding-left: 50px !important;
    font-size: 0.875rem !important;
    background-color: white !important;
  }
  .react-tel-input .form-control:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 1px #3b82f6 !important;
    outline: none !important;
  }
  .react-tel-input .flag-dropdown {
    border: 1px solid #d1d5db !important;
    border-right: none !important;
    border-radius: 0.375rem 0 0 0.375rem !important;
    background-color: white !important;
  }
  .react-tel-input .flag-dropdown.open {
    border-color: #3b82f6 !important;
  }
  .react-tel-input .selected-flag {
    height: 42px !important;
    padding: 0 8px 0 12px !important;
    border-radius: 0.375rem 0 0 0.375rem !important;
  }
  .react-tel-input .country-list {
    border: 1px solid #d1d5db !important;
    border-radius: 0.375rem !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    max-height: 200px !important;
  }
  .react-tel-input .country-list .country {
    padding: 8px 12px !important;
    font-size: 0.875rem !important;
  }
  .react-tel-input .country-list .country:hover {
    background-color: #f3f4f6 !important;
  }
  .react-tel-input .country-list .country.highlight {
    background-color: #3b82f6 !important;
    color: white !important;
  }
`;

/** ISO or Date → yyyy-mm-dd for <input type="date" /> */
function toDateInputString(value) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string') {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
function normalizeGenderSelectValue(raw) {
  if (!raw) return '';
  const s = String(raw).toLowerCase();
  return GENDER_OPTIONS.find((o) => o.toLowerCase() === s) || raw;
}

const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];
function normalizeMaritalSelectValue(raw) {
  if (!raw) return '';
  const s = String(raw).toLowerCase();
  return MARITAL_OPTIONS.find((o) => o.toLowerCase() === s) || raw;
}

const STATUS_OPTIONS = ['Active', 'Inactive', 'On Leave', 'Terminated'];
function normalizeStatusSelectValue(raw, isActive) {
  if (raw && raw !== 'N/A') {
    const s = String(raw).toLowerCase();
    const found = STATUS_OPTIONS.find((o) => o.toLowerCase() === s);
    if (found) return found;
    if (s === 'active') return 'Active';
    if (s === 'inactive') return 'Inactive';
  }
  if (isActive === false) return 'Inactive';
  return 'Active';
}

const EMPLOYEE_TYPE_EDIT_OPTIONS = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
];
function normalizeEmployeeTypeSelectValue(raw) {
  if (!raw || raw === 'N/A') return '';
  const s = String(raw).toLowerCase();
  const legacy = { 'full-time': 'permanent', 'part-time': 'contract' };
  const v = legacy[s] || s;
  if (EMPLOYEE_TYPE_EDIT_OPTIONS.some((o) => o.value === v)) return v;
  return raw;
}

function backendOriginForUploads() {
  const explicit =
    typeof process !== 'undefined' && process.env.REACT_APP_BACKEND_URL
      ? String(process.env.REACT_APP_BACKEND_URL).trim()
      : '';
  if (explicit) return explicit.replace(/\/$/, '');
  const base = String(API_BASE_URL || 'http://localhost:3001/api').replace(/\/$/, '');
  const stripped = base.replace(/\/api(\/v\d+)?$/i, '');
  return stripped || 'http://localhost:3001';
}

/**
 * Employee JSON often has `/uploads/documents/...` (relative to API server).
 * Opening that path on the React dev server 404s — prefix the API host.
 */
function resolveEmployeeAttachmentUrl(url) {
  if (url == null || typeof url !== 'string') return null;
  const t = url.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  const origin = backendOriginForUploads();
  if (t.startsWith('/')) return `${origin}${t}`;
  return `${origin}/uploads/${t.replace(/^\/+/, '')}`;
}

function fileBasenameFromStored(pathOrUrl) {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return null;
  const noQuery = pathOrUrl.split('?')[0];
  const parts = noQuery.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || pathOrUrl;
}

function formatDocExpiryDisplay(expiry) {
  if (expiry === null || expiry === undefined || expiry === '') return null;
  if (typeof expiry === 'string') {
    const m = expiry.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : expiry;
  }
  try {
    const d = new Date(expiry);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch (_) {
    /* ignore */
  }
  return null;
}

/** Legal / profile files returned by GET employee (attachment filename + public URL). */
function buildDirectoryDocumentsFromEmployee(emp) {
  if (!emp) return [];
  const entries = [
    {
      key: 'profile_photo',
      label: 'Profile photo',
      file: emp.photo,
      url: emp.photoUrl,
      expiry: null,
    },
    {
      key: 'passport',
      label: 'Passport',
      file: emp.passportAttachment,
      url: emp.passportAttachmentUrl,
      expiry: emp.passportExpiryDate,
    },
    {
      key: 'national_id',
      label: 'National ID',
      file: emp.nationalIdAttachment,
      url: emp.nationalIdAttachmentUrl,
      expiry: emp.nationalIdExpiryDate,
    },
    {
      key: 'residency',
      label: 'Residency / visa',
      file: emp.residencyAttachment,
      url: emp.residencyAttachmentUrl,
      expiry: emp.residencyExpiryDate,
    },
    {
      key: 'insurance',
      label: 'Insurance',
      file: emp.insuranceAttachment,
      url: emp.insuranceAttachmentUrl,
      expiry: emp.insuranceExpiryDate,
    },
    {
      key: 'driving_license',
      label: 'Driving licence',
      file: emp.drivingLicenseAttachment,
      url: emp.drivingLicenseAttachmentUrl,
      expiry: emp.drivingLicenseExpiryDate,
    },
    {
      key: 'labour_id',
      label: 'Labour card',
      file: emp.labourIdAttachment,
      url: emp.labourIdAttachmentUrl,
      expiry: emp.labourIdExpiryDate,
    },
  ];

  return entries
    .filter((e) => e.file && String(e.file).trim() !== '')
    .map((e) => {
      const exp = formatDocExpiryDisplay(e.expiry);
      return {
        id: `directory-${e.key}`,
        source: 'directory',
        name: fileBasenameFromStored(e.file) || `${e.label} (file)`,
        type: e.label,
        uploadDate: 'On record',
        expiryDate: exp,
        fileSize: null,
        url: resolveEmployeeAttachmentUrl(e.url) || e.url || null,
        status: 'uploaded',
      };
    });
}

function mergeEmployeeDocumentsList(emp, sessionList) {
  const fromApi = buildDirectoryDocumentsFromEmployee(emp);
  const local = Array.isArray(sessionList) ? sessionList : [];
  return [...fromApi, ...local];
}

/** Canonical directory date key → short alias on shaped API payloads (see backend employee-response). */
const DIRECTORY_DATE_SHORT = {
  birthday: 'birthDate',
  passportIssueDate: 'passportIssue',
  passportExpiryDate: 'passportExpiry',
  nationalIdExpiryDate: 'nationalIdExpiry',
  residencyExpiryDate: 'residencyExpiry',
  insuranceExpiryDate: 'insuranceExpiry',
  drivingLicenseExpiryDate: 'drivingLicenseExpiry',
  labourIdExpiryDate: 'labourCardExpiry',
};

function isoOrRawToDdMmYyyy(raw) {
  if (raw == null || raw === '') return null;
  const s0 = typeof raw === 'string' ? raw.trim() : String(raw);
  const m = s0.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const iso = toDateInputString(raw);
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, mo, d] = iso.split('-');
    return `${d}/${mo}/${y}`;
  }
  return s0 || null;
}

/** dd/mm/yyyy when API sends Formatted variants; else YYYY-MM-DD / ISO → dd/mm/yyyy. */
function getEmployeeDirectoryDateDisplay(emp, canonicalKey) {
  if (!emp) return null;
  const fmt =
    emp[`${canonicalKey}Formatted`] ?? emp[`${canonicalKey}_dd_mm_yyyy`];
  if (fmt != null && String(fmt).trim() !== '') return String(fmt).trim();

  const short = DIRECTORY_DATE_SHORT[canonicalKey];
  const fmtShort = short ? emp[`${short}Formatted`] : null;
  if (fmtShort != null && String(fmtShort).trim() !== '') return String(fmtShort).trim();

  const fromLabourLegacy = canonicalKey === 'labourIdExpiryDate' ? emp.labourExpiry : null;
  const keyVal = emp[canonicalKey];
  const shortVal = short ? emp[short] : null;
  for (const raw of [keyVal, shortVal, fromLabourLegacy]) {
    const dd = isoOrRawToDdMmYyyy(raw);
    if (dd) return dd;
  }

  const legal = emp.legal;
  if (legal && typeof legal === 'object') {
    const lFmt = legal[`${canonicalKey}Formatted`];
    if (lFmt != null && String(lFmt).trim() !== '') return String(lFmt).trim();
    const lDd = isoOrRawToDdMmYyyy(legal[canonicalKey]);
    if (lDd) return lDd;
  }
  return null;
}

function displayDirectoryText(emp, ...keys) {
  if (!emp) return null;
  for (const k of keys) {
    const v = emp[k];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  const legal = emp.legal;
  if (legal && typeof legal === 'object') {
    for (const k of keys) {
      const v = legal[k];
      if (v != null && String(v).trim() !== '') return String(v).trim();
    }
  }
  return null;
}

/** Prefer scalar `phone`, then API `phoneNumbersList`, then JSON `phoneNumbers` (handles alternate keys). */
function getEmployeePrimaryPhoneDisplay(emp) {
  if (!emp) return null;
  if (emp.phone != null && String(emp.phone).trim() !== '') return String(emp.phone).trim();
  const list = emp.phoneNumbersList;
  if (Array.isArray(list) && list.length > 0) {
    const first = list[0];
    const v = first && (first.value ?? first.phone ?? first.number ?? first.mobile);
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  const raw = emp.phoneNumbers;
  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0];
    const v = first && (first.value ?? first.phone ?? first.number ?? first.mobile);
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const p = JSON.parse(raw);
      if (Array.isArray(p) && p[0]) {
        const v = p[0].value ?? p[0].phone ?? p[0].number ?? p[0].mobile;
        if (v != null && String(v).trim() !== '') return String(v).trim();
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

/** Normalize one API employee row for directory table + modals (`...emp` first so computed `phone` / `name` win). */
function mapEmployeeListItem(emp) {
  if (!emp) return emp;
  let emailDisplay = emp.email || 'No email';
  if (!emp.email && emp.emailAddresses) {
    try {
      if (Array.isArray(emp.emailAddresses)) {
        const first = emp.emailAddresses[0];
        emailDisplay = (first && (first.value ?? first)) || emailDisplay;
      } else if (typeof emp.emailAddresses === 'string' && emp.emailAddresses.trim()) {
        const p = JSON.parse(emp.emailAddresses);
        if (Array.isArray(p) && p[0]) {
          emailDisplay = p[0].value ?? p[0] ?? emailDisplay;
        }
      }
    } catch {
      /* keep emailDisplay */
    }
  }
  return {
    ...emp,
    name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
    department: emp.department || 'N/A',
    email: emailDisplay,
    jobTitle: emp.jobTitle || 'N/A',
    employeeType: emp.employeeType || 'N/A',
    status: emp.status || (emp.isActive ? 'Active' : 'Inactive'),
    phone: getEmployeePrimaryPhoneDisplay(emp) || 'No phone',
    manager: emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : 'N/A',
    joiningDate: emp.joiningDate || null,
  };
}

/** Only active directory people may be chosen as line manager (inactive/deactivated accounts excluded). */
function isEmployeeActiveForLineManagerPicker(emp) {
  if (!emp) return false;
  if (emp.isActive === false) return false;
  const st = String(emp.status || '').trim().toLowerCase();
  if (st === 'inactive' || st === 'terminated') return false;
  return true;
}

// Comprehensive nationality/country list with flags using Unicode
const nationalities = [
  { value: "afghan", label: "Afghan", flag: "\u{1F1E6}\u{1F1EB}" },
  { value: "albanian", label: "Albanian", flag: "\u{1F1E6}\u{1F1F1}" },
  { value: "algerian", label: "Algerian", flag: "\u{1F1E9}\u{1F1FF}" },
  { value: "american", label: "American", flag: "\u{1F1FA}\u{1F1F8}" },
  { value: "andorran", label: "Andorran", flag: "\u{1F1E6}\u{1F1E9}" },
  { value: "angolan", label: "Angolan", flag: "\u{1F1E6}\u{1F1F4}" },
  { value: "antiguans", label: "Antiguans", flag: "\u{1F1E6}\u{1F1EC}" },
  { value: "argentinean", label: "Argentinean", flag: "\u{1F1E6}\u{1F1F7}" },
  { value: "armenian", label: "Armenian", flag: "\u{1F1E6}\u{1F1F2}" },
  { value: "australian", label: "Australian", flag: "\u{1F1E6}\u{1F1FA}" },
  { value: "austrian", label: "Austrian", flag: "\u{1F1E6}\u{1F1F9}" },
  { value: "azerbaijani", label: "Azerbaijani", flag: "\u{1F1E6}\u{1F1FF}" },
  { value: "bahamian", label: "Bahamian", flag: "\u{1F1E7}\u{1F1F8}" },
  { value: "bahraini", label: "Bahraini", flag: "\u{1F1E7}\u{1F1ED}" },
  { value: "bangladeshi", label: "Bangladeshi", flag: "\u{1F1E7}\u{1F1E9}" },
  { value: "barbadian", label: "Barbadian", flag: "\u{1F1E7}\u{1F1E7}" },
  { value: "barbudans", label: "Barbudans", flag: "\u{1F1E6}\u{1F1EC}" },
  { value: "batswana", label: "Batswana", flag: "\u{1F1E7}\u{1F1FC}" },
  { value: "belarusian", label: "Belarusian", flag: "🇧🇾" },
  { value: "belgian", label: "Belgian", flag: "🇧🇪" },
  { value: "belizean", label: "Belizean", flag: "🇧🇿" },
  { value: "beninese", label: "Beninese", flag: "🇧🇯" },
  { value: "bhutanese", label: "Bhutanese", flag: "🇧🇹" },
  { value: "bolivian", label: "Bolivian", flag: "🇧🇴" },
  { value: "bosnian", label: "Bosnian", flag: "🇧🇦" },
  { value: "brazilian", label: "Brazilian", flag: "🇧🇷" },
  { value: "british", label: "British", flag: "🇬🇧" },
  { value: "bruneian", label: "Bruneian", flag: "🇧🇳" },
  { value: "bulgarian", label: "Bulgarian", flag: "🇧🇬" },
  { value: "burkinabe", label: "Burkinabe", flag: "🇧🇫" },
  { value: "burmese", label: "Burmese", flag: "🇲🇲" },
  { value: "burundian", label: "Burundian", flag: "🇧🇮" },
  { value: "cambodian", label: "Cambodian", flag: "🇰🇭" },
  { value: "cameroonian", label: "Cameroonian", flag: "🇨🇲" },
  { value: "canadian", label: "Canadian", flag: "🇨🇦" },
  { value: "cape verdean", label: "Cape Verdean", flag: "🇨🇻" },
  { value: "central african", label: "Central African", flag: "🇨🇫" },
  { value: "chadian", label: "Chadian", flag: "🇹🇩" },
  { value: "chilean", label: "Chilean", flag: "🇨🇱" },
  { value: "chinese", label: "Chinese", flag: "🇨🇳" },
  { value: "colombian", label: "Colombian", flag: "🇨🇴" },
  { value: "comoran", label: "Comoran", flag: "🇰🇲" },
  { value: "congolese", label: "Congolese", flag: "🇨🇬" },
  { value: "costa rican", label: "Costa Rican", flag: "🇨🇷" },
  { value: "croatian", label: "Croatian", flag: "🇭🇷" },
  { value: "cuban", label: "Cuban", flag: "🇨🇺" },
  { value: "cypriot", label: "Cypriot", flag: "🇨🇾" },
  { value: "czech", label: "Czech", flag: "🇨🇿" },
  { value: "danish", label: "Danish", flag: "🇩🇰" },
  { value: "djibouti", label: "Djibouti", flag: "🇩🇯" },
  { value: "dominican", label: "Dominican", flag: "🇩🇴" },
  { value: "dutch", label: "Dutch", flag: "🇳🇱" },
  { value: "east timorese", label: "East Timorese", flag: "🇹🇱" },
  { value: "ecuadorean", label: "Ecuadorean", flag: "🇪🇨" },
  { value: "egyptian", label: "Egyptian", flag: "🇪🇬" },
  { value: "emirian", label: "Emirian", flag: "🇦🇪" },
  { value: "equatorial guinean", label: "Equatorial Guinean", flag: "🇬🇶" },
  { value: "eritrean", label: "Eritrean", flag: "🇪🇷" },
  { value: "estonian", label: "Estonian", flag: "🇪🇪" },
  { value: "ethiopian", label: "Ethiopian", flag: "🇪🇹" },
  { value: "fijian", label: "Fijian", flag: "🇫🇯" },
  { value: "filipino", label: "Filipino", flag: "🇵🇭" },
  { value: "finnish", label: "Finnish", flag: "🇫🇮" },
  { value: "french", label: "French", flag: "🇫🇷" },
  { value: "gabonese", label: "Gabonese", flag: "🇬🇦" },
  { value: "gambian", label: "Gambian", flag: "🇬🇲" },
  { value: "georgian", label: "Georgian", flag: "🇬🇪" },
  { value: "german", label: "German", flag: "🇩🇪" },
  { value: "ghanaian", label: "Ghanaian", flag: "🇬🇭" },
  { value: "greek", label: "Greek", flag: "🇬🇷" },
  { value: "grenadian", label: "Grenadian", flag: "🇬🇩" },
  { value: "guatemalan", label: "Guatemalan", flag: "🇬🇹" },
  { value: "guinea-bissauan", label: "Guinea-Bissauan", flag: "🇬🇼" },
  { value: "guinean", label: "Guinean", flag: "🇬🇳" },
  { value: "guyanese", label: "Guyanese", flag: "🇬🇾" },
  { value: "haitian", label: "Haitian", flag: "🇭🇹" },
  { value: "herzegovinian", label: "Herzegovinian", flag: "🇧🇦" },
  { value: "honduran", label: "Honduran", flag: "🇭🇳" },
  { value: "hungarian", label: "Hungarian", flag: "🇭🇺" },
  { value: "icelander", label: "Icelander", flag: "🇮🇸" },
  { value: "indian", label: "Indian", flag: "🇮🇳" },
  { value: "indonesian", label: "Indonesian", flag: "🇮🇩" },
  { value: "iranian", label: "Iranian", flag: "🇮🇷" },
  { value: "iraqi", label: "Iraqi", flag: "🇮🇶" },
  { value: "irish", label: "Irish", flag: "🇮🇪" },
  { value: "israeli", label: "Israeli", flag: "🇮🇱" },
  { value: "italian", label: "Italian", flag: "🇮🇹" },
  { value: "ivorian", label: "Ivorian", flag: "🇨🇮" },
  { value: "jamaican", label: "Jamaican", flag: "🇯🇲" },
  { value: "japanese", label: "Japanese", flag: "🇯🇵" },
  { value: "jordanian", label: "Jordanian", flag: "🇯🇴" },
  { value: "kazakhstani", label: "Kazakhstani", flag: "🇰🇿" },
  { value: "kenyan", label: "Kenyan", flag: "🇰🇪" },
  { value: "kittian and nevisian", label: "Kittian and Nevisian", flag: "🇰🇳" },
  { value: "kuwaiti", label: "Kuwaiti", flag: "🇰🇼" },
  { value: "kyrgyz", label: "Kyrgyz", flag: "🇰🇬" },
  { value: "laotian", label: "Laotian", flag: "🇱🇦" },
  { value: "latvian", label: "Latvian", flag: "🇱🇻" },
  { value: "lebanese", label: "Lebanese", flag: "🇱🇧" },
  { value: "liberian", label: "Liberian", flag: "🇱🇷" },
  { value: "libyan", label: "Libyan", flag: "🇱🇾" },
  { value: "liechtensteiner", label: "Liechtensteiner", flag: "🇱🇮" },
  { value: "lithuanian", label: "Lithuanian", flag: "🇱🇹" },
  { value: "luxembourger", label: "Luxembourger", flag: "🇱🇺" },
  { value: "macedonian", label: "Macedonian", flag: "🇲🇰" },
  { value: "malagasy", label: "Malagasy", flag: "🇲🇬" },
  { value: "malawian", label: "Malawian", flag: "🇲🇼" },
  { value: "malaysian", label: "Malaysian", flag: "🇲🇾" },
  { value: "maldivan", label: "Maldivan", flag: "🇲🇻" },
  { value: "malian", label: "Malian", flag: "🇲🇱" },
  { value: "maltese", label: "Maltese", flag: "🇲🇹" },
  { value: "marshallese", label: "Marshallese", flag: "🇲🇭" },
  { value: "mauritanian", label: "Mauritanian", flag: "🇲🇷" },
  { value: "mauritian", label: "Mauritian", flag: "🇲🇺" },
  { value: "mexican", label: "Mexican", flag: "🇲🇽" },
  { value: "micronesian", label: "Micronesian", flag: "🇫🇲" },
  { value: "moldovan", label: "Moldovan", flag: "🇲🇩" },
  { value: "monacan", label: "Monacan", flag: "🇲🇨" },
  { value: "mongolian", label: "Mongolian", flag: "🇲🇳" },
  { value: "moroccan", label: "Moroccan", flag: "🇲🇦" },
  { value: "mosotho", label: "Mosotho", flag: "🇱🇸" },
  { value: "motswana", label: "Motswana", flag: "🇧🇼" },
  { value: "mozambican", label: "Mozambican", flag: "🇲🇿" },
  { value: "namibian", label: "Namibian", flag: "🇳🇦" },
  { value: "nauruan", label: "Nauruan", flag: "🇳🇷" },
  { value: "nepalese", label: "Nepalese", flag: "🇳🇵" },
  { value: "new zealander", label: "New Zealander", flag: "🇳🇿" },
  { value: "ni-vanuatu", label: "Ni-Vanuatu", flag: "🇻🇺" },
  { value: "nicaraguan", label: "Nicaraguan", flag: "🇳🇮" },
  { value: "nigerian", label: "Nigerian", flag: "🇳🇬" },
  { value: "nigerien", label: "Nigerien", flag: "🇳🇪" },
  { value: "north korean", label: "North Korean", flag: "🇰🇵" },
  { value: "northern irish", label: "Northern Irish", flag: "🇬🇧" },
  { value: "norwegian", label: "Norwegian", flag: "🇳🇴" },
  { value: "omani", label: "Omani", flag: "🇴🇲" },
  { value: "pakistani", label: "Pakistani", flag: "🇵🇰" },
  { value: "palauan", label: "Palauan", flag: "🇵🇼" },
  { value: "panamanian", label: "Panamanian", flag: "🇵🇦" },
  { value: "papua new guinean", label: "Papua New Guinean", flag: "🇵🇬" },
  { value: "paraguayan", label: "Paraguayan", flag: "🇵🇾" },
  { value: "peruvian", label: "Peruvian", flag: "🇵🇪" },
  { value: "polish", label: "Polish", flag: "🇵🇱" },
  { value: "portuguese", label: "Portuguese", flag: "🇵🇹" },
  { value: "qatari", label: "Qatari", flag: "🇶🇦" },
  { value: "romanian", label: "Romanian", flag: "🇷🇴" },
  { value: "russian", label: "Russian", flag: "🇷🇺" },
  { value: "rwandan", label: "Rwandan", flag: "🇷🇼" },
  { value: "saint lucian", label: "Saint Lucian", flag: "🇱🇨" },
  { value: "salvadoran", label: "Salvadoran", flag: "🇸🇻" },
  { value: "samoan", label: "Samoan", flag: "🇼🇸" },
  { value: "san marinese", label: "San Marinese", flag: "🇸🇲" },
  { value: "sao tomean", label: "Sao Tomean", flag: "🇸🇹" },
  { value: "saudi", label: "Saudi", flag: "🇸🇦" },
  { value: "scottish", label: "Scottish", flag: "🇬🇧" },
  { value: "senegalese", label: "Senegalese", flag: "🇸🇳" },
  { value: "serbian", label: "Serbian", flag: "🇷🇸" },
  { value: "seychellois", label: "Seychellois", flag: "🇸🇨" },
  { value: "sierra leonean", label: "Sierra Leonean", flag: "🇸🇱" },
  { value: "singaporean", label: "Singaporean", flag: "🇸🇬" },
  { value: "slovakian", label: "Slovakian", flag: "🇸🇰" },
  { value: "slovenian", label: "Slovenian", flag: "🇸🇮" },
  { value: "solomon islander", label: "Solomon Islander", flag: "🇸🇧" },
  { value: "somali", label: "Somali", flag: "🇸🇴" },
  { value: "south african", label: "South African", flag: "🇿🇦" },
  { value: "south korean", label: "South Korean", flag: "🇰🇷" },
  { value: "spanish", label: "Spanish", flag: "🇪🇸" },
  { value: "sri lankan", label: "Sri Lankan", flag: "🇱🇰" },
  { value: "sudanese", label: "Sudanese", flag: "🇸🇩" },
  { value: "surinamer", label: "Surinamer", flag: "🇸🇷" },
  { value: "swazi", label: "Swazi", flag: "🇸🇿" },
  { value: "swedish", label: "Swedish", flag: "🇸🇪" },
  { value: "swiss", label: "Swiss", flag: "🇨🇭" },
  { value: "syrian", label: "Syrian", flag: "🇸🇾" },
  { value: "taiwanese", label: "Taiwanese", flag: "🇹🇼" },
  { value: "tajik", label: "Tajik", flag: "🇹🇯" },
  { value: "tanzanian", label: "Tanzanian", flag: "🇹🇿" },
  { value: "thai", label: "Thai", flag: "🇹🇭" },
  { value: "togolese", label: "Togolese", flag: "🇹🇬" },
  { value: "tongan", label: "Tongan", flag: "🇹🇴" },
  { value: "trinidadian or tobagonian", label: "Trinidadian or Tobagonian", flag: "🇹🇹" },
  { value: "tunisian", label: "Tunisian", flag: "🇹🇳" },
  { value: "turkish", label: "Turkish", flag: "🇹🇷" },
  { value: "tuvaluan", label: "Tuvaluan", flag: "🇹🇻" },
  { value: "ugandan", label: "Ugandan", flag: "🇺🇬" },
  { value: "ukrainian", label: "Ukrainian", flag: "🇺🇦" },
  { value: "uruguayan", label: "Uruguayan", flag: "🇺🇾" },
  { value: "uzbekistani", label: "Uzbekistani", flag: "🇺🇿" },
  { value: "venezuelan", label: "Venezuelan", flag: "🇻🇪" },
  { value: "vietnamese", label: "Vietnamese", flag: "🇻🇳" },
  { value: "welsh", label: "Welsh", flag: "🇬🇧" },
  { value: "yemenite", label: "Yemenite", flag: "🇾🇪" },
  { value: "zambian", label: "Zambian", flag: "🇿🇲" },
  { value: "zimbabwean", label: "Zimbabwean", flag: "🇿🇼" }
];

// Demo employee data removed - now using real backend data

// Form context for multi-step form state
const EmployeeFormContext = createContext();
function useEmployeeForm() { return useContext(EmployeeFormContext); }

const steps = [
  { label: "Personal Info", icon: UserIcon },
  { label: "Personal Details", icon: UserIcon },
  { label: "Contact Info", icon: PhoneIcon },
  { label: "Company Info", icon: BriefcaseIcon },
  { label: "Legal Info", icon: IdentificationIcon },
  { label: "Review & Submit", icon: CheckCircleIcon },
];

function EmployeeForm({ onBack, onSaveEmployee, jobTitles, attendancePrograms, employeesList }) {
  const [step, setStep] = useState(0);
  const location = useLocation();
  const { selectedCompany } = useCompanySelection();
  
  // Only use department from navigation state (when coming from positions/subdepartments), not from localStorage/context
  const navigationState = location.state || {};
  // Only prefill department if explicitly coming from a position/subdepartment navigation
  const hasExplicitNavigation = navigationState.position || navigationState.subDepartment || navigationState.positionId;
  
  // Extract department name - handle both string and object formats
  let departmentFromNavigation = null;
  if (hasExplicitNavigation) {
    const dept = navigationState.department || navigationState.departmentName;
    if (dept) {
      // If it's an object, extract the name property; otherwise use it as-is
      departmentFromNavigation = typeof dept === 'object' && dept !== null ? (dept.name || dept.title || String(dept)) : dept;
    }
  }
  
  // Static company locations
  const companyLocations = [
    "Dubai HQ",
    "Abu Dhabi Office",
    "Syria Office"
  ];
  
  const [form, setForm] = useState({
    employeeType: "",
    firstName: "",
    lastName: "",
    employeeId: "",
    status: "",
    userAccount: false,
    role: 'EMPLOYEE',
    personalImage: null,
    gender: "",
    maritalStatus: "",
    nationality: "",
    currentAddress: "",
    childrenCount: "",
    birthday: "",
    contacts: [{ type: "phone", value: "", countryCode: "ae" }],
    emails: [""],
    department: (typeof departmentFromNavigation === 'string' ? departmentFromNavigation : (departmentFromNavigation?.name || departmentFromNavigation?.title || '')) || "",
    position: (navigationState.position && navigationState.position.name) || "",
    jobTitle: "",
    location: "",
    manager: "",
    managerId: "",
    passport: "",
    id: "",
    visa: "",
    insurance: "",
    documents: [],
    company: selectedCompany || "",
    attendanceProgram: "",
    joiningDate: "",
    exitDate: "",
    companyLocation: "",
    workingLocations: [],
    isLineManager: false,
    passportNumber: "",
    passportIssue: "",
    passportExpiry: "",
    passportAttachment: null,
    nationalIdNumber: "",
    nationalIdExpiry: "",
    nationalIdAttachment: null,
    residencyNumber: "",
    residencyExpiry: "",
    residencyAttachment: null,
    insuranceNumber: "",
    insuranceExpiry: "",
    insuranceAttachment: null,
    drivingNumber: "",
    drivingExpiry: "",
    drivingAttachment: null,
    labourNumber: "",
    labourExpiry: "",
    labourAttachment: null,
    remarks: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userAccountFields, setUserAccountFields] = useState({ workEmail: '', password: '', passwordConfirm: '' });
  const [useGeneratedPassword, setUseGeneratedPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openLegalSection, setOpenLegalSection] = useState('');
  const [nationalityDropdownOpen, setNationalityDropdownOpen] = useState(false);
  const [nationalitySearchTerm, setNationalitySearchTerm] = useState('');

  const activeLineManagerCandidates = useMemo(
    () =>
      Array.isArray(employeesList)
        ? employeesList.filter(isEmployeeActiveForLineManagerPicker)
        : [],
    [employeesList]
  );
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // Context value
  const ctxValue = { form, setForm };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nationalityDropdownOpen && !event.target.closest('.nationality-dropdown')) {
        setNationalityDropdownOpen(false);
        // Reset search term if no selection was made
        if (!form.nationality) {
          setNationalitySearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [nationalityDropdownOpen, form.nationality]);

  // When adding from Company → … → Position, default job title to the position name so directory placement matches org chart.
  useEffect(() => {
    const posName = navigationState.position?.name;
    if (!posName || !String(posName).trim()) return;
    setForm((prev) => ({
      ...prev,
      position: (prev.position && String(prev.position).trim()) ? prev.position : posName,
      jobTitle: (prev.jobTitle && String(prev.jobTitle).trim()) ? prev.jobTitle : posName,
    }));
  }, []);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await getCompanies();
        if (response.success && response.data) {
          const companiesList = Array.isArray(response.data) ? response.data : (response.data.companies || []);
          setCompanies(companiesList);
          
          // If there's a selected company from context, find and set it
          if (selectedCompany) {
            const foundCompany = companiesList.find(c => c.name === selectedCompany || c.id === selectedCompany);
            if (foundCompany) {
              setSelectedCompanyId(foundCompany.id);
              setForm(prev => ({ ...prev, company: foundCompany.name }));
              // Fetch departments for the selected company
              fetchDepartmentsForCompany(foundCompany.id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch departments for a company
  const fetchDepartmentsForCompany = async (companyId) => {
    if (!companyId) {
      setDepartments([]);
      return;
    }

    setLoadingDepartments(true);
    try {
      const response = await getCompanyDepartments(companyId, { status: 'ACTIVE' });
      if (response.success && response.data) {
        const departmentsList = Array.isArray(response.data) ? response.data : [];
        setDepartments(departmentsList);
        
        // Only prefill department if explicitly coming from navigation (position/subdepartment), not from localStorage/context
        // Check if we have explicit navigation state indicating we came from a specific position/subdepartment
        const hasExplicitNavigation = navigationState.position || navigationState.subDepartment || navigationState.positionId;
        if (hasExplicitNavigation && departmentFromNavigation) {
          const foundDepartment = departmentsList.find(d => d.name === departmentFromNavigation);
          if (foundDepartment) {
            setForm(prev => ({ ...prev, department: foundDepartment.name }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Handle company selection change
  const handleCompanyChange = async (e) => {
    const companyName = e.target.value;
    const selectedCompanyObj = companies.find(c => c.name === companyName);
    
    if (selectedCompanyObj) {
      setSelectedCompanyId(selectedCompanyObj.id);
      setForm(prev => ({ ...prev, company: companyName, department: '' })); // Clear department when company changes
      await fetchDepartmentsForCompany(selectedCompanyObj.id);
    } else {
      setSelectedCompanyId(null);
      setForm(prev => ({ ...prev, company: companyName, department: '' }));
      setDepartments([]);
    }
  };

  // Update form when selected company or department changes from context
  useEffect(() => {
    if (selectedCompany && companies.length > 0) {
      const foundCompany = companies.find(c => c.name === selectedCompany || c.id === selectedCompany);
      if (foundCompany && foundCompany.id !== selectedCompanyId) {
        setSelectedCompanyId(foundCompany.id);
        setForm(prev => ({ ...prev, company: foundCompany.name }));
        fetchDepartmentsForCompany(foundCompany.id);
      }
    }
  }, [selectedCompany, companies.length]);

  // Only update department if explicitly coming from navigation (position/subdepartment), not from localStorage/context
  useEffect(() => {
    const hasExplicitNavigation = navigationState.position || navigationState.subDepartment || navigationState.positionId;
    if (hasExplicitNavigation && departmentFromNavigation && departments.length > 0) {
      const foundDepartment = departments.find(d => d.name === departmentFromNavigation);
      if (foundDepartment && form.department !== foundDepartment.name) {
        setForm(prev => ({ ...prev, department: foundDepartment.name }));
      }
    }
  }, [departmentFromNavigation, departments.length]);

  // Helper function to format phone number for submission
  const formatPhoneForSubmission = (phoneNumber, countryCode) => {
    // Remove any non-digit characters except the + sign
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    // Ensure it starts with + if it doesn't already
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  };

  // Helper function to calculate age from birthday
  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Validate birthday for minimum age
  const validateBirthday = (birthday) => {
    if (!birthday) {
      return "Required";
    }
    const age = calculateAge(birthday);
    if (age === null) {
      return "Invalid date";
    }
    if (age < 18) {
      return "This employee cannot be added to the company unless they are at least 18 years old.";
    }
    return null;
  };

  // Validate passport expiry date - must be at least 6 months from today
  const validatePassportExpiry = (expiryDate) => {
    if (!expiryDate) {
      return "Required";
    }
    const expiry = new Date(expiryDate);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(expiry.getTime())) {
      return "Invalid date";
    }
    
    // Calculate 6 months from today
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(today.getMonth() + 6);
    
    // Check if expiry date is at least 6 months away
    if (expiry < sixMonthsFromNow) {
      return "Passport must be valid for at least 6 months from today. Please upload a passport with a later expiry date.";
    }
    
    return null;
  };

  const isMaritalSingle = (status) => String(status || '').toLowerCase() === 'single';

  // Handlers
  const handleChange = (field, value) => {
    // Ensure department is always stored as a string
    if (field === 'department' && typeof value !== 'string') {
      value = typeof value === 'object' && value !== null ? (value.name || value.title || String(value)) : String(value);
    }
    if (field === 'maritalStatus' && String(value).toLowerCase() === 'single') {
      setForm((prev) => ({ ...prev, maritalStatus: value, childrenCount: '' }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.childrenCount;
        return next;
      });
      return;
    }
    setForm({ ...form, [field]: value });
  };
  const handleContactChange = (idx, value, countryCode = null) => {
    const contacts = [...form.contacts];
    contacts[idx].value = value;
    if (countryCode) {
      contacts[idx].countryCode = countryCode;
    }
    setForm({ ...form, contacts });
  };
  const handleAddContact = () => setForm({ ...form, contacts: [...form.contacts, { type: "phone", value: "", countryCode: "ae" }] });
  const handleRemoveContact = (idx) => setForm({ ...form, contacts: form.contacts.filter((_, i) => i !== idx) });
  const handleEmailChange = (idx, value) => {
    const emails = [...form.emails];
    emails[idx] = value;
    setForm({ ...form, emails });
  };
  const handleAddEmail = () => setForm({ ...form, emails: [...form.emails, ""] });
  const handleRemoveEmail = (idx) => setForm({ ...form, emails: form.emails.filter((_, i) => i !== idx) });
  const handleFileChange = (e) => setForm({ ...form, documents: Array.from(e.target.files) });
  const handleImageChange = (e) => setForm({ ...form, personalImage: e.target.files[0] });
  const handleLegalDocumentChange = (field, file) => setForm({ ...form, [field]: file });
  const handleMultiSelect = (field, value) => {
    setForm((prev) => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const handleUserAccountSave = () => {
    setForm({ ...form, userAccount: true, userAccountFields });
    setShowUserModal(false);
  };

  // Get validation errors for a given step (pure, no setState) - used to disable Next and show inline errors
  const getStepErrors = (s) => {
    const errs = {};
    if (s === 0) {
      if (!(form.employeeType || '').trim()) errs.employeeType = "Required";
      if (!(form.firstName || '').trim()) errs.firstName = "Required";
      if (!(form.lastName || '').trim()) errs.lastName = "Required";
      if (!(form.employeeId || '').trim()) errs.employeeId = "Required";
      if (!(form.status || '').trim()) errs.status = "Required";
    }
    if (s === 1) {
      if (!(form.gender || '').trim()) errs.gender = "Required";
      if (!(form.maritalStatus || '').trim()) errs.maritalStatus = "Required";
      if (!(form.nationality || '').trim()) errs.nationality = "Required";
      if (!(form.currentAddress || '').trim()) errs.currentAddress = "Required";
      if (!isMaritalSingle(form.maritalStatus) && !(form.childrenCount || '').toString().trim()) errs.childrenCount = "Required";
      const birthdayError = validateBirthday(form.birthday);
      if (birthdayError) errs.birthday = birthdayError;
    }
    if (s === 2) {
      if (!form.contacts[0]?.value?.trim()) errs.contacts = "At least one phone required";
      else if (form.contacts[0].value.replace(/\D/g, '').length < 8) errs.contacts = "Phone number must be at least 8 digits";
      if (!(form.emails[0] || '').trim()) errs.emails = "At least one email required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((form.emails[0] || '').trim())) errs.emails = "Enter a valid email address";
    }
    if (s === 3) {
      if (!(form.company || '').trim()) errs.company = "Required";
      if (!(form.department || '').trim()) errs.department = "Required";
      if (!(form.jobTitle || '').trim()) errs.jobTitle = "Required";
      if (!(form.attendanceProgram || '').trim()) errs.attendanceProgram = "Required";
      if (!(form.joiningDate || '').trim()) errs.joiningDate = "Required";
      if (!(form.companyLocation || '').trim()) errs.companyLocation = "Required";
    }
    if (s === 4) {
      if (!(form.passportNumber || '').trim()) errs.passportNumber = "Required";
      if (!(form.passportIssue || '').trim()) errs.passportIssue = "Required";
      const passportExpiryError = validatePassportExpiry(form.passportExpiry);
      if (passportExpiryError) errs.passportExpiry = passportExpiryError;
    }
    return errs;
  };

  const currentStepErrors = getStepErrors(step);
  const isCurrentStepValid = Object.keys(currentStepErrors).length === 0;
  // Merge displayed errors: show current step live errors; after a failed Next, also show errors state for visibility
  const displayErrors = { ...currentStepErrors, ...errors };

  // Validation (simple) - sets errors and returns whether step is valid
  const validateStep = () => {
    const errs = getStepErrors(step);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleEmployeeIdBlur = async () => {
    const id = (form.employeeId || '').trim();
    if (!id) return;
    try {
      const result = await checkEmployeeAvailability({ employeeId: id });
      if (result.employeeIdAvailable === false) {
        setErrors(prev => ({ ...prev, employeeId: "This Employee ID is already in use" }));
      } else {
        setErrors(prev => { const next = { ...prev }; delete next.employeeId; return next; });
      }
    } catch (_) { /* allow form to proceed; backend will reject if duplicate */ }
  };
  const handlePrev = () => setStep((s) => s - 1);
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all steps before submission
    let allErrors = {};
    
    // Validate step 0
    if (!form.employeeType) allErrors.employeeType = "Required";
    if (!form.firstName) allErrors.firstName = "Required";
    if (!form.lastName) allErrors.lastName = "Required";
    if (!form.employeeId) allErrors.employeeId = "Required";
    if (!form.status) allErrors.status = "Required";
    
    // Validate step 1 (including birthday age check)
    if (!form.gender) allErrors.gender = "Required";
    if (!form.maritalStatus) allErrors.maritalStatus = "Required";
    if (!form.nationality) allErrors.nationality = "Required";
    if (!form.currentAddress) allErrors.currentAddress = "Required";
    if (!isMaritalSingle(form.maritalStatus) && !String(form.childrenCount || '').trim()) allErrors.childrenCount = "Required";
    const birthdayError = validateBirthday(form.birthday);
    if (birthdayError) {
      allErrors.birthday = birthdayError;
    }
    
    // Validate step 2
    if (!form.contacts[0]?.value) allErrors.contacts = "At least one phone required";
    if (!form.emails[0]) allErrors.emails = "At least one email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((form.emails[0] || '').trim())) allErrors.emails = "Enter a valid email address";
    
    // Validate step 3
    if (!form.company) allErrors.company = "Required";
    if (!form.department) allErrors.department = "Required";
    if (!form.jobTitle) allErrors.jobTitle = "Required";
    if (!form.attendanceProgram) allErrors.attendanceProgram = "Required";
    if (!form.joiningDate) allErrors.joiningDate = "Required";
    if (!form.companyLocation) allErrors.companyLocation = "Required";
    
    // ERP Access validation (when enabled) - accept email OR mobile number
    if (form.userAccount) {
      const we = (userAccountFields.workEmail || '').trim();
      if (!we) {
        allErrors.workEmail = "Work email or mobile number is required for ERP login.";
      } else {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(we);
        const isMobile = /^(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,9}[-.\s]?\d{1,9}$/.test(we.replace(/\s/g, ''));
        if (!isEmail && !isMobile) {
          allErrors.workEmail = "Enter a valid email address or mobile number.";
        }
      }
      if (!useGeneratedPassword) {
        if (!userAccountFields.password) allErrors.erpPassword = "Password is required, or use Generate temporary password.";
        else if (userAccountFields.password.length < 8) allErrors.erpPassword = "Password must be at least 8 characters.";
        else if (!/[a-zA-Z]/.test(userAccountFields.password) || !/\d/.test(userAccountFields.password)) allErrors.erpPassword = "Password must contain at least one letter and one number.";
        else if (userAccountFields.password !== userAccountFields.passwordConfirm) allErrors.erpPasswordConfirm = "Passwords do not match.";
      }
    }
    
    // If there are errors, set them and prevent submission
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Scroll to step indicator / top so user sees summary
      const summaryEl = document.querySelector('.employee-form-steps');
      if (summaryEl) summaryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Scroll to first error field if found
      const firstErrorField = Object.keys(allErrors)[0];
      setTimeout(() => {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`) ||
                            document.querySelector(`input[id*="${firstErrorField}"]`)?.closest('.w-full') ||
                            document.querySelector(`.border-red-500`);
        if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return;
    }
    
    // Format phone numbers for submission
    const formattedContacts = form.contacts.map(contact => ({
      ...contact,
      value: formatPhoneForSubmission(contact.value, contact.countryCode)
    }));
    
    // Extract passport fields and map to backend expected names
    const { 
      passportIssue, passportExpiry, nationalIdExpiry, residencyExpiry, 
      insuranceExpiry, drivingExpiry, drivingNumber, labourExpiry,
      ...restOfForm 
    } = form;
    
    // ERP Access: workEmail (required when enabled), password (optional - backend generates if empty), role
    const workEmailVal = form.userAccount ? (userAccountFields.workEmail || '').trim() : '';
    const passwordVal = form.userAccount && !useGeneratedPassword ? userAccountFields.password : '';
    const submissionData = {
      ...restOfForm,
      ...(isMaritalSingle(form.maritalStatus) ? { childrenCount: '0' } : {}),
      contacts: formattedContacts,
      passportNumber: form.passportNumber || '',
      passportIssueDate: passportIssue || '',
      passportExpiryDate: passportExpiry || '',
      nationalIdExpiryDate: nationalIdExpiry || null,
      residencyExpiryDate: residencyExpiry || null,
      insuranceExpiryDate: insuranceExpiry || null,
      drivingLicenseExpiryDate: drivingExpiry || null,
      labourIdExpiryDate: labourExpiry || null,
      drivingLicenseNumber: drivingNumber || null,
      // ERP Access
      workEmail: form.userAccount ? workEmailVal || undefined : undefined,
      password: form.userAccount && passwordVal ? passwordVal : undefined,
      userAccount: !!form.userAccount,
      role: form.role || 'EMPLOYEE',
    };

    const primaryPhoneDigits = formattedContacts[0]?.value
      ? formatPhoneForSubmission(formattedContacts[0].value, formattedContacts[0].countryCode || 'ae')
      : '';
    if (primaryPhoneDigits) {
      submissionData.phone = primaryPhoneDigits;
    }
    if (form.labourNumber != null && String(form.labourNumber).trim() !== '') {
      submissionData.labourIdNumber = String(form.labourNumber).trim();
    }
    
    console.log('Submitting employee data:', submissionData);
    console.log('Passport fields check:', {
      passportNumber: submissionData.passportNumber,
      passportIssueDate: submissionData.passportIssueDate,
      passportExpiryDate: submissionData.passportExpiryDate,
      formPassportNumber: form.passportNumber,
      formPassportIssue: form.passportIssue,
      formPassportExpiry: form.passportExpiry
    });
    setSubmitted(true);
    
    // Save the employee to the list
    if (onSaveEmployee) {
      onSaveEmployee(submissionData);
    }
  };

  // Step content
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            {/* User Account Modal */}
            {showUserModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
                  <h3 className="text-lg font-bold mb-4">ERP Access (Login Credentials)</h3>
                  <div className="mb-4">
                    <label className="block font-medium mb-1">Work Email *</label>
                    <input type="email" className="input" placeholder="e.g. name@company.com" value={userAccountFields.workEmail} onChange={e => setUserAccountFields(f => ({ ...f, workEmail: e.target.value }))} />
                    {userAccountFields.workEmail === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
                  </div>
                  <div className="mb-4">
                    <label className="block font-medium mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="input pr-10" 
                        placeholder="Min 8 chars, letter + number" 
                        value={userAccountFields.password} 
                        onChange={e => setUserAccountFields(f => ({ ...f, password: e.target.value }))} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {userAccountFields.password === '' && <div className="text-red-500 text-xs mt-1">Required (or use Generate in form)</div>}
                  </div>
                  <div className="mb-4">
                    <label className="block font-medium mb-1">Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        className="input pr-10" 
                        placeholder="Confirm password" 
                        value={userAccountFields.passwordConfirm} 
                        onChange={e => setUserAccountFields(f => ({ ...f, passwordConfirm: e.target.value }))} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {userAccountFields.passwordConfirm === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button type="button" className="btn" onClick={() => setShowUserModal(false)}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={() => {
                      if (userAccountFields.workEmail && userAccountFields.password && userAccountFields.passwordConfirm) {
                        handleUserAccountSave();
                      }
                    }}>Save</button>
                  </div>
                </div>
              </div>
            )}
                          <div className="flex items-center gap-6 mb-8 flex-col sm:flex-row">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-400 flex items-center justify-center shadow-lg overflow-hidden cursor-pointer" onClick={() => document.getElementById('personalImageInput').click()}>
                    {form.personalImage ? (
                      <img src={URL.createObjectURL(form.personalImage)} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                  <input
                    id="personalImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {form.personalImage && (
                    <p className="text-xs text-green-600 font-medium mt-1">{form.personalImage.name}</p>
                  )}
                </div>
                <div className="text-lg font-semibold text-gray-700 mt-2 sm:mt-0">Main Information</div>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-6 px-1 sm:px-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Employee Type<span className="text-red-500 ml-1">*</span></label>
                <select className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${displayErrors.employeeType ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`} value={form.employeeType} onChange={e => handleChange('employeeType', e.target.value)}>
                  <option value="">Select employee type</option>
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
                {displayErrors.employeeType && <div className="text-red-500 text-xs mt-1">{displayErrors.employeeType}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">First Name<span className="text-red-500 ml-1">*</span></label>
                <input className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${displayErrors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`} placeholder="Enter first name" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} />
                {displayErrors.firstName && <div className="text-red-500 text-xs mt-1">{displayErrors.firstName}</div>}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Last Name<span className="text-red-500 ml-1">*</span></label>
                <input className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${displayErrors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`} placeholder="Enter last name" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} />
                {displayErrors.lastName && <div className="text-red-500 text-xs mt-1">{displayErrors.lastName}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Employee ID<span className="text-red-500 ml-1">*</span></label>
                <input className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${displayErrors.employeeId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`} placeholder="Enter employee ID" value={form.employeeId} onChange={e => handleChange('employeeId', e.target.value)} onBlur={handleEmployeeIdBlur} />
                {displayErrors.employeeId && <div className="text-red-500 text-xs mt-1">{displayErrors.employeeId}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Status<span className="text-red-500 ml-1">*</span></label>
                <select className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${displayErrors.status ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`} value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="probation">Probation</option>
                </select>
                {displayErrors.status && <div className="text-red-500 text-xs mt-1">{displayErrors.status}</div>}
              </div>

              {/* ERP Access section */}
              <div className="md:col-span-2 w-full mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">ERP Access</h4>
                <p className="text-xs text-gray-500 mb-3">These credentials will be used for ERP login.</p>
                <div className="flex items-center gap-2 mb-3">
                  <input type="checkbox" id="erpAccessToggle" checked={form.userAccount} onChange={e => handleChange('userAccount', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <label htmlFor="erpAccessToggle" className="text-sm font-medium text-gray-700">Enable ERP Access</label>
                </div>
                {form.userAccount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Email / Mobile Number (required for login) *</label>
                      <input type="text" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="e.g. name@company.com or +971501234567" value={userAccountFields.workEmail} onChange={e => setUserAccountFields(f => ({ ...f, workEmail: e.target.value }))} />
                      <p className="text-xs text-gray-500 mt-1">Enter email address or mobile number for ERP login</p>
                      {errors.workEmail && <div className="text-red-500 text-xs mt-1">{errors.workEmail}</div>}
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.role} onChange={e => handleChange('role', e.target.value)}>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="PROJECT_MANAGER">Manager</option>
                        <option value="HR">HR</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          className="w-full h-[42px] px-4 py-2 pr-10 text-sm border rounded-md" 
                          placeholder={useGeneratedPassword ? "Will be generated" : "Min 8 chars, letter + number"} 
                          value={userAccountFields.password} 
                          onChange={e => { setUserAccountFields(f => ({ ...f, password: e.target.value })); setUseGeneratedPassword(false); }} 
                          disabled={useGeneratedPassword} 
                        />
                        {!useGeneratedPassword && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        )}
                      </div>
                      {errors.erpPassword && <div className="text-red-500 text-xs mt-1">{errors.erpPassword}</div>}
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          className="w-full h-[42px] px-4 py-2 pr-10 text-sm border rounded-md" 
                          placeholder="Confirm password" 
                          value={userAccountFields.passwordConfirm} 
                          onChange={e => setUserAccountFields(f => ({ ...f, passwordConfirm: e.target.value }))} 
                          disabled={useGeneratedPassword} 
                        />
                        {!useGeneratedPassword && (
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        )}
                      </div>
                      {errors.erpPasswordConfirm && <div className="text-red-500 text-xs mt-1">{errors.erpPasswordConfirm}</div>}
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <button type="button" className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100" onClick={() => { setUseGeneratedPassword(true); setUserAccountFields(f => ({ ...f, password: '', passwordConfirm: '' })); }}>Generate temporary password</button>
                      {useGeneratedPassword && <span className="text-xs text-gray-600">Temporary password will be shown after save.</span>}
                    </div>
                  </div>
                )}
              </div>

            </div>
                     </div>
         );
       case 1:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><UserIcon className="h-6 w-6 text-indigo-400" /> Personal Details</div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Gender<span className="text-red-500 ml-1">*</span></label>
                 <select className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${displayErrors.gender ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`} value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
                   <option value="">Select gender</option>
                   <option value="male">Male</option>
                   <option value="female">Female</option>
                   <option value="other">Other</option>
                 </select>
                 {displayErrors.gender && <div className="text-red-500 text-xs mt-1">{displayErrors.gender}</div>}
               </div>
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Marital Status<span className="text-red-500 ml-1">*</span></label>
                 <select className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${displayErrors.maritalStatus ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`} value={form.maritalStatus} onChange={e => handleChange('maritalStatus', e.target.value)}>
                   <option value="">Select marital status</option>
                   <option value="single">Single</option>
                   <option value="married">Married</option>
                   <option value="divorced">Divorced</option>
                   <option value="widowed">Widowed</option>
                 </select>
                 {displayErrors.maritalStatus && <div className="text-red-500 text-xs mt-1">{displayErrors.maritalStatus}</div>}
               </div>
               <div className="w-full">
                                     <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Nationality<span className="text-red-500 ml-1">*</span></label>
                    <div className="relative nationality-dropdown">
                      <div className="relative">
                        <input
                          type="text"
                          className={`w-full h-[42px] px-4 py-2 pr-10 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white ${displayErrors.nationality ? 'border-red-500' : ''}`}
                          placeholder="Type to search nationality..."
                          value={form.nationality 
                            ? nationalities.find(n => n.value === form.nationality)?.label || form.nationality 
                            : nationalitySearchTerm}
                          onChange={(e) => {
                            const searchValue = e.target.value;
                            setNationalitySearchTerm(searchValue);
                            setNationalityDropdownOpen(true);
                            // Clear selection if user starts typing something different
                            if (form.nationality) {
                              const currentLabel = nationalities.find(n => n.value === form.nationality)?.label || '';
                              if (searchValue !== currentLabel) {
                                handleChange('nationality', '');
                              }
                            }
                          }}
                          onFocus={() => {
                            setNationalityDropdownOpen(true);
                            // If there's a selected nationality, show it in search term for editing
                            if (form.nationality) {
                              const selectedLabel = nationalities.find(n => n.value === form.nationality)?.label || '';
                              setNationalitySearchTerm(selectedLabel);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setNationalityDropdownOpen(false);
                              // Restore selected value if exists
                              if (form.nationality) {
                                const selectedLabel = nationalities.find(n => n.value === form.nationality)?.label || '';
                                setNationalitySearchTerm(selectedLabel);
                              } else {
                                setNationalitySearchTerm('');
                              }
                            }
                            // Allow Enter key to select first filtered option
                            if (e.key === 'Enter' && nationalityDropdownOpen) {
                              e.preventDefault();
                              const filteredNationalities = nationalities.filter((nationality) =>
                                nationality.label.toLowerCase().includes(nationalitySearchTerm.toLowerCase()) ||
                                nationality.value.toLowerCase().includes(nationalitySearchTerm.toLowerCase())
                              );
                              if (filteredNationalities.length > 0) {
                                handleChange('nationality', filteredNationalities[0].value);
                                setNationalitySearchTerm('');
                                setNationalityDropdownOpen(false);
                              }
                            }
                          }}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          {form.nationality ? (
                            <span className="text-lg" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols"' }}>
                              {nationalities.find(n => n.value === form.nationality)?.flag}
                            </span>
                          ) : (
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      {nationalityDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {(() => {
                            const filteredNationalities = nationalities.filter((nationality) =>
                              nationality.label.toLowerCase().includes(nationalitySearchTerm.toLowerCase()) ||
                              nationality.value.toLowerCase().includes(nationalitySearchTerm.toLowerCase())
                            );
                            
                            if (filteredNationalities.length === 0) {
                              return (
                                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                  No nationalities found
                                </div>
                              );
                            }
                            
                            return filteredNationalities.map((nationality) => (
                              <div
                                key={nationality.value}
                                className="px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer flex items-center transition-colors"
                                onClick={() => {
                                  handleChange('nationality', nationality.value);
                                  setNationalitySearchTerm('');
                                  setNationalityDropdownOpen(false);
                                }}
                              >
                                <span className="mr-2 text-lg" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols"' }}>{nationality.flag}</span>
                                <span className={form.nationality === nationality.value ? 'font-semibold text-indigo-600' : ''}>{nationality.label}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                    {displayErrors.nationality && <div className="text-red-500 text-xs mt-1">{displayErrors.nationality}</div>}
               </div>
               {!isMaritalSingle(form.maritalStatus) && (
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Children Count<span className="text-red-500 ml-1">*</span></label>
                 <input type="number" className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${displayErrors.childrenCount ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`} placeholder="Enter children count" value={form.childrenCount} onChange={e => handleChange('childrenCount', e.target.value)} min="0" />
                 {displayErrors.childrenCount && <div className="text-red-500 text-xs mt-1">{displayErrors.childrenCount}</div>}
               </div>
               )}
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Birthday<span className="text-red-500 ml-1">*</span></label>
                 <input 
                   type="date" 
                   className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${
                     displayErrors.birthday ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                   }`}
                   value={form.birthday} 
                   onChange={e => {
                     const birthdayValue = e.target.value;
                     handleChange('birthday', birthdayValue);
                     // Real-time validation
                     const birthdayError = validateBirthday(birthdayValue);
                     if (birthdayError) {
                       setErrors(prev => ({ ...prev, birthday: birthdayError }));
                     } else {
                       setErrors(prev => {
                         const newErrors = { ...prev };
                         delete newErrors.birthday;
                         return newErrors;
                       });
                     }
                   }}
                   max={(() => {
                     // Set max date to 18 years ago from today
                     const today = new Date();
                     const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                     return maxDate.toISOString().split('T')[0];
                   })()}
                 />
                 {displayErrors.birthday && (
                   <div className={`text-xs mt-1 ${
                     displayErrors.birthday.includes('at least 18 years old') 
                       ? 'text-red-600 font-medium' 
                       : 'text-red-500'
                   }`}>
                     {displayErrors.birthday}
                   </div>
                 )}
                 {form.birthday && !displayErrors.birthday && (
                   <div className="text-xs text-gray-500 mt-1">
                     Age: {calculateAge(form.birthday)} years old
                   </div>
                 )}
               </div>
               <div className="w-full col-span-1 md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Current Address<span className="text-red-500 ml-1">*</span></label>
                 <textarea className={`w-full h-[80px] px-4 py-2 text-sm border rounded-md ${displayErrors.currentAddress ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`} placeholder="Enter current address" value={form.currentAddress} onChange={e => handleChange('currentAddress', e.target.value)} />
                 {displayErrors.currentAddress && <div className="text-red-500 text-xs mt-1">{displayErrors.currentAddress}</div>}
               </div>

             </div>
           </div>
         );
       case 2:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><PhoneIcon className="h-6 w-6 text-indigo-400" /> Contact Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Phone Numbers<span className="text-red-500 ml-1">*</span></label>
                {form.contacts.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <PhoneInput
                      country={'ae'}
                      value={c.value}
                      onChange={(phone, country) => handleContactChange(i, phone, country.countryCode)}
                      placeholder="50 123 4567"
                      enableSearch={true}
                      searchPlaceholder="Search country..."
                      preferredCountries={['ae', 'sa', 'kw', 'bh', 'om', 'qa']}
                      autoFormat={true}
                      disableSearchIcon={true}
                      countryCodeEditable={false}
                    />
                    {form.contacts.length > 1 && <button type="button" className="text-red-500" onClick={() => handleRemoveContact(i)}>Remove</button>}
                  </div>
                ))}
                <button type="button" className="text-blue-600" onClick={handleAddContact}>+ Add Phone</button>
                {displayErrors.contacts && <div className="text-red-500 text-xs mt-1">{displayErrors.contacts}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Emails<span className="text-red-500 ml-1">*</span></label>
                {form.emails.map((em, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${displayErrors.emails && i === 0 ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`} value={em} onChange={e => handleEmailChange(i, e.target.value)} placeholder="Email" />
                    {form.emails.length > 1 && <button type="button" className="text-red-500" onClick={() => handleRemoveEmail(i)}>Remove</button>}
                  </div>
                ))}
                <button type="button" className="text-blue-600" onClick={handleAddEmail}>+ Add Email</button>
                {displayErrors.emails && <div className="text-red-500 text-xs mt-1">{displayErrors.emails}</div>}
              </div>
            </div>
          </div>
        );
             case 3:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><BriefcaseIcon className="h-6 w-6 text-indigo-400" /> Company Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Company<span className="text-red-500 ml-1">*</span>
                  {selectedCompany && form.company === selectedCompany && (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                      <CheckIcon className="h-3 w-3" />
                      Pre-filled
                    </span>
                  )}
                </label>
                <select
                  className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${
                    selectedCompany && form.company === selectedCompany ? 'border-green-300 bg-green-50' : ''
                  }`}
                  value={form.company}
                  onChange={handleCompanyChange}
                  disabled={loadingCompanies}
                >
                  <option value="">{loadingCompanies ? 'Loading companies...' : 'Select company'}</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.name}>
                      {company.name}
                    </option>
                  ))}
                </select>
                {displayErrors.company && <div className="text-red-500 text-xs mt-1">{displayErrors.company}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Department<span className="text-red-500 ml-1">*</span>
                  {departmentFromNavigation && form.department === departmentFromNavigation && (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                      <CheckIcon className="h-3 w-3" />
                      Pre-filled
                    </span>
                  )}
                  {selectedCompanyId && departments.length > 0 && form.department && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                      <CheckIcon className="h-3 w-3" />
                      {departments.length} available
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    list={`department-list-${selectedCompanyId || 'none'}`}
                    className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${
                      departmentFromNavigation && form.department === departmentFromNavigation ? 'border-green-300 bg-green-50' : ''
                    }`}
                    placeholder={loadingDepartments 
                      ? 'Loading departments...' 
                      : !selectedCompanyId 
                        ? 'Select a company first' 
                        : departments.length === 0
                          ? 'Enter department name'
                          : 'Select or type department name'}
                    value={typeof form.department === 'string' ? form.department : (form.department?.name || form.department?.title || '')}
                    onChange={e => handleChange('department', e.target.value)}
                    disabled={loadingDepartments || !selectedCompanyId}
                  />
                  <datalist id={`department-list-${selectedCompanyId || 'none'}`}>
                    {departments.map(department => (
                      <option key={department.id} value={department.name}>
                        {department.name}
                      </option>
                    ))}
                  </datalist>
                </div>
                {selectedCompanyId && departments.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {departments.length} department{departments.length !== 1 ? 's' : ''} available. Select from list or type a new name.
                  </div>
                )}
                {selectedCompanyId && departments.length === 0 && !loadingDepartments && (
                  <div className="text-xs text-gray-500 mt-1">
                    No departments found for this company. You can enter a department name manually.
                  </div>
                )}
                {displayErrors.department && <div className="text-red-500 text-xs mt-1">{displayErrors.department}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Job Title<span className="text-red-500 ml-1">*</span></label>
                <select 
                  key={`job-title-select-${jobTitles?.length || 0}`}
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.jobTitle || ""} 
                  onChange={e => {
                    const newJobTitle = e.target.value;
                    console.log('Job Title selected:', newJobTitle);
                    console.log('Available job titles:', jobTitles);
                    console.log('Current form.jobTitle:', form.jobTitle);
                    
                    // Update job title using functional update to ensure latest state
                    setForm(prev => {
                      const updated = { ...prev, jobTitle: newJobTitle };
                      // Clear manager field when job title is "Manager"
                      if (newJobTitle === "Manager") {
                        updated.manager = '';
                        updated.managerId = '';
                      }
                      return updated;
                    });
                    
                    // Clear manager error if it exists when selecting Manager
                    if (newJobTitle === "Manager") {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.manager;
                        return newErrors;
                      });
                    }
                  }}
                >
                  <option value="">Select job title</option>
                  {jobTitles && jobTitles.length > 0 ? (
                    buildJobTitlePickerOptions(jobTitles, form.jobTitle).map((job, index) => {
                      const jobTitleValue = job.title || job.name || '';
                      const jobTitleDisplay = job.title || job.name || '';
                      const inactive = job._inactiveOrgPath;
                      return (
                        <option
                          key={job.id || `job-${index}`}
                          value={jobTitleValue}
                          disabled={!!inactive}
                        >
                          {inactive ? `${jobTitleDisplay} (inactive org — reactivate in Company)` : jobTitleDisplay}
                        </option>
                      );
                    })
                  ) : (
                    <option value="Manager">Manager</option>
                  )}
                </select>
                {displayErrors.jobTitle && <div className="text-red-500 text-xs mt-1">{displayErrors.jobTitle}</div>}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Current value: {form.jobTitle || '(empty)'} | Available: {jobTitles?.length || 0} titles
                  </div>
                )}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Attendance Program<span className="text-red-500 ml-1">*</span></label>
                <select 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.attendanceProgram} 
                  onChange={e => handleChange('attendanceProgram', e.target.value)}
                >
                  <option value="">Select attendance program</option>
                  {attendancePrograms && attendancePrograms.map(program => (
                    <option key={program.id} value={program.name}>{program.name}</option>
                  ))}
                </select>
                {displayErrors.attendanceProgram && <div className="text-red-500 text-xs mt-1">{displayErrors.attendanceProgram}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Joining Date<span className="text-red-500 ml-1">*</span></label>
                <input type="date" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.joiningDate} onChange={e => handleChange('joiningDate', e.target.value)} />
                {displayErrors.joiningDate && <div className="text-red-500 text-xs mt-1">{displayErrors.joiningDate}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Exit Date</label>
                <input type="date" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.exitDate} onChange={e => handleChange('exitDate', e.target.value)} />
                {errors.exitDate && <div className="text-red-500 text-xs">{errors.exitDate}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Company Location<span className="text-red-500 ml-1">*</span></label>
                <select 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.companyLocation} 
                  onChange={e => handleChange('companyLocation', e.target.value)}
                >
                  <option value="">Select company location</option>
                  {companyLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                {displayErrors.companyLocation && <div className="text-red-500 text-xs mt-1">{displayErrors.companyLocation}</div>}
              </div>
              {form.jobTitle !== "Manager" && (
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Line Manager</label>
                  <select 
                    className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                    value={form.managerId || ''} 
                    onChange={(e) => {
                      const id = e.target.value;
                      if (!id) {
                        setForm((prev) => ({ ...prev, managerId: '', manager: '' }));
                        return;
                      }
                      const emp = activeLineManagerCandidates.find((x) => x.id === id);
                      const label = emp
                        ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || ''
                        : '';
                      setForm((prev) => ({ ...prev, managerId: id, manager: label }));
                    }}
                  >
                    <option value="">Select line manager (Optional)</option>
                    {activeLineManagerCandidates.map((emp) => {
                      const label = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.email || emp.id;
                      return (
                        <option key={emp.id} value={emp.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  {errors.manager && <div className="text-red-500 text-xs">{errors.manager}</div>}
                </div>
              )}
              <div className="w-full flex items-center gap-2 mt-6">
                <input type="checkbox" checked={form.isLineManager} onChange={e => handleChange('isLineManager', e.target.checked)} />
                <label className="block text-sm font-medium text-gray-700 mb-1">Is Line Manager</label>
              </div>
            </div>
          </div>
        );
             case 4:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><IdentificationIcon className="h-6 w-6 text-indigo-400" /> Legal Information</div>
            <div className="space-y-4 mb-6">
              {/* Collapsible Section Helper */}
              {[
                { key: 'passport', label: 'Passport Info', attachmentField: 'passportAttachment', fields: [
                  { name: 'passportNumber', label: 'Passport Number', placeholder: 'Enter passport number' },
                  { name: 'passportIssue', label: 'Passport Issue Date', type: 'date' },
                  { name: 'passportExpiry', label: 'Passport Expiry Date', type: 'date' },
                ]},
                { key: 'nationalId', label: 'National ID', attachmentField: 'nationalIdAttachment', fields: [
                  { name: 'nationalIdNumber', label: 'National ID Number', placeholder: 'Enter national ID number' },
                  { name: 'nationalIdExpiry', label: 'National ID Expiry', type: 'date' },
                ]},
                { key: 'residency', label: 'Residency Info', attachmentField: 'residencyAttachment', fields: [
                  { name: 'residencyNumber', label: 'Residency Number', placeholder: 'Enter residency number' },
                  { name: 'residencyExpiry', label: 'Residency Expiry', type: 'date' },
                ]},
                { key: 'insurance', label: 'Insurance', attachmentField: 'insuranceAttachment', fields: [
                  { name: 'insuranceNumber', label: 'Insurance Number', placeholder: 'Enter insurance number' },
                  { name: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' },
                ]},
                { key: 'driving', label: 'Driving Licence', attachmentField: 'drivingAttachment', fields: [
                  { name: 'drivingNumber', label: 'Driving Licence Number', placeholder: 'Enter driving licence number' },
                  { name: 'drivingExpiry', label: 'Driving Licence Expiry', type: 'date' },
                ]},
                { key: 'labour', label: 'Labour ID', attachmentField: 'labourAttachment', fields: [
                  { name: 'labourNumber', label: 'Labour ID Number', placeholder: 'Enter labour ID number' },
                  { name: 'labourExpiry', label: 'Labour ID Expiry', type: 'date' },
                ]},
              ].map(section => (
                <div key={section.key} className="border rounded-lg overflow-hidden">
                  <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-indigo-50 transition font-semibold text-left" onClick={() => setOpenLegalSection(openLegalSection === section.key ? '' : section.key)}>
                    {section.label}
                    <span>{openLegalSection === section.key ? '-' : '+'}</span>
                  </button>
                  {openLegalSection === section.key && (
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-4">
                        {section.fields.map(field => {
                          // Special handling for passport expiry date
                          const isPassportExpiry = field.name === 'passportExpiry';
                          return (
                            <div key={field.name} className="w-full">
                              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                              <input
                                className={`w-full h-[42px] px-4 py-2 text-sm border rounded-md ${
                                  displayErrors[field.name] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                                }`}
                                type={field.type || 'text'}
                                placeholder={field.placeholder || field.label}
                                value={form[field.name] || ''}
                                onChange={e => {
                                  const value = e.target.value;
                                  handleChange(field.name, value);
                                  
                                  // Real-time validation for passport expiry
                                  if (isPassportExpiry) {
                                    const expiryError = validatePassportExpiry(value);
                                    if (expiryError) {
                                      setErrors(prev => ({ ...prev, [field.name]: expiryError }));
                                    } else {
                                      setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors[field.name];
                                        return newErrors;
                                      });
                                    }
                                  }
                                }}
                                min={isPassportExpiry ? (() => {
                                  // Set min date to 6 months from today
                                  const today = new Date();
                                  const minDate = new Date();
                                  minDate.setMonth(today.getMonth() + 6);
                                  return minDate.toISOString().split('T')[0];
                                })() : undefined}
                              />
                              {displayErrors[field.name] && (
                                <div className={`text-xs mt-1 ${
                                  displayErrors[field.name].includes('6 months')
                                    ? 'text-red-600 font-medium'
                                    : 'text-red-500'
                                }`}>
                                  {displayErrors[field.name]}
                                </div>
                              )}
                              {isPassportExpiry && form[field.name] && !displayErrors[field.name] && (() => {
                                const expiry = new Date(form[field.name]);
                                const today = new Date();
                                const monthsUntilExpiry = (expiry.getFullYear() - today.getFullYear()) * 12 + (expiry.getMonth() - today.getMonth());
                                return (
                                  <div className="text-xs text-green-600 mt-1">
                                    Valid for {monthsUntilExpiry} months
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Attachment Section */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <DocumentPlusIcon className="h-5 w-5 text-indigo-500" />
                          <label className="block text-sm font-medium text-gray-700">Upload {section.label} Document</label>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={e => handleLegalDocumentChange(section.attachmentField, e.target.files[0])}
                          />
                          {form[section.attachmentField] && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckIcon className="h-4 w-4" />
                              <span>{form[section.attachmentField].name}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                                 </div>
               ))}
             </div>
             
             {/* Legal Documents Summary */}
             <div className="mt-6 p-4 bg-gray-50 rounded-lg">
               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                 <DocumentPlusIcon className="h-4 w-4 text-indigo-500" />
                 Uploaded Legal Documents
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {[
                   { label: 'Passport', field: 'passportAttachment' },
                   { label: 'National ID', field: 'nationalIdAttachment' },
                   { label: 'Residency', field: 'residencyAttachment' },
                   { label: 'Insurance', field: 'insuranceAttachment' },
                   { label: 'Driving License', field: 'drivingAttachment' },
                   { label: 'Labour ID', field: 'labourAttachment' }
                 ].map(doc => (
                   <div key={doc.field} className="flex items-center gap-2 p-2 bg-white rounded border">
                     {form[doc.field] ? (
                       <>
                         <CheckIcon className="h-4 w-4 text-green-500" />
                         <span className="text-sm text-gray-700">{doc.label}:</span>
                         <span className="text-sm text-green-600 font-medium">{form[doc.field].name}</span>
                       </>
                     ) : (
                       <>
                         <div className="h-4 w-4 border-2 border-gray-300 rounded"></div>
                         <span className="text-sm text-gray-500">{doc.label}: Not uploaded</span>
                       </>
                     )}
                   </div>
                 ))}
               </div>
             </div>
           </div>
        );

                            case 5:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><CheckCircleIcon className="h-6 w-6 text-green-500" /> Review & Submit</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
              <div className="w-full"><b>Gender:</b> {form.gender}</div>
              <div className="w-full"><b>Marital Status:</b> {form.maritalStatus}</div>
                              <div className="w-full"><b>Nationality:</b> {nationalities.find(n => n.value === form.nationality)?.flag} {nationalities.find(n => n.value === form.nationality)?.label || form.nationality}</div>
              <div className="w-full"><b>Birthday:</b> {form.birthday}</div>
              <div className="w-full"><b>Phones:</b> {form.contacts.map(c => c.value).join(", ")}</div>
              <div className="w-full"><b>Emails:</b> {form.emails.join(", ")}</div>
              <div className="w-full"><b>Department:</b> {form.department}</div>
              <div className="w-full"><b>Job Title:</b> {form.jobTitle}</div>
              <div className="w-full"><b>Attendance Program:</b> {form.attendanceProgram}</div>
              <div className="w-full"><b>Company Location:</b> {form.companyLocation}</div>
              {form.jobTitle !== "Manager" && (
                <div className="w-full"><b>Line Manager:</b> {form.manager}</div>
              )}
              <div className="w-full"><b>Passport:</b> {form.passportNumber || '—'}</div>
              <div className="w-full"><b>National ID:</b> {form.nationalIdNumber || '—'}</div>
              <div className="w-full"><b>Residency / Visa:</b> {form.residencyNumber || '—'}</div>
              <div className="w-full"><b>Insurance:</b> {form.insuranceNumber || '—'}</div>
              <div className="w-full"><b>Driving licence:</b> {form.drivingNumber || '—'}</div>
              <div className="w-full"><b>Labour ID:</b> {form.labourNumber || '—'}</div>
              <div className="w-full col-span-2">
                <b>Legal Documents:</b>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { label: 'Passport', field: 'passportAttachment' },
                    { label: 'National ID', field: 'nationalIdAttachment' },
                    { label: 'Residency', field: 'residencyAttachment' },
                    { label: 'Insurance', field: 'insuranceAttachment' },
                    { label: 'Driving License', field: 'drivingAttachment' },
                    { label: 'Labour ID', field: 'labourAttachment' }
                  ].map(doc => (
                    <div key={doc.field} className="text-sm">
                      <span className="font-medium">{doc.label}:</span> {form[doc.field] ? form[doc.field].name : 'Not uploaded'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <EmployeeFormContext.Provider value={ctxValue}>
      <div className="w-full min-h-screen flex flex-col items-center animate-fade-in px-1 sm:px-2 md:px-4 pb-8 employee-form-steps overflow-x-hidden overflow-y-auto">
        {/* Mobile Stepper */}
        <div className="w-full lg:hidden mb-4 mt-2 px-1 overflow-x-auto">
          <div className="flex items-center justify-between mb-4 min-w-[400px]">
            <span className="text-xs font-medium text-gray-500">Step {step + 1} of {steps.length}</span>
            <span className="text-xs font-medium text-indigo-600">{steps[step].label}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop Stepper */}
        <div className="w-full relative mb-6 mt-6 px-2 sm:px-4 lg:px-10 hidden lg:block" style={{height: 60}}>
          {/* Progress line (background) */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-gray-300 rounded z-0" />
          {/* Progress line (active) */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-indigo-500 rounded z-0 transition-all duration-300"
            style={{ width: `${(step/(steps.length-1))*100}%`, right: 'auto' }}
          />
          {/* Stepper icons */}
          <div className="relative z-10 flex items-center justify-between w-full">
            {steps.map((s, i) => {
              const canGo = i === 0 || Array.from({length: i}).every((_, idx) => {
                // Simulate validation for each previous step
                let errs = {};
                if (idx === 0) {
                  if (!form.employeeType) errs.employeeType = 'Required';
                  if (!form.firstName) errs.firstName = 'Required';
                  if (!form.lastName) errs.lastName = 'Required';
                  if (!form.employeeId) errs.employeeId = 'Required';
                  if (!form.status) errs.status = 'Required';
                }
                                 if (idx === 1) {
                   if (!form.gender) errs.gender = 'Required';
                   if (!form.maritalStatus) errs.maritalStatus = 'Required';
                   if (!form.nationality) errs.nationality = 'Required';
                   if (!form.currentAddress) errs.currentAddress = 'Required';
                   if (!isMaritalSingle(form.maritalStatus) && !String(form.childrenCount || '').trim()) errs.childrenCount = 'Required';
                   // Validate birthday with age check
                   const birthdayError = validateBirthday(form.birthday);
                   if (birthdayError) {
                     errs.birthday = birthdayError;
                   }
                 }
                 if (idx === 2) {
                   if (!form.contacts[0].value) errs.contacts = 'At least one phone required';
                   if (!form.emails[0]) errs.emails = 'At least one email required';
                 }
                 if (idx === 3) {
                   if (!form.company) errs.company = 'Required';
                   if (!form.department) errs.department = 'Required';
                   if (!form.jobTitle) errs.jobTitle = 'Required';
                   if (!form.attendanceProgram) errs.attendanceProgram = 'Required';
                   if (!form.joiningDate) errs.joiningDate = 'Required';
                   if (!form.exitDate) errs.exitDate = 'Required';
                   if (!form.workingLocations || form.workingLocations.length === 0) errs.workingLocations = 'Required';
                   // Line Manager is optional - no validation required
                 }
                 if (idx === 4) {
                   // Passport - REQUIRED
                   if (!form.passportNumber) errs.passportNumber = 'Required';
                   if (!form.passportIssue) errs.passportIssue = 'Required';
                   // Validate passport expiry - must be at least 6 months away
                   const passportExpiryError = validatePassportExpiry(form.passportExpiry);
                   if (passportExpiryError) {
                     errs.passportExpiry = passportExpiryError;
                   }
                   // All other legal documents (National ID, Residency, Insurance, Driving License, Labour ID) are OPTIONAL
                   // No validation required for these fields
                 }
                return Object.keys(errs).length === 0;
              });
              const isCompleted = i < step;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center w-1/6 ${i === step ? 'text-indigo-600 font-bold' : canGo ? 'text-gray-400 cursor-pointer hover:text-indigo-500' : 'text-gray-300 cursor-not-allowed'}`}
                  onClick={() => canGo && setStep(i)}
                  title={canGo ? s.label : 'Complete previous steps first'}
                  style={{ pointerEvents: canGo ? 'auto' : 'none' }}
                >
                  <div className={`relative z-10 rounded-full w-10 h-10 flex items-center justify-center border-2 ${i === step ? 'border-indigo-600 bg-indigo-100' : isCompleted ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 bg-white'} transition-all duration-300`}>
                    {isCompleted ? (
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <s.icon className={`h-6 w-6 ${i === step ? 'text-indigo-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="text-xs mt-2 text-center whitespace-nowrap">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-2xl p-2 sm:p-4 lg:p-10 border border-indigo-100 mx-0">
          {Object.keys(errors).length > 0 && step === steps.length - 1 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <p className="text-sm font-semibold text-red-800 mb-2">Please fix the following before submitting:</p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                {Object.entries(errors).slice(0, 8).map(([key, msg]) => (
                  <li key={key}>{msg}</li>
                ))}
                {Object.keys(errors).length > 8 && <li>... and {Object.keys(errors).length - 8} more</li>}
              </ul>
            </div>
          )}
          {renderStep()}
          <div className="flex flex-col sm:flex-row justify-between mt-6 gap-2 sm:gap-4">
            <button type="button" className="btn flex items-center justify-center gap-2 order-2 sm:order-1 w-full sm:w-auto" onClick={onBack}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to List
            </button>
            <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2 w-full sm:w-auto">
              {step > 0 && <button type="button" className="btn flex items-center justify-center gap-2 w-full sm:w-auto" onClick={handlePrev}><svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Previous</button>}
              {step < steps.length - 1 && (
                <button
                  type="button"
                  className={`btn flex items-center justify-center gap-2 w-full sm:w-auto ${!isCurrentStepValid ? 'btn-disabled opacity-60 cursor-not-allowed' : 'btn-primary'}`}
                  onClick={handleNext}
                  disabled={!isCurrentStepValid}
                  title={!isCurrentStepValid ? 'Complete all required fields correctly to continue' : ''}
                >
                  Next <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
              {step === steps.length - 1 && <button type="submit" className="btn btn-success flex items-center justify-center gap-2 w-full sm:w-auto"><CheckCircleIcon className="h-5 w-5" /> Submit</button>}
            </div>
          </div>
          {submitted && <div className="mt-4 text-green-600 font-bold text-center">Employee submitted successfully!</div>}
        </form>
        <style>{`
          .input { @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200; }
          .btn { @apply px-4 py-2 rounded font-semibold transition bg-white border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm; }
          .btn-primary { @apply bg-indigo-600 text-white hover:bg-indigo-700 border-0; }
          .btn-success { @apply bg-green-600 text-white hover:bg-green-700 border-0; }
          .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(.4,0,.2,1); }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
          
          ${phoneInputStyles}
        `}</style>
      </div>
    </EmployeeFormContext.Provider>
  );
}

export default function Employees() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedCompany: selectedCompanyName } = useCompanySelection();
  const isAdmin = user?.role === 'ADMIN';
  const isHr = user?.role === 'HR';
  const canManageInactiveVisibility = isAdmin || isHr;
  
  // Get navigation state for breadcrumbs (company, department, subdepartment, position)
  const navigationState = location.state || {};
  const company = navigationState.company || null;
  const department = navigationState.department || null;
  const subDepartment = navigationState.subDepartment || null;
  const position = navigationState.position || null;
  const placementPositionId =
    (navigationState.positionId != null && String(navigationState.positionId).trim()) ||
    (position && position.id != null && String(position.id).trim()) ||
    '';

  /**
   * Placement filter when drilling from org chart → position.
   * User.department often matches the *sub-department* name (e.g. "HR") while navigation passes the
   * parent department ("Human Resources"). Accept either parent or sub-department label.
   * Position match uses User.position or User.jobTitle (exact or substring when label is long enough).
   */
  const placementDepartmentName =
    (department && typeof department === 'object' && department !== null
      ? department.name
      : typeof department === 'string'
        ? department
        : '') || '';
  const placementSubDepartmentName =
    subDepartment && typeof subDepartment === 'object' && subDepartment !== null
      ? String(subDepartment.name || '').trim()
      : '';
  const placementPositionName = (position && position.name) || '';
  const placementDeptAliases = [
    ...new Set(
      [placementDepartmentName, placementSubDepartmentName]
        .map((s) => String(s || '').trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
  const placementFilterActive =
    Boolean(placementPositionName.trim()) &&
    placementDeptAliases.length > 0;

  const matchesPlacementPositionLabel = (empPos, empJob, wantRaw) => {
    const want = String(wantRaw || '').trim().toLowerCase();
    if (!want) return true;
    const p = String(empPos || '').trim().toLowerCase();
    const j = String(empJob || '').trim().toLowerCase();
    if (p === want || j === want) return true;
    if (want.length >= 4 && (p.includes(want) || j.includes(want))) return true;
    return false;
  };

  const matchesPlacementFilter = (emp) => {
    if (!placementFilterActive) return true;
    if (
      placementPositionId &&
      Array.isArray(emp.additionalPositionIds) &&
      emp.additionalPositionIds.includes(placementPositionId)
    ) {
      return true;
    }
    const dept = String(emp.department || '').trim().toLowerCase();
    if (!placementDeptAliases.includes(dept)) return false;
    const wantPos = placementPositionName.trim().toLowerCase();
    return matchesPlacementPositionLabel(emp.position, emp.jobTitle, wantPos);
  };

  const clearPlacementFilter = () => {
    navigate('/employees', {
      replace: true,
      state: company ? { company } : {},
    });
  };

  // Current company context: from navigation state (object with id, name) or from context (name only)
  // When viewing "Onix" vs "Onix Engineering Consultancy", only that company's employees are shown
  const effectiveCompany = company && (company.id || company.name)
    ? { id: company.id, name: company.name || selectedCompanyName }
    : (selectedCompanyName ? { id: null, name: selectedCompanyName } : null);
  const companyParams = effectiveCompany
    ? (effectiveCompany.id ? { companyId: effectiveCompany.id } : { companyName: effectiveCompany.name })
    : {};

  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    totalDepartments: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  /** When false, inactive (deactivated) rows are hidden so the directory can look empty after bulk deactivate. */
  const [showInactiveEmployees, setShowInactiveEmployees] = useState(false);
  const [showJobTitlesModal, setShowJobTitlesModal] = useState(false);
  const [showAttendanceProgramModal, setShowAttendanceProgramModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] = useState(null);
  const [showPayrollDrawer, setShowPayrollDrawer] = useState(false);
  const [selectedEmployeeForPayroll, setSelectedEmployeeForPayroll] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState(null);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState(null);
  const [employeeEditChangeReason, setEmployeeEditChangeReason] = useState('');
  const [historyDrawerLoading, setHistoryDrawerLoading] = useState(false);
  const [historyDrawerError, setHistoryDrawerError] = useState(null);
  const [openLegalSection, setOpenLegalSection] = useState('');
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [selectedEmployeeForPassword, setSelectedEmployeeForPassword] = useState(null);
  const [showAssignFromDirectoryModal, setShowAssignFromDirectoryModal] = useState(false);
  const [assignDirectorySearch, setAssignDirectorySearch] = useState('');
  const [assigningEmployeeId, setAssigningEmployeeId] = useState(null);

  const canAssignFromDirectory = (isAdmin || isHr) && placementFilterActive && Boolean(placementPositionId);

  const employeesForAssignPicker = useMemo(() => {
    const q = assignDirectorySearch.trim().toLowerCase();
    let list = Array.isArray(employees) ? [...employees] : [];
    list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' }));
    if (!q) return list;
    return list.filter((emp) => {
      const hay = `${emp.name || ''} ${emp.email || ''} ${emp.department || ''} ${emp.jobTitle || ''} ${emp.position || ''} ${emp.employeeId != null ? String(emp.employeeId) : ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [employees, assignDirectorySearch]);
  
  // Fetch employees and statistics (filtered by company when a company is selected)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch employees (optionally filtered by company)
        const employeesResponse = await getEmployees(companyParams);
        if (employeesResponse.success && employeesResponse.data) {
          // Transform backend employee data to match frontend format
          const transformedEmployees = employeesResponse.data.map(mapEmployeeListItem);
          setEmployees(transformedEmployees);
        }

        // Fetch statistics (same company filter so counts match the list)
        const statsResponse = await getEmployeeStatistics(companyParams);
        if (statsResponse.success && statsResponse.data) {
          setStatistics(statsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching employees and statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [effectiveCompany?.id, effectiveCompany?.name]);

  // Filter employees: org placement (from positions drill-down) + search + optional hide inactive (Admin/HR)
  const filteredEmployees = employees.filter((emp) => {
    if (!matchesPlacementFilter(emp)) return false;
    if (canManageInactiveVisibility && !showInactiveEmployees && emp.isActive === false) {
      return false;
    }
    const searchLower = searchTerm.toLowerCase();
    return (
      (emp.name || '').toLowerCase().includes(searchLower) ||
      (emp.department || '').toLowerCase().includes(searchLower) ||
      (emp.jobTitle || '').toLowerCase().includes(searchLower) ||
      (emp.email || '').toLowerCase().includes(searchLower) ||
      (emp.id || '').toString().includes(searchTerm)
    );
  });
  
  /** Per-employee session uploads (mock keys removed — real IDs are UUIDs). Merged with API legal attachments in the UI. */
  const [employeeDocuments, setEmployeeDocuments] = useState({});
  const mergedViewDocuments = useMemo(
    () =>
      mergeEmployeeDocumentsList(
        selectedEmployeeForView,
        selectedEmployeeForView ? employeeDocuments[selectedEmployeeForView.id] : undefined
      ),
    [selectedEmployeeForView, employeeDocuments]
  );
  const mergedEditDocuments = useMemo(
    () =>
      mergeEmployeeDocumentsList(
        selectedEmployeeForEdit,
        selectedEmployeeForEdit ? employeeDocuments[selectedEmployeeForEdit.id] : undefined
      ),
    [selectedEmployeeForEdit, employeeDocuments]
  );
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [jobTitles, setJobTitles] = useState([]);
  const [jobTitlesLoading, setJobTitlesLoading] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editJobDraft, setEditJobDraft] = useState({ title: '', department: '', description: '' });

  const loadJobTitles = useCallback(async () => {
    setJobTitlesLoading(true);
    try {
      const res = await getAllPositions();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setJobTitles(
          res.data.map((p) => ({
            id: p.id,
            title: p.title || p.name,
            department: p.departmentLabel || '—',
            description: p.description || '',
            fromApi: true,
            positionStatus: p.status,
            subDepartmentStatus: p.subDepartment?.status,
            departmentStatus: p.subDepartment?.department?.status,
          }))
        );
      } else {
        setJobTitles(buildFallbackJobTitlesList());
      }
    } catch (e) {
      console.warn('Job titles load failed, using fallback list', e);
      setJobTitles(buildFallbackJobTitlesList());
    } finally {
      setJobTitlesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobTitles();
  }, [loadJobTitles]);

  useEffect(() => {
    if (showJobTitlesModal) {
      setEditingJobId(null);
      loadJobTitles();
    }
  }, [showJobTitlesModal, loadJobTitles]);

  const [attendancePrograms, setAttendancePrograms] = useState([]);
  const [attendanceProgramsLoading, setAttendanceProgramsLoading] = useState(false);
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [newAttendanceProgramDraft, setNewAttendanceProgramDraft] = useState({
    name: '',
    description: '',
    weeklySchedule: createDefaultWeeklySchedule(),
  });
  const [attendanceProgramFilter, setAttendanceProgramFilter] = useState('');

  useEffect(() => {
    if (showAttendanceProgramModal) {
      setEditingAttendanceId(null);
      setNewAttendanceProgramDraft({
        name: '',
        description: '',
        weeklySchedule: createDefaultWeeklySchedule(),
      });
      setAttendanceProgramFilter('');
    }
  }, [showAttendanceProgramModal]);

  const loadAttendancePrograms = useCallback(async () => {
    const params =
      effectiveCompany?.id
        ? { companyId: effectiveCompany.id }
        : effectiveCompany?.name
          ? { companyName: effectiveCompany.name }
          : {};
    if (!params.companyId && !params.companyName) {
      setAttendancePrograms([]);
      setAttendanceProgramsLoading(false);
      return;
    }
    setAttendanceProgramsLoading(true);
    const res = await getAttendancePrograms(params);
    setAttendanceProgramsLoading(false);
    if (res.success && Array.isArray(res.data)) {
      setAttendancePrograms(
        res.data.map((row) => ({
          id: row.id,
          name: row.name || '',
          description: row.description || '',
          weeklySchedule: mergeWeeklySchedule(row.weeklySchedule),
          hours: row.hours || formatWeeklyScheduleSummary(mergeWeeklySchedule(row.weeklySchedule)),
        }))
      );
    } else {
      setAttendancePrograms([]);
      if (res.message) console.warn(res.message);
    }
  }, [effectiveCompany?.id, effectiveCompany?.name]);

  useEffect(() => {
    loadAttendancePrograms();
  }, [loadAttendancePrograms]);

  const filteredAttendancePrograms = useMemo(() => {
    const q = attendanceProgramFilter.trim().toLowerCase();
    if (!q) return attendancePrograms;
    return attendancePrograms.filter((p) => attendanceProgramSearchText(p).includes(q));
  }, [attendancePrograms, attendanceProgramFilter]);

  // Mock data for payroll information
  const [payrollData, setPayrollData] = useState({
    1: {
      basicSalary: 5000,
      allowances: {
        housing: 800,
        transport: 300,
        meal: 200,
        other: 150
      },
      deductions: {
        tax: 450,
        insurance: 200,
        pension: 300,
        other: 100
      },
      bonuses: {
        performance: 500,
        attendance: 200,
        other: 0
      },
      monthlyRecords: [
        {
          id: 1,
          month: "January 2024",
          basicSalary: 5000,
          totalAllowances: 1450,
          totalDeductions: 1050,
          totalBonuses: 700,
          netSalary: 6100,
          status: "paid",
          transactionId: "TXN-2024-001",
          paymentDate: "2024-01-31T10:30:00Z",
          payslipGenerated: true
        },
        {
          id: 2,
          month: "December 2023",
          basicSalary: 5000,
          totalAllowances: 1450,
          totalDeductions: 1050,
          totalBonuses: 600,
          netSalary: 6000,
          status: "paid",
          transactionId: "TXN-2023-012",
          paymentDate: "2023-12-31T10:30:00Z",
          payslipGenerated: true
        }
      ]
    },
    2: {
      basicSalary: 4500,
      allowances: {
        housing: 700,
        transport: 250,
        meal: 180,
        other: 120
      },
      deductions: {
        tax: 400,
        insurance: 180,
        pension: 270,
        other: 90
      },
      bonuses: {
        performance: 400,
        attendance: 150,
        other: 0
      },
      monthlyRecords: [
        {
          id: 3,
          month: "January 2024",
          basicSalary: 4500,
          totalAllowances: 1250,
          totalDeductions: 940,
          totalBonuses: 550,
          netSalary: 5360,
          status: "paid",
          transactionId: "TXN-2024-002",
          paymentDate: "2024-01-31T10:30:00Z",
          payslipGenerated: true
        }
      ]
    },
    3: {
      basicSalary: 6000,
      allowances: {
        housing: 1000,
        transport: 400,
        meal: 250,
        other: 200
      },
      deductions: {
        tax: 550,
        insurance: 250,
        pension: 360,
        other: 120
      },
      bonuses: {
        performance: 800,
        attendance: 300,
        other: 0
      },
      monthlyRecords: [
        {
          id: 4,
          month: "January 2024",
          basicSalary: 6000,
          totalAllowances: 1850,
          totalDeductions: 1280,
          totalBonuses: 1100,
          netSalary: 7670,
          status: "pending",
          transactionId: null,
          paymentDate: null,
          payslipGenerated: false
        }
      ]
    },
    4: {
      basicSalary: 3800,
      allowances: {
        housing: 600,
        transport: 200,
        meal: 150,
        other: 100
      },
      deductions: {
        tax: 320,
        insurance: 150,
        pension: 228,
        other: 80
      },
      bonuses: {
        performance: 300,
        attendance: 100,
        other: 0
      },
      monthlyRecords: [
        {
          id: 5,
          month: "January 2024",
          basicSalary: 3800,
          totalAllowances: 1050,
          totalDeductions: 778,
          totalBonuses: 400,
          netSalary: 4472,
          status: "paid",
          transactionId: "TXN-2024-004",
          paymentDate: "2024-01-31T10:30:00Z",
          payslipGenerated: true
        }
      ]
    }
  });

  /** employeeId (UUID) -> change log rows from GET /employees/:id/change-history */
  const [employeeChangeLogs, setEmployeeChangeLogs] = useState({});

  const handleEmployeeClick = (employee) => {
    // Open the employee view modal when employee is clicked
    handleViewEmployee(employee);
  };

  const handleViewEmployee = async (employee) => {
    setSelectedEmployeeForView(employee);
    setShowViewModal(true);
    try {
      const res = await getEmployeeById(employee.id);
      if (res.success && res.data) {
        const d = res.data;
        setSelectedEmployeeForView((prev) => ({
          ...(prev || employee),
          ...d,
          name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || prev?.name,
        }));
      }
    } catch (e) {
      console.warn('Could not load full employee for view:', e);
    }
  };

  const handleEditEmployee = async (employee) => {
    setSelectedEmployeeForEdit(employee);
    setEmployeeEditChangeReason('');
    setShowEditModal(true);
    try {
      const res = await getEmployeeById(employee.id);
      if (res.success && res.data) {
        const d = res.data;
        setSelectedEmployeeForEdit((prev) => {
          const base = prev || employee;
          const managerStr =
            d.manager && typeof d.manager === 'object'
              ? `${d.manager.firstName || ''} ${d.manager.lastName || ''}`.trim()
              : typeof d.manager === 'string'
                ? d.manager
                : base.manager && typeof base.manager === 'object'
                  ? `${base.manager.firstName || ''} ${base.manager.lastName || ''}`.trim()
                  : base.manager || '';
          const merged = { ...base, ...d };
          return {
            ...merged,
            name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || base.name,
            manager: managerStr,
            phone:
              getEmployeePrimaryPhoneDisplay(merged) ||
              (d.phone != null && String(d.phone).trim() !== '' ? String(d.phone).trim() : '') ||
              (base.phone != null && String(base.phone).trim() !== '' ? String(base.phone).trim() : ''),
          };
        });
      }
    } catch (e) {
      console.warn('Could not load full employee for edit:', e);
    }
  };

  const handleSetPassword = (employee) => {
    setSelectedEmployeeForPassword(employee);
    setShowSetPasswordModal(true);
  };

  const handlePasswordSetSuccess = (message) => {
    // Show success notification (you can use a toast library or alert)
    alert(message || 'Password set successfully');
  };

  const handleDeleteEmployee = async (employee) => {
    const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.name || 'this employee';
    
    if (
      window.confirm(
        `Permanently remove ${employeeName} from the system?\n\n` +
          `Their user record and related assignments will be deleted. ` +
          `Their work email and employee ID can then be used for a new employee. ` +
          `This cannot be undone (no restore).`
      )
    ) {
      try {
        const response = await deleteEmployee(employee.id, { permanent: true });
        
        if (response.success) {
          alert(`Employee ${employeeName} has been removed. You can create a new employee with the same work email if needed.`);
          
          // Refresh employees and statistics (keep same company filter)
          const employeesResponse = await getEmployees(companyParams);
          if (employeesResponse.success && employeesResponse.data) {
            const transformedEmployees = employeesResponse.data.map(mapEmployeeListItem);
            setEmployees(transformedEmployees);
          }
          
          // Refresh statistics
          const statsResponse = await getEmployeeStatistics(companyParams);
          if (statsResponse.success && statsResponse.data) {
            setStatistics(statsResponse.data);
          }
        } else {
          alert(response.message || 'Failed to remove employee');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert(`Failed to delete employee: ${error.message}`);
      }
    }
  };

  const handleRestoreEmployee = async (employee) => {
    const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.name || 'this employee';
    
    if (window.confirm(`Are you sure you want to restore ${employeeName}? This will reactivate their account.`)) {
      try {
        console.log('🔄 Restoring employee:', employee.id, employeeName);
        const response = await restoreEmployee(employee.id);
        console.log('📥 Restore response:', response);
        
        if (response.success) {
          alert(`Employee ${employeeName} has been restored successfully.`);
          
          // Refresh employees and statistics (keep same company filter)
          const employeesResponse = await getEmployees(companyParams);
          if (employeesResponse.success && employeesResponse.data) {
            const transformedEmployees = employeesResponse.data.map(mapEmployeeListItem);
            setEmployees(transformedEmployees);
            console.log('✅ Employees list refreshed after restore');
          }
          
          // Refresh statistics
          const statsResponse = await getEmployeeStatistics(companyParams);
          if (statsResponse.success && statsResponse.data) {
            setStatistics(statsResponse.data);
            console.log('✅ Statistics refreshed after restore');
          }
        } else {
          // Handle API error response
          const errorMessage = response.message || 'Failed to restore employee';
          console.error('❌ Restore failed:', errorMessage);
          alert(`Failed to restore employee: ${errorMessage}`);
        }
      } catch (error) {
        console.error('❌ Error restoring employee:', error);
        alert(`Failed to restore employee: ${error.message || 'Unknown error occurred'}`);
      }
    }
  };

  const handleUpdateEmployee = async () => {
    if (selectedEmployeeForEdit) {
      try {
        const reason = (employeeEditChangeReason || '').trim();
        if (!reason) {
          alert(
            'Fill in "Reason for this update" in the yellow box above the Update button. It is required for every save (audit trail), even when you only change Employee ID or other fields.'
          );
          return;
        }
        const payload = {
          ...selectedEmployeeForEdit,
          ...(selectedEmployeeForEdit.email && !selectedEmployeeForEdit.workEmail
            ? { workEmail: selectedEmployeeForEdit.email }
            : {}),
          changeReason: reason,
        };
        const response = await updateEmployee(selectedEmployeeForEdit.id, payload);
        
        if (response.success) {
          // Refresh employees and statistics (keep same company filter)
          const employeesResponse = await getEmployees(companyParams);
          if (employeesResponse.success && employeesResponse.data) {
            const transformedEmployees = employeesResponse.data.map(mapEmployeeListItem);
            setEmployees(transformedEmployees);
          }

          // Refresh statistics
          const statsResponse = await getEmployeeStatistics(companyParams);
          if (statsResponse.success && statsResponse.data) {
            setStatistics(statsResponse.data);
          }

          setEmployeeChangeLogs((prev) => {
            const next = { ...prev };
            delete next[selectedEmployeeForEdit.id];
            return next;
          });
          setShowEditModal(false);
          setSelectedEmployeeForEdit(null);
          setEmployeeEditChangeReason('');
          alert('Employee updated successfully!');
        } else {
          alert(`Failed to update employee: ${response.message}`);
        }
      } catch (error) {
        console.error('Error updating employee:', error);
        alert(`Error updating employee: ${error.message}`);
      }
    }
  };

  const handleEditFieldChange = (field, value) => {
    setSelectedEmployeeForEdit(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBackToPositions = () => {
    // Navigate back to the positions page
    navigate(-1);
  };

  const handleAssignExistingEmployeeToPlacement = async (emp) => {
    if (!emp?.id || !placementFilterActive || !placementPositionId) {
      if (!placementPositionId) {
        alert('Open this list by clicking a position on the org chart so the system knows which position to link.');
      }
      return;
    }
    const deptLabel = placementSubDepartmentName || placementDepartmentName || '';
    const posLabel = placementPositionName || '';
    const confirmMsg =
      `Add ${emp.name || 'this employee'} to "${posLabel}"` +
      (deptLabel ? ` under "${deptLabel}"` : '') +
      '?\n\nTheir primary department and job title in the directory stay the same. They will also appear in this position (additional assignment).';
    if (!window.confirm(confirmMsg)) return;

    setAssigningEmployeeId(emp.id);
    try {
      const response = await assignEmployeeToOrgPosition(emp.id, placementPositionId, {
        reason: `Load from Employee Directory → ${posLabel}`,
      });
      if (response.success) {
        const employeesResponse = await getEmployees(companyParams);
        if (employeesResponse.success && employeesResponse.data) {
          setEmployees(employeesResponse.data.map(mapEmployeeListItem));
        }
        const statsResponse = await getEmployeeStatistics(companyParams);
        if (statsResponse.success && statsResponse.data) {
          setStatistics(statsResponse.data);
        }
        setShowAssignFromDirectoryModal(false);
        setAssignDirectorySearch('');
        alert(response.message || `${emp.name || 'Employee'} also appears on this position now.`);
      } else {
        alert(response.message || 'Failed to assign employee.');
      }
    } catch (error) {
      console.error('Assign to placement error:', error);
      alert(error.message || 'Failed to assign employee.');
    } finally {
      setAssigningEmployeeId(null);
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      // Create employee via API
      const response = await createEmployee(employeeData);
      
      if (response.success) {
        // Refresh employees and statistics (keep same company filter)
        const employeesResponse = await getEmployees(companyParams);
        if (employeesResponse.success && employeesResponse.data) {
          const transformedEmployees = employeesResponse.data.map(mapEmployeeListItem);
          setEmployees(transformedEmployees);
        }

        // Refresh statistics
        const statsResponse = await getEmployeeStatistics(companyParams);
        if (statsResponse.success && statsResponse.data) {
          setStatistics(statsResponse.data);
        }

        setShowForm(false);
        if (response.data?.credentials?.temporaryPassword) {
          alert(`Employee created successfully!\n\nERP Login credentials (save these - they will not be shown again):\nEmail: ${response.data.credentials.email}\nTemporary password: ${response.data.credentials.temporaryPassword}\n\n${response.data.credentials.message || 'User should change password on first login.'}`);
        } else {
          alert('Employee created successfully!');
        }
      } else {
        alert(`Failed to create employee: ${response.message}`);
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      alert(`Error creating employee: ${error.message}`);
    }
  };

  const handleAddJobTitle = (newJobTitle) => {
    // Check for duplicates (case-insensitive)
    const titleLower = newJobTitle.title?.toLowerCase().trim();
    const isDuplicate = jobTitles.some(job => 
      (job.title || job.name || '').toLowerCase().trim() === titleLower
    );
    
    if (isDuplicate) {
      alert(`Job title "${newJobTitle.title}" already exists. Please use a different title.`);
      return;
    }
    
    if (!titleLower) {
      alert('Please enter a job title.');
      return;
    }
    
    const jobTitle = {
      id: `local-${Date.now()}`,
      title: newJobTitle.title.trim(),
      department: newJobTitle.department?.trim() || 'All',
      description: newJobTitle.description?.trim() || '',
      fromApi: false,
    };

    setJobTitles((prev) => [...prev, jobTitle]);
    alert(`Job title "${jobTitle.title}" has been added to this list. To create an org position linked to sub-departments, use Company → Department → Sub-department.`);
  };

  const startEditJobTitle = (job) => {
    setEditingJobId(job.id);
    setEditJobDraft({
      title: job.title || job.name || '',
      department: job.department || '',
      description: job.description || '',
    });
  };

  const cancelJobTitleEdit = () => {
    setEditingJobId(null);
    setEditJobDraft({ title: '', department: '', description: '' });
  };

  const saveEditedJobTitle = async () => {
    const job = jobTitles.find((j) => j.id === editingJobId);
    if (!job) return;
    const title = (editJobDraft.title || '').trim();
    if (!title) {
      alert('Job title name is required.');
      return;
    }
    if (job.fromApi) {
      try {
        const res = await updatePosition(job.id, {
          name: title,
          description: (editJobDraft.description || '').trim() || null,
        });
        if (res.success) {
          cancelJobTitleEdit();
          await loadJobTitles();
          const employeesResponse = await getEmployees(companyParams);
          if (employeesResponse.success && employeesResponse.data) {
            setEmployees(employeesResponse.data.map(mapEmployeeListItem));
          }
          const n = typeof res.employeesJobTitleSynced === 'number' ? res.employeesJobTitleSynced : 0;
          alert(
            n > 0
              ? `Saved. ${n} employee record(s) were updated to use the new title.`
              : 'Job title saved.'
          );
        } else {
          alert(res.message || 'Failed to update job title.');
        }
      } catch (err) {
        console.error(err);
        alert(err.message || 'Failed to update job title.');
      }
    } else {
      const dept = (editJobDraft.department || '').trim() || 'All';
      setJobTitles((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, title, department: dept, description: (editJobDraft.description || '').trim() } : j
        )
      );
      cancelJobTitleEdit();
      alert('Job title updated in this list.');
    }
  };

  const handleAddAttendanceProgram = async (newProgram) => {
    const params =
      effectiveCompany?.id
        ? { companyId: effectiveCompany.id }
        : effectiveCompany?.name
          ? { companyName: effectiveCompany.name }
          : {};
    if (!params.companyId && !params.companyName) {
      alert('Select a company (open the directory from a company) before saving attendance programs.');
      return false;
    }
    const nameTrim = (newProgram.name || '').trim();
    const weeklySchedule = mergeWeeklySchedule(newProgram.weeklySchedule);
    const v = validateWeeklySchedule(weeklySchedule);
    if (!v.ok) {
      alert(v.message);
      return false;
    }
    const res = await createAttendanceProgram({
      ...params,
      name: nameTrim,
      description: (newProgram.description || '').trim(),
      weeklySchedule,
    });
    if (!res.success) {
      alert(res.message || 'Could not save program.');
      return false;
    }
    await loadAttendancePrograms();
    alert(res.message || `Program "${nameTrim}" saved.`);
    return true;
  };

  const startEditAttendanceProgram = (program) => {
    setEditingAttendanceId(program.id);
    setNewAttendanceProgramDraft({
      name: program.name || '',
      description: program.description || '',
      weeklySchedule: mergeWeeklySchedule(program.weeklySchedule),
    });
  };

  const cancelAttendanceProgramEdit = () => {
    setEditingAttendanceId(null);
    setNewAttendanceProgramDraft({
      name: '',
      description: '',
      weeklySchedule: createDefaultWeeklySchedule(),
    });
  };

  /** Create (POST) or update (PUT) using the left-hand form only — no duplicate rows. */
  const submitAttendanceProgramForm = async () => {
    const nameTrim = (newAttendanceProgramDraft.name || '').trim();
    const descriptionTrim = (newAttendanceProgramDraft.description || '').trim();
    if (!nameTrim) {
      alert('Program name is required.');
      return;
    }
    const v = validateWeeklySchedule(newAttendanceProgramDraft.weeklySchedule);
    if (!v.ok) {
      alert(v.message);
      return;
    }

    const params =
      effectiveCompany?.id
        ? { companyId: effectiveCompany.id }
        : effectiveCompany?.name
          ? { companyName: effectiveCompany.name }
          : {};
    if (!params.companyId && !params.companyName) {
      alert('Select a company before saving attendance programs.');
      return;
    }

    const weeklySchedule = mergeWeeklySchedule(newAttendanceProgramDraft.weeklySchedule);

    if (editingAttendanceId) {
      const program = attendancePrograms.find((p) => p.id === editingAttendanceId);
      if (!program) {
        cancelAttendanceProgramEdit();
        return;
      }
      const oldName = program.name;
      const res = await updateAttendanceProgram(program.id, {
        ...params,
        name: nameTrim,
        description: descriptionTrim,
        weeklySchedule,
      });
      if (!res.success) {
        alert(res.message || 'Could not save changes.');
        return;
      }
      const canSync = user?.role === 'ADMIN' || user?.role === 'HR';
      if (canSync) {
        try {
          const employeesResponse = await getEmployees(companyParams);
          if (employeesResponse.success && employeesResponse.data) {
            setEmployees(employeesResponse.data.map(mapEmployeeListItem));
          }
        } catch (e) {
          console.warn(e);
        }
      }
      setSelectedEmployeeForEdit((prev) =>
        prev && prev.attendanceProgram === oldName && oldName !== nameTrim
          ? { ...prev, attendanceProgram: nameTrim }
          : prev
      );
      await loadAttendancePrograms();
      cancelAttendanceProgramEdit();
      alert(res.message || 'Program updated.');
      return;
    }

    const ok = await handleAddAttendanceProgram({
      name: nameTrim,
      description: descriptionTrim,
      weeklySchedule: newAttendanceProgramDraft.weeklySchedule,
    });
    if (ok) {
      setNewAttendanceProgramDraft({
        name: '',
        description: '',
        weeklySchedule: createDefaultWeeklySchedule(),
      });
    }
  };

  const canManageAttendancePrograms = user?.role === 'ADMIN' || user?.role === 'HR';

  const handleDeleteAttendanceProgram = async (program) => {
    if (!program?.id) return;
    const params =
      effectiveCompany?.id
        ? { companyId: effectiveCompany.id }
        : effectiveCompany?.name
          ? { companyName: effectiveCompany.name }
          : {};
    if (!params.companyId && !params.companyName) {
      alert('Select a company before deleting programs.');
      return;
    }
    if (
      !window.confirm(
        `Delete attendance program "${program.name}"? This cannot be undone. If any employee still uses this program, deletion will be blocked until you reassign them.`
      )
    ) {
      return;
    }
    const res = await deleteAttendanceProgram(program.id, params);
    if (!res.success) {
      alert(res.message || 'Could not delete program.');
      return;
    }
    if (editingAttendanceId === program.id) {
      cancelAttendanceProgramEdit();
    }
    await loadAttendancePrograms();
    alert(res.message || 'Program deleted.');
  };

  const handleRuleButton = (employee) => {
    navigate(`/employees/rule-builder?empId=${employee.id}`);
  };

  // Document handling functions
  const handleUploadDocument = (employeeId, documentData) => {
    const newDocument = {
      id: Date.now(),
      name: documentData.name,
      type: documentData.type,
      uploadDate: new Date().toLocaleDateString(),
      expiryDate: documentData.expiryDate,
      fileSize: documentData.fileSize,
      status: 'active'
    };

    setEmployeeDocuments(prev => ({
      ...prev,
      [employeeId]: [...(prev[employeeId] || []), newDocument]
    }));

    setShowDocumentUpload(false);
    setSelectedDocumentType('');
    
    // Show success message
    alert(`Document "${documentData.name}" uploaded successfully!`);
  };

  const handleDeleteDocument = (employeeId, documentId) => {
    const document = employeeDocuments[employeeId]?.find((doc) => doc.id === documentId);
    if (document && window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      setEmployeeDocuments((prev) => ({
        ...prev,
        [employeeId]: prev[employeeId]?.filter((doc) => doc.id !== documentId) || [],
      }));
      alert(`Document "${document.name}" removed from this list.`);
    }
  };

  const handleViewDocument = (doc) => {
    const href = resolveEmployeeAttachmentUrl(doc.url) || doc.url;
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    alert(`No file link for: ${doc.name}. Save the employee again with this document attached, or upload via Edit.`);
  };

  const handleDownloadDocument = async (doc) => {
    const href = resolveEmployeeAttachmentUrl(doc.url) || doc.url;
    if (!href) {
      alert(`No file link for: ${doc.name}. Save the employee again with this document attached, or upload via Edit.`);
      return;
    }
    const safeName = (doc.name || 'document').replace(/[/\\?%*:|"<>]/g, '-');
    try {
      const res = await fetch(href, { method: 'GET', mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const obj = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = obj;
      a.download = safeName;
      a.rel = 'noopener noreferrer';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(obj);
    } catch (err) {
      console.warn('Direct download failed, opening in new tab:', err);
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const [employeeImporting, setEmployeeImporting] = useState(false);
  const [employeeImportResult, setEmployeeImportResult] = useState(null);

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadEmployeeTemplate = async () => {
    try {
      const blob = await downloadEmployeeTemplate();
      downloadBlob(blob, 'employee-import-template.xlsx');
    } catch (e) {
      alert(e.message || 'Failed to download template');
    }
  };

  const handleExportEmployees = async () => {
    try {
      const blob = await exportEmployeesExcel();
      downloadBlob(blob, 'employees-export.xlsx');
    } catch (e) {
      alert(e.message || 'Failed to export employees');
    }
  };

  const handleImportEmployees = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setEmployeeImporting(true);
      const res = await importEmployeesExcel(file);
      setEmployeeImportResult(res?.data || null);
      setShowImportExportModal(false);
      // Refresh employee list + stats (same flow as initial load)
      try {
        setLoading(true);
        const employeesResponse = await getEmployees(companyParams);
        if (employeesResponse.success && employeesResponse.data) {
          const transformedEmployees = employeesResponse.data.map(mapEmployeeListItem);
          setEmployees(transformedEmployees);
        }
        const statsResponse = await getEmployeeStatistics(companyParams);
        if (statsResponse.success && statsResponse.data) {
          setStatistics(statsResponse.data);
        }
      } finally {
        setLoading(false);
      }
    } catch (e) {
      alert(e.message || 'Import failed');
    } finally {
      setEmployeeImporting(false);
      event.target.value = '';
    }
  };

  const downloadEmployeeImportErrors = () => {
    if (!employeeImportResult?.errorReportBase64) return;
    const byteCharacters = atob(employeeImportResult.errorReportBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const blob = new Blob([new Uint8Array(byteNumbers)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, 'employee-import-errors.xlsx');
  };

  const handleHistoryButton = async (employee) => {
    setSelectedEmployeeForHistory(employee);
    setShowHistoryDrawer(true);
    setHistoryDrawerError(null);
    setHistoryDrawerLoading(true);
    const res = await getEmployeeChangeHistory(employee.id);
    setHistoryDrawerLoading(false);
    if (res.success) {
      setEmployeeChangeLogs((prev) => ({
        ...prev,
        [employee.id]: res.data || [],
      }));
    } else {
      setHistoryDrawerError(res.message || 'Failed to load change history');
      setEmployeeChangeLogs((prev) => ({
        ...prev,
        [employee.id]: [],
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePayrollButton = (employee) => {
    setSelectedEmployeeForPayroll(employee);
    setShowPayrollDrawer(true);
  };

  const calculateNetSalary = (basicSalary, allowances, deductions, bonuses) => {
    const totalAllowances = Object.values(allowances).reduce((sum, value) => sum + value, 0);
    const totalDeductions = Object.values(deductions).reduce((sum, value) => sum + value, 0);
    const totalBonuses = Object.values(bonuses).reduce((sum, value) => sum + value, 0);
    return basicSalary + totalAllowances - totalDeductions + totalBonuses;
  };

  const handleUpdatePayroll = (employeeId, field, value) => {
    setPayrollData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value
      }
    }));
  };

  const handleUpdateAllowance = (employeeId, allowanceType, value) => {
    setPayrollData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        allowances: {
          ...prev[employeeId].allowances,
          [allowanceType]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleUpdateDeduction = (employeeId, deductionType, value) => {
    setPayrollData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        deductions: {
          ...prev[employeeId].deductions,
          [deductionType]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleUpdateBonus = (employeeId, bonusType, value) => {
    setPayrollData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        bonuses: {
          ...prev[employeeId].bonuses,
          [bonusType]: parseFloat(value) || 0
        }
      }
    }));
  };

  const generatePayslip = (employee, payrollRecord) => {
    // Mock payslip generation
    const payslipContent = `
      PAYSLIP - ${payrollRecord.month}
      
      Employee: ${employee.name}
      Employee ID: ${employee.id}
      Department: ${employee.department}
      Job Title: ${employee.jobTitle}
      
      EARNINGS:
      Basic Salary: $${payrollRecord.basicSalary}
      Allowances: $${payrollRecord.totalAllowances}
      Bonuses: $${payrollRecord.totalBonuses}
      Total Earnings: $${payrollRecord.basicSalary + payrollRecord.totalAllowances + payrollRecord.totalBonuses}
      
      DEDUCTIONS:
      Total Deductions: $${payrollRecord.totalDeductions}
      
      NET SALARY: $${payrollRecord.netSalary}
      
      Payment Status: ${payrollRecord.status.toUpperCase()}
      Transaction ID: ${payrollRecord.transactionId || 'Pending'}
      Payment Date: ${payrollRecord.paymentDate ? formatDate(payrollRecord.paymentDate) : 'Pending'}
    `;

    const blob = new Blob([payslipContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${employee.name}_${payrollRecord.month.replace(' ', '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Mock user role for access control
  const currentUserRole = "admin"; // Can be "admin", "hr", "employee"
  const canEditPayroll = currentUserRole === "admin" || currentUserRole === "hr";
  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden overflow-y-auto">
      {!showForm && <Breadcrumbs 
        names={{ 
          company: company?.name || null,
          department: department?.name || null,
          subdepartment: subDepartment?.name || null,
          position: position?.name || null
        }} 
        company={company}
      />}
      
      {/* Enhanced Top Section - Employee Directory */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 px-4 sm:px-6 lg:px-10 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToPositions}
            className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm"
            title="Back to Positions"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-500" /> 
            Employee Directory
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => setShowJobTitlesModal(true)}
          >
            <BriefcaseIcon className="h-5 w-5" />
            Job Titles
          </button>
          {canAssignFromDirectory && (
            <button
              type="button"
              className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => {
                setAssignDirectorySearch('');
                setShowAssignFromDirectoryModal(true);
              }}
              title="Pick an existing employee and move their directory placement to this org position"
            >
              <UsersIcon className="h-5 w-5" />
              Load from Employee Directory
            </button>
          )}
          <button
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => setShowImportExportModal(true)}
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Import/Export
          </button>
          <button
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => setShowAttendanceProgramModal(true)}
          >
            <CalendarIcon className="h-5 w-5" />
            Attendance Program
          </button>
          <button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => setShowForm(true)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Employee
          </button>
        </div>
      </div>
      
      {/* Enhanced Section Header - Employees Management - Only show when not in form */}
      {!showForm && (
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className={`rounded-3xl shadow-2xl p-8 relative overflow-hidden mb-8 transition-all duration-300 ${
            showJobTitlesModal || showAttendanceProgramModal 
              ? 'bg-transparent' 
              : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600'
          }`}>
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white opacity-10 rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <UsersIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-indigo-100 text-lg">View and manage all employees in your organization</p>
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white bg-opacity-30 rounded-xl">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {loading
                          ? '...'
                          : searchTerm || placementFilterActive
                            ? filteredEmployees.length
                            : statistics.totalEmployees}
                      </div>
                      <div className="text-indigo-100 text-sm">
                        {searchTerm
                          ? 'Filtered Employees'
                          : placementFilterActive
                            ? 'In selected position'
                            : 'Total Employees'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white bg-opacity-30 rounded-xl">
                      <BriefcaseIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {loading ? '...' : statistics.totalDepartments}
                      </div>
                      <div className="text-indigo-100 text-sm">Departments</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white bg-opacity-30 rounded-xl">
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {loading
                          ? '...'
                          : searchTerm || placementFilterActive
                            ? filteredEmployees.filter((emp) => (emp.status || '').toLowerCase() === 'active').length
                            : statistics.activeEmployees}
                      </div>
                      <div className="text-indigo-100 text-sm">
                        {searchTerm
                          ? 'Filtered Active'
                          : placementFilterActive
                            ? 'Active (this position)'
                            : 'Active Employees'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Placement filter (from org structure → position) */}
      {!showForm && placementFilterActive && (
        <div className="w-full px-4 sm:px-6 lg:px-10 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/90 px-4 py-3 text-sm text-indigo-950 shadow-sm">
            <span>
              Showing staff in <strong>{placementDepartmentName}</strong>
              {subDepartment?.name ? (
                <>
                  {' '}
                  › <strong>{subDepartment.name}</strong>
                </>
              ) : null}
              {placementPositionName ? (
                <>
                  {' '}
                  › <strong>{placementPositionName}</strong>
                </>
              ) : null}{' '}
              only.
            </span>
            <button
              type="button"
              onClick={clearPlacementFilter}
              className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              Show all employees
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {!showForm && (
        <div className="w-full px-4 sm:px-6 lg:px-10 mb-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search employees by name, department, job title, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {canManageInactiveVisibility && (
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={showInactiveEmployees}
                      onChange={(e) => setShowInactiveEmployees(e.target.checked)}
                    />
                    Show inactive employees
                  </label>
                )}
                <div className="text-sm text-gray-500">
                  {filteredEmployees.length} of {employees.length} employees
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                )}
              </div>
            </div>
            {searchTerm && (
              <div className="mt-3 text-sm text-indigo-600">
                Searching for: <span className="font-semibold">"{searchTerm}"</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-indigo-50 to-white min-h-[60vh] px-4 sm:px-6 lg:px-10">
        {!showForm ? (
          <div className="w-full mt-4 sm:mt-8">
            {/* Enhanced Mobile Cards View */}
            <div className="lg:hidden space-y-6">
              {filteredEmployees.map(emp => {
                const isInactive = !emp.isActive;
                return (
                <div 
                  key={emp.id} 
                  className={`group bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-indigo-300 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden ${isInactive ? 'opacity-40' : ''}`}
                  onClick={() => handleEmployeeClick(emp)}
                  title="Click to view employee details"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative p-6">
                    {/* Header with enhanced styling */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                        <UserIcon className="h-6 w-6 text-white" />
                  </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-900 transition-colors">{emp.name}</h3>
                        </div>
                        <p className="text-gray-500 text-sm">Employee</p>
                    </div>
                    </div>
                    
                    {/* Enhanced info sections */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <BriefcaseIcon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Department</span>
                          <div className="text-gray-900 font-semibold">{emp.department}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <ClipboardDocumentListIcon className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Job Title</span>
                          <div className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm">
                        {emp.jobTitle}
                    </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-indigo-50 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-indigo-100 rounded-lg flex items-center justify-center">
                          <EnvelopeIcon className="h-4 w-4 text-pink-600" />
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Email</span>
                          <div className="text-gray-900 font-semibold text-sm">{emp.email}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEmployee(emp);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Employee"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEmployee(emp);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit Employee"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {!emp.isActive ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreEmployee(emp);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Restore Employee"
                          >
                            <ArrowPathIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmployee(emp);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Employee"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )})}
              
              {/* No Results Message for Mobile */}
              {searchTerm && filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
                    <p className="text-gray-500 mb-4">No employees match your search for "{searchTerm}"</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Enhanced Desktop Table View */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                      <tr>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Employee</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Department</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Job Title</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Contact</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                  {filteredEmployees.map(emp => {
                    const isInactive = !emp.isActive;
                    return (
                    <tr 
                      key={emp.id} 
                          className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer group ${isInactive ? 'opacity-40' : ''}`}
                      onClick={() => handleEmployeeClick(emp)}
                      title="Click to view employee details"
                    >
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                                <UserIcon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-gray-900 text-base group-hover:text-indigo-900 transition-colors">{emp.name}</div>
                                </div>
                                <div className="text-gray-500 text-sm">Employee</div>
                              </div>
                            </div>
                      </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm">
                                <BriefcaseIcon className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <span className="text-gray-900 text-sm font-semibold">{emp.department}</span>
                                <div className="text-gray-500 text-xs">Department</div>
                              </div>
                            </div>
                      </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-sm">
                                <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm">
                                  {emp.jobTitle}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm">
                                <EnvelopeIcon className="h-5 w-5 text-pink-600" />
                              </div>
                              <div>
                                <span className="text-gray-900 text-sm font-semibold">{emp.email}</span>
                                <div className="text-gray-500 text-xs">Email</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewEmployee(emp);
                                }}
                                className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                title="View Employee"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEmployee(emp);
                                }}
                                className="p-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                title="Edit Employee"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRuleButton(emp);
                                }}
                                className="p-3 text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                title="Rule Settings"
                              >
                                <Cog6ToothIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleHistoryButton(emp);
                                }}
                                className="p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                title="View History"
                              >
                                <ClockIcon className="h-5 w-5" />
                              </button>
                              {!emp.isActive ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestoreEmployee(emp);
                                  }}
                                  className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                  title="Restore Employee"
                                >
                                  <ArrowPathIcon className="h-5 w-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEmployee(emp);
                                  }}
                                  className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                  title="Delete Employee"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePayrollButton(emp);
                                }}
                                className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                title="Payroll Management"
                              >
                                <CurrencyDollarIcon className="h-5 w-5" />
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetPassword(emp);
                                  }}
                                  className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                  title="Set Password"
                                >
                                  <KeyIcon className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
              
              {/* No Results Message for Desktop */}
              {searchTerm && filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-white border-t border-gray-100 p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
                    <p className="text-gray-500 mb-4">No employees match your search for "{searchTerm}"</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmployeeForm 
            onBack={() => setShowForm(false)} 
            onSaveEmployee={handleSaveEmployee}
            jobTitles={jobTitles}
            attendancePrograms={attendancePrograms}
            employeesList={employees}
          />
        )}
      </div>

      {/* Job Titles Modal */}
      {showJobTitlesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <div className="flex items-center gap-3">
                <BriefcaseIcon className="h-8 w-8" />
                <div>
                  <h3 className="text-xl font-bold">Job Titles Management</h3>
                  <p className="text-blue-100">Create and manage job titles</p>
                </div>
              </div>
              <button
                onClick={() => setShowJobTitlesModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Add New Job Title Form */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Add New Job Title</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Job Title"
                    className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="newJobTitle"
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="newJobDepartment"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="newJobDescription"
                  />
                </div>
                <button
                  onClick={() => {
                    const title = document.getElementById('newJobTitle').value;
                    const department = document.getElementById('newJobDepartment').value;
                    const description = document.getElementById('newJobDescription').value;
                    if (title && department) {
                      handleAddJobTitle({ title, department, description });
                      document.getElementById('newJobTitle').value = '';
                      document.getElementById('newJobDepartment').value = '';
                      document.getElementById('newJobDescription').value = '';
                    }
                  }}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Job Title
                </button>
              </div>

              {/* Job Titles List */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-lg font-semibold text-gray-900">Current Job Titles</h4>
                  {jobTitlesLoading && (
                    <span className="text-sm text-gray-500">Loading…</span>
                  )}
                </div>
                <p className="px-6 py-2 text-xs text-gray-500 border-b border-gray-100">
                  Rows from the org chart sync with the database. Renaming updates employees whose job title matched the old name. Local-only rows apply to this browser list until you create a position under a sub-department.
                </p>
                <div className="max-h-96 overflow-y-auto">
                  {jobTitles.map((job) => (
                    <div key={job.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {editingJobId === job.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Job title</label>
                              <input
                                type="text"
                                value={editJobDraft.title}
                                onChange={(e) => setEditJobDraft((d) => ({ ...d, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Department / placement</label>
                              {job.fromApi ? (
                                <input
                                  type="text"
                                  value={editJobDraft.department}
                                  disabled
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-600"
                                  title="Change placement from Company → Department → Sub-department"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={editJobDraft.department}
                                  onChange={(e) => setEditJobDraft((d) => ({ ...d, department: e.target.value }))}
                                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                                />
                              )}
                            </div>
                            <div className="md:col-span-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                              <input
                                type="text"
                                value={editJobDraft.description}
                                onChange={(e) => setEditJobDraft((d) => ({ ...d, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 justify-end">
                            <button
                              type="button"
                              onClick={cancelJobTitleEdit}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={saveEditedJobTitle}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                            >
                              Save changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h5 className="font-semibold text-gray-900">{job.title}</h5>
                            <p className="text-sm text-gray-600">Department: {job.department}</p>
                            {job.description ? (
                              <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                            ) : null}
                            <p className="text-xs text-gray-400 mt-1">
                              {job.fromApi
                                ? isAssignableOrgPosition(job)
                                  ? 'Synced position · Active for new assignments'
                                  : 'Synced position · Inactive (not offered on new employee forms)'
                                : 'Local list only'}
                            </p>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2">
                            <span
                              className="hidden sm:inline px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono max-w-[140px] truncate"
                              title={String(job.id)}
                            >
                              {job.fromApi ? String(job.id).slice(0, 8) + '…' : job.id}
                            </span>
                            <button
                              type="button"
                              onClick={() => startEditJobTitle(job)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-50"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                              Edit
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign existing employee to current org position (no new directory record) */}
      {showAssignFromDirectoryModal && canAssignFromDirectory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col ring-1 ring-indigo-100"
            role="dialog"
            aria-labelledby="assign-directory-modal-title"
            aria-modal="true"
          >
            <div className="flex-shrink-0 flex items-start justify-between gap-3 px-5 py-4 bg-gradient-to-r from-sky-600 to-indigo-600 text-white">
              <div className="min-w-0">
                <h3 id="assign-directory-modal-title" className="text-lg font-bold">
                  Load from Employee Directory
                </h3>
                <p className="text-sm text-sky-100 mt-1">
                  Select an employee to assign to{' '}
                  <strong className="text-white">{placementPositionName}</strong>
                  {placementSubDepartmentName ? (
                    <>
                      {' '}
                      · <span className="text-white/95">{placementSubDepartmentName}</span>
                    </>
                  ) : null}
                  . Adds an extra org-chart link: their main directory department and job title stay unchanged; they also show here. No duplicate person record.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAssignFromDirectoryModal(false);
                  setAssignDirectorySearch('');
                }}
                className="shrink-0 p-2 rounded-lg hover:bg-white/15 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden />
                <input
                  type="search"
                  autoFocus
                  placeholder="Search by name, employee ID, email, department…"
                  value={assignDirectorySearch}
                  onChange={(e) => setAssignDirectorySearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Showing {employeesForAssignPicker.length} of {employees.length} employees
                {effectiveCompany?.name ? ` in ${effectiveCompany.name}` : ''}.
              </p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-2">
              {employeesForAssignPicker.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">No employees match your search.</div>
              ) : (
                <ul className="space-y-1">
                  {employeesForAssignPicker.map((emp) => {
                    const busy = assigningEmployeeId === emp.id;
                    return (
                      <li key={emp.id}>
                        <button
                          type="button"
                          disabled={Boolean(assigningEmployeeId)}
                          onClick={() => handleAssignExistingEmployeeToPlacement(emp)}
                          className={`w-full text-left rounded-xl px-4 py-3 border transition-colors ${
                            busy
                              ? 'border-indigo-300 bg-indigo-50'
                              : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/60'
                          } ${assigningEmployeeId && !busy ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <div className="font-semibold text-gray-900">{emp.name || '—'}</div>
                          <div className="text-xs text-gray-600 mt-0.5 space-y-0.5">
                            {emp.employeeId != null && String(emp.employeeId).trim() !== '' ? (
                              <div>ID: {String(emp.employeeId)}</div>
                            ) : null}
                            <div className="truncate">{emp.email || '—'}</div>
                            <div>
                              {emp.department || '—'}
                              {emp.jobTitle && emp.jobTitle !== 'N/A' ? ` · ${emp.jobTitle}` : ''}
                            </div>
                          </div>
                          {busy ? <div className="text-xs text-indigo-600 mt-1">Assigning…</div> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Program Modal */}
      {showAttendanceProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-2xl shadow-[0_24px_80px_-12px_rgba(15,23,42,0.35)] w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col ring-1 ring-slate-200/80"
            role="dialog"
            aria-labelledby="attendance-program-modal-title"
            aria-modal="true"
          >
            <div className="relative flex-shrink-0 flex items-start sm:items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 bg-slate-900 text-white">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 20%, #fbbf24 0, transparent 45%), radial-gradient(circle at 80% 0%, #38bdf8 0, transparent 40%)',
                }}
              />
              <div className="relative flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <ClockIcon className="h-6 w-6 text-amber-300" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 id="attendance-program-modal-title" className="text-lg sm:text-xl font-semibold tracking-tight">
                    Attendance programs
                  </h3>
                  <p className="text-sm text-slate-300 mt-0.5">
                    Define schedules for the employee form. Search, add, or edit entries below.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAttendanceProgramModal(false)}
                className="relative shrink-0 p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 bg-slate-50/90">
              {!effectiveCompany?.id && !effectiveCompany?.name ? (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  Select a company (header selector or open this directory from a company) to load and save programs for that organization.
                </div>
              ) : null}
              <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 xl:items-start">
                {/* Create */}
                <aside className="w-full xl:w-[min(100%,420px)] shrink-0 space-y-4">
                  <div
                    className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${
                      editingAttendanceId ? 'ring-2 ring-amber-400/80 ring-offset-2 ring-offset-slate-50' : 'ring-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-slate-900 font-semibold mb-1">
                      {editingAttendanceId ? (
                        <PencilSquareIcon className="h-5 w-5 text-amber-600" aria-hidden />
                      ) : (
                        <PlusIcon className="h-5 w-5 text-amber-600" aria-hidden />
                      )}
                      {editingAttendanceId ? 'Edit program' : 'New program'}
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      {editingAttendanceId
                        ? 'Update name, weekly ON/OFF, clock-in/out, or description. Saving updates this program in the library (does not create a copy).'
                        : 'Program name is required. Set each day to ON or OFF; when ON, pick clock-in and clock-out (24h). Description is optional.'}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Program name</label>
                        <input
                          type="text"
                          value={newAttendanceProgramDraft.name}
                          onChange={(e) =>
                            setNewAttendanceProgramDraft((d) => ({ ...d, name: e.target.value }))
                          }
                          placeholder="e.g. Standard 9–5"
                          disabled={!effectiveCompany?.id && !effectiveCompany?.name}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 disabled:opacity-50"
                        />
                      </div>
                      <AttendanceWeeklyScheduleEditor
                        value={newAttendanceProgramDraft.weeklySchedule}
                        onChange={(next) =>
                          setNewAttendanceProgramDraft((d) => ({ ...d, weeklySchedule: next }))
                        }
                        disabled={!effectiveCompany?.id && !effectiveCompany?.name}
                      />
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                        <input
                          type="text"
                          value={newAttendanceProgramDraft.description}
                          onChange={(e) =>
                            setNewAttendanceProgramDraft((d) => ({ ...d, description: e.target.value }))
                          }
                          placeholder="Short note for HR (optional)"
                          disabled={!effectiveCompany?.id && !effectiveCompany?.name}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 disabled:opacity-50"
                        />
                      </div>
                      <div className="flex flex-col gap-2 mt-1">
                        {editingAttendanceId ? (
                          <button
                            type="button"
                            onClick={cancelAttendanceProgramEdit}
                            disabled={!effectiveCompany?.id && !effectiveCompany?.name}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                          >
                            Cancel edit
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={submitAttendanceProgramForm}
                          disabled={!effectiveCompany?.id && !effectiveCompany?.name}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {editingAttendanceId ? (
                            <>
                              <CheckIcon className="h-4 w-4" />
                              Update program
                            </>
                          ) : (
                            <>
                              <PlusIcon className="h-4 w-4" />
                              Add to list
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-3 text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 font-medium">Rename note:</strong> each employee stores the program <em>name</em>. Renaming a program (as HR/Admin) updates matching employees for this company. Weekly schedules are saved in the database per company.
                  </div>
                </aside>

                {/* Library */}
                <section className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">Program library</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {attendanceProgramsLoading
                          ? 'Loading…'
                          : `${attendancePrograms.length} program${attendancePrograms.length === 1 ? '' : 's'} total`}
                        {!attendanceProgramsLoading && attendanceProgramFilter.trim()
                          ? ` · ${filteredAttendancePrograms.length} match${filteredAttendancePrograms.length === 1 ? '' : 'es'}`
                          : ''}
                      </p>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <MagnifyingGlassIcon
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                        aria-hidden
                      />
                      <input
                        type="search"
                        value={attendanceProgramFilter}
                        onChange={(e) => setAttendanceProgramFilter(e.target.value)}
                        placeholder="Search name, schedule, description…"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500/60"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-h-[280px] max-h-[min(52vh,560px)] overflow-y-auto pr-1 -mr-1">
                    {filteredAttendancePrograms.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-6 text-center">
                        <CalendarIcon className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                        <p className="text-sm font-medium text-slate-700">No programs match your search</p>
                        <p className="text-xs text-slate-500 mt-1">Try another term or clear the search field.</p>
                      </div>
                    ) : (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
                        {filteredAttendancePrograms.map((program) => {
                          const programIndex = attendancePrograms.findIndex((p) => p.id === program.id);
                          return (
                            <li key={program.id}>
                              <article
                                className={`rounded-2xl border bg-white shadow-sm transition-shadow ${
                                  editingAttendanceId === program.id
                                    ? 'ring-2 ring-amber-500/50 border-amber-300 bg-amber-50/30'
                                    : 'border-slate-200/90 hover:shadow-md hover:border-slate-300/80'
                                }`}
                              >
                                <div className="p-4 sm:p-5 flex flex-col gap-3 h-full">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <h5 className="font-semibold text-slate-900 leading-snug">{program.name}</h5>
                                      {editingAttendanceId === program.id ? (
                                        <p className="text-xs font-medium text-amber-800 mt-1.5">
                                          Editing in the left panel — adjust times there, then click Update program.
                                        </p>
                                      ) : null}
                                      <div className="mt-2 flex gap-1.5 items-start max-w-full text-xs font-medium text-amber-950 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                                        <ClockIcon className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
                                        <span className="min-w-0 leading-snug line-clamp-3">
                                          {program.hours ||
                                            formatWeeklyScheduleSummary(program.weeklySchedule)}
                                        </span>
                                      </div>
                                      {program.description ? (
                                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{program.description}</p>
                                      ) : (
                                        <p className="text-sm text-slate-400 mt-2 italic">No description</p>
                                      )}
                                    </div>
                                    <span className="shrink-0 text-[11px] font-mono text-slate-400 tabular-nums pt-0.5">
                                      #{programIndex + 1}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap justify-end gap-2 mt-auto pt-1">
                                    <button
                                      type="button"
                                      onClick={() => startEditAttendanceProgram(program)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300"
                                    >
                                      <PencilSquareIcon className="h-4 w-4 text-slate-500" />
                                      {editingAttendanceId === program.id ? 'Reload into form' : 'Edit'}
                                    </button>
                                    {canManageAttendancePrograms ? (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteAttendanceProgram(program)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 hover:border-red-300"
                                        aria-label={`Delete ${program.name}`}
                                      >
                                        <TrashIcon className="h-4 w-4 text-red-600" />
                                        Delete
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
                              </article>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {showImportExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <div className="flex items-center gap-3">
                <ArrowDownTrayIcon className="h-8 w-8" />
                <div>
                  <h3 className="text-xl font-bold">Import/Export Employees</h3>
                  <p className="text-orange-100">Import or export employee data via Excel (.xlsx)</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportExportModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Template */}
              <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <ArrowDownTrayIcon className="h-6 w-6 text-slate-700" />
                  <h4 className="text-lg font-semibold text-slate-900">Download Employee Template</h4>
                </div>
                <p className="text-slate-600 mb-4 text-sm">
                  The template mirrors the Create Employee form fields and order. Required columns are marked with <strong>*</strong>.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadEmployeeTemplate}
                  className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-semibold flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Download Employee Template (.xlsx)
                </button>
              </div>

              {/* Export Section */}
              <div className="mb-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <ArrowDownTrayIcon className="h-6 w-6 text-orange-600" />
                  <h4 className="text-lg font-semibold text-orange-900">Export Employees</h4>
                </div>
                <p className="text-orange-700 mb-4">
                  Download all current employee data as an Excel file, using the same structure as the import template (compatible for re-upload).
                </p>
                <button
                  onClick={handleExportEmployees}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Export to Excel
                </button>
              </div>

              {/* Import Section */}
              <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <ArrowUpTrayIcon className="h-6 w-6 text-red-600" />
                  <h4 className="text-lg font-semibold text-red-900">Import Employees</h4>
                </div>
                <p className="text-red-700 mb-4">
                  Upload the filled Employee template (.xlsx). Invalid rows will be skipped and an error report will be generated.
                </p>
                <div className="mb-4">
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleImportEmployees}
                    disabled={employeeImporting}
                    className="block w-full text-sm text-red-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 file:cursor-pointer disabled:opacity-50"
                  />
                </div>
                <div className="text-xs text-red-600">
                  <p>
                    <strong>Note:</strong> Keep header row 1 unchanged. Row 2 contains hidden system keys.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import summary modal */}
      {employeeImportResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
              <div className="font-bold">Employee import summary</div>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-white/15"
                onClick={() => setEmployeeImportResult(null)}
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between"><span>Total processed</span><span className="font-semibold">{employeeImportResult.processed}</span></div>
              <div className="flex justify-between"><span>Imported</span><span className="font-semibold text-green-700">{employeeImportResult.imported}</span></div>
              <div className="flex justify-between"><span>Failed</span><span className="font-semibold text-red-700">{employeeImportResult.failed}</span></div>
              {employeeImportResult.errorCount > 0 ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={downloadEmployeeImportErrors}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold"
                  >
                    Download error report (.xlsx)
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Fix the failed rows and re-import using the same template.
                  </p>
                </div>
              ) : (
                <div className="text-green-700 font-semibold">No errors.</div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setEmployeeImportResult(null)}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {showHistoryDrawer && selectedEmployeeForHistory && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300"
            onClick={() => setShowHistoryDrawer(false)}
          ></div>
          
          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-gradient-to-b from-white to-gray-50 shadow-2xl transform transition-all duration-500 ease-out">
            <div className="flex flex-col h-full">
              {/* Enhanced Header */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative flex items-center justify-between p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                      <ClockIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Employee History</h3>
                      <p className="text-indigo-100 text-sm font-medium">{selectedEmployeeForHistory.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistoryDrawer(false)}
                    className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Enhanced Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Employee Profile Card */}
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                        <UserIcon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-1">{selectedEmployeeForHistory.name}</h4>
                        <p className="text-gray-600 mb-2">{selectedEmployeeForHistory.jobTitle} • {selectedEmployeeForHistory.department}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-indigo-600">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            Active Employee
                          </span>
                          <span className="text-gray-500">ID: {selectedEmployeeForHistory.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Change Logs */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h5 className="text-lg font-bold text-gray-900">Change History</h5>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
                  </div>
                  
                  {historyDrawerLoading ? (
                    <div className="text-center py-12 text-gray-600">Loading change history…</div>
                  ) : historyDrawerError ? (
                    <div className="text-center py-12 text-red-600 text-sm px-4">{historyDrawerError}</div>
                  ) : (employeeChangeLogs[selectedEmployeeForHistory.id] || []).length > 0 ? (
                    <div className="space-y-4">
                      {(employeeChangeLogs[selectedEmployeeForHistory.id] || []).map((log) => (
                        <div key={log.id} className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          <div className="relative">
                            <div className="absolute left-0 top-0 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"></div>
                            <div className="absolute left-1.5 top-3 w-0.5 h-full bg-gradient-to-b from-purple-500 to-transparent"></div>
                          </div>

                          <div className="ml-6">
                            <div className="flex items-start justify-between mb-4 gap-2">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex-shrink-0">
                                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-gray-900 text-lg">{log.fieldChanged || log.fieldLabel}</span>
                                  <p className="text-sm text-gray-500">Field updated</p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">{formatDate(log.changedAt)}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 mb-4">
                              <div className="flex flex-wrap items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                <span className="text-sm font-medium text-gray-700">Previous:</span>
                                <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium break-all">{log.oldValue != null && log.oldValue !== '' ? log.oldValue : '—'}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                <span className="text-sm font-medium text-gray-700">Updated to:</span>
                                <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium break-all">{log.newValue != null && log.newValue !== '' ? log.newValue : '—'}</span>
                              </div>
                            </div>

                            {log.reason ? (
                              <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Reason</p>
                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{log.reason}</p>
                              </div>
                            ) : null}

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs text-white font-bold">{(log.changedBy || '?').charAt(0)}</span>
                                </div>
                                <span className="text-sm text-gray-600 truncate">
                                  <span className="font-semibold text-gray-900">{log.changedBy || 'Unknown'}</span>
                                  {log.changedByRole ? (
                                    <span className="text-gray-500"> · {log.changedByRole}</span>
                                  ) : null}
                                </span>
                              </div>
                              <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                                {log.changeType || 'update'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl inline-block mb-4">
                        <ClockIcon className="h-16 w-16 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">No Changes Yet</h4>
                      <p className="text-gray-500">This employee&apos;s record hasn&apos;t been modified yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Footer */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <span className="text-gray-600">Employee ID: <span className="font-semibold text-gray-900">{selectedEmployeeForHistory.id}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Total Changes:</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full font-bold">
                        {(employeeChangeLogs[selectedEmployeeForHistory.id] || []).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Drawer */}
      {showPayrollDrawer && selectedEmployeeForPayroll && payrollData[selectedEmployeeForPayroll.id] && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300"
            onClick={() => setShowPayrollDrawer(false)}
          ></div>
          
          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-gradient-to-b from-white to-gray-50 shadow-2xl transform transition-all duration-500 ease-out">
            <div className="flex flex-col h-full">
              {/* Enhanced Header */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"></div>
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative flex items-center justify-between p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                      <CurrencyDollarIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Payroll Management</h3>
                      <p className="text-green-100 text-sm font-medium">{selectedEmployeeForPayroll.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPayrollDrawer(false)}
                    className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  </div>
                </div>

            {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Employee Info Card */}
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                        <UserIcon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-1">{selectedEmployeeForPayroll.name}</h4>
                        <p className="text-gray-600 mb-2">{selectedEmployeeForPayroll.jobTitle} • {selectedEmployeeForPayroll.department}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Active Employee
                          </span>
                          <span className="text-gray-500">ID: {selectedEmployeeForPayroll.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payroll Configuration */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Basic Salary */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <BanknotesIcon className="h-5 w-5 text-white" />
                      </div>
                      <h5 className="text-lg font-bold text-gray-900">Basic Salary</h5>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Basic Salary</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={payrollData[selectedEmployeeForPayroll.id].basicSalary}
                            onChange={(e) => handleUpdatePayroll(selectedEmployeeForPayroll.id, 'basicSalary', parseFloat(e.target.value) || 0)}
                            disabled={!canEditPayroll}
                            className={`w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${!canEditPayroll ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Salary Calculator */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <CalculatorIcon className="h-5 w-5 text-white" />
                      </div>
                      <h5 className="text-lg font-bold text-gray-900">Net Salary Calculator</h5>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Basic Salary:</span>
                        <span className="font-semibold">${payrollData[selectedEmployeeForPayroll.id].basicSalary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Allowances:</span>
                        <span className="font-semibold text-green-600">+${Object.values(payrollData[selectedEmployeeForPayroll.id].allowances).reduce((sum, value) => sum + value, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Deductions:</span>
                        <span className="font-semibold text-red-600">-${Object.values(payrollData[selectedEmployeeForPayroll.id].deductions).reduce((sum, value) => sum + value, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Bonuses:</span>
                        <span className="font-semibold text-blue-600">+${Object.values(payrollData[selectedEmployeeForPayroll.id].bonuses).reduce((sum, value) => sum + value, 0)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-bold text-gray-900">Net Salary:</span>
                          <span className="text-xl font-bold text-green-600">
                            ${calculateNetSalary(
                              payrollData[selectedEmployeeForPayroll.id].basicSalary,
                              payrollData[selectedEmployeeForPayroll.id].allowances,
                              payrollData[selectedEmployeeForPayroll.id].deductions,
                              payrollData[selectedEmployeeForPayroll.id].bonuses
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allowances, Deductions, and Bonuses */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Allowances */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <h5 className="text-lg font-bold text-gray-900">Allowances</h5>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(payrollData[selectedEmployeeForPayroll.id].allowances).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => handleUpdateAllowance(selectedEmployeeForPayroll.id, key, e.target.value)}
                              disabled={!canEditPayroll}
                              className={`w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${!canEditPayroll ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                      </div>
                      <h5 className="text-lg font-bold text-gray-900">Deductions</h5>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(payrollData[selectedEmployeeForPayroll.id].deductions).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => handleUpdateDeduction(selectedEmployeeForPayroll.id, key, e.target.value)}
                              disabled={!canEditPayroll}
                              className={`w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${!canEditPayroll ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bonuses */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <h5 className="text-lg font-bold text-gray-900">Bonuses</h5>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(payrollData[selectedEmployeeForPayroll.id].bonuses).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => handleUpdateBonus(selectedEmployeeForPayroll.id, key, e.target.value)}
                              disabled={!canEditPayroll}
                              className={`w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!canEditPayroll ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Monthly Payroll Records */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-white" />
                    </div>
                    <h5 className="text-lg font-bold text-gray-900">Monthly Payroll Records</h5>
                  </div>
                  
                  <div className="space-y-4">
                    {payrollData[selectedEmployeeForPayroll.id].monthlyRecords.map((record) => (
                      <div key={record.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h6 className="font-semibold text-gray-900">{record.month}</h6>
                            <p className="text-sm text-gray-600">Net Salary: ${record.netSalary}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              record.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.status.toUpperCase()}
                            </span>
                            {record.payslipGenerated && (
                              <button
                                onClick={() => generatePayslip(selectedEmployeeForPayroll, record)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Download Payslip"
                              >
                                <DocumentTextIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Basic:</span>
                            <span className="ml-2 font-medium">${record.basicSalary}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Allowances:</span>
                            <span className="ml-2 font-medium text-green-600">+${record.totalAllowances}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Deductions:</span>
                            <span className="ml-2 font-medium text-red-600">-${record.totalDeductions}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Bonuses:</span>
                            <span className="ml-2 font-medium text-blue-600">+${record.totalBonuses}</span>
                          </div>
                        </div>
                        
                        {record.transactionId && (
                          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                            <div className="flex items-center justify-between">
                              <span>Transaction ID: <span className="font-medium">{record.transactionId}</span></span>
                              <span>Paid: {formatDate(record.paymentDate)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                      <span className="text-gray-600">Access Level: <span className="font-semibold text-gray-900 capitalize">{currentUserRole}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Can Edit:</span>
                      <span className={`px-3 py-1 rounded-full font-bold ${canEditPayroll ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {canEditPayroll ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && selectedEmployeeForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="relative flex items-center justify-between p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                    <UserIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Employee Details</h3>
                    <p className="text-indigo-100 text-sm font-medium">{selectedEmployeeForView.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              {/* Employee Profile Header */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                      <UserIcon className="h-12 w-12 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedEmployeeForView.name}</h4>
                      <p className="text-gray-600 mb-3 text-lg">{selectedEmployeeForView.jobTitle} • {selectedEmployeeForView.department}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-2 text-indigo-600 font-semibold">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                          Active Employee
                        </span>
                        <span className="text-gray-500 font-medium">ID: {selectedEmployeeForView.id}</span>
                        <span className="text-gray-500 font-medium">Status: {selectedEmployeeForView.status || 'Active'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          handleEditEmployee(selectedEmployeeForView);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                      >
                        EDIT
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Sections */}
              <div className="space-y-6">
                {/* Contacts Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenLegalSection(openLegalSection === 'contacts' ? '' : 'contacts')}
                    className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <h5 className="text-lg font-bold text-gray-900">Contacts</h5>
                    </div>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openLegalSection === 'contacts' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openLegalSection === 'contacts' && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <p className="text-gray-900 font-medium">
                            {getEmployeePrimaryPhoneDisplay(selectedEmployeeForView) ||
                              selectedEmployeeForView.phone ||
                              'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                          <p className="text-gray-900 font-medium">Not provided</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Alternative Phone</label>
                          <p className="text-gray-900 font-medium">Not provided</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Company Details Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenLegalSection(openLegalSection === 'company' ? '' : 'company')}
                    className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h5 className="text-lg font-bold text-gray-900">Company Details</h5>
                    </div>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openLegalSection === 'company' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openLegalSection === 'company' && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.id}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.jobTitle}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.department}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Employee Type</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.employeeType || 'Full-time'}</p>
                        </div>
                        {selectedEmployeeForView.jobTitle !== "Manager" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
                            <p className="text-gray-900 font-medium">{selectedEmployeeForView.manager || 'Not assigned'}</p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.joiningDate || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company Location</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.companyLocation || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            selectedEmployeeForView.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedEmployeeForView.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Passport Details Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenLegalSection(openLegalSection === 'passport' ? '' : 'passport')}
                    className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h5 className="text-lg font-bold text-gray-900">Passport Details</h5>
                    </div>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openLegalSection === 'passport' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openLegalSection === 'passport' && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                          <p className="text-gray-900 font-medium">
                            {displayDirectoryText(selectedEmployeeForView, 'passportNumber') || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                          <p className="text-gray-900 font-medium">
                            {getEmployeeDirectoryDateDisplay(selectedEmployeeForView, 'passportIssueDate') ||
                              displayDirectoryText(selectedEmployeeForView, 'passportIssue') ||
                              'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                          <p className="text-gray-900 font-medium">
                            {getEmployeeDirectoryDateDisplay(selectedEmployeeForView, 'passportExpiryDate') ||
                              displayDirectoryText(selectedEmployeeForView, 'passportExpiry') ||
                              'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                          <p className="text-gray-900 font-medium">
                            {displayDirectoryText(selectedEmployeeForView, 'nationality') || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Documents Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenLegalSection(openLegalSection === 'documents' ? '' : 'documents')}
                    className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h5 className="text-lg font-bold text-gray-900">Documents</h5>
                      {mergedViewDocuments.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircleIcon className="h-4 w-4 shrink-0" aria-hidden />
                          {mergedViewDocuments.length} on file
                        </span>
                      )}
                    </div>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openLegalSection === 'documents' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openLegalSection === 'documents' && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="space-y-6">
                        {/* Document Upload Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h6 className="text-lg font-semibold text-gray-900">Upload New Document</h6>
                              <p className="text-sm text-blue-600 font-medium">Employee ID: {selectedEmployeeForView?.id}</p>
                            </div>
                            <button
                              onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                              {showDocumentUpload ? 'Cancel' : 'Add Document'}
                            </button>
                          </div>
                          
                          {showDocumentUpload && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                                  <select
                                    value={selectedDocumentType}
                                    onChange={(e) => setSelectedDocumentType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="">Select document type</option>
                                    <option value="passport">Passport</option>
                                    <option value="visa">Visa</option>
                                    <option value="labour_card">Labour Card</option>
                                    <option value="contract">Employment Contract</option>
                                    <option value="id_card">ID Card</option>
                                    <option value="certificate">Certificate</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (if applicable)</label>
                                  <input
                                    id="expiry-date"
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                                <div 
                                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                                  onClick={() => document.getElementById('file-upload').click()}
                                >
                                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                                  <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                                  <input 
                                    id="file-upload"
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        const documentData = {
                                          name: file.name,
                                          type: selectedDocumentType,
                                          expiryDate: document.getElementById('expiry-date').value,
                                          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                        };
                                        handleUploadDocument(selectedEmployeeForView.id, documentData);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                  Upload Document
                                </button>
                                <button 
                                  onClick={() => setShowDocumentUpload(false)}
                                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Documents List */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              Uploaded Documents
                              {mergedViewDocuments.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <CheckCircleIcon className="h-4 w-4" aria-hidden />
                                  {mergedViewDocuments.length} on file
                                </span>
                              )}
                            </h6>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">ID: {selectedEmployeeForView?.id}</span>
                          </div>
                          <div className="space-y-3">
                            {mergedViewDocuments.length > 0 ? (
                              mergedViewDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-900 flex items-center gap-2">
                                        <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" title="Uploaded" aria-hidden />
                                        <span className="truncate">{doc.name}</span>
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {doc.type}
                                        {' • '}
                                        {doc.uploadDate}
                                        {doc.fileSize ? ` • ${doc.fileSize}` : ''}
                                      </p>
                                      {doc.expiryDate && (
                                        <p className={`text-xs ${new Date(doc.expiryDate) < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                                          Expires: {doc.expiryDate}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleViewDocument(doc)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title={doc.url ? 'Open document' : 'No link available'}
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadDocument(doc)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title={doc.url ? 'Download' : 'No link available'}
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                    </button>
                                    {doc.source !== 'directory' && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteDocument(selectedEmployeeForView.id, doc.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove from list"
                                      >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <p className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</p>
                                  <p className="mt-1 text-sm text-gray-500">Upload employee documents to get started</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Personal Details Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenLegalSection(openLegalSection === 'personal' ? '' : 'personal')}
                    className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h5 className="text-lg font-bold text-gray-900">Personal Details</h5>
                    </div>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openLegalSection === 'personal' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openLegalSection === 'personal' && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.gender || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                          <p className="text-gray-900 font-medium">
                            {getEmployeeDirectoryDateDisplay(selectedEmployeeForView, 'birthday') ||
                              displayDirectoryText(selectedEmployeeForView, 'birthDate', 'dateOfBirth') ||
                              'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.maritalStatus || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.nationality || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Children Count</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.childrenCount || 'Not specified'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                          <p className="text-gray-900 font-medium">{selectedEmployeeForView.currentAddress || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Residency Details Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenLegalSection(openLegalSection === 'residency' ? '' : 'residency')}
                    className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <h5 className="text-lg font-bold text-gray-900">Residency Details</h5>
                    </div>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openLegalSection === 'residency' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openLegalSection === 'residency' && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Residency Number</label>
                          <p className="text-gray-900 font-medium">
                            {displayDirectoryText(selectedEmployeeForView, 'residencyNumber') || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Residency Expiry</label>
                          <p className="text-gray-900 font-medium">
                            {getEmployeeDirectoryDateDisplay(selectedEmployeeForView, 'residencyExpiryDate') ||
                              displayDirectoryText(selectedEmployeeForView, 'residencyExpiry') ||
                              'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Visa ID number</label>
                          <p className="text-gray-900 font-medium">
                            {displayDirectoryText(
                              selectedEmployeeForView,
                              'visaNumber',
                              'visa',
                              'visaId',
                              'visa_id'
                            ) ||
                              displayDirectoryText(selectedEmployeeForView, 'residencyNumber') ||
                              'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Labour Card Number</label>
                          <p className="text-gray-900 font-medium">
                            {displayDirectoryText(
                              selectedEmployeeForView,
                              'labourIdNumber',
                              'labourCardNumber',
                              'laborCardNumber',
                              'labourNumber'
                            ) || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Labour Card Expiry</label>
                          <p className="text-gray-900 font-medium">
                            {getEmployeeDirectoryDateDisplay(selectedEmployeeForView, 'labourIdExpiryDate') ||
                              displayDirectoryText(selectedEmployeeForView, 'labourExpiry', 'labourCardExpiry') ||
                              'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Number</label>
                          <p className="text-gray-900 font-medium">
                            {displayDirectoryText(selectedEmployeeForView, 'insuranceNumber') || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Expiry</label>
                          <p className="text-gray-900 font-medium">
                            {getEmployeeDirectoryDateDisplay(selectedEmployeeForView, 'insuranceExpiryDate') ||
                              displayDirectoryText(selectedEmployeeForView, 'insuranceExpiry') ||
                              'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Quick Actions
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handlePayrollButton(selectedEmployeeForView);
                    }}
                    className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    View Payroll
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleHistoryButton(selectedEmployeeForView);
                    }}
                    className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View History
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleRuleButton(selectedEmployeeForView);
                    }}
                    className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Rule Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployeeForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col">
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"></div>
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="relative flex items-center justify-between p-6 text-white">
                <div className="flex items-center gap-4">
                  {/* Back Button */}
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setShowViewModal(true);
                    }}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110 mr-2"
                    title="Back to View"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Edit Employee</h3>
                    <p className="text-purple-100 text-sm font-medium">{selectedEmployeeForEdit.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-purple-600" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.firstName || selectedEmployeeForEdit.name?.split(' ')[0] || ''}
                          onChange={(e) => handleEditFieldChange('firstName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.lastName || selectedEmployeeForEdit.name?.split(' ')[1] || ''}
                          onChange={(e) => handleEditFieldChange('lastName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter last name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={selectedEmployeeForEdit.email}
                          onChange={(e) => handleEditFieldChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter email address"
                        />
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div className="text-xs text-gray-600">
                            This email is used for ERP login.
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSetPassword(selectedEmployeeForEdit)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-purple-200 text-purple-700 bg-white hover:bg-purple-50 transition-colors"
                            title="Reset ERP password"
                          >
                            <KeyIcon className="h-4 w-4" />
                            Reset Password
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={
                            selectedEmployeeForEdit.phone ||
                            getEmployeePrimaryPhoneDisplay(selectedEmployeeForEdit) ||
                            ''
                          }
                          onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                          value={normalizeGenderSelectValue(selectedEmployeeForEdit.gender)}
                          onChange={(e) => handleEditFieldChange('gender', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                        <select
                          value={normalizeMaritalSelectValue(selectedEmployeeForEdit.maritalStatus)}
                          onChange={(e) => handleEditFieldChange('maritalStatus', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.nationality || ''}
                          onChange={(e) => handleEditFieldChange('nationality', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter nationality"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
                        <input
                          type="date"
                          value={toDateInputString(selectedEmployeeForEdit.birthday)}
                          onChange={(e) => handleEditFieldChange('birthday', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                      <textarea
                        value={selectedEmployeeForEdit.currentAddress || ''}
                        onChange={(e) => handleEditFieldChange('currentAddress', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="Enter current address"
                      />
                    </div>
                  </div>

                  {/* Work Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                      Work Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.employeeId || selectedEmployeeForEdit.id || ''}
                          onChange={(e) => handleEditFieldChange('employeeId', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter employee ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                        <select
                          key={`edit-job-title-select-${jobTitles?.length || 0}`}
                          value={selectedEmployeeForEdit.jobTitle || ""}
                          onChange={(e) => {
                            const newJobTitle = e.target.value;
                            setSelectedEmployeeForEdit((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    jobTitle: newJobTitle,
                                    ...(newJobTitle === 'Manager'
                                      ? { manager: '', managerId: null }
                                      : {}),
                                  }
                                : prev
                            );
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select job title</option>
                          {jobTitles && jobTitles.length > 0 ? (
                            buildJobTitlePickerOptions(jobTitles, selectedEmployeeForEdit.jobTitle).map((job, index) => {
                              const jobTitleValue = job.title || job.name || '';
                              const jobTitleDisplay = job.title || job.name || '';
                              const inactive = job._inactiveOrgPath;
                              return (
                                <option
                                  key={job.id || `edit-job-${index}`}
                                  value={jobTitleValue}
                                  disabled={!!inactive}
                                >
                                  {inactive ? `${jobTitleDisplay} (inactive org — reactivate in Company)` : jobTitleDisplay}
                                </option>
                              );
                            })
                          ) : (
                            <>
                              <option value="Manager">Manager</option>
                              <option value="Developer">Developer</option>
                              <option value="Accountant">Accountant</option>
                              <option value="Sales Rep">Sales Rep</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <input
                          type="text"
                          value={
                            typeof selectedEmployeeForEdit.department === 'string'
                              ? selectedEmployeeForEdit.department
                              : selectedEmployeeForEdit.department?.name ||
                                selectedEmployeeForEdit.department?.title ||
                                ''
                          }
                          onChange={(e) => handleEditFieldChange('department', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Department name (must match company directory)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Type</label>
                        <select
                          value={normalizeEmployeeTypeSelectValue(selectedEmployeeForEdit.employeeType)}
                          onChange={(e) => handleEditFieldChange('employeeType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select type</option>
                          {EMPLOYEE_TYPE_EDIT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={normalizeStatusSelectValue(selectedEmployeeForEdit.status, selectedEmployeeForEdit.isActive)}
                          onChange={(e) => handleEditFieldChange('status', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Terminated">Terminated</option>
                        </select>
                      </div>
                      {selectedEmployeeForEdit.jobTitle !== "Manager" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Line Manager (Optional)</label>
                          <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={selectedEmployeeForEdit.managerId || ''}
                            onChange={(e) => {
                              const id = e.target.value;
                              if (!id) {
                                setSelectedEmployeeForEdit((prev) =>
                                  prev ? { ...prev, managerId: null, manager: '' } : prev
                                );
                                return;
                              }
                              const emp = employees.find((x) => x.id === id);
                              const label = emp
                                ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || ''
                                : '';
                              setSelectedEmployeeForEdit((prev) =>
                                prev ? { ...prev, managerId: id, manager: label } : prev
                              );
                            }}
                          >
                            <option value="">Select line manager (Optional)</option>
                            {selectedEmployeeForEdit.managerId &&
                              !employees.some(
                                (e) =>
                                  e.id === selectedEmployeeForEdit.managerId &&
                                  isEmployeeActiveForLineManagerPicker(e)
                              ) && (
                                <option value={selectedEmployeeForEdit.managerId} disabled>
                                  {(selectedEmployeeForEdit.manager || 'Current line manager') +
                                    ' (inactive — pick another or clear)'}
                                </option>
                              )}
                            {employees
                              .filter(
                                (emp) =>
                                  emp.id !== selectedEmployeeForEdit.id &&
                                  isEmployeeActiveForLineManagerPicker(emp)
                              )
                              .map((emp) => {
                                const label =
                                  `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
                                  emp.name ||
                                  emp.email ||
                                  emp.id;
                                return (
                                  <option key={emp.id} value={emp.id}>
                                    {label}
                                  </option>
                                );
                              })}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                        <input
                          type="date"
                          value={toDateInputString(selectedEmployeeForEdit.joiningDate)}
                          onChange={(e) => handleEditFieldChange('joiningDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Location</label>
                        <select
                          value={selectedEmployeeForEdit.companyLocation || ''}
                          onChange={(e) => handleEditFieldChange('companyLocation', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select location</option>
                          <option value="Dubai HQ">Dubai HQ</option>
                          <option value="Abu Dhabi Office">Abu Dhabi Office</option>
                          <option value="Syria Office">Syria Office</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Program</label>
                        <select
                          value={selectedEmployeeForEdit.attendanceProgram || ''}
                          onChange={(e) => handleEditFieldChange('attendanceProgram', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select program</option>
                          {attendancePrograms.map((program) => (
                            <option key={program.id} value={program.name}>
                              {program.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Legal Documents */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5 text-green-600" />
                      Legal Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.passportNumber || ''}
                          onChange={(e) => handleEditFieldChange('passportNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter passport number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Passport Expiry</label>
                        <input
                          type="date"
                          value={toDateInputString(
                            selectedEmployeeForEdit.passportExpiryDate ?? selectedEmployeeForEdit.passportExpiry
                          )}
                          onChange={(e) => handleEditFieldChange('passportExpiryDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">National ID Number</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.nationalIdNumber || ''}
                          onChange={(e) => handleEditFieldChange('nationalIdNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter national ID number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">National ID Expiry</label>
                        <input
                          type="date"
                          value={toDateInputString(
                            selectedEmployeeForEdit.nationalIdExpiryDate ?? selectedEmployeeForEdit.nationalIdExpiry
                          )}
                          onChange={(e) => handleEditFieldChange('nationalIdExpiryDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Residency Number</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.residencyNumber || ''}
                          onChange={(e) => handleEditFieldChange('residencyNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter residency number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Residency Expiry</label>
                        <input
                          type="date"
                          value={toDateInputString(
                            selectedEmployeeForEdit.residencyExpiryDate ?? selectedEmployeeForEdit.residencyExpiry
                          )}
                          onChange={(e) => handleEditFieldChange('residencyExpiryDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Number</label>
                        <input
                          type="text"
                          value={selectedEmployeeForEdit.insuranceNumber || ''}
                          onChange={(e) => handleEditFieldChange('insuranceNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter insurance number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Expiry</label>
                        <input
                          type="date"
                          value={toDateInputString(
                            selectedEmployeeForEdit.insuranceExpiryDate ?? selectedEmployeeForEdit.insuranceExpiry
                          )}
                          onChange={(e) => handleEditFieldChange('insuranceExpiryDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Number</label>
                        <input
                          type="text"
                          value={
                            selectedEmployeeForEdit.drivingLicenseNumber ??
                            selectedEmployeeForEdit.drivingNumber ??
                            ''
                          }
                          onChange={(e) => handleEditFieldChange('drivingLicenseNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter driving license number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Expiry</label>
                        <input
                          type="date"
                          value={toDateInputString(
                            selectedEmployeeForEdit.drivingLicenseExpiryDate ?? selectedEmployeeForEdit.drivingExpiry
                          )}
                          onChange={(e) => handleEditFieldChange('drivingLicenseExpiryDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Labour Card Number</label>
                        <input
                          type="text"
                          value={
                            selectedEmployeeForEdit.labourIdNumber ??
                            selectedEmployeeForEdit.labourNumber ??
                            ''
                          }
                          onChange={(e) => handleEditFieldChange('labourIdNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter labour card number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Labour Card Expiry</label>
                        <input
                          type="date"
                          value={toDateInputString(
                            selectedEmployeeForEdit.labourIdExpiryDate ?? selectedEmployeeForEdit.labourExpiry
                          )}
                          onChange={(e) => handleEditFieldChange('labourIdExpiryDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      Documents Management
                    </h4>
                    
                                         {/* Document Upload Section */}
                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 mb-6">
                       <div className="flex items-center justify-between mb-4">
                         <div>
                           <h6 className="text-lg font-semibold text-gray-900">Upload New Document</h6>
                           <p className="text-sm text-blue-600 font-medium">Employee ID: {selectedEmployeeForEdit?.id}</p>
                         </div>
                         <button
                           onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                         >
                           <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                           </svg>
                           {showDocumentUpload ? 'Cancel' : 'Add Document'}
                         </button>
                       </div>
                      
                      {showDocumentUpload && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                              <select
                                value={selectedDocumentType}
                                onChange={(e) => setSelectedDocumentType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select document type</option>
                                <option value="passport">Passport</option>
                                <option value="visa">Visa</option>
                                <option value="labour_card">Labour Card</option>
                                <option value="contract">Employment Contract</option>
                                <option value="id_card">ID Card</option>
                                <option value="certificate">Certificate</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (if applicable)</label>
                              <input
                                id="edit-expiry-date"
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                            <div 
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                              onClick={() => document.getElementById('edit-file-upload').click()}
                            >
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                              <input 
                                id="edit-file-upload"
                                type="file" 
                                className="hidden" 
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const documentData = {
                                      name: file.name,
                                      type: selectedDocumentType,
                                      expiryDate: document.getElementById('edit-expiry-date').value,
                                      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                    };
                                    handleUploadDocument(selectedEmployeeForEdit.id, documentData);
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              Upload Document
                            </button>
                            <button 
                              onClick={() => setShowDocumentUpload(false)}
                              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Documents List */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h6 className="text-lg font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                          Uploaded Documents
                          {mergedEditDocuments.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircleIcon className="h-4 w-4" aria-hidden />
                              {mergedEditDocuments.length} on file
                            </span>
                          )}
                        </h6>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">ID: {selectedEmployeeForEdit?.id}</span>
                      </div>
                      <div className="space-y-3">
                        {mergedEditDocuments.length > 0 ? (
                          mergedEditDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 flex items-center gap-2">
                                    <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" title="Uploaded" aria-hidden />
                                    <span className="truncate">{doc.name}</span>
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {doc.type}
                                    {' • '}
                                    {doc.uploadDate}
                                    {doc.fileSize ? ` • ${doc.fileSize}` : ''}
                                  </p>
                                  {doc.expiryDate && (
                                    <p className={`text-xs ${new Date(doc.expiryDate) < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                                      Expires: {doc.expiryDate}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleViewDocument(doc)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title={doc.url ? 'Open document' : 'No link available'}
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadDocument(doc)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title={doc.url ? 'Download' : 'No link available'}
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </button>
                                {doc.source !== 'directory' && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDocument(selectedEmployeeForEdit.id, doc.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove from list"
                                  >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <div className="text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</p>
                              <p className="mt-1 text-sm text-gray-500">Upload employee documents to get started</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <UsersIcon className="h-5 w-5 text-orange-600" />
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Children Count</label>
                        <input
                          type="number"
                          value={selectedEmployeeForEdit.childrenCount || ''}
                          onChange={(e) => handleEditFieldChange('childrenCount', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Number of children"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Exit Date</label>
                        <input
                          type="date"
                          value={toDateInputString(selectedEmployeeForEdit.exitDate)}
                          onChange={(e) => handleEditFieldChange('exitDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                      <textarea
                        value={selectedEmployeeForEdit.remarks || ''}
                        onChange={(e) => handleEditFieldChange('remarks', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        placeholder="Enter any additional remarks"
                      />
                    </div>
                  </div>

                  
                </div>


              </div>
            </div>

            {/* Footer — reason here so it stays visible above Update (not the same as Employee ID / employee number fields) */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex-shrink-0 space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <label className="block text-sm font-semibold text-amber-900 mb-1">
                  Reason for this update <span className="text-red-600">*</span>
                </label>
                <p className="text-xs text-amber-800 mb-2">
                  Required for every save (Employee History audit). Example: &quot;Corrected employee number per HR request.&quot; This is separate from Employee ID or any field you changed.
                </p>
                <textarea
                  value={employeeEditChangeReason}
                  onChange={(e) => setEmployeeEditChangeReason(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white text-sm"
                  placeholder="Why are you saving these changes?"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Record ID:</span>{' '}
                  <span className="font-mono text-xs">{selectedEmployeeForEdit.id}</span>
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEmployeeEditChangeReason('');
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-semibold border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateEmployee}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ✅ Update Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Password Modal */}
      <SetPasswordModal
        isOpen={showSetPasswordModal}
        onClose={() => {
          setShowSetPasswordModal(false);
          setSelectedEmployeeForPassword(null);
        }}
        employee={selectedEmployeeForPassword}
        onSuccess={handlePasswordSetSuccess}
      />

    </div>
  );
}
