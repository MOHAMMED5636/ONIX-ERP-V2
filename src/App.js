import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Dashboard from "./modules/Dashboard";
import ChatRoom from "./modules/ChatRoom";
import Sidebar from "./layout/Sidebar";
import Navbar from "./layout/Navbar";
import Login from "./modules/Login";
import ProjectChatApp from "./modules/ProjectChatApp";
import Employees from "./modules/Employees";
import Clients from "./modules/Clients";
import Departments from "./modules/Departments";
import WorkingLocations from "./modules/WorkingLocations";
import Task from "./pages/Task";
import Contracts from "./pages/Contracts";
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
import { CompanySelectionProvider } from "./context/CompanySelectionContext";
import { RuleProvider } from "./context/RuleContext";

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
        <main className="flex-1 w-full">
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
            <Route path="/contracts/*" element={<Contracts />} />
            <Route path="/task-categories" element={<TaskCategoryList />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/create" element={<CreateCompanyPage />} />
            {/* Workplace Hub routes */}
            <Route path="/workplace/company-policy" element={<CompanyPolicy />} />
            <Route path="/workplace/my-attendance" element={<MyAttendance />} />
            <Route path="/workplace/leaves" element={<Leaves />} />
            <Route path="/workplace/feedbacks-survey" element={<FeedbacksSurvey />} />
            <Route path="/employees/rule-builder" element={<RuleBuilder />} />
            <Route path="/employees/rule-demo" element={<EmployeeRuleDemo />} />
            <Route path="/team-project-tracker" element={<TeamProjectTracker />} />
            <Route path="/project-lifecycle" element={<ProjectLifeCycle />} />
            {/* Add other authenticated routes here */}
          </Routes>
        </main>
      </div>
    </div>
  );
}

// PrivateRoute component for protecting routes
function PrivateRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <CompanySelectionProvider>
      <RuleProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Special route for Jira table demo - bypasses main layout */}
            <Route path="/jira-table-demo" element={<JiraTableDemo />} />
            <Route path="/*" element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            } />
          </Routes>
        </Router>
      </RuleProvider>
    </CompanySelectionProvider>
  );
}
