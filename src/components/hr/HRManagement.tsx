import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserCheck, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LayoutDashboard,
  Crown
} from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';
import AddOvertimeModal from './AddOvertimeModal';
import AddLeaveModal from './AddLeaveModal';
import EditEmployeeModal from './EditEmployeeModal';
import html2pdf from 'html2pdf.js';

export default function HRManagement() {
  const { employees, overtimes, leaves, deleteEmployee, deleteOvertime, deleteLeave } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAddOvertimeModalOpen, setIsAddOvertimeModalOpen] = useState(false);
  const [isAddLeaveModalOpen, setIsAddLeaveModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);

  // Vérifier l'accès PRO
  const isProActive = user?.company.subscription === 'pro' && user?.company.expiryDate && 
    new Date(user.company.expiryDate) > new Date();

  if (!isProActive) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔒 Fonctionnalité PRO
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            La Gestion Humaine est réservée aux abonnés PRO. 
            Passez à la version PRO pour accéder à cette fonctionnalité avancée.
          </p>
          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
            <span className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Passer à PRO - 299 MAD/mois</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Calculs pour le dashboard
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Filtrer par employé sélectionné
  const filteredOvertimes = selectedEmployee === 'all' 
    ? overtimes 
    : overtimes.filter(overtime => overtime.employeeId === selectedEmployee);

  const filteredLeaves = selectedEmployee === 'all' 
    ? leaves 
    : leaves.filter(leave => leave.employeeId === selectedEmployee);

  const filteredEmployees = selectedEmployee === 'all' 
    ? employees 
    : employees.filter(employee => employee.id === selectedEmployee);

  const monthlyOvertimes = filteredOvertimes.filter(overtime => {
    const overtimeDate = new Date(overtime.date);
    return overtimeDate.getMonth() === currentMonth && overtimeDate.getFullYear() === currentYear;
  });
  
  const totalOvertimeHours = monthlyOvertimes.reduce((sum, overtime) => sum + overtime.hours, 0);
  const totalOvertimeCost = monthlyOvertimes.reduce((sum, overtime) => sum + overtime.total, 0);
  
  const totalBaseSalary = filteredEmployees.reduce((sum, employee) => sum + employee.baseSalary, 0);
  const totalMonthlyCost = totalBaseSalary + totalOvertimeCost;
  
  const approvedLeaves = filteredLeaves.filter(leave => leave.status === 'approved');
  const totalLeaveDaysTaken = approvedLeaves.reduce((sum, leave) => sum + leave.days, 0);
  const totalLeaveAllowance = filteredEmployees.reduce((sum, employee) => sum + employee.annualLeaveDays, 0);
  const remainingLeaveDays = totalLeaveAllowance - totalLeaveDaysTaken;

  const searchFilteredEmployees = filteredEmployees.filter(employee =>
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmployeeOvertimeStats = (employeeId: string) => {
    const employeeOvertimes = monthlyOvertimes.filter(overtime => overtime.employeeId === employeeId);
    const hours = employeeOvertimes.reduce((sum, overtime) => sum + overtime.hours, 0);
    const cost = employeeOvertimes.reduce((sum, overtime) => sum + overtime.total, 0);
    return { hours, cost };
  };

  const getEmployeeLeaveStats = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    const employeeLeaves = approvedLeaves.filter(leave => leave.employeeId === employeeId);
    const daysTaken = employeeLeaves.reduce((sum, leave) => sum + leave.days, 0);
    const daysRemaining = (employee?.annualLeaveDays || 0) - daysTaken;
    return { daysTaken, daysRemaining, totalAllowed: employee?.annualLeaveDays || 0 };
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      deleteEmployee(id);
    }
  };

  const handleDeleteOvertime = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ces heures supplémentaires ?')) {
      deleteOvertime(id);
    }
  };

  const handleDeleteLeave = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce congé ?')) {
      deleteLeave(id);
    }
  };

  const exportHRReport = () => {
    const reportContent = generateHRReportHTML();
    
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
      filename: `Rapport_RH_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
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

  const generateHRReportHTML = () => {
    return `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #059669; padding-bottom: 20px;">
          <h1 style="font-size: 28px; color: #059669; margin: 0; font-weight: bold;">RAPPORT DE GESTION HUMAINE</h1>
          <h2 style="font-size: 20px; color: #1f2937; margin: 10px 0; font-weight: bold;">${employees[0]?.entrepriseId || ''}</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <!-- Statistiques globales -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📊 Statistiques Globales</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9;">
              <p style="font-size: 14px; color: #0c4a6e; margin: 0;"><strong>Total Employés:</strong> ${employees.length}</p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b;">
              <p style="font-size: 14px; color: #92400e; margin: 0;"><strong>Masse Salariale:</strong> ${totalBaseSalary.toLocaleString()} MAD</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a;">
              <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Heures Sup. ce mois:</strong> ${totalOvertimeHours}h</p>
            </div>
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #dc2626;">
              <p style="font-size: 14px; color: #991b1b; margin: 0;"><strong>Congés pris:</strong> ${totalLeaveDaysTaken} jours</p>
            </div>
          </div>
        </div>
        
        <!-- Liste des employés -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">👥 Liste du Personnel</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">Nom</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Poste</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Salaire</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Congés Restants</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(employee => {
                const leaveStats = getEmployeeLeaveStats(employee.id);
                return `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #e5e7eb;">${employee.firstName} ${employee.lastName}</td>
                    <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${employee.position}</td>
                    <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${employee.baseSalary.toLocaleString()} MAD</td>
                    <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${leaveStats.daysRemaining}/${leaveStats.totalAllowed} jours</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Personnel', icon: Users },
    { id: 'overtime', label: 'Heures Sup.', icon: Clock },
    { id: 'leaves', label: 'Congés', icon: Calendar }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <UserCheck className="w-8 h-8 text-blue-600" />
            <span>Gestion Humaine</span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            La section Gestion Humaine vous permet de suivre vos employés, leurs heures supplémentaires et leurs congés. Fonctionnalité réservée aux abonnés PRO.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par employé
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tous les employés</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} - {employee.position}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={exportHRReport}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
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
                      ? 'border-blue-500 text-blue-600'
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredEmployees.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedEmployee === 'all' ? 'Employés Total' : 'Employé Sélectionné'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalOvertimeHours}h</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Heures Sup. ce mois</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalMonthlyCost.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Coût Total (MAD)</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{remainingLeaveDays}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Jours Congés Restants</p>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Répartition des Coûts {selectedEmployee !== 'all' && `- ${employees.find(e => e.id === selectedEmployee)?.firstName} ${employees.find(e => e.id === selectedEmployee)?.lastName}`}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Salaires de base</span>
                  <span className="font-bold text-blue-600">{totalBaseSalary.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Heures supplémentaires</span>
                  <span className="font-bold text-amber-600">{totalOvertimeCost.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-t-2 border-gray-300 dark:border-gray-600">
                  <span className="font-bold text-gray-900 dark:text-gray-100">Total mensuel</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{totalMonthlyCost.toLocaleString()} MAD</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Congés {selectedEmployee !== 'all' && `- ${employees.find(e => e.id === selectedEmployee)?.firstName} ${employees.find(e => e.id === selectedEmployee)?.lastName}`}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Total alloué</span>
                  <span className="font-bold text-green-600">{totalLeaveAllowance} jours</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Jours pris</span>
                  <span className="font-bold text-red-600">{totalLeaveDaysTaken} jours</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-t-2 border-gray-300 dark:border-gray-600">
                  <span className="font-bold text-gray-900 dark:text-gray-100">Jours restants</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{remainingLeaveDays} jours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personnel Tab */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Personnel</h2>
            <button
              onClick={() => setIsAddEmployeeModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Employé</span>
            </button>
          </div>

          {/* Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Rechercher par nom, poste ou email..."
              />
            </div>
          </div>

          {/* Employees Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Poste
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Salaire Base
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Heures Sup. (mois)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Congés
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {searchFilteredEmployees.map((employee) => {
                    const overtimeStats = getEmployeeOvertimeStats(employee.id);
                    const leaveStats = getEmployeeLeaveStats(employee.id);
                    
                    return (
                      <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{employee.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {employee.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {employee.baseSalary.toLocaleString()} MAD
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {overtimeStats.hours}h
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {overtimeStats.cost.toLocaleString()} MAD
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {leaveStats.daysRemaining}/{leaveStats.totalAllowed}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {leaveStats.daysTaken} pris
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setEditingEmployee(employee.id)}
                              className="text-amber-600 hover:text-amber-700 transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {searchFilteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Aucun employé trouvé</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overtime Tab */}
      {activeTab === 'overtime' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Heures Supplémentaires</h2>
            <button
              onClick={() => setIsAddOvertimeModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter Heures Sup.</span>
            </button>
          </div>

          {/* Overtime Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Heures
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Taux
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOvertimes.map((overtime) => (
                    <tr key={overtime.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {overtime.employee.firstName} {overtime.employee.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(overtime.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {overtime.hours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {overtime.rate} MAD/h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {overtime.total.toLocaleString()} MAD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <button
                          onClick={() => handleDeleteOvertime(overtime.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOvertimes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedEmployee === 'all' 
                    ? 'Aucune heure supplémentaire enregistrée' 
                    : 'Aucune heure supplémentaire pour cet employé'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaves Tab */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gestion des Congés</h2>
            <button
              onClick={() => setIsAddLeaveModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Congé</span>
            </button>
          </div>

          {/* Leaves Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Période
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Durée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {leave.employee.firstName} {leave.employee.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          leave.type === 'annual' ? 'bg-blue-100 text-blue-800' :
                          leave.type === 'sick' ? 'bg-red-100 text-red-800' :
                          leave.type === 'maternity' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {leave.type === 'annual' ? 'Annuel' :
                           leave.type === 'sick' ? 'Maladie' :
                           leave.type === 'maternity' ? 'Maternité' : 'Autre'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(leave.startDate).toLocaleDateString('fr-FR')} - {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {leave.days} jour{leave.days > 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                          leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.status === 'approved' ? 'Approuvé' :
                           leave.status === 'rejected' ? 'Refusé' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <button
                          onClick={() => handleDeleteLeave(leave.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLeaves.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedEmployee === 'all' 
                    ? 'Aucun congé enregistré' 
                    : 'Aucun congé pour cet employé'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEmployeeModal 
        isOpen={isAddEmployeeModalOpen} 
        onClose={() => setIsAddEmployeeModalOpen(false)} 
      />

      <AddOvertimeModal 
        isOpen={isAddOvertimeModalOpen} 
        onClose={() => setIsAddOvertimeModalOpen(false)} 
      />

      <AddLeaveModal 
        isOpen={isAddLeaveModalOpen} 
        onClose={() => setIsAddLeaveModalOpen(false)} 
      />

      {editingEmployee && (
        <EditEmployeeModal
          isOpen={!!editingEmployee}
          onClose={() => setEditingEmployee(null)}
          employee={employees.find(emp => emp.id === editingEmployee)!}
        />
      )}
    </div>
  );
}