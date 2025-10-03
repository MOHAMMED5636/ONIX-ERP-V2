import React, { useState, useRef, useEffect } from "react";
import { UserCircleIcon, GlobeAltIcon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon, ChatBubbleLeftRightIcon, Bars3Icon, BellIcon, XMarkIcon, UserPlusIcon, ExclamationCircleIcon, CogIcon, UsersIcon, DocumentTextIcon, CalendarIcon, BoltIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";

export default function Navbar({ onMenuToggle }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Enhanced notifications data
  const notifications = [
    {
      id: 1,
      title: "New Task Assigned",
      message: "You have been assigned to 'Website Development' project with high priority",
      time: "2 minutes ago",
      type: "task",
      read: false,
      priority: "high",
      avatar: "👨‍💻",
      action: "View Task"
    },
    {
      id: 2,
      title: "Project Deadline Reminder",
      message: "Mobile App Design project deadline is approaching in 3 days",
      time: "15 minutes ago",
      type: "deadline",
      read: false,
      priority: "urgent",
      avatar: "⏰",
      action: "View Project"
    },
    {
      id: 3,
      title: "System Maintenance",
      message: "ERP system will be updated tonight at 2:00 AM for 30 minutes",
      time: "1 hour ago",
      type: "system",
      read: true,
      priority: "medium",
      avatar: "🔧",
      action: "Learn More"
    },
    {
      id: 4,
      title: "Document Approved",
      message: "Your project proposal has been approved by the management team",
      time: "3 hours ago",
      type: "approval",
      read: false,
      priority: "medium",
      avatar: "✅",
      action: "View Document"
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Close notifications when clicking outside
  const notificationsRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

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
    <header className="w-full glass-card bg-gradient-to-br from-indigo-50 via-white to-cyan-50 shadow-xl flex items-center px-3 sm:px-6 py-4 z-40 border-b border-indigo-100 backdrop-blur-md">
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
      <div className="flex-1 min-w-0 flex justify-center items-center max-w-md mx-4">
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
      <div className="flex items-center gap-4 ml-auto">
        {/* ERP Admin title - hidden on small mobile */}
        {/* Removed Admin and Logout controls for Sidebar migration */}
        
        {/* Notifications Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-3 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 group ${
              showNotifications ? 'ring-4 ring-orange-200 shadow-2xl' : ''
            }`}
            title="ERP Notifications"
          >
            <BellIcon className={`h-5 w-5 transition-all duration-300 ${
              showNotifications ? 'animate-bounce' : 'group-hover:animate-pulse group-hover:rotate-12'
            }`} />
            {/* Enhanced Notification badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 font-bold shadow-lg border-2 border-white animate-bounce">
                {unreadCount}
              </span>
            )}
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
          </button>

          {/* Enhanced Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden animate-in slide-in-from-top-2 duration-300">
              {/* Enhanced Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                      <BellIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                      <p className="text-sm text-gray-600">
                        {unreadCount > 0 ? `${unreadCount} new updates` : 'All caught up! 🎉'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Enhanced Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`px-6 py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      !notification.read ? 'bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-orange-500' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar with priority indicator */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${
                          notification.type === 'task' ? 'from-blue-400 to-blue-600' :
                          notification.type === 'deadline' ? 'from-red-400 to-red-600' :
                          notification.type === 'system' ? 'from-yellow-400 to-yellow-600' :
                          notification.type === 'approval' ? 'from-green-400 to-green-600' :
                          'from-purple-400 to-purple-600'
                        } shadow-lg`}>
                          {notification.avatar}
                        </div>
                        {/* Priority indicator */}
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          notification.priority === 'urgent' ? 'bg-red-500 animate-pulse' :
                          notification.priority === 'high' ? 'bg-orange-500' :
                          notification.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-bold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap bg-gray-100 px-2 py-1 rounded-full">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {/* Action button */}
                        <button className="mt-3 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full hover:shadow-md transition-all duration-300 transform hover:scale-105">
                          {notification.action}
                        </button>
                      </div>

                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
                <button className="w-full text-center text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

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
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold shadow border border-blue-200 hover:bg-blue-100 transition pill-pop relative"
        >
          <GlobeAltIcon className="h-5 w-5" />
          <span className="hidden sm:inline">{lang === "en" ? "EN | ع" : "ع | EN"}</span>
          <span className="sm:hidden">{lang === "en" ? "EN" : "ع"}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4" onClick={() => setShowAdminModal(false)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Admin Profile</h2>
              <button
                className="text-gray-400 hover:text-red-500 text-2xl font-bold"
                onClick={() => setShowAdminModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img src={admin.avatar} alt={admin.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-indigo-200 shadow" />
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold text-gray-700">Name:</span>
                      <span className="text-gray-900">{admin.name}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold text-gray-700">Job Title:</span>
                      <span className="text-gray-900">{admin.jobTitle}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold text-gray-700">Middle Name:</span>
                      <span className="text-gray-900">{admin.middleName}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold text-gray-700">Status:</span>
                      <span className={admin.status === "Active" ? "text-green-600" : "text-red-600"}>{admin.status}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold text-gray-700">ID:</span>
                      <span className="text-gray-900">{admin.id}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Collapsible Sections */}
              {/* Contacts */}
              <Section title="Contacts" open={openSection.contacts} onClick={() => toggleSection('contacts')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Mobile:</span>
                    <span className="text-gray-900">{admin.contacts.mobile}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Email:</span>
                    <a href={`mailto:${admin.contacts.email}`} className="text-blue-600 underline">{admin.contacts.email}</a>
                  </div>
                </div>
              </Section>
              
              {/* Company Details */}
              <Section title="Company Details" open={openSection.company} onClick={() => toggleSection('company')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Department:</span>
                    <span className="text-gray-900">{admin.company.department}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Line Manager:</span>
                    <span className="text-gray-900">{admin.company.manager}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Joining Date:</span>
                    <span className="text-gray-900">{admin.company.joiningDate}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Exit Date:</span>
                    <span className="text-gray-900">{admin.company.exitDate || '-'}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Years of Service:</span>
                    <span className="text-gray-900">{admin.company.yearsOfService}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Attendance Program:</span>
                    <span className="text-gray-900">{admin.company.attendance}</span>
                  </div>
                </div>
              </Section>
              
              {/* Personal Details */}
              <Section title="Personal Details" open={openSection.personal} onClick={() => toggleSection('personal')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Gender:</span>
                    <span className="text-gray-900">{admin.personal.gender}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Nationality:</span>
                    <span className="text-gray-900">{admin.personal.nationality}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Birth Day:</span>
                    <span className="text-gray-900">{admin.personal.birthDay}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Marital Status:</span>
                    <span className="text-gray-900">{admin.personal.maritalStatus}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Children Count:</span>
                    <span className="text-gray-900">{admin.personal.children}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Current Address:</span>
                    <span className="text-gray-900">{admin.personal.currentAddress}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Permanent Address:</span>
                    <span className="text-gray-900">{admin.personal.permanentAddress}</span>
                  </div>
                </div>
              </Section>
              
              {/* Passport Details */}
              <Section title="Passport Details" open={openSection.passport} onClick={() => toggleSection('passport')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Passport Number:</span>
                    <span className="text-gray-900">{admin.passport.number}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Issue Date:</span>
                    <span className="text-gray-900">{admin.passport.issueDate}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Expiry Date:</span>
                    <span className="text-gray-900">{admin.passport.expiryDate}</span>
                  </div>
                </div>
              </Section>
              
              {/* Residency Details */}
              <Section title="Residency Details" open={openSection.residency} onClick={() => toggleSection('residency')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Sponsor Company:</span>
                    <span className="text-gray-900">{admin.residency.sponsorCompany}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Issue Date:</span>
                    <span className="text-gray-900">{admin.residency.issueDate}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Expiry Date:</span>
                    <span className="text-gray-900">{admin.residency.expiryDate}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Visa Number:</span>
                    <span className="text-gray-900">{admin.residency.visaNumber}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Employment Sponsor:</span>
                    <span className="text-gray-900">{admin.residency.employmentSponsor}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">National ID:</span>
                    <span className="text-gray-900">{admin.residency.nationalId}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">National ID Expiry:</span>
                    <span className="text-gray-900">{admin.residency.nationalIdExpiry}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Insurance Company:</span>
                    <span className="text-gray-900">{admin.residency.insuranceCompany}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Insurance Card:</span>
                    <span className="text-gray-900">{admin.residency.insuranceCard}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Insurance Expiry:</span>
                    <span className="text-gray-900">{admin.residency.insuranceExpiry}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Driving Licence:</span>
                    <span className="text-gray-900">{admin.residency.drivingLicenceNumber || '-'}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Driving Licence Issue:</span>
                    <span className="text-gray-900">{admin.residency.drivingLicenceIssue || '-'}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Driving Licence Expiry:</span>
                    <span className="text-gray-900">{admin.residency.drivingLicenceExpiry || '-'}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Labour ID:</span>
                    <span className="text-gray-900">{admin.residency.labourId || '-'}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="font-semibold text-gray-700">Labour ID Expiry:</span>
                    <span className="text-gray-900">{admin.residency.labourIdExpiry || '-'}</span>
                  </div>
                </div>
              </Section>
              
              {/* Documents */}
              <Section title="Documents" open={openSection.documents} onClick={() => toggleSection('documents')}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {admin.documents.map((doc, idx) => (
                    <div key={idx} className="flex flex-col items-center border rounded-lg p-3 bg-gray-50 shadow-sm">
                      <div className="text-2xl text-red-400 mb-2">📄</div>
                      <div className="text-xs font-semibold mb-1 text-center truncate w-full">{doc.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{doc.date}</div>
                      <button className="text-xs text-blue-600 underline hover:text-blue-800">Download</button>
                    </div>
                  ))}
                </div>
              </Section>
              
              {/* Policy Acknowledgements */}
              <Section title="Policy Acknowledgements" open={openSection.policy} onClick={() => toggleSection('policy')}>
                <div className="space-y-2">
                  {admin.policyAcknowledgements.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-900">{p.name}</span>
                      {p.acknowledged ? (
                        <span className="text-green-600 text-lg">✔</span>
                      ) : (
                        <span className="text-red-600 text-lg">✖</span>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Collapsible Section Component
function Section({ title, open, onClick, children }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition font-semibold text-left text-sm"
        onClick={onClick}
      >
        <span className="text-gray-900">{title}</span>
        <span className="text-gray-500">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 py-4 bg-white">{children}</div>}
    </div>
  );
} 