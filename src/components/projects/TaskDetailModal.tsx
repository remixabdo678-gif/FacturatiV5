import React from 'react';
import { Task, Project, Employee } from '../../contexts/DataContext';
import { useData } from '../../contexts/DataContext';
import { 
  X, 
  Calendar, 
  User, 
  FolderKanban, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  Edit,
  Flag,
  FileText
} from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onEdit: () => void;
}

export default function TaskDetailModal({ isOpen, onClose, task, onEdit }: TaskDetailModalProps) {
  const { projects, employees } = useData();
  
  if (!isOpen) return null;

  const project = projects.find(p => p.id === task.projectId);
  const assignedEmployee = employees.find(emp => emp.id === task.assignedTo);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 transition-colors duration-300">
            <Clock className="w-4 h-4 mr-2" />
            À faire
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 transition-colors duration-300">
            <Target className="w-4 h-4 mr-2" />
            En cours
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 transition-colors duration-300">
            <CheckCircle className="w-4 h-4 mr-2" />
            Terminé
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 transition-colors duration-300">
            <Flag className="w-4 h-4 mr-2" />
            🔴 Haute
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 transition-colors duration-300">
            <Flag className="w-4 h-4 mr-2" />
            🟡 Moyenne
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 transition-colors duration-300">
            <Flag className="w-4 h-4 mr-2" />
            🟢 Basse
          </span>
        );
      default:
        return null;
    }
  };

  const getDeadlineStatus = (deadline: string, status: string) => {
    if (status === 'completed') return { color: 'text-green-600', text: 'Terminé à temps', urgent: false };
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { color: 'text-red-600 font-bold', text: `En retard de ${Math.abs(daysLeft)} jour${Math.abs(daysLeft) > 1 ? 's' : ''}`, urgent: true };
    } else if (daysLeft <= 3) {
      return { color: 'text-orange-600 font-medium', text: `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`, urgent: true };
    } else {
      return { color: 'text-gray-600 dark:text-gray-400', text: `${daysLeft} jours restants`, urgent: false };
    }
  };

  const deadlineStatus = getDeadlineStatus(task.deadline, task.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Détails de la Tâche</h3>
                  <p className="text-sm opacity-90">{task.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onEdit}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status and Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
              </div>
              {deadlineStatus.urgent && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">Urgent</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-300">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-2 transition-colors duration-300">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Description</span>
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-300">
                {task.description || 'Aucune description fournie'}
              </p>
            </div>

            {/* Project and Assignment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700 transition-colors duration-300">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 flex items-center space-x-2 transition-colors duration-300">
                    <FolderKanban className="w-4 h-4" />
                    <span>Projet</span>
                  </h4>
                  <div className="text-sm text-purple-800 dark:text-purple-200 transition-colors duration-300">
                    <p className="font-medium">{project?.name || 'Projet non trouvé'}</p>
                    <p className="text-xs mt-1">Client: {project?.client.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700 transition-colors duration-300">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2 transition-colors duration-300">
                    <User className="w-4 h-4" />
                    <span>Assigné à</span>
                  </h4>
                  <div className="text-sm text-blue-800 dark:text-blue-200 transition-colors duration-300">
                    <p className="font-medium">
                      {assignedEmployee ? 
                        `${assignedEmployee.firstName} ${assignedEmployee.lastName}` : 
                        'Non assigné'
                      }
                    </p>
                    <p className="text-xs mt-1">
                      {assignedEmployee?.position || 'Poste non défini'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700 transition-colors duration-300">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center space-x-2 transition-colors duration-300">
                    <Calendar className="w-4 h-4" />
                    <span>Échéance</span>
                  </h4>
                  <div className="text-sm text-green-800 dark:text-green-200 transition-colors duration-300">
                    <p className="font-medium">{new Date(task.deadline).toLocaleDateString('fr-FR')}</p>
                    <p className={`text-xs mt-1 ${deadlineStatus.color} transition-colors duration-300`}>
                      {deadlineStatus.text}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700 transition-colors duration-300">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2 flex items-center space-x-2 transition-colors duration-300">
                    <Clock className="w-4 h-4" />
                    <span>Temps de travail</span>
                  </h4>
                  <div className="text-sm text-amber-800 dark:text-amber-200 transition-colors duration-300">
                    <p>Estimé: {task.estimatedHours || 0}h</p>
                    <p>Réel: {task.actualHours || 0}h</p>
                    {task.estimatedHours && task.actualHours && (
                      <p className="text-xs mt-1">
                        Efficacité: {((task.estimatedHours / task.actualHours) * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-300">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-300">Chronologie</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    Tâche créée le {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {task.status === 'completed' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      Tâche terminée
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                Fermer
              </button>
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200"
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}