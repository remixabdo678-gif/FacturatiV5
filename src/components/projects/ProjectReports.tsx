import React, { useState } from 'react';
import { Project, Task, Employee } from '../../contexts/DataContext';
import { 
  FileText, 
  Download, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Target,
  Calendar,
  Activity
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface ProjectReportsProps {
  projects: Project[];
  tasks: Task[];
  employees: Employee[];
}

export default function ProjectReports({ projects, tasks, employees }: ProjectReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedProject, setSelectedProject] = useState('all');

  // Calculs des métriques
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const completedProjects = projects.filter(p => p.status === 'completed');
  const activeProjects = projects.filter(p => p.status === 'in_progress');
  const overdueProjects = projects.filter(p => p.status === 'overdue');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const overdueTasks = tasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'completed');

  const averageProgress = projects.length > 0 ? 
    projects.reduce((sum, project) => sum + project.progress, 0) / projects.length : 0;

  // Calcul du temps estimé vs réel
  const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

  // Projets par statut
  const projectsByStatus = [
    { name: 'En attente', value: projects.filter(p => p.status === 'pending').length, color: '#6B7280' },
    { name: 'En cours', value: activeProjects.length, color: '#3B82F6' },
    { name: 'Terminés', value: completedProjects.length, color: '#10B981' },
    { name: 'En retard', value: overdueProjects.length, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Rentabilité par projet (estimation)
  const projectProfitability = projects.map(project => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const totalHours = projectTasks.reduce((sum, task) => sum + (task.actualHours || task.estimatedHours || 0), 0);
    const estimatedCost = totalHours * 200; // 200 MAD/heure estimé
    const profit = project.budget - estimatedCost;
    const profitMargin = project.budget > 0 ? (profit / project.budget) * 100 : 0;
    
    return {
      ...project,
      estimatedCost,
      profit,
      profitMargin,
      totalHours
    };
  }).sort((a, b) => b.profitMargin - a.profitMargin);

  // Performance des employés
  const employeePerformance = employees.map(employee => {
    const employeeTasks = tasks.filter(task => task.assignedTo === employee.id);
    const completedCount = employeeTasks.filter(task => task.status === 'completed').length;
    const overdueCount = employeeTasks.filter(task => 
      new Date(task.deadline) < new Date() && task.status !== 'completed'
    ).length;
    const totalHours = employeeTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
    
    return {
      ...employee,
      totalTasks: employeeTasks.length,
      completedTasks: completedCount,
      overdueTasks: overdueCount,
      totalHours,
      completionRate: employeeTasks.length > 0 ? (completedCount / employeeTasks.length) * 100 : 0,
      efficiency: employeeTasks.length > 0 ? ((completedCount - overdueCount) / employeeTasks.length) * 100 : 0
    };
  }).filter(emp => emp.totalTasks > 0)
    .sort((a, b) => b.efficiency - a.efficiency);

  const handleExportPDF = () => {
    const reportContent = generateProjectReportHTML();
    
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '0';
    tempDiv.style.left = '0';
    tempDiv.style.width = '210mm';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.zIndex = '-1';
    tempDiv.style.opacity = '0';
    tempDiv.innerHTML = reportContent;
    document.body.appendChild(tempDiv);

    const options = {
      margin: [10, 10, 10, 10],
      filename: `Rapport_Projets_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    html2pdf()
      .set(options)
      .from(tempDiv)
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
      })
      .catch((error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
        alert('Erreur lors de la génération du PDF');
      });
  };

  const generateProjectReportHTML = () => {
    return `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #8B5CF6; padding-bottom: 20px;">
          <h1 style="font-size: 28px; color: #8B5CF6; margin: 0; font-weight: bold;">RAPPORT DE GESTION DE PROJET</h1>
          <h2 style="font-size: 20px; color: #1f2937; margin: 10px 0; font-weight: bold;">${projects[0]?.entrepriseId || ''}</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📊 Statistiques Globales</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #8B5CF6;">
              <p style="font-size: 14px; color: #5B21B6; margin: 0;"><strong>Total Projets:</strong> ${projects.length}</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a;">
              <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Projets Terminés:</strong> ${completedProjects.length}</p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b;">
              <p style="font-size: 14px; color: #92400e; margin: 0;"><strong>Budget Total:</strong> ${totalBudget.toLocaleString()} MAD</p>
            </div>
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #dc2626;">
              <p style="font-size: 14px; color: #991b1b; margin: 0;"><strong>Progression Moyenne:</strong> ${averageProgress.toFixed(0)}%</p>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">🏆 Top Projets par Rentabilité</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">Projet</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Budget</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Coût Estimé</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Marge</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Progression</th>
              </tr>
            </thead>
            <tbody>
              ${projectProfitability.slice(0, 10).map(project => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${project.name}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${project.budget.toLocaleString()} MAD</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${project.estimatedCost.toLocaleString()} MAD</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb; color: ${project.profit >= 0 ? '#16a34a' : '#dc2626'};">${project.profit >= 0 ? '+' : ''}${project.profit.toLocaleString()} MAD</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${project.progress}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Rapports et Analytiques</h2>
          <p className="text-gray-600 dark:text-gray-300">Analyse détaillée de la performance des projets</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{projects.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Projets Total</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {completedProjects.length} terminés • {activeProjects.length} actifs
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{averageProgress.toFixed(0)}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Progression Moyenne</p>
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalEstimatedHours}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Heures Estimées</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {totalActualHours}h réelles
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des projets par statut */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">Répartition par Statut</h3>
          <div className="space-y-4">
            {projectsByStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">{item.value}</span>
                  <div className="text-xs text-gray-500">
                    {projects.length > 0 ? ((item.value / projects.length) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance des employés */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">Performance Équipe</h3>
          <div className="space-y-4">
            {employeePerformance.slice(0, 5).map((employee, index) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{employee.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    {employee.efficiency.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    {employee.completedTasks}/{employee.totalTasks} tâches
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analyse de rentabilité */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Analyse de Rentabilité</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Projet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Coût Estimé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Profit Estimé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Marge (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Heures
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Progression
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {projectProfitability.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">{project.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{project.client.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    {project.budget.toLocaleString()} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    {project.estimatedCost.toLocaleString()} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-bold ${
                      project.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {project.profit >= 0 ? '+' : ''}{project.profit.toLocaleString()} MAD
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-bold ${
                      project.profitMargin >= 20 ? 'text-green-600' :
                      project.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {project.profitMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.totalHours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 transition-colors duration-300">
                        <div 
                          className={`h-2 rounded-full ${
                            project.progress >= 80 ? 'bg-green-500' :
                            project.progress >= 50 ? 'bg-blue-500' :
                            project.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">{project.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {projectProfitability.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors duration-300" />
            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Aucune donnée de rentabilité disponible</p>
          </div>
        )}
      </div>

      {/* Résumé exécutif */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{projects.length}</div>
            <div className="text-sm opacity-90">Projets Gérés</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{totalBudget.toLocaleString()}</div>
            <div className="text-sm opacity-90">MAD Budget Total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{averageProgress.toFixed(0)}%</div>
            <div className="text-sm opacity-90">Progression Moyenne</div>
          </div>
        </div>
      </div>
    </div>
  );
}