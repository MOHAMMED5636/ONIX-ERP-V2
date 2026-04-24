import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import PhotoUploadEnhanced from "../../components/PhotoUploadEnhanced";
import { updateProfile } from "../../services/authAPI";
import salaryAPI from "../../services/salaryAPI";
import payrollSelfAPI from "../../services/payrollSelfAPI";
import {
  UserCircleIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  PhoneIcon,
  CalendarIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const inputClass =
  "w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900";

/** Normalize DB value to an array of raw entries (strings or objects). */
function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return [value];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return [parsed];
    return [];
  } catch {
    return [];
  }
}

function displayPhoneEntry(item) {
  if (item == null || item === "") return "";
  if (typeof item === "string") {
    const t = item.trim();
    if (!t) return "";
    if (t.startsWith("{")) {
      try {
        const o = JSON.parse(t);
        if (o && typeof o === "object" && o.value != null && o.value !== "") return String(o.value).trim();
      } catch {
        /* ignore */
      }
    }
    return t;
  }
  if (typeof item === "object" && item.value != null && item.value !== "") return String(item.value).trim();
  return "";
}

function displayEmailEntry(item) {
  if (item == null || item === "") return "";
  if (typeof item === "string") {
    const t = item.trim();
    if (!t) return "";
    if (t.startsWith("{")) {
      try {
        const o = JSON.parse(t);
        if (o && typeof o === "object" && o.value != null && o.value !== "") return String(o.value).trim();
      } catch {
        /* ignore */
      }
    }
    return t;
  }
  if (typeof item === "object" && item.value != null && item.value !== "") return String(item.value).trim();
  return "";
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function display(value) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

function isoDateField(v) {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function getPhotoSrc(photoPath) {
  if (!photoPath) return null;
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) return photoPath;
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL ||
    process.env.REACT_APP_API_URL?.replace("/api", "") ||
    "http://localhost:3001";
  if (photoPath.startsWith("/uploads/")) return `${backendUrl}${photoPath}`;
  return `${backendUrl}/uploads/photos/${photoPath}`;
}

function buildFormFromUser(user) {
  if (!user) {
    return {
      firstName: "",
      lastName: "",
      phone: "",
      jobTitle: "",
      position: "",
      department: "",
      company: "",
      companyLocation: "",
      employeeType: "",
      attendanceProgram: "",
      joiningDate: "",
      gender: "",
      maritalStatus: "",
      nationality: "",
      birthday: "",
      childrenCount: "",
      currentAddress: "",
      phoneNumbersText: "",
      emailAddressesText: "",
      passportNumber: "",
      passportIssueDate: "",
      passportExpiryDate: "",
      nationalIdNumber: "",
      nationalIdExpiryDate: "",
      residencyNumber: "",
      residencyExpiryDate: "",
      labourIdNumber: "",
      labourIdExpiryDate: "",
      insuranceNumber: "",
      insuranceExpiryDate: "",
      drivingLicenseNumber: "",
      drivingLicenseExpiryDate: "",
    };
  }
  const phoneLines = parseJsonArray(user.phoneNumbers)
    .map(displayPhoneEntry)
    .filter(Boolean)
    .join("\n");
  const emailLines = parseJsonArray(user.emailAddresses)
    .map(displayEmailEntry)
    .filter(Boolean)
    .join("\n");
  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    jobTitle: user.jobTitle || "",
    position: user.position || "",
    department: user.department || "",
    company: user.company || "",
    companyLocation: user.companyLocation || "",
    employeeType: user.employeeType || "",
    attendanceProgram: user.attendanceProgram || "",
    joiningDate: isoDateField(user.joiningDate),
    gender: user.gender || "",
    maritalStatus: user.maritalStatus || "",
    nationality: user.nationality || "",
    birthday: isoDateField(user.birthday),
    childrenCount: user.childrenCount != null ? String(user.childrenCount) : "",
    currentAddress: user.currentAddress || "",
    phoneNumbersText: phoneLines,
    emailAddressesText: emailLines,
    passportNumber: user.passportNumber || "",
    passportIssueDate: isoDateField(user.passportIssueDate),
    passportExpiryDate: isoDateField(user.passportExpiryDate),
    nationalIdNumber: user.nationalIdNumber || "",
    nationalIdExpiryDate: isoDateField(user.nationalIdExpiryDate),
    residencyNumber: user.residencyNumber || "",
    residencyExpiryDate: isoDateField(user.residencyExpiryDate),
    labourIdNumber: user.labourIdNumber || "",
    labourIdExpiryDate: isoDateField(user.labourIdExpiryDate),
    insuranceNumber: user.insuranceNumber || "",
    insuranceExpiryDate: isoDateField(user.insuranceExpiryDate),
    drivingLicenseNumber: user.drivingLicenseNumber || "",
    drivingLicenseExpiryDate: isoDateField(user.drivingLicenseExpiryDate),
  };
}

function AccordionSection({ id, title, icon: Icon, gradientClass, openSection, setOpenSection, children }) {
  const open = openSection === id;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpenSection(open ? "" : id)}
        className={`w-full p-5 sm:p-6 flex items-center justify-between transition-all duration-200 ${gradientClass}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && <Icon className="h-6 w-6 text-current shrink-0" />}
          <h5 className="text-lg font-bold text-gray-900 text-left">{title}</h5>
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="p-5 sm:p-6 border-t border-gray-200">{children}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="text-gray-900 font-medium break-words">{children}</div>
    </div>
  );
}

export default function EmployeeProfile() {
  const { user, refreshUser, updateUserData } = useAuth();
  const canEditProfile = user?.role === "HR";
  const canEditSalary = user?.role === "HR" || user?.role === "ADMIN";
  const canChangePicture = Boolean(user?.id);
  const [openSection, setOpenSection] = useState("contacts");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => buildFormFromUser(null));

  // Salary details: self-only configuration + finalized payslips
  const [salaryDetails, setSalaryDetails] = useState(null);
  const [payslipLines, setPayslipLines] = useState([]);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadSalaryDetails = async () => {
      if (!user?.id) return;
      setSalaryLoading(true);
      setSalaryError('');
      try {
        const [salaryResp, payrollResp] = await Promise.all([
          salaryAPI.getSelfSalaryDetails(),
          payrollSelfAPI.getSelfPayslips(),
        ]);

        if (!mounted) return;
        setSalaryDetails(salaryResp?.data || null);
        setPayslipLines(payrollResp?.data?.lines || []);
      } catch (e) {
        console.error('loadSalaryDetails error:', e);
        if (!mounted) return;
        setSalaryDetails(null);
        setPayslipLines([]);
        setSalaryError(e?.message || 'Failed to load salary details');
      } finally {
        if (mounted) setSalaryLoading(false);
      }
    };

    loadSalaryDetails();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleDownloadPayslip = async (payrollRunId) => {
    try {
      await payrollSelfAPI.downloadPayslip(payrollRunId, user?.id);
    } catch (e) {
      alert('Error downloading payslip: ' + (e?.message || e));
    }
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  useEffect(() => {
    setFormData(buildFormFromUser(user));
  }, [user]);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email?.split("@")[0] || "Employee";

  const extraPhones = parseJsonArray(user?.phoneNumbers)
    .map(displayPhoneEntry)
    .filter(Boolean);
  const extraEmails = parseJsonArray(user?.emailAddresses)
    .map(displayEmailEntry)
    .filter(Boolean);
  const statusLabel = user?.status || (user?.isActive === false ? "Inactive" : "Active");

  const documentLinks = user
    ? [
        { label: "Passport", url: user.passportAttachmentUrl },
        { label: "National ID / Emirates ID", url: user.nationalIdAttachmentUrl },
        { label: "Residency", url: user.residencyAttachmentUrl },
        { label: "Insurance", url: user.insuranceAttachmentUrl },
        { label: "Driving license", url: user.drivingLicenseAttachmentUrl },
        { label: "Labour card", url: user.labourIdAttachmentUrl },
      ].filter((d) => d.url)
    : [];

  const photoSrc = getPhotoSrc(user?.photo);
  const effectivePhotoSrc = photoPreviewUrl || photoSrc;

  useEffect(() => {
    if (!newPhotoFile || !(newPhotoFile instanceof File)) {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      setPhotoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(newPhotoFile);
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPhotoFile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const appendProfileForm = (fd) => {
    const textPairs = [
      ["firstName", formData.firstName],
      ["lastName", formData.lastName],
      ["phone", formData.phone],
      ["jobTitle", formData.jobTitle],
      ["position", formData.position],
      ["department", formData.department],
      ["company", formData.company],
      ["companyLocation", formData.companyLocation],
      ["employeeType", formData.employeeType],
      ["attendanceProgram", formData.attendanceProgram],
      ["gender", formData.gender],
      ["maritalStatus", formData.maritalStatus],
      ["nationality", formData.nationality],
      ["currentAddress", formData.currentAddress],
      ["passportNumber", formData.passportNumber],
      ["nationalIdNumber", formData.nationalIdNumber],
      ["residencyNumber", formData.residencyNumber],
      ["labourIdNumber", formData.labourIdNumber],
      ["insuranceNumber", formData.insuranceNumber],
      ["drivingLicenseNumber", formData.drivingLicenseNumber],
    ];
    textPairs.forEach(([k, v]) => fd.append(k, v == null ? "" : String(v)));

    const dateKeys = [
      "joiningDate",
      "birthday",
      "passportIssueDate",
      "passportExpiryDate",
      "nationalIdExpiryDate",
      "residencyExpiryDate",
      "labourIdExpiryDate",
      "insuranceExpiryDate",
      "drivingLicenseExpiryDate",
    ];
    dateKeys.forEach((k) => {
      const v = formData[k];
      if (v != null && String(v).trim() !== "") fd.append(k, String(v));
    });

    if (formData.childrenCount !== "" && formData.childrenCount != null) {
      fd.append("childrenCount", String(formData.childrenCount));
    }

    fd.append("phoneNumbers", formData.phoneNumbersText ?? "");
    fd.append("emailAddresses", formData.emailAddressesText ?? "");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!canEditProfile) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const fd = new FormData();
      appendProfileForm(fd);
      const res = await updateProfile(fd);
      if (res?.success) {
        if (res.data && updateUserData) updateUserData(res.data);
        setSuccess(true);
        setIsEditing(false);
        if (refreshUser) await refreshUser();
        setTimeout(() => setSuccess(false), 4000);
      } else {
        throw new Error(res?.message || "Update failed");
      }
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData(buildFormFromUser(user));
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Profile</h1>
          <p className="text-slate-600">View-only profile. Only HR can edit employee details.</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <span className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            HR only
          </span>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-green-800">Profile updated successfully.</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <XCircleIcon className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form id="employee-profile-form" onSubmit={handleSaveProfile}>
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative p-6 sm:p-8 text-white">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="shrink-0">
                  {photoSrc || effectivePhotoSrc ? (
                    <img
                      src={effectivePhotoSrc}
                      alt=""
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white/40 shadow-lg"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/40 shadow-lg">
                      <UserCircleIcon className="w-20 h-20 text-white/90" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1">{displayName}</h2>
                  <p className="text-indigo-100 text-sm sm:text-base mb-2">{user?.email}</p>
                  <p className="text-indigo-100 text-sm mb-3">
                    {display(user?.jobTitle)} • {display(user?.department)}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {statusLabel}
                    </span>
                    {user?.role && (
                      <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">{user.role}</span>
                    )}
                    <span className="text-indigo-100">ID: {display(user?.id)}</span>
                  </div>
                </div>
              </div>

              {canChangePicture && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoError(null);
                      setNewPhotoFile(null);
                      setPhotoModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/25 text-white text-sm font-semibold border border-white/20 transition"
                  >
                    Change picture
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AccordionSection
            id="contacts"
            title="Contacts"
            icon={PhoneIcon}
            gradientClass="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Email address">
                <span className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  {display(user?.email)}
                </span>
                <p className="text-xs text-slate-500 mt-1">Contact HR to change your email.</p>
              </Field>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                {isEditing ? (
                  <input name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.phone)}</div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional phone numbers (one per line)
                </label>
                {isEditing ? (
                  <textarea
                    name="phoneNumbersText"
                    value={formData.phoneNumbersText}
                    onChange={handleInputChange}
                    rows={3}
                    className={inputClass}
                    placeholder="+971…"
                  />
                ) : extraPhones.length ? (
                  <div className="text-gray-900 font-medium">{extraPhones.join(", ")}</div>
                ) : (
                  <div className="text-gray-900 font-medium">—</div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional emails (one per line)
                </label>
                {isEditing ? (
                  <textarea
                    name="emailAddressesText"
                    value={formData.emailAddressesText}
                    onChange={handleInputChange}
                    rows={2}
                    className={inputClass}
                    placeholder="name@company.com"
                  />
                ) : extraEmails.length ? (
                  <div className="text-gray-900 font-medium">{extraEmails.join(", ")}</div>
                ) : (
                  <div className="text-gray-900 font-medium">—</div>
                )}
              </div>
              <Field label="Emergency contact">Add details in additional contacts or contact HR.</Field>
            </div>
          </AccordionSection>

          <AccordionSection
            id="company"
            title="Company details"
            icon={BuildingOfficeIcon}
            gradientClass="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Employee ID">{display(user?.employeeId)}</Field>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job title</label>
                {isEditing ? (
                  <input name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.jobTitle)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                {isEditing ? (
                  <input name="position" value={formData.position} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.position)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                {isEditing ? (
                  <input name="department" value={formData.department} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.department)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                {isEditing ? (
                  <input name="company" value={formData.company} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.company)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee type</label>
                {isEditing ? (
                  <input name="employeeType" value={formData.employeeType} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.employeeType)}</div>
                )}
              </div>
              <Field label="Line manager">{display(user?.managerName)}</Field>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining date</label>
                {isEditing ? (
                  <input name="joiningDate" type="date" value={formData.joiningDate} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{formatDate(user?.joiningDate)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company location</label>
                {isEditing ? (
                  <input name="companyLocation" value={formData.companyLocation} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.companyLocation)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attendance program</label>
                {isEditing ? (
                  <input name="attendanceProgram" value={formData.attendanceProgram} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.attendanceProgram)}</div>
                )}
              </div>
              <Field label="Status">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    statusLabel === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {statusLabel}
                </span>
              </Field>
            </div>
          </AccordionSection>

          <AccordionSection
            id="salary-details"
            title="Salary Details"
            icon={CurrencyDollarIcon}
            gradientClass="bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100"
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            {salaryLoading ? (
              <div className="text-gray-600">Loading salary details...</div>
            ) : salaryError ? (
              <div className="text-red-600 text-sm">{salaryError}</div>
            ) : (
              <>
                {canEditSalary && (
                  <div className="mb-5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!user?.id) return;
                        window.location.href = `/salary/employee-setup?employeeId=${user.id}`;
                      }}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold transition-colors"
                    >
                      Edit Salary Setup
                    </button>
                  </div>
                )}

                {(() => {
                  const latest = salaryDetails?.latest || null;
                  if (!latest) {
                    return <div className="text-gray-600 text-sm">No salary configuration found.</div>;
                  }

                  const allowancesTotal = (latest.allowances || []).reduce((sum, a) => sum + Number(a.amount || 0), 0);
                  const deductionsTotal = (latest.deductions || []).reduce((sum, d) => sum + Number(d.value || 0), 0);
                  const contractTotal = Number(latest.basicSalary || 0) + allowancesTotal;
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Effective From">
                          {latest.effectiveFrom ? new Date(latest.effectiveFrom).toLocaleDateString() : '—'}
                        </Field>
                        <Field label="Contract Salary">
                          {contractTotal.toFixed(2)} AED
                        </Field>
                        <Field label="Per Hour Rate">
                          {latest.perHourRate != null ? Number(latest.perHourRate).toFixed(2) : '—'} AED
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Allowances Total">
                          {allowancesTotal.toFixed(2)} AED
                        </Field>
                        <Field label="Deductions (Configured) Total">
                          {deductionsTotal.toFixed(2)} AED
                        </Field>
                      </div>

                      <div className="bg-white rounded-2xl border border-gray-200 p-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Increment History</h3>
                        {latest.increments?.length ? (
                          <div className="space-y-2">
                            {latest.increments
                              .slice()
                              .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate))
                              .map((inc) => (
                                <div key={inc.id} className="flex justify-between gap-4 text-sm">
                                  <span className="text-gray-700">
                                    {inc.effectiveDate ? new Date(inc.effectiveDate).toLocaleDateString() : '—'}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {inc.amount != null ? Number(inc.amount).toFixed(2) : '0.00'} AED
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-gray-600 text-sm">No increments recorded.</div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Finalized Payslips</h3>
                  {Array.isArray(payslipLines) && payslipLines.length > 0 ? (
                    <div className="space-y-3">
                      {payslipLines.map((line) => {
                        const run = line.payrollRun;
                        const period =
                          run?.periodMonth && run?.periodYear ? `${run.periodMonth}/${run.periodYear}` : 'N/A';
                        const status = run?.status || '—';
                        return (
                          <div key={line.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Period: {period}</p>
                              <p className="text-xs text-gray-500">{status.replace(/_/g, ' ')}</p>
                              <p className="text-sm text-gray-700">
                                Net Salary: <span className="font-semibold">{Number(line.netSalary || 0).toFixed(2)} AED</span>
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => run?.id && handleDownloadPayslip(run.id)}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold transition-colors"
                                disabled={!run?.id}
                              >
                                Download Payslip
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm">No finalized payslips found.</div>
                  )}
                </div>
              </>
            )}
          </AccordionSection>

          <AccordionSection
            id="passport"
            title="Passport details"
            icon={IdentificationIcon}
            gradientClass="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100"
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passport number</label>
                {isEditing ? (
                  <input name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.passportNumber)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue date</label>
                {isEditing ? (
                  <input name="passportIssueDate" type="date" value={formData.passportIssueDate} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{formatDate(user?.passportIssueDate)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry date</label>
                {isEditing ? (
                  <input name="passportExpiryDate" type="date" value={formData.passportExpiryDate} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{formatDate(user?.passportExpiryDate)}</div>
                )}
              </div>
              {user?.passportAttachmentUrl && (
                <div className="md:col-span-2">
                  <a
                    href={user.passportAttachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    View uploaded passport document →
                  </a>
                </div>
              )}
            </div>
          </AccordionSection>

          <AccordionSection
            id="emirates"
            title="Emirates ID / National ID"
            icon={IdentificationIcon}
            gradientClass="bg-gradient-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100"
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID number</label>
                {isEditing ? (
                  <input name="nationalIdNumber" value={formData.nationalIdNumber} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.nationalIdNumber)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry date</label>
                {isEditing ? (
                  <input name="nationalIdExpiryDate" type="date" value={formData.nationalIdExpiryDate} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{formatDate(user?.nationalIdExpiryDate)}</div>
                )}
              </div>
              {user?.nationalIdAttachmentUrl && (
                <div className="md:col-span-2">
                  <a
                    href={user.nationalIdAttachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    View uploaded ID document →
                  </a>
                </div>
              )}
            </div>
          </AccordionSection>

          <AccordionSection
            id="documents"
            title="Documents"
            icon={BriefcaseIcon}
            gradientClass="bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100"
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            {documentLinks.length === 0 ? (
              <p className="text-sm text-gray-500">No documents on file. HR can attach files to your profile.</p>
            ) : (
              <ul className="space-y-2">
                {documentLinks.map((d) => (
                  <li key={d.label}>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium hover:underline">
                      {d.label} →
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </AccordionSection>

          <AccordionSection
            id="personal"
            title="Personal details"
            icon={UserCircleIcon}
            gradientClass="bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100"
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
                {isEditing ? (
                  <input name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClass} required />
                ) : (
                  <div className="text-gray-900 font-medium">{user?.firstName}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
                {isEditing ? (
                  <input name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClass} required />
                ) : (
                  <div className="text-gray-900 font-medium">{user?.lastName}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                {isEditing ? (
                  <input name="gender" value={formData.gender} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.gender)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of birth</label>
                {isEditing ? (
                  <input name="birthday" type="date" value={formData.birthday} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{formatDate(user?.birthday)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital status</label>
                {isEditing ? (
                  <input name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.maritalStatus)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                {isEditing ? (
                  <input name="nationality" value={formData.nationality} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.nationality)}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Children count</label>
                {isEditing ? (
                  <input name="childrenCount" type="number" min="0" value={formData.childrenCount} onChange={handleInputChange} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{user?.childrenCount != null ? user.childrenCount : "—"}</div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current address</label>
                {isEditing ? (
                  <textarea name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} rows={3} className={inputClass} />
                ) : (
                  <div className="text-gray-900 font-medium">{display(user?.currentAddress)}</div>
                )}
              </div>
              {user?.remarks && (
                <div className="md:col-span-2">
                  <Field label="Remarks (HR)">{user.remarks}</Field>
                </div>
              )}
            </div>
          </AccordionSection>

          <AccordionSection
            id="residency"
            title="Residency & labour"
            icon={CalendarIcon}
            gradientClass="bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100"
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ["residencyNumber", "Residency number"],
                ["residencyExpiryDate", "Residency expiry", "date"],
                ["labourIdNumber", "Labour card number"],
                ["labourIdExpiryDate", "Labour card expiry", "date"],
                ["insuranceNumber", "Insurance number"],
                ["insuranceExpiryDate", "Insurance expiry", "date"],
                ["drivingLicenseNumber", "Driving license number"],
                ["drivingLicenseExpiryDate", "Driving license expiry", "date"],
              ].map(([name, label, type]) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                  {isEditing ? (
                    <input
                      name={name}
                      type={type === "date" ? "date" : "text"}
                      value={formData[name]}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  ) : (
                    <div className="text-gray-900 font-medium">
                      {type === "date" ? formatDate(user?.[name]) : display(user?.[name])}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {(user?.residencyAttachmentUrl ||
              user?.labourIdAttachmentUrl ||
              user?.insuranceAttachmentUrl ||
              user?.drivingLicenseAttachmentUrl) && (
              <div className="mt-5 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-800 mb-2">Submitted documents</p>
                <ul className="space-y-2">
                  {user?.residencyAttachmentUrl && (
                    <li>
                      <a
                        href={user.residencyAttachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-medium hover:underline"
                      >
                        Residency document →
                      </a>
                    </li>
                  )}
                  {user?.labourIdAttachmentUrl && (
                    <li>
                      <a
                        href={user.labourIdAttachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-medium hover:underline"
                      >
                        Labour card document →
                      </a>
                    </li>
                  )}
                  {user?.insuranceAttachmentUrl && (
                    <li>
                      <a
                        href={user.insuranceAttachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-medium hover:underline"
                      >
                        Insurance document →
                      </a>
                    </li>
                  )}
                  {user?.drivingLicenseAttachmentUrl && (
                    <li>
                      <a
                        href={user.drivingLicenseAttachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-medium hover:underline"
                      >
                        Driving license document →
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </AccordionSection>
        </div>
      </form>

      {photoModalOpen && canChangePicture && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-indigo-100">
            <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-cyan-50 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Update profile picture</h3>
                <p className="text-sm text-gray-600">Choose an image and save.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhotoModalOpen(false);
                  setPhotoError(null);
                  setNewPhotoFile(null);
                  if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
                  setPhotoPreviewUrl(null);
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-5">
              <PhotoUploadEnhanced currentPhoto={user?.photo} onPhotoChange={setNewPhotoFile} size="lg" shape="circle" />
              {photoError && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{photoError}</div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoModalOpen(false);
                    setPhotoError(null);
                    setNewPhotoFile(null);
                    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
                    setPhotoPreviewUrl(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newPhotoFile) {
                      setPhotoError("Please choose a photo first.");
                      return;
                    }
                    setPhotoSaving(true);
                    setPhotoError(null);
                    try {
                      const formDataPhoto = new FormData();
                      formDataPhoto.append("photo", newPhotoFile);
                      const res = await updateProfile(formDataPhoto);
                      if (res?.success) {
                        if (res?.data && updateUserData) updateUserData(res.data);
                        await refreshUser();
                        if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
                        setPhotoPreviewUrl(null);
                        setNewPhotoFile(null);
                        setPhotoModalOpen(false);
                      } else {
                        setPhotoError(res?.message || "Unable to save photo");
                      }
                    } catch (e) {
                      setPhotoError(e?.message || "Unable to save photo");
                    } finally {
                      setPhotoSaving(false);
                    }
                  }}
                  disabled={photoSaving}
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {photoSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
