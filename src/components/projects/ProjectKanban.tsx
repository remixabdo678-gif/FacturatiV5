import React, { useState } from 'react';
import { useData, Project, Task, Employee } from '../../contexts/DataContext';
import { 
  FolderKanban, 
  Calendar, 
  Users, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Edit,
  MoreVertical,
  User,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectKanbanProps {
  projects: Project[];
  tasks: Task[];
  employees: Employee[];
  onEditTask: (taskId: string) => void;
  onEditProject: (projectId: string) => void;
}

const COLUMNS = [
  { id: 'pending', title: 'À faire', color: 'bg-gray-100 dark:bg-gray-700', textColor: 'text-gray-700 dark:text-gray-300' },
  { id: 'in_progress', title: 'En cours', color: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-300' },
  { id: 'overdue', title: 'En attente', color: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-300' },
  { id: 'completed', title: 'Terminé', color: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-300' }
];

export default function ProjectKanban({ projects, tasks, employees, onEditTask, onEditProject }: ProjectKanbanProps) {
  const { updateProject } = useData();
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (columnId: string) => {
    setHoveredColumn(columnId);
  };

  const handleDragLeave = () => {
    setHoveredColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setHoveredColumn(null);
    
    if (draggedProject && draggedProject.status !== newStatus) {
      try {
        await updateProject(draggedProject.id, { 
          status: newStatus as Project['status']
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    }
    setDraggedProject(null);
  };

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => project.status === status);
  };

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'À faire' };
      case 'in_progress':
        return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'En cours' };
      case 'overdue':
        return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: 'En attente' };
      case 'completed':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Terminé' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Inconnu' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const getDeadlineStatus = (endDate: string, status: string) => {
    if (status === 'completed') return { color: 'text-green-600', urgent: false };
    
    const deadline = new Date(endDate);
    const today = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { color: 'text-red-600', urgent: true };
    } else if (daysLeft <= 3) {
      return { color: 'text-orange-600', urgent: true };
    } else {
      return { color: 'text-gray-600 dark:text-gray-400', urgent: false };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Kanban des Projets</h2>
          <p className="text-gray-600 dark:text-gray-300">Glissez-déposez les projets pour changer leur statut</p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{projects.length} projets total</span>
          <span>•</span>
          <span>{tasks.length} tâches</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map((column) => {
          const columnProjects = getProjectsByStatus(column.id);
          const isHovered = hoveredColumn === column.id;
          
          return (
            <div
              key={column.id}
              className={`${column.color} rounded-xl p-4 min-h-96 transition-all duration-300 ${
                isHovered ? 'ring-2 ring-purple-400 shadow-lg' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className={`font-semibold ${column.textColor} transition-colors duration-300`}>
                    {column.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${column.textColor} bg-white dark:bg-gray-800 transition-colors duration-300`}>
                    {columnProjects.length}
                  </span>
                </div>
              </div>

              {/* Project Cards */}
              <div className="space-y-3">
                <AnimatePresence>
                  {columnProjects.map((project) => {
                    const projectTasks = getProjectTasks(project.id);
                    const completedTasks = projectTasks.filter(task => task.status === 'completed');
                    const deadlineStatus = getDeadlineStatus(project.endDate, project.status);
                    
                    return (
                      <motion.div
                        key={project.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{ scale: 1.02 }}
                        whileDrag={{ scale: 1.05, rotate: 2 }}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 ${getPriorityColor(project.priority)} p-4 cursor-move hover:shadow-md transition-all duration-300 group`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, project)}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight transition-colors duration-300">
                            {project.name}
                          </h4>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => onEditProject(project.id)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-300"
                              title="Modifier le projet"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Client */}
                        <div className="flex items-center space-x-2 mb-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                            {project.client.name}
                          </span>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center space-x-2 mb-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className={`text-xs ${deadlineStatus.color} transition-colors duration-300`}>
                            {new Date(project.startDate).toLocaleDateString('fr-FR')} - {new Date(project.endDate).toLocaleDateString('fr-FR')}
                          </span>
                          {deadlineStatus.urgent && (
                            <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
                          )}
                        </div>

                        {/* Budget */}
                        <div className="flex items-center space-x-2 mb-3">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                            {project.budget.toLocaleString()} MAD
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">Progression</span>
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 transition-colors duration-300">
                            <motion.div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                project.progress >= 80 ? 'bg-green-500' :
                                project.progress >= 50 ? 'bg-blue-500' :
                                project.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${project.progress}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                        </div>

                        {/* Tasks Summary */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <Target className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                              {completedTasks.length}/{projectTasks.length} tâches
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {project.priority === 'high' && <span className="text-red-500">🔴</span>}
                            {project.priority === 'medium' && <span className="text-yellow-500">🟡</span>}
                            {project.priority === 'low' && <span className="text-green-500">🟢</span>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Empty State */}
              {columnProjects.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors duration-300">
                    <FolderKanban className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    Aucun projet
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">Légende du Kanban</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Priorités</h5>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">🔴 Haute priorité</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">🟡 Priorité moyenne</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">🟢 Basse priorité</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Utilisation</h5>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 transition-colors duration-300">
              <p>• Glissez-déposez les cartes entre colonnes</p>
              <p>• Cliquez sur l'icône ✏️ pour modifier un projet</p>
              <p>• La barre de progression se met à jour automatiquement</p>
              <p>• Les dates en rouge indiquent un retard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}