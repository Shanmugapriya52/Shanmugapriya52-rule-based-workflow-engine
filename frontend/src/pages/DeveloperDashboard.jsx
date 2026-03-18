import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CodeBracketIcon,
  CommandLineIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PlusIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function DeveloperDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
      loadDeveloperData();
    }
  }, []);

  const loadDeveloperData = () => {
    // Sample developer data
    setProjects([
      { id: 1, name: 'Workflow Engine', status: 'In Progress', progress: 75 },
      { id: 2, name: 'API Integration', status: 'Completed', progress: 100 },
      { id: 3, name: 'UI Components', status: 'In Progress', progress: 60 }
    ]);
    
    setTasks([
      { id: 1, title: 'Fix authentication bug', priority: 'High', status: 'Open' },
      { id: 2, title: 'Add new workflow step', priority: 'Medium', status: 'In Progress' },
      { id: 3, title: 'Code review - PR #42', priority: 'Low', status: 'Open' }
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.1)] border border-lilac-border p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-lilac-text tracking-tight uppercase">Developer Dashboard</h1>
            <p className="text-lilac-muted font-medium mt-1">Manage your development projects and tasks</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/workflow-editor')}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-lilac-primary to-lilac-accent text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(200,162,255,0.39)] hover:opacity-90 transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-lilac-border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-lilac-muted">Active Projects</p>
              <p className="text-3xl font-black text-lilac-text mt-2">{projects.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-lilac-primary to-lilac-accent rounded-xl flex items-center justify-center shadow-lg">
              <CodeBracketIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-lilac-border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-lilac-muted">Open Tasks</p>
              <p className="text-3xl font-black text-lilac-text mt-2">{tasks.filter(t => t.status === 'Open').length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-lilac-primary to-lilac-accent rounded-xl flex items-center justify-center shadow-lg">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-lilac-border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-lilac-muted">Code Reviews</p>
              <p className="text-3xl font-black text-lilac-text mt-2">3</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-lilac-primary to-lilac-accent rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-lilac-border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-lilac-muted">Deployments</p>
              <p className="text-3xl font-black text-lilac-text mt-2">12</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-lilac-primary to-lilac-accent rounded-xl flex items-center justify-center shadow-lg">
              <ArrowPathIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-lilac-border p-6">
          <h2 className="text-lg font-bold text-lilac-text mb-6 flex items-center">
            <CodeBracketIcon className="w-5 h-5 mr-2 text-lilac-primary" />
            My Projects
          </h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-lilac-bg/30 border border-lilac-border rounded-xl p-4 hover:border-lilac-primary transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lilac-text">{project.name}</h3>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-xl border ${
                    project.status === 'Completed' 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                      : 'bg-lilac-secondary text-lilac-accent border-lilac-primary/30'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="w-full bg-lilac-border/30 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-lilac-primary to-lilac-accent h-full rounded-full group-hover:opacity-80 transition-all" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                   <p className="text-xs font-bold text-lilac-muted uppercase">{project.progress}% Complete</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-lilac-border p-6">
          <h2 className="text-lg font-bold text-lilac-text mb-6 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2 text-lilac-primary" />
            My Tasks
          </h2>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-lilac-bg/30 border border-lilac-border rounded-xl p-4 hover:border-lilac-primary transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lilac-text">{task.title}</h3>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-xl border ${
                    task.priority === 'High' 
                      ? 'bg-rose-100 text-rose-700 border-rose-200' 
                      : task.priority === 'Medium'
                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-lilac-primary animate-pulse"></span>
                   <p className="text-xs font-bold text-lilac-muted uppercase">Status: {task.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
