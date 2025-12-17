import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Dashboard from "./modules/Dashboard";
import ChatRoom from "./modules/ChatRoom";
import Sidebar from "./layout/Sidebar";
import Navbar from "./layout/Navbar";
import Login from "./modules/Login";
import TenderEngineerLogin from "./modules/TenderEngineerLogin";
import TenderEngineerDashboard from "./pages/TenderEngineerDashboard";
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
import { CompanySelectionProvider } from "./context/CompanySelectionContext";
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
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  
  if (!isAuthenticated) {
    // Redirect to appropriate login based on route
    if (location.pathname.startsWith('/tender-engineer')) {
      return <Navigate to="/login/tender-engineer" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check role if required
  if (requiredRole && userRole !== requiredRole) {
    // Redirect based on current role
    if (userRole === 'TENDER_ENGINEER') {
      return <Navigate to="/tender-engineer/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Tender Engineer Layout (without sidebar)
function TenderEngineerLayout() {
  return (
    <Routes>
      <Route path="/dashboard" element={<TenderEngineerDashboard />} />
      <Route path="*" element={<Navigate to="/tender-engineer/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <CompanySelectionProvider>
      <RuleProvider>
        <AIAssistantProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/login/tender-engineer" element={<TenderEngineerLogin />} />
              {/* Special route for Jira table demo - bypasses main layout */}
              <Route path="/jira-table-demo" element={<JiraTableDemo />} />
              {/* Tender Engineer Routes */}
              <Route path="/tender-engineer/*" element={
                <PrivateRoute requiredRole="TENDER_ENGINEER">
                  <TenderEngineerLayout />
                </PrivateRoute>
              } />
              {/* Admin/General Routes */}
              <Route path="/*" element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              } />
            </Routes>
          </Router>
        </AIAssistantProvider>
      </RuleProvider>
    </CompanySelectionProvider>
  );
}
