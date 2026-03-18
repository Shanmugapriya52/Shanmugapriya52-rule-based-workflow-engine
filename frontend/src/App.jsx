import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ResponsiveSidebar from "./components/ResponsiveSidebar";
import AutomationRules from "./pages/AutomationRules";
import WorkflowExecution from "./pages/WorkflowExecution";
import Welcome from "./pages/Welcome";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DynamicDashboard from "./pages/DynamicDashboard";
import DashboardBuilder from "./pages/DashboardBuilder";
import WorkflowList from "./pages/WorkflowList";
import WorkflowEditor from "./pages/WorkflowEditor";
import StepEditor from "./pages/StepEditor";
import RuleEditor from "./pages/RuleEditor";
import ExecuteWorkflow from "./pages/ExecuteWorkflow";
import ExecutionLogs from "./pages/ExecutionLogs";
import ApprovalPage from "./pages/ApprovalPage";
import NotificationPage from "./pages/NotificationPage";
import AuditLog from "./pages/AuditLog";
import RoleManagement from "./pages/RoleManagement";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import Settings from "./pages/Settings";
import { NotificationProvider } from "./services/NotificationService";

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('currentUser');
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function RoleBasedDashboard() {
  const user = localStorage.getItem('currentUser');
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const currentUser = JSON.parse(user);
  
  // Always use the dynamic dashboard
  return <DynamicDashboard />;
}

function AppContent() {
  const location = useLocation();
  const showLayout = !["/", "/login", "/signup"].includes(location.pathname);

  return (
    <div className={`h-screen overflow-hidden ${showLayout ? 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100'}`}>
      <div className="flex flex-col h-full overflow-hidden">
        {showLayout && <Navbar />}
        
        <div className="flex-1 flex overflow-hidden">
          {showLayout && <ResponsiveSidebar />}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto scroll-smooth">
            <div className="w-full max-w-full">
              <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Dynamic Role-based Dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <RoleBasedDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Dashboard Builder for Admins */}
              <Route 
                path="/dashboard-builder" 
                element={
                  <ProtectedRoute>
                    <DashboardBuilder />
                  </ProtectedRoute>
                } 
              />
              
              {/* Workflow Management */}
              <Route 
                path="/workflows" 
                element={
                  <ProtectedRoute>
                    <WorkflowList />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/workflow-editor" 
                element={
                  <ProtectedRoute>
                    <WorkflowEditor />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/step-editor" 
                element={
                  <ProtectedRoute>
                    <StepEditor />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/rule-editor" 
                element={
                  <ProtectedRoute>
                    <RuleEditor />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/execute-workflow" 
                element={
                  <ProtectedRoute>
                    <ExecuteWorkflow />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/logs" 
                element={
                  <ProtectedRoute>
                    <ExecutionLogs />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/approvals" 
                element={
                  <ProtectedRoute>
                    <ApprovalPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <NotificationPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/audit" 
                element={
                  <ProtectedRoute>
                    <AuditLog />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/role-management" 
                element={
                  <ProtectedRoute>
                    <RoleManagement />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/developer-dashboard" 
                element={
                  <ProtectedRoute>
                    <DeveloperDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/automation" 
                element={
                  <ProtectedRoute>
                    <AutomationRules />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/workflows/:workflowId/execute" 
                element={
                  <ProtectedRoute>
                    <WorkflowExecution />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </BrowserRouter>
  );
}
