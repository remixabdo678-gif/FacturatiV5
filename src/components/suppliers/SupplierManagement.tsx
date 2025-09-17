import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSupplier } from '../../contexts/SupplierContext';
import { 
  Truck, 
  Crown,
  BarChart3,
  DollarSign, 
  FileText,
  Search,
  Download,
  Filter,
  LayoutDashboard,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Target,
  Users,
  Package,
  Activity,
  PieChart,
  TrendingDown
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import SupplierDistributionChart from './charts/SupplierDistributionChart';
import SupplierEvolutionChart from './charts/SupplierEvolutionChart';
import SupplierHeatmapChart from './charts/SupplierHeatmapChart';
import SupplierReliabilityChart from './charts/SupplierReliabilityChart';
import html2pdf from 'html2pdf.js';

export default function SupplierManagement() {
  const { user } = useAuth();
  const { 
    suppliers, 
    purchaseOrders, 
    supplierPayments, 
    getSupplierStats
  } = useSupplier();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Vérifier l'accès PRO
  const isProActive = user?.company.subscription === 'pro' && user?.company.expiryDate && 
    new Date(user.company.expiryDate) > new Date();

  if (!isProActive) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔒 Fonctionnalité PRO
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            La Gestion Avancée des Fournisseurs est réservée aux abonnés PRO. 
            Passez à la version PRO pour accéder à cette fonctionnalité avancée.
          </p>
          <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
            <span className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Passer à PRO - 299 MAD/mois</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Fonction pour filtrer les données selon la période
  const getFilteredData = () => {
    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const filteredOrders = purchaseOrders.filter(order => {
      const orderDate = new Date(order.date);
      const matchesPeriod = orderDate >= startDate;
      const matchesSupplier = selectedSupplier === 'all' || order.supplierId === selectedSupplier;
      return matchesPeriod && matchesSupplier;
    });

    const filteredPayments = supplierPayments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const matchesPeriod = paymentDate >= startDate;
      const matchesSupplier = selectedSupplier === 'all' || payment.supplierId === selectedSupplier;
      return matchesPeriod && matchesSupplier;
    });

    return { filteredOrders, filteredPayments };
  };

  const { filteredOrders, filteredPayments } = getFilteredData();

  // Calculs des statistiques globales
  const globalStats = useMemo(() => {
    const totalPurchases = filteredOrders.reduce((sum, order) => sum + order.totalTTC, 0);
    const totalPayments = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalBalance = totalPurchases - totalPayments;
    
    // Délai moyen de paiement
    const averagePaymentDelay = filteredOrders.length > 0 ? 
      filteredOrders.reduce((sum, order) => {
        const orderDate = new Date(order.date);
        const dueDate = new Date(order.dueDate);
        return sum + Math.max(0, (dueDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / filteredOrders.length : 0;

    return {
      totalSuppliers: suppliers.length,
      totalPurchases,
      totalPayments,
      totalBalance,
      averagePaymentDelay
    };
  }, [suppliers, filteredOrders, filteredPayments]);

  // Données pour les graphiques
  const supplierDistributionData = useMemo(() => {
    const colors = ['#EA580C', '#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    
    return suppliers.map((supplier, index) => {
      const supplierOrders = filteredOrders.filter(order => order.supplierId === supplier.id);
      const totalAmount = supplierOrders.reduce((sum, order) => sum + order.totalTTC, 0);
      
      return {
        name: supplier.name,
        value: totalAmount,
        color: colors[index % colors.length],
        percentage: globalStats.totalPurchases > 0 ? (totalAmount / globalStats.totalPurchases) * 100 : 0
      };
    }).filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [suppliers, filteredOrders, globalStats.totalPurchases]);

  const monthlyEvolutionData = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(currentDate, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthOrders = purchaseOrders.filter(order => {
        const orderDate = parseISO(order.date);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const monthPayments = supplierPayments.filter(payment => {
        const paymentDate = parseISO(payment.paymentDate);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });
      
      const ordersAmount = monthOrders.reduce((sum, order) => sum + order.totalTTC, 0);
      const paymentsAmount = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      months.push({
        month: format(date, 'MMM', { locale: fr }),
        orders: ordersAmount,
        payments: paymentsAmount,
        balance: ordersAmount - paymentsAmount
      });
    }
    
    return months;
  }, [purchaseOrders, supplierPayments]);

  const topSuppliersData = useMemo(() => {
    return suppliers.map(supplier => {
      const stats = getSupplierStats(supplier.id);
      const supplierOrders = filteredOrders.filter(order => order.supplierId === supplier.id);
      const supplierPaymentsData = filteredPayments.filter(payment => payment.supplierId === supplier.id);
      
      const periodPurchases = supplierOrders.reduce((sum, order) => sum + order.totalTTC, 0);
      const periodPayments = supplierPaymentsData.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        ...supplier,
        ...stats,
        periodPurchases,
        periodPayments,
        periodBalance: periodPurchases - periodPayments
      };
    }).filter(supplier => supplier.periodPurchases > 0)
      .sort((a, b) => b.periodPurchases - a.periodPurchases)
      .slice(0, 10);
  }, [suppliers, filteredOrders, filteredPayments, getSupplierStats]);

  const periods = [
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'quarter', label: 'Ce trimestre' },
    { id: 'year', label: 'Cette année' }
  ];

  const tabs = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'distribution', label: 'Répartition', icon: PieChart },
    { id: 'evolution', label: 'Évolution', icon: TrendingUp },
    { id: 'heatmap', label: 'Heatmap', icon: Activity },
    { id: 'analysis', label: 'Analyse Avancée', icon: Target }
  ];

  const getPeriodLabel = () => {
    const labels = {
      'week': 'cette semaine',
      'month': 'ce mois',
      'quarter': 'ce trimestre',
      'year': 'cette année'
    };
    return labels[selectedPeriod as keyof typeof labels] || 'cette période';
  };

  const handleExportPDF = () => {
    const reportContent = generateGlobalReportHTML();
    
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
      filename: `Tableau_Bord_Fournisseurs_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
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

  const generateGlobalReportHTML = () => {
    return `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #EA580C; padding-bottom: 20px;">
          <h1 style="font-size: 28px; color: #EA580C; margin: 0; font-weight: bold;">TABLEAU DE BORD FOURNISSEURS</h1>
          <h2 style="font-size: 20px; color: #1f2937; margin: 10px 0; font-weight: bold;">${user?.company?.name || ''}</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Période: ${getPeriodLabel()} - Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📊 Statistiques Globales</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b;">
              <p style="font-size: 14px; color: #92400e; margin: 0;"><strong>Total Fournisseurs:</strong> ${globalStats.totalSuppliers}</p>
            </div>
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #dc2626;">
              <p style="font-size: 14px; color: #991b1b; margin: 0;"><strong>Total Commandes:</strong> ${globalStats.totalPurchases.toLocaleString()} MAD</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a;">
              <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Total Paiements:</strong> ${globalStats.totalPayments.toLocaleString()} MAD</p>
            </div>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9;">
              <p style="font-size: 14px; color: #0c4a6e; margin: 0;"><strong>Balance Globale:</strong> ${globalStats.totalBalance.toLocaleString()} MAD</p>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">🏆 Top Fournisseurs</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">Nom</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Commandes TTC</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Paiements</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${topSuppliersData.map(supplier => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${supplier.name}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${supplier.totalPurchases.toLocaleString()} MAD</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${supplier.totalPayments.toLocaleString()} MAD</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb; ${supplier.balance > 0 ? 'color: #dc2626;' : 'color: #16a34a;'}">${supplier.balance.toLocaleString()} MAD</td>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <Truck className="w-8 h-8 text-orange-600" />
            <span>Tableau de Bord Fournisseurs</span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Vue d'ensemble complète avec analyses avancées, graphiques et KPIs. Fonctionnalité PRO.
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Filtres avancés */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Période d'analyse
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {periods.map(period => (
                <option key={period.id} value={period.id}>{period.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Truck className="w-4 h-4 inline mr-1" />
              Fournisseur
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tous les fournisseurs</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Rechercher..."
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedPeriod('month');
                setSelectedSupplier('all');
                setSearchTerm('');
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
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
                      ? 'border-orange-500 text-orange-600'
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

      {/* Contenu des onglets */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{globalStats.totalSuppliers}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Fournisseurs Total</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{globalStats.totalPurchases.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">MAD Commandes</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{globalStats.totalPayments.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">MAD Paiements</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  globalStats.totalBalance > 0 
                    ? 'bg-gradient-to-br from-red-500 to-pink-600' 
                    : globalStats.totalBalance < 0 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                      : 'bg-gradient-to-br from-gray-500 to-gray-600'
                }`}>
                  {globalStats.totalBalance > 0 ? (
                    <TrendingUp className="w-6 h-6 text-white" />
                  ) : globalStats.totalBalance < 0 ? (
                    <TrendingDown className="w-6 h-6 text-white" />
                  ) : (
                    <Target className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className={`text-2xl font-bold ${
                    globalStats.totalBalance > 0 ? 'text-red-600' : 
                    globalStats.totalBalance < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {globalStats.totalBalance.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">MAD Balance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau global des fournisseurs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tableau Global des Fournisseurs</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nom Fournisseur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Commandes TTC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Paiements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Délai Paiement
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {topSuppliersData.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{supplier.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ICE: {supplier.ice}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {supplier.totalPurchases.toLocaleString()} MAD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {supplier.totalPayments.toLocaleString()} MAD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-bold ${
                            supplier.balance > 0 ? 'text-red-600' : 
                            supplier.balance < 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {supplier.balance.toLocaleString()} MAD
                          </span>
                          {supplier.balance > 0 ? (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          ) : supplier.balance < 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Target className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {supplier.paymentTerms} jours
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {topSuppliersData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Aucune donnée pour la période sélectionnée</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'distribution' && (
        <SupplierDistributionChart 
          data={supplierDistributionData}
          totalPurchases={globalStats.totalPurchases}
        />
      )}

      {activeTab === 'evolution' && (
        <SupplierEvolutionChart data={monthlyEvolutionData} />
      )}

      {activeTab === 'heatmap' && (
        <SupplierHeatmapChart 
          suppliers={suppliers}
          purchaseOrders={purchaseOrders}
          supplierPayments={supplierPayments}
        />
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <SupplierReliabilityChart 
            suppliers={topSuppliersData}
            averagePaymentDelay={globalStats.averagePaymentDelay}
          />

          {/* Alertes et recommandations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Alertes et Recommandations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fournisseurs à payer */}
              {topSuppliersData.filter(s => s.balance > 0).length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-900 dark:text-red-100">Paiements en Attente</h4>
                  </div>
                  <div className="space-y-2">
                    {topSuppliersData.filter(s => s.balance > 0).slice(0, 3).map(supplier => (
                      <div key={supplier.id} className="flex justify-between text-sm">
                        <span className="text-red-800 dark:text-red-200">{supplier.name}</span>
                        <span className="font-bold text-red-900 dark:text-red-100">{supplier.balance.toLocaleString()} MAD</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fournisseurs fiables */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900 dark:text-green-100">Fournisseurs Fiables</h4>
                </div>
                <div className="space-y-2">
                  {topSuppliersData.filter(s => s.balance <= 0).slice(0, 3).map(supplier => (
                    <div key={supplier.id} className="flex justify-between text-sm">
                      <span className="text-green-800 dark:text-green-200">{supplier.name}</span>
                      <span className="font-bold text-green-900 dark:text-green-100">✅ À jour</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widget de synthèse rapide */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">📊 Synthèse Rapide - {getPeriodLabel()}</h3>
            <p className="text-sm opacity-90">
              {globalStats.totalSuppliers} fournisseurs • {filteredOrders.length} commandes • 
              Balance {globalStats.totalBalance > 0 ? 'due' : globalStats.totalBalance < 0 ? 'crédit' : 'équilibrée'}: {Math.abs(globalStats.totalBalance).toLocaleString()} MAD
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{globalStats.totalPurchases.toLocaleString()}</div>
            <div className="text-sm opacity-90">MAD Commandes</div>
          </div>
        </div>
      </div>
    </div>
  );
}