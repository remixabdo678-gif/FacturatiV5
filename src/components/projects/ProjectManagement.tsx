import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  FolderKanban, 
  Crown,
  Plus,
  Calendar,
  BarChart3,
  Users,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  MessageSquare,
  Paperclip,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import ProjectDashboard from './ProjectDashboard';
import ProjectsList from './ProjectsList';
import ProjectKanban from './ProjectKanban';
import ProjectCalendar from './ProjectCalendar';
import ProjectReports from './ProjectReports';
import TasksSection from './TasksSection';
import AddProjectModal from './AddProjectModal';
import EditProjectModal from './EditProjectModal';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';

export default function ProjectManagement() {
  const { user } = useAuth();
  const { projects, tasks, employees } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Vérifier l'accès PRO
  const isProActive = user?.company.subscription === 'pro' && user?.company.expiryDate && 
    new Date(user.company.expiryDate) > new Date();

  if (!isProActive) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔒 Fonctionnalité PRO
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            La Gestion de Projet est réservée aux abonnés PRO. 
            Passez à la version PRO pour accéder à cette fonctionnalité avancée.
          </p>
          <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
            <span className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Passer à PRO - 299 MAD/mois</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 },
    { id: 'projects', label: 'Projets', icon: FolderKanban },
    { id: 'kanban', label: 'Kanban', icon: Target },
    { id: 'tasks', label: 'Tâches', icon: CheckCircle },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'reports', label: 'Rapports', icon: FileText }
  ];

  // Calculs des statistiques
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const overdueProjects = projects.filter(p => p.status === 'overdue').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <FolderKanban className="w-8 h-8 text-purple-600" />
            <span>Gestion de Projet</span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Gérez vos projets, tâches et équipes avec des outils collaboratifs avancés. Fonctionnalité PRO.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddTaskModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Tâche</span>
          </button>
          <button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Projet</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalProjects}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Projets Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeProjects}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">En Cours</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedProjects}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Terminés</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overdueProjects}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">En Retard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <ProjectDashboard 
          projects={projects}
          tasks={tasks}
          employees={employees}
        />
      )}

      {activeTab === 'projects' && (
        <ProjectsList 
          projects={projects}
          onEditProject={setEditingProject}
          onViewProject={setSelectedProject}
        />
      )}

      {activeTab === 'kanban' && (
        <ProjectKanban 
          projects={projects}
          tasks={tasks}
          employees={employees}
          onEditTask={setEditingTask}
          onEditProject={setEditingProject}
        />
      )}

      {activeTab === 'tasks' && (
        <TasksSection 
          onAddTask={() => setIsAddTaskModalOpen(true)}
          onEditTask={setEditingTask}
        />
      )}

      {activeTab === 'calendar' && (
        <ProjectCalendar 
          projects={projects}
          tasks={tasks}
        />
      )}

      {activeTab === 'reports' && (
        <ProjectReports 
          projects={projects}
          tasks={tasks}
          employees={employees}
        />
      )}

      {/* Modals */}
      <AddProjectModal 
        isOpen={isAddProjectModalOpen} 
        onClose={() => setIsAddProjectModalOpen(false)} 
      />

      <AddTaskModal 
        isOpen={isAddTaskModalOpen} 
        onClose={() => setIsAddTaskModalOpen(false)} 
      />

      {editingProject && (
        (() => {
          const project = projects.find(p => p.id === editingProject);
          return project ? (
            <EditProjectModal
              isOpen={!!editingProject}
              onClose={() => setEditingProject(null)}
              project={project}
            />
          ) : null;
        })()
      )}

      {editingTask && (
        (() => {
          const task = tasks.find(t => t.id === editingTask);
          return task ? (
            <EditTaskModal
              isOpen={!!editingTask}
              onClose={() => setEditingTask(null)}
              task={task}
            />
          ) : null;
        })()
      )}
    </div>
  );
}