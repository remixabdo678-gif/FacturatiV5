import React from 'react';
import { Project, Task, Employee } from '../../contexts/DataContext';
import { 
  FolderKanban, 
  Clock, 
  Users, 
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface ProjectDashboardProps {
  projects: Project[];
  tasks: Task[];
  employees: Employee[];
}

export default function ProjectDashboard({ projects, tasks, employees }: ProjectDashboardProps) {
  // --- Stats globales
  const totalProjects = projects.length;                                 // ✅ FIX
  const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);

  const activeProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const overdueProjects = projects.filter(p => p.status === 'overdue');
  const pendingProjects = projects.filter(p => p.status === 'pending');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const overdueTasks = tasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'completed');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');

  const averageProgress = projects.length > 0 
    ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length
    : 0;

  // Projets urgents (deadline ≤ 7 jours)
  const urgentProjects = projects.filter(project => {
    const endDate = new Date(project.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0 && project.status !== 'completed';
  });

  // Top employés par tâches
  const employeeTaskStats = employees
    .map(employee => {
      const employeeTasks = tasks.filter(task => task.assignedTo === employee.id);
      const completedCount = employeeTasks.filter(task => task.status === 'completed').length;
      const inProgressCount = employeeTasks.filter(task => task.status === 'in_progress').length;
      return {
        ...employee,
        totalTasks: employeeTasks.length,
        completedTasks: completedCount,
        inProgressTasks: inProgressCount,
        completionRate: employeeTasks.length > 0 ? (completedCount / employeeTasks.length) * 100 : 0
      };
    })
    .filter(emp => emp.totalTasks > 0)
    .sort((a, b) => b.totalTasks - a.totalTasks)
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">En attente</span>;
      case 'in_progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">En cours</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Terminé</span>;
      case 'overdue':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">En retard</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">🔴 Haute</span>;
      case 'medium':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">🟡 Moyenne</span>;
      case 'low':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">🟢 Basse</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 dark:bg-gray-900">
      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalTasks}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Tâches Total</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {completedTasks.length} terminées • {inProgressTasks.length} en cours
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(averageProgress)}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Progression Moyenne</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-700"
                style={{ width: `${averageProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalBudget.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Budget Total (MAD)</p>
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

      {/* Projets urgents + Équipe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projets urgents */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Projets Urgents</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Deadline dans les 7 prochains jours</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            {urgentProjects.length > 0 ? (
              urgentProjects.map((project) => {
                const endDate = new Date(project.endDate);
                const today = new Date();
                const diffTime = endDate.getTime() - today.getTime();
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{project.client?.name ?? '—'}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{project.progress}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-red-600">
                        {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-red-700">restant{daysLeft > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucun projet urgent</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Tous vos projets sont dans les temps !</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance équipe */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance de l'Équipe</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Top employés par tâches</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            {employeeTaskStats.length > 0 ? (
              employeeTaskStats.map((employee, index) => (
                <div key={employee.id} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{employee.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{employee.totalTasks}</div>
                    <div className="text-xs text-blue-700">{employee.completionRate.toFixed(0)}% terminé</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucune tâche assignée</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projets récents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Projets Récents</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Projet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Progression</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {projects.slice(0, 5).map((project) => {
                const endDate = new Date(project.endDate);
                const today = new Date();
                const isOverdue = endDate < today && project.status !== 'completed';
                const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{(project.description ?? '').substring(0, 50)}{project.description && project.description.length > 50 ? '…' : ''}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{project.client?.name ?? '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              project.progress >= 80 ? 'bg-green-500' :
                              project.progress >= 50 ? 'bg-blue-500' :
                              project.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(project.budget || 0).toLocaleString()} MAD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-900 dark:text-gray-100'}`}>
                        {endDate.toLocaleDateString('fr-FR')}
                      </div>
                      {!isOverdue && daysLeft <= 7 && daysLeft > 0 && (
                        <div className="text-xs text-orange-600 font-medium">
                          {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''}
                        </div>
                      )}
                      {isOverdue && (
                        <div className="text-xs text-red-600 font-bold">
                          Retard de {Math.abs(daysLeft)} jour{Math.abs(daysLeft) > 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(project.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <FolderKanban className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors duration-300" />
            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Aucun projet créé</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 transition-colors duration-300">Créez votre premier projet pour commencer</p>
          </div>
        )}
      </div>

      {/* Alertes */}
      {(overdueProjects.length > 0 || overdueTasks.length > 0 || urgentProjects.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">🚨 Alertes Importantes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {overdueProjects.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-red-300">
                <p className="font-bold text-red-900">{overdueProjects.length} projet{overdueProjects.length > 1 ? 's' : ''} en retard</p>
                <p className="text-sm text-red-700">Action immédiate requise</p>
              </div>
            )}
            {overdueTasks.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-red-300">
                <p className="font-bold text-red-900">{overdueTasks.length} tâche{overdueTasks.length > 1 ? 's' : ''} en retard</p>
                <p className="text-sm text-red-700">Réassigner ou reporter</p>
              </div>
            )}
            {urgentProjects.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-orange-300">
                <p className="font-bold text-orange-900">{urgentProjects.length} projet{urgentProjects.length > 1 ? 's' : ''} urgent{urgentProjects.length > 1 ? 's' : ''}</p>
                <p className="text-sm text-orange-700">Deadline proche</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Résumé de performance */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">📊 Résumé de Performance</h3>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Commencez à utiliser Facturati pour voir vos activités ici
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalBudget.toLocaleString()}</div>
            <div className="text-sm opacity-90">MAD Budget Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}
