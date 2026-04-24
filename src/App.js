import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Bars3Icon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import Dashboard from "./modules/Dashboard";
import ChatRoom from "./modules/ChatRoom";
import Sidebar from "./layout/Sidebar";
import Navbar from "./layout/Navbar";
import TenderEngineerSidebar from "./layout/TenderEngineerSidebar";
import EmployeeSidebar from "./layout/EmployeeSidebar";
import Login from "./modules/Login";
import ChangePassword from "./components/auth/ChangePassword";
import CreateEmployeeForm from "./components/employees/CreateEmployeeForm";
import TenderEngineerLogin from "./modules/TenderEngineerLogin";
import TenderEngineerDashboard from "./pages/TenderEngineerDashboard";
import TenderEngineerSubmission from "./pages/TenderEngineerSubmission";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeProjects from "./pages/employee/EmployeeProjects";
import EmployeeProjectDetail from "./pages/employee/EmployeeProjectDetail";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import TaskList from "./components/tasks/TaskList";
import MyAttendance from "./pages/workplace/MyAttendance";
import AdminAttendance from "./pages/AdminAttendance";
import EmployeeActivityCalendar from "./pages/EmployeeActivityCalendar";
import { trackActivity } from "./services/activityAPI";
import CompanyPolicy from "./pages/workplace/CompanyPolicy";
import ProjectChatApp from "./modules/ProjectChatApp";
import Employees from "./modules/Employees";
import Clients from "./pages/Clients";
import Departments from "./modules/Departments";
import WorkingLocations from "./modules/WorkingLocations";
import Task from "./pages/Task";
import TenderPage from "./pages/Tender";
import TenderContractorSelection from "./pages/TenderContractorSelection";
import TenderConfirmation from "./pages/TenderConfirmation";
import TenderDocumentUpload from "./pages/TenderDocumentUpload";
import TenderTechnicalSubmission from "./pages/TenderTechnicalSubmission";
import TenderFees from "./pages/TenderFees";
import TenderInvitation from "./pages/TenderInvitation";
import TenderContractorEvaluation from "./pages/TenderContractorEvaluation";
import Contracts from "./pages/Contracts";
import Payroll from "./pages/Payroll";
import ContractorsPage from "./pages/Contractors";
import SalaryManagement from "./pages/salary/index";
import EmployeeSalarySetup from "./pages/salary/employee-setup";
import DeductionsPage from "./pages/salary/deductions";
import IncrementsPage from "./pages/salary/increments";
import TaskCategoryList from "./components/tasks/TaskCategoryList";
import CompaniesPage from "./components/companies/CompaniesPage";
import CreateCompanyPage from "./components/companies/CreateCompanyPage";
import SubDepartmentsPage from "./modules/SubDepartmentsPage";
import PositionsPage from "./modules/PositionsPage";
import EmployeeSectionPage from "./modules/EmployeeSectionPage";
import Leaves from "./pages/workplace/Leaves";
import TeamLeaveManagement from "./pages/workplace/TeamLeaveManagement";
import FeedbacksSurvey from "./pages/workplace/FeedbacksSurvey";
import FormBuilderPage from "./pages/workplace/forms/FormBuilderPage";
import FormFillPage from "./pages/workplace/forms/FormFillPage";
import FormInsightsPage from "./pages/workplace/forms/FormInsightsPage";
import RuleBuilder from "./pages/employees/RuleBuilder";
import EmployeeRuleDemo from "./pages/employees/EmployeeRuleDemo";
import MyPayroll from "./pages/employee/MyPayroll";
import MySalary from "./pages/MySalary";
import TeamProjectTracker from "./components/TeamProjectTracker";
import ProjectLifeCycle from "./components/ProjectLifeCycle";
import { JiraTableDemo } from "./components/JiraTable/JiraTableDemo";
import ExcelTable from "./pages/ExcelTable";
import JiraLikePage from "./pages/JiraLikePage";
import ITSupport from "./pages/ITSupport";
import AIEmployeeEvaluations from "./components/AIEmployeeEvaluations";
import BankReconciliationDashboard from "./components/BankReconciliation";
import Settings from "./pages/Settings";
import SystemFeedbackAdminPage from "./pages/SystemFeedbackAdminPage";
import Preferences from "./pages/Preferences";
import { CompanySelectionProvider } from "./context/CompanySelectionContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { RuleProvider } from "./context/RuleContext";
import { AIAssistantProvider, AIAssistantEnhanced } from "./components/AIAssistant";
import PolicyNotificationModal from "./components/policies/PolicyNotificationModal";
import * as policiesAPI from "./services/policiesAPI";
import SystemFeedbackModal from "./components/SystemFeedbackModal";
import { WelcomeBannerExtrasProvider } from "./context/WelcomeBannerExtrasContext";
import AppWelcomeBanner from "./components/layout/AppWelcomeBanner";
import AIChatbot from "./components/tasks/AIChatbot";
import EmailTemplatesPage from "./pages/emails/EmailTemplatesPage";
import EmailTriggersPage from "./pages/emails/EmailTriggersPage";
import EmailLogsPage from "./pages/emails/EmailLogsPage";
import EmailQueuePage from "./pages/emails/EmailQueuePage";

function FeedbackFloatingButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[300] w-12 h-12 rounded-full bg-white shadow-xl border border-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-50 hover:scale-105 transition"
      aria-label="Send feedback"
      title="Send feedback"
    >
      <QuestionMarkCircleIcon className="h-7 w-7" />
    </button>
  );
}

/** Throttled PAGE_VIEW logs for module/route usage (Employee Activity Calendar). */
function ActivityRouteTracker() {
  const location = useLocation();
  const { user } = useAuth();
  const lastByPathRef = React.useRef({});

  React.useEffect(() => {
    if (!user?.id) return;
    const path = `${location.pathname}${location.search || ""}`;
    const now = Date.now();
    const last = lastByPathRef.current[path] || 0;
    if (now - last < 90000) return;
    lastByPathRef.current[path] = now;
    trackActivity({
      module: path,
      eventType: "PAGE_VIEW",
      action: "VIEW",
      metadata: {
        title: typeof document !== "undefined" ? document.title : undefined,
      },
    }).catch(() => {});
  }, [location.pathname, location.search, user?.id]);

  return null;
}

function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [isLgUp, setIsLgUp] = useState(() => window.innerWidth >= 1024);
  const location = useLocation();
  const { user } = useAuth();
  const [policyNotice, setPolicyNotice] = useState(null);
  const [policyNoticeOpen, setPolicyNoticeOpen] = useState(false);
  const [policyAcknowledging, setPolicyAcknowledging] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [showAIChatbot, setShowAIChatbot] = useState(false);

  React.useEffect(() => {
    const handler = () => setFeedbackOpen(true);
    window.addEventListener('open-system-feedback', handler);
    return () => window.removeEventListener('open-system-feedback', handler);
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
      setIsLgUp(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hide Navbar for /tasks and for dashboard roles that use the Welcome header controls.
  // HR specifically requested to remove the extra top search bar above the Welcome header.
  const isDashboardRoute =
    location.pathname === "/" || location.pathname === "/dashboard";
  const hideNavbarDesktopOnly =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "PROJECT_MANAGER" ||
    (isDashboardRoute && user?.role === "HR");
  const hideNavbar = location.pathname.startsWith("/tasks") || (hideNavbarDesktopOnly && isLgUp);

  // Project list (Tasks module) has its own header; hide the global welcome banner there.
  const hideWelcomeBanner = location.pathname.startsWith("/tasks");

  function normalizeDept(s) {
    return String(s || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  function policyDepartmentTargets(policyDeptRaw, userDeptNorm) {
    const raw = String(policyDeptRaw || '').trim();
    if (!raw) return false;
    const normAll = normalizeDept(raw);
    if (normAll === 'all departments' || normAll === 'all' || normAll === 'everyone') return true;
    const parts = raw
      .split(/[,;|\n/]+/g)
      .map((x) => normalizeDept(x))
      .filter(Boolean);
    if (!parts.length) return false;
    return parts.includes(userDeptNorm);
  }

  React.useEffect(() => {
    let cancelled = false;
    async function checkPolicyNotice() {
      if (!user?.id) return;
      const dept = normalizeDept(user.department);
      if (!dept) return;
      try {
        const res = await policiesAPI.fetchPolicies();
        const rows = res?.data?.policies || [];
        const pending = rows.filter((p) => p?.status === 'pending');
        const relevant = pending.filter((p) => {
          return policyDepartmentTargets(p.department, dept);
        });
        if (!relevant.length) return;
        // pick newest by updatedAt/createdAt if present
        const sorted = [...relevant].sort((a, b) => {
          const ta = Date.parse(a.updatedAt || a.createdAt || '') || 0;
          const tb = Date.parse(b.updatedAt || b.createdAt || '') || 0;
          return tb - ta;
        });
        const top = sorted[0];
        const key = `policyNoticeSeen:${user.id}:${top.id}`;
        if (localStorage.getItem(key) === 'true') return;
        if (cancelled) return;
        setPolicyNotice(top);
        setPolicyNoticeOpen(true);
      } catch {
        // ignore notice failures
      }
    }
    checkPolicyNotice();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.department]);

  const closePolicyNotice = () => {
    if (user?.id && policyNotice?.id) {
      localStorage.setItem(`policyNoticeSeen:${user.id}:${policyNotice.id}`, 'true');
    }
    setPolicyNoticeOpen(false);
  };

  const acknowledgePolicyFromNotice = async () => {
    if (!policyNotice?.id) return;
    setPolicyAcknowledging(true);
    try {
      await policiesAPI.acknowledgePolicy(policyNotice.id);
      closePolicyNotice();
    } catch (e) {
      window.alert(e.message || 'Failed to acknowledge policy');
    } finally {
      setPolicyAcknowledging(false);
    }
  };

  return (
    <WelcomeBannerExtrasProvider>
    <div className="flex min-h-screen bg-gray-50">
      <SystemFeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <AIChatbot isOpen={showAIChatbot} onClose={() => setShowAIChatbot(false)} />
      <FeedbackFloatingButton onClick={() => setFeedbackOpen(true)} />
      <PolicyNotificationModal
        open={policyNoticeOpen}
        policy={policyNotice}
        acknowledging={policyAcknowledging}
        onClose={closePolicyNotice}
        onAcknowledge={acknowledgePolicyFromNotice}
      />
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full
        ${
        sidebarCollapsed 
          ? 'ml-0 lg:ml-8 xl:ml-8' 
          : 'ml-0 lg:ml-28 xl:ml-28'
        }
      `}>
        {!hideNavbar && <Navbar onMenuToggle={() => setSidebarCollapsed((c) => !c)} />}
        <main className={`flex-1 w-full flex flex-col min-h-0 ${hideNavbar ? 'h-screen' : ''}`}>
          {!hideWelcomeBanner && (
            <AppWelcomeBanner
              onOpenAIAssistant={() => setShowAIChatbot(true)}
              onOpenCustomizeWidgets={() => window.dispatchEvent(new Event("open-dashboard-widget-customizer"))}
            />
          )}
          <div className="flex-1 min-h-0 w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatRoom />} />
            <Route path="/project-chat" element={<ProjectChatApp />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/create" element={
              <PrivateRoute requiredRole={['ADMIN', 'HR']}>
                <div className="p-6">
                  <CreateEmployeeForm />
                </div>
              </PrivateRoute>
            } />
            <Route path="/clients" element={<Clients />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/company-resources/departments/:departmentId/sub-departments" element={<SubDepartmentsPage />} />
            <Route path="/company-resources/departments/:departmentId/sub-departments/:subDepartmentId/positions" element={<PositionsPage />} />
            <Route path="/working-locations" element={<WorkingLocations />} />
            <Route path="/tasks/*" element={<Task />} />
            <Route path="/tender" element={<TenderPage />} />
            <Route path="/tender/contractors" element={<TenderContractorSelection />} />
            <Route path="/tender/confirmation" element={<TenderConfirmation />} />
            <Route path="/tender/document-upload" element={<TenderDocumentUpload />} />
            <Route path="/tender/technical-submission" element={<TenderTechnicalSubmission />} />
            <Route path="/tender/fees" element={<TenderFees />} />
            <Route path="/tender/invitation/:tenderId" element={<TenderInvitation />} />
            <Route path="/tender/evaluation" element={<TenderContractorEvaluation />} />
            <Route path="/contracts/*" element={<Contracts />} />
            <Route path="/payroll/*" element={
              <PrivateRoute requiredRole={['ADMIN', 'HR']}>
                <Payroll />
              </PrivateRoute>
            } />
            <Route
              path="/salary"
              element={
                <PrivateRoute requiredRole={['ADMIN', 'HR']}>
                  <SalaryManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/salary/employee-setup"
              element={
                <PrivateRoute requiredRole={['ADMIN', 'HR']}>
                  <EmployeeSalarySetup />
                </PrivateRoute>
              }
            />
            <Route
              path="/salary/deductions"
              element={
                <PrivateRoute requiredRole={['ADMIN', 'HR']}>
                  <DeductionsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/salary/increments"
              element={
                <PrivateRoute requiredRole={['ADMIN', 'HR']}>
                  <IncrementsPage />
                </PrivateRoute>
              }
            />
            {/* Manager / PM: use employee-style profile UI */}
            <Route path="/profile" element={<EmployeeProfile />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/task-categories" element={<TaskCategoryList />} />
            <Route path="/companies" element={
              <PrivateRoute requiredRole={['ADMIN', 'HR']}>
                <CompaniesPage />
              </PrivateRoute>
            } />
            <Route path="/companies/create" element={
              <PrivateRoute requiredRole={['ADMIN', 'HR']}>
                <CreateCompanyPage />
              </PrivateRoute>
            } />
            <Route path="/contractors" element={<ContractorsPage />} />
            <Route
              path="/my-salary"
              element={
                <PrivateRoute requiredRole={['MANAGER', 'PROJECT_MANAGER']}>
                  <MySalary />
                </PrivateRoute>
              }
            />
            {/* Admin/HR: all employees attendance list — not PROJECT_MANAGER */}
            <Route path="/attendance" element={
              <PrivateRoute requiredRole={['ADMIN', 'HR']}>
                <AdminAttendance />
              </PrivateRoute>
            } />
            <Route path="/employee-activity-calendar" element={
              <PrivateRoute requiredRole={['ADMIN', 'HR']}>
                <EmployeeActivityCalendar />
              </PrivateRoute>
            } />
            {/* Workplace Hub routes */}
            <Route path="/workplace/company-policy" element={<CompanyPolicy />} />
            <Route path="/workplace/my-attendance" element={
              <PrivateRoute blockRoles={['ADMIN']}>
                <MyAttendance />
              </PrivateRoute>
            } />
            <Route
              path="/workplace/leaves/team"
              element={
                <PrivateRoute requiredRole={["MANAGER", "PROJECT_MANAGER"]}>
                  <TeamLeaveManagement />
                </PrivateRoute>
              }
            />
            <Route path="/workplace/leaves" element={<Leaves />} />
            <Route path="/workplace/feedbacks-survey" element={<FeedbacksSurvey />} />
            <Route path="/workplace/forms/:formId/edit" element={<FormBuilderPage />} />
            <Route path="/workplace/forms/:formId/fill" element={<FormFillPage />} />
            <Route path="/workplace/forms/:formId/insights" element={<FormInsightsPage />} />
            <Route path="/emails/templates" element={<EmailTemplatesPage />} />
            <Route path="/emails/triggers" element={<EmailTriggersPage />} />
            <Route path="/emails/logs" element={<EmailLogsPage />} />
            <Route path="/emails/queue" element={<EmailQueuePage />} />
            <Route path="/employees/rule-builder" element={<RuleBuilder />} />
            <Route path="/employees/rule-demo" element={<EmployeeRuleDemo />} />
            <Route path="/team-project-tracker" element={<TeamProjectTracker />} />
            <Route path="/project-lifecycle" element={<ProjectLifeCycle />} />
            <Route path="/bank-reconciliation" element={
              <PrivateRoute blockRoles={['MANAGER', 'PROJECT_MANAGER']}>
                <BankReconciliationDashboard />
              </PrivateRoute>
            } />
            <Route path="/it-support" element={<ITSupport />} />
            <Route path="/ai-employee-evaluations" element={<AIEmployeeEvaluations />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/admin/system-feedback"
              element={
                <PrivateRoute requiredRole={['ADMIN']}>
                  <SystemFeedbackAdminPage />
                </PrivateRoute>
              }
            />
            <Route path="/excel-table/*" element={<ExcelTable />} />
            <Route path="/jira-like/*" element={<JiraLikePage />} />
            {/* Add other authenticated routes here */}
          </Routes>
          <ActivityRouteTracker />
          </div>
        </main>
      </div>
      
      {/* AI Assistant - Only available on dashboard page */}
      {location.pathname === '/' && <AIAssistantEnhanced />}
    </div>
    </WelcomeBannerExtrasProvider>
  );
}

// PrivateRoute component for protecting routes
function PrivateRoute({ children, requiredRole = null, blockRoles = null }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Redirect to appropriate login based on route
    if (location.pathname.startsWith('/erp/tender') || location.pathname.startsWith('/tender-engineer')) {
      return <Navigate to="/login/tender-engineer" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Block specific roles (e.g. ADMIN from "My Attendance" — they use org-wide Attendance instead)
  if (blockRoles && user?.role) {
    const blocked = Array.isArray(blockRoles) ? blockRoles : [blockRoles];
    if (blocked.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // Check role if required (supports array of roles)
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user.role)) {
      // Redirect based on current role
      if (user.role === 'TENDER_ENGINEER') {
        return <Navigate to="/erp/tender/dashboard" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // Block TENDER_ENGINEER from accessing main ERP routes
  // Main ERP routes should only be accessible to ADMIN and other non-TENDER_ENGINEER roles
  // Block TENDER_ENGINEER from accessing ANY main ERP routes including /tender/* routes
  if (user.role === 'TENDER_ENGINEER') {
    // Only allow access to /erp/tender/* routes
    if (!location.pathname.startsWith('/erp/tender') && 
        !location.pathname.startsWith('/tender-engineer') &&
        !location.pathname.startsWith('/login') &&
        !location.pathname.startsWith('/change-password')) {
      return <Navigate to="/erp/tender/dashboard" replace />;
    }
    // Block access to main ERP /tender/* routes (invitation acceptance, etc.)
    if (location.pathname.startsWith('/tender/') && !location.pathname.startsWith('/erp/tender/')) {
      return <Navigate to="/erp/tender/dashboard" replace />;
    }
  }
  
  return children;
}

// Block TENDER_ENGINEER from accessing main ERP routes
function TenderEngineerBlock({ children }) {
  const { user } = useAuth();
  if (user && user.role === 'TENDER_ENGINEER') {
    return <Navigate to="/erp/tender/dashboard" replace />;
  }
  return children;
}

// Block EMPLOYEE from accessing Admin ERP; redirect to Employee ERP
function EmployeeBlock({ children }) {
  const { user } = useAuth();
  if (user && user.role === 'EMPLOYEE') {
    return <Navigate to="/employee/dashboard" replace />;
  }
  return children;
}

// Employee ERP layout (limited features) — mobile: sidebar toggled via hamburger
function EmployeeLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  React.useEffect(() => {
    const handler = () => setFeedbackOpen(true);
    window.addEventListener('open-system-feedback', handler);
    return () => window.removeEventListener('open-system-feedback', handler);
  }, []);
  React.useEffect(() => {
    const handleResize = () => setSidebarCollapsed(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const toggleSidebar = () => setSidebarCollapsed((c) => !c);
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SystemFeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <FeedbackFloatingButton onClick={() => setFeedbackOpen(true)} />
      <EmployeeSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      {/* Mobile overlay: tap to close sidebar when open on small screens */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          aria-hidden
          onClick={toggleSidebar}
        />
      )}
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full ${sidebarCollapsed ? 'lg:ml-8' : 'lg:ml-28'}`}>
        {/* Mobile header with menu button so sidebar can be opened on mobile */}
        <header className="sticky top-0 z-30 lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="font-semibold text-slate-800">ERP</span>
        </header>
        <main className="flex-1 w-full p-4">
          <Routes>
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="projects" element={<EmployeeProjects />} />
            <Route path="projects/:id" element={<EmployeeProjectDetail />} />
            {/* Employee sees same Project Management table, but backend restricts what they can edit */}
            <Route path="tasks/*" element={<TaskList />} />
            <Route path="attendance" element={<MyAttendance />} />
            <Route path="leave-request" element={<Leaves />} />
            <Route path="company-policy" element={<CompanyPolicy />} />
            <Route path="my-payroll" element={<MyPayroll />} />
            <Route path="feedbacks-survey" element={<FeedbacksSurvey />} />
            <Route path="contractors" element={<ContractorsPage />} />
            <Route path="it-support" element={<ITSupport />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="preferences" element={<Preferences />} />
            <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
          </Routes>
          <ActivityRouteTracker />
        </main>
      </div>
    </div>
  );
}

// Tender Engineer Layout (with sidebar and navbar like main ERP)
function TenderEngineerLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  React.useEffect(() => {
    const handler = () => setFeedbackOpen(true);
    window.addEventListener('open-system-feedback', handler);
    return () => window.removeEventListener('open-system-feedback', handler);
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SystemFeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <FeedbackFloatingButton onClick={() => setFeedbackOpen(true)} />
      <TenderEngineerSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full
        ${
        sidebarCollapsed 
          ? 'lg:ml-8 xl:ml-8' 
          : 'lg:ml-28 xl:ml-28'
        }
      `}>
        <Navbar onMenuToggle={() => setSidebarCollapsed((c) => !c)} />
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/dashboard" element={<TenderEngineerDashboard />} />
            <Route path="/submit/:tenderId" element={<TenderEngineerSubmission />} />
            <Route path="*" element={<Navigate to="/erp/tender/dashboard" replace />} />
          </Routes>
          <ActivityRouteTracker />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CompanySelectionProvider>
        <PreferencesProvider>
        <RuleProvider>
          <AIAssistantProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/login/tender-engineer" element={<TenderEngineerLogin />} />
                <Route
                  path="/change-password"
                  element={
                    <PrivateRoute blockRoles={['MANAGER', 'PROJECT_MANAGER']}>
                      <ChangePassword />
                    </PrivateRoute>
                  }
                />
                {/* Special route for Jira table demo - bypasses main layout */}
                <Route path="/jira-table-demo" element={<JiraTableDemo />} />
                {/* Tender Engineer Routes */}
                <Route path="/erp/tender/*" element={
                  <PrivateRoute requiredRole="TENDER_ENGINEER">
                    <TenderEngineerLayout />
                  </PrivateRoute>
                } />
                {/* Legacy Tender Engineer Routes - redirect to new path */}
                <Route path="/tender-engineer/*" element={
                  <PrivateRoute requiredRole="TENDER_ENGINEER">
                    <Navigate to="/erp/tender/dashboard" replace />
                  </PrivateRoute>
                } />
                {/* Employee ERP - limited access (same login, different layout) */}
                <Route path="/employee/*" element={
                  <PrivateRoute requiredRole="EMPLOYEE">
                    <EmployeeLayout />
                  </PrivateRoute>
                } />
                {/* Admin/General Routes - Block TENDER_ENGINEER and EMPLOYEE */}
                <Route path="/*" element={
                  <PrivateRoute>
                    <TenderEngineerBlock>
                      <EmployeeBlock>
                        <MainLayout />
                      </EmployeeBlock>
                    </TenderEngineerBlock>
                  </PrivateRoute>
                } />
              </Routes>
            </Router>
          </AIAssistantProvider>
        </RuleProvider>
        </PreferencesProvider>
      </CompanySelectionProvider>
    </AuthProvider>
  );
}
