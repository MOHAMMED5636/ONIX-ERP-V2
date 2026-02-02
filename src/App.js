import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./modules/Dashboard";
import ChatRoom from "./modules/ChatRoom";
import Sidebar from "./layout/Sidebar";
import Navbar from "./layout/Navbar";
import TenderEngineerSidebar from "./layout/TenderEngineerSidebar";
import Login from "./modules/Login";
import ChangePassword from "./components/auth/ChangePassword";
import CreateEmployeeForm from "./components/employees/CreateEmployeeForm";
import TenderEngineerLogin from "./modules/TenderEngineerLogin";
import TenderEngineerDashboard from "./pages/TenderEngineerDashboard";
import TenderEngineerSubmission from "./pages/TenderEngineerSubmission";
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
import ContractorsPage from "./pages/Contractors";
import TaskCategoryList from "./components/tasks/TaskCategoryList";
import CompaniesPage from "./components/companies/CompaniesPage";
import CreateCompanyPage from "./components/companies/CreateCompanyPage";
import SubDepartmentsPage from "./modules/SubDepartmentsPage";
import PositionsPage from "./modules/PositionsPage";
import EmployeeSectionPage from "./modules/EmployeeSectionPage";
import CompanyPolicy from "./pages/workplace/CompanyPolicy";
import MyAttendance from "./pages/workplace/MyAttendance";
import Leaves from "./pages/workplace/Leaves";
import FeedbacksSurvey from "./pages/workplace/FeedbacksSurvey";
import RuleBuilder from "./pages/employees/RuleBuilder";
import EmployeeRuleDemo from "./pages/employees/EmployeeRuleDemo";
import TeamProjectTracker from "./components/TeamProjectTracker";
import ProjectLifeCycle from "./components/ProjectLifeCycle";
import { JiraTableDemo } from "./components/JiraTable/JiraTableDemo";
import ExcelTable from "./pages/ExcelTable";
import JiraLikePage from "./pages/JiraLikePage";
import ITSupport from "./pages/ITSupport";
import AIEmployeeEvaluations from "./components/AIEmployeeEvaluations";
import BankReconciliationDashboard from "./components/BankReconciliation";
import Settings from "./pages/Settings";
import { CompanySelectionProvider } from "./context/CompanySelectionContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { RuleProvider } from "./context/RuleContext";
import { AIAssistantProvider, AIAssistantEnhanced } from "./components/AIAssistant";

function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const location = useLocation();

  React.useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hide Navbar only for /tasks route
  const hideNavbar = location.pathname.startsWith("/tasks");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full
        ${
        sidebarCollapsed 
          ? 'lg:ml-8 xl:ml-8' 
          : 'lg:ml-28 xl:ml-28'
        }
      `}>
        {!hideNavbar && <Navbar onMenuToggle={() => setSidebarCollapsed((c) => !c)} />}
        <main className={`flex-1 w-full ${hideNavbar ? 'h-screen' : ''}`}>
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
            <Route path="/task-categories" element={<TaskCategoryList />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/create" element={<CreateCompanyPage />} />
            <Route path="/contractors" element={<ContractorsPage />} />
            {/* Workplace Hub routes */}
            <Route path="/workplace/company-policy" element={<CompanyPolicy />} />
            <Route path="/workplace/my-attendance" element={<MyAttendance />} />
            <Route path="/workplace/leaves" element={<Leaves />} />
            <Route path="/workplace/feedbacks-survey" element={<FeedbacksSurvey />} />
            <Route path="/employees/rule-builder" element={<RuleBuilder />} />
            <Route path="/employees/rule-demo" element={<EmployeeRuleDemo />} />
            <Route path="/team-project-tracker" element={<TeamProjectTracker />} />
            <Route path="/project-lifecycle" element={<ProjectLifeCycle />} />
            <Route path="/bank-reconciliation" element={<BankReconciliationDashboard />} />
            <Route path="/it-support" element={<ITSupport />} />
            <Route path="/ai-employee-evaluations" element={<AIEmployeeEvaluations />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/excel-table/*" element={<ExcelTable />} />
            <Route path="/jira-like/*" element={<JiraLikePage />} />
            {/* Add other authenticated routes here */}
          </Routes>
        </main>
      </div>
      
      {/* AI Assistant - Only available on dashboard page */}
      {location.pathname === '/' && <AIAssistantEnhanced />}
    </div>
  );
}

// PrivateRoute component for protecting routes
function PrivateRoute({ children, requiredRole = null }) {
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

// Component to block TENDER_ENGINEER from accessing main ERP routes
function TenderEngineerBlock({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  
  // If TENDER_ENGINEER tries to access main ERP routes, redirect to their dashboard
  if (user && user.role === 'TENDER_ENGINEER') {
    return <Navigate to="/erp/tender/dashboard" replace />;
  }
  
  return children;
}

// Tender Engineer Layout (with sidebar and navbar like main ERP)
function TenderEngineerLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const location = useLocation();

  React.useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
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
                <Route path="/change-password" element={<ChangePassword />} />
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
                {/* Admin/General Routes - Block TENDER_ENGINEER */}
                <Route path="/*" element={
                  <PrivateRoute>
                    <TenderEngineerBlock>
                      <MainLayout />
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
