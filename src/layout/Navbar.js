import React, { useState } from "react";
import { UserCircleIcon, GlobeAltIcon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon, ChatBubbleLeftRightIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";

export default function Navbar({ onMenuToggle }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [openSection, setOpenSection] = useState({});
  
  const handleLogout = () => {
    navigate("/login");
  };

  // Mock admin profile data
  const admin = {
    name: "Kaddour Alksadour",
    jobTitle: "Building Architect",
    middleName: "Ahmed",
    status: "Active",
    id: "021002",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    contacts: {
      mobile: "+971-5034-859",
      email: "archkadd@hotmail.com"
    },
    company: {
      department: "Architecture Department",
      manager: "John Doe",
      joiningDate: "2/8/2021",
      exitDate: "",
      yearsOfService: "4.45",
      attendance: "ONIX TIMING"
    },
    personal: {
      gender: "M",
      nationality: "Syrian Arab Republic",
      birthDay: "1/21/1991",
      maritalStatus: "Married",
      children: 2,
      currentAddress: "Dubai",
      permanentAddress: "Dubai"
    },
    passport: {
      number: "N015340713",
      issueDate: "4/16/2022",
      expiryDate: "10/15/2024"
    },
    residency: {
      sponsorCompany: "ONIX",
      issueDate: "3/9/2023",
      expiryDate: "3/8/2025",
      visaNumber: "784-1991-183517-2",
      employmentSponsor: "ONIX",
      nationalId: "784-1991-183517-2",
      nationalIdExpiry: "3/8/2025",
      insuranceCompany: "MED NET",
      insuranceCard: "097110119351793801",
      insuranceExpiry: "8/14/2025",
      drivingLicenceNumber: "",
      drivingLicenceIssue: "",
      drivingLicenceExpiry: "",
      labourId: "",
      labourIdExpiry: ""
    },
    documents: [
      { name: "PID 2025.pdf", type: "PDF", date: "01/01/2025" },
      { name: "VISA 2023.pdf", type: "PDF", date: "01/01/2023" },
      { name: "PASSPORT 2027.pdf", type: "PDF", date: "01/01/2027" },
      { name: "GRADUATION CERT.pdf", type: "PDF", date: "01/01/2020" }
    ],
    policyAcknowledgements: [
      { name: "DRESS CODE", acknowledged: false }
    ]
  };
  
  const toggleSection = (section) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };
  
  return (
    <header className="w-full glass-card bg-gradient-to-br from-indigo-50 via-white to-cyan-50 shadow-xl flex items-center justify-between px-3 sm:px-6 py-3 z-40 border-b border-indigo-100 backdrop-blur-md">
      {/* Left section: Menu button and Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 focus:outline-none hover:bg-indigo-50 rounded-lg"
          aria-label="Toggle menu"
        >
          <Bars3Icon className="h-6 w-6 text-indigo-500" />
        </button>
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/onix-bg.png" alt="Logo" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-gray-200" />
        </div>
      </div>

      {/* Center section: Search bar */}
      <div className="flex-1 flex justify-center max-w-md mx-4">
        {/* Mobile search toggle */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="lg:hidden p-2 focus:outline-none hover:bg-indigo-50 rounded-lg"
          aria-label="Toggle search"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
        </button>
        {/* Desktop search */}
        <div className="hidden lg:flex relative w-full max-w-sm">
          <div className="relative w-full">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gradient-to-br from-indigo-400 to-cyan-400 text-white rounded-full h-8 w-8 shadow search-pop">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder={lang === "ar" ? "بحث..." : "Search..."}
              className="w-full pl-12 pr-4 py-2 rounded-2xl glass-card bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border border-indigo-100 focus:ring-2 focus:ring-indigo-300 focus:outline-none text-sm shadow search-pop transition-all duration-200 focus:border-cyan-400 hover:shadow-lg"
              dir={lang}
            />
          </div>
        </div>
        {/* Mobile search dropdown */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-4 lg:hidden z-50">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gradient-to-br from-indigo-400 to-cyan-400 text-white rounded-full h-8 w-8 shadow search-pop">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder={lang === "ar" ? "بحث..." : "Search..."}
                className="w-full pl-12 pr-4 py-3 rounded-2xl glass-card bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border border-indigo-100 focus:ring-2 focus:ring-indigo-300 focus:outline-none text-sm shadow search-pop transition-all duration-200 focus:border-cyan-400 hover:shadow-lg"
                dir={lang}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
      <style>{`
        .search-pop { transition: box-shadow 0.3s, border 0.3s, background 0.3s; }
        .search-pop:focus-within, .search-pop:focus, .search-pop:hover { box-shadow: 0 0 0 2px #38bdf8, 0 2px 8px 0 #a5b4fc33; }
      `}</style>

      {/* Right section: Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* ERP Admin title - hidden on small mobile */}
        <span className="hidden sm:flex items-center font-bold text-indigo-700 text-lg sm:text-xl tracking-tight px-3 py-1 rounded-full bg-white/70 shadow border border-indigo-100 mr-1 glow-pop">
          <UserCircleIcon className="h-6 w-6 text-indigo-400 mr-1" /> ERP {t("Admin")}
        </span>
        {/* Chatroom Button */}
        <button
          onClick={() => navigate("/project-chat")}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold shadow border border-blue-200 hover:bg-blue-100 transition pill-pop relative"
          title="Go to Chatroom"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Chatroom</span>
          {/* Notification badge example */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow-sm border-2 border-white">2</span>
        </button>
        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/70 text-indigo-700 font-bold shadow border border-indigo-200 hover:bg-indigo-100 transition pill-pop"
        >
          <GlobeAltIcon className="h-5 w-5" />
          <span className="hidden sm:inline">{lang === "en" ? "EN | ع" : "ع | EN"}</span>
          <span className="sm:hidden">{lang === "en" ? "EN" : "ع"}</span>
        </button>
        {/* Profile button */}
        <button 
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 text-indigo-700 font-bold shadow border border-indigo-200 hover:bg-indigo-100 transition pill-pop focus:outline-none" 
          onClick={() => setShowAdminModal(true)}
        >
          <img src={admin.avatar} alt="Admin" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 border-indigo-200 shadow mr-1" />
          <span className="hidden sm:inline font-medium">Admin</span>
          <svg className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 font-bold shadow border border-red-200 hover:bg-red-100 transition pill-pop"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
      <style>{`
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); }
        .glow-pop { box-shadow: 0 0 0 2px #a5b4fc, 0 2px 8px 0 #a5b4fc33; animation: glowPop 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes glowPop { from { box-shadow: 0 0 0 0 #a5b4fc00, 0 0 0 0 #a5b4fc00; transform: scale(0.9);} to { box-shadow: 0 0 0 2px #a5b4fc, 0 2px 8px 0 #a5b4fc33; transform: scale(1);} }
        .pill-pop { animation: pillPop 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes pillPop { from { transform: scale(0.9);} to { transform: scale(1);} }
      `}</style>

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-3xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowAdminModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 mb-6">
              <img src={admin.avatar} alt={admin.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-indigo-200 shadow" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
                <div>
                  <div className="mb-2 text-sm sm:text-base"><span className="font-semibold">Name:</span> {admin.name}</div>
                  <div className="mb-2 text-sm sm:text-base"><span className="font-semibold">Job Title:</span> {admin.jobTitle}</div>
                  <div className="mb-2 text-sm sm:text-base"><span className="font-semibold">Middle Name:</span> {admin.middleName}</div>
                </div>
                <div>
                  <div className="mb-2 text-sm sm:text-base"><span className="font-semibold">Status:</span> <span className={admin.status === "Active" ? "text-green-600" : "text-red-600"}>{admin.status}</span></div>
                  <div className="mb-2 text-sm sm:text-base"><span className="font-semibold">ID:</span> {admin.id}</div>
                </div>
              </div>
            </div>
            
            {/* Collapsible Sections */}
            {/* Contacts */}
            <Section title="Contacts" open={openSection.contacts} onClick={() => toggleSection('contacts')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="text-sm sm:text-base"><span className="font-semibold">Mobile 1:</span> {admin.contacts.mobile}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Email:</span> <a href={`mailto:${admin.contacts.email}`} className="text-blue-600 underline">{admin.contacts.email}</a></div>
              </div>
            </Section>
            
            {/* Company Details */}
            <Section title="Company Details" open={openSection.company} onClick={() => toggleSection('company')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="text-sm sm:text-base"><span className="font-semibold">Department:</span> {admin.company.department}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Line Manager:</span> {admin.company.manager}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Joining Date:</span> {admin.company.joiningDate}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Exit Date:</span> {admin.company.exitDate || '-'}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Years of Service:</span> {admin.company.yearsOfService}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Attendance Program:</span> {admin.company.attendance}</div>
              </div>
            </Section>
            
            {/* Personal Details */}
            <Section title="Personal Details" open={openSection.personal} onClick={() => toggleSection('personal')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="text-sm sm:text-base"><span className="font-semibold">Gender:</span> {admin.personal.gender}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Nationality:</span> {admin.personal.nationality}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Birth Day:</span> {admin.personal.birthDay}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Marital Status:</span> {admin.personal.maritalStatus}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Children Count:</span> {admin.personal.children}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Current Address:</span> {admin.personal.currentAddress}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Permanent Address:</span> {admin.personal.permanentAddress}</div>
              </div>
            </Section>
            
            {/* Passport Details */}
            <Section title="Passport Details" open={openSection.passport} onClick={() => toggleSection('passport')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="text-sm sm:text-base"><span className="font-semibold">Passport Number:</span> {admin.passport.number}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Passport Issue Date:</span> {admin.passport.issueDate}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Passport Expiry Date:</span> {admin.passport.expiryDate}</div>
              </div>
            </Section>
            
            {/* Residency Details */}
            <Section title="Residency Details" open={openSection.residency} onClick={() => toggleSection('residency')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="text-sm sm:text-base"><span className="font-semibold">Residency Sponsor Company:</span> {admin.residency.sponsorCompany}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Residency Issue Date:</span> {admin.residency.issueDate}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Residency Expiry Date:</span> {admin.residency.expiryDate}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Residency Visa Number:</span> {admin.residency.visaNumber}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Employment Sponsor Company:</span> {admin.residency.employmentSponsor}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">National ID Number:</span> {admin.residency.nationalId}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">National ID Expiry:</span> {admin.residency.nationalIdExpiry}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Insurance Company:</span> {admin.residency.insuranceCompany}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Insurance Card Number:</span> {admin.residency.insuranceCard}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Insurance Expiry Date:</span> {admin.residency.insuranceExpiry}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Driving Licence Number:</span> {admin.residency.drivingLicenceNumber || '-'}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Driving Licence Issue Date:</span> {admin.residency.drivingLicenceIssue || '-'}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Driving Licence Expiry Date:</span> {admin.residency.drivingLicenceExpiry || '-'}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Labour Id Number:</span> {admin.residency.labourId || '-'}</div>
                <div className="text-sm sm:text-base"><span className="font-semibold">Labour Id Expiry Date:</span> {admin.residency.labourIdExpiry || '-'}</div>
              </div>
            </Section>
            
            {/* Documents */}
            <Section title="Documents" open={openSection.documents} onClick={() => toggleSection('documents')}>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {admin.documents.map((doc, idx) => (
                  <div key={idx} className="flex flex-col items-center border rounded-lg p-2 bg-gray-50 shadow-sm w-28 sm:w-32">
                    <div className="text-3xl sm:text-4xl text-red-400 mb-1">📄</div>
                    <div className="text-xs font-semibold mb-1 text-center">{doc.name}</div>
                    <div className="text-xs text-gray-500 mb-1">{doc.date}</div>
                    <button className="text-xs text-blue-600 underline">Download</button>
                  </div>
                ))}
              </div>
            </Section>
            
            {/* Policy Acknowledgements */}
            <Section title="Policy Acknowledgements" open={openSection.policy} onClick={() => toggleSection('policy')}>
              <div className="flex flex-col gap-2">
                {admin.policyAcknowledgements.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm sm:text-base">
                    <span>{p.name}</span>
                    {p.acknowledged ? (
                      <span className="text-green-600">✔</span>
                    ) : (
                      <span className="text-red-600">✖</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      )}
    </header>
  );
}

// Collapsible Section Component
function Section({ title, open, onClick, children }) {
  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      <button
        className="w-full flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-indigo-50 transition font-semibold text-left text-sm sm:text-base"
        onClick={onClick}
      >
        <span>{title}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-3 sm:px-4 py-3 bg-white">{children}</div>}
    </div>
  );
} 