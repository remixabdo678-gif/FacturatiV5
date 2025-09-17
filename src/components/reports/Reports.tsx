import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, DollarSign, Calendar, Download } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import FinancialAlerts from './FinancialAlerts';
import FinancialKPIs from './FinancialKPIs';
import CashflowChart from './charts/CashflowChart';
import RevenueEvolutionChart from './charts/RevenueEvolutionChart';
import PaymentStatusChart from './charts/PaymentStatusChart';
import PaymentMethodChart from './charts/PaymentMethodChart';
import PaymentDelayChart from './charts/PaymentDelayChart';
import TopClientsChart from './charts/TopClientsChart';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { invoices } = useData();
  const { user } = useAuth();

  // Vérifier l'accès PRO
  const isProActive = user?.company.subscription === 'pro' && user?.company.expiryDate && 
    new Date(user.company.expiryDate) > new Date();

  if (!isProActive) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔒 Fonctionnalité PRO
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            La Gestion Financière est réservée aux abonnés PRO. 
            Passez à la version PRO pour accéder à cette fonctionnalité avancée.
          </p>
          <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
            <span className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Passer à PRO - 299 MAD/mois</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Préparer les données d'évolution du chiffre d'affaires avec les vraies données
  const revenueEvolutionData = useMemo(() => {
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    return months.map((month, index) => {
      // Revenus année actuelle
      const currentYearRevenue = invoices
        .filter(invoice => {
          const invoiceDate = new Date(invoice.date);
          return invoiceDate.getMonth() === index && 
                 invoiceDate.getFullYear() === currentYear &&
                 (invoice.status === 'paid' || invoice.status === 'collected');
        })
        .reduce((sum, invoice) => sum + invoice.totalTTC, 0);

      // Revenus année précédente
      const previousYearRevenue = invoices
        .filter(invoice => {
          const invoiceDate = new Date(invoice.date);
          return invoiceDate.getMonth() === index && 
                 invoiceDate.getFullYear() === previousYear &&
                 (invoice.status === 'paid' || invoice.status === 'collected');
        })
        .reduce((sum, invoice) => sum + invoice.totalTTC, 0);

      return {
        month,
        currentYear: currentYearRevenue,
        previousYear: previousYearRevenue,
        date: `${currentYear}-${String(index + 1).padStart(2, '0')}-01`
      };
    });
  }, [invoices]);

  // Préparer les données de statut de paiement avec les vraies données
  const paymentStatusData = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return [
        { name: 'Payées', value: 0, amount: 0, percentage: 0, color: '#10B981' },
        { name: 'Non payées', value: 0, amount: 0, percentage: 0, color: '#EF4444' },
        { name: 'Encaissées', value: 0, amount: 0, percentage: 0, color: '#F59E0B' }
      ];
    }

    // Grouper par statut réel des factures
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
    const collectedInvoices = invoices.filter(inv => inv.status === 'collected');
    
    const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
    const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
    const collectedAmount = collectedInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
    
    const totalAmount = paidAmount + unpaidAmount + collectedAmount;

    const data = [
      { 
        name: 'Payées', 
        value: paidInvoices.length, 
        amount: paidAmount,
        color: '#10B981' 
      },
      { 
        name: 'Non payées', 
        value: unpaidInvoices.length, 
        amount: unpaidAmount,
        color: '#EF4444' 
      },
      { 
        name: 'Encaissées', 
        value: collectedInvoices.length, 
        amount: collectedAmount,
        color: '#F59E0B' 
      }
    ];

    // Calculate percentages
    return data.map(item => ({
      ...item,
      percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
    }));
  }, [invoices]);

  // Préparer les données de mode de paiement avec les vraies données
  const paymentMethodData = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return [];
    }

    const paidInvoices = invoices.filter(inv => 
      (inv.status === 'paid' || inv.status === 'collected') && inv.paymentMethod
    );

    if (paidInvoices.length === 0) {
      return [];
    }

    const methodStats = paidInvoices.reduce((acc: any, invoice) => {
      const method = invoice.paymentMethod || 'virement';
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 };
      }
      acc[method].count += 1;
      acc[method].amount += invoice.totalTTC;
      return acc;
    }, {});

    const totalAmount = Object.values(methodStats).reduce((sum: number, stat: any) => sum + stat.amount, 0);
    
    const methodLabels: Record<string, string> = {
      'virement': 'Virement',
      'espece': 'Espèces',
      'cheque': 'Chèque',
      'effet': 'Effet'
    };

    return Object.entries(methodStats).map(([method, stats]: [string, any]) => ({
      name: methodLabels[method] || method,
      value: stats.amount,
      count: stats.count,
      percentage: totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0
    })).filter(item => item.value > 0);
  }, [invoices]);

  // Préparer les données de retard de paiement avec les vraies données
  const paymentDelayData = useMemo(() => {
    if (!invoices || invoices.length === 0) return [];
    
    // Filtrer les factures en retard
    const overdueInvoices = invoices.filter(invoice => {
      if (invoice.status !== 'unpaid' || !invoice.dueDate) return false;
      const dueDate = new Date(invoice.dueDate);
      return new Date() > dueDate;
    });

    if (overdueInvoices.length === 0) return [];
    
    // Grouper par client
    const clientDelayStats = overdueInvoices.reduce((acc: any, invoice) => {
      const clientName = invoice.client.name;
      const dueDate = new Date(invoice.dueDate!);
      const currentDate = new Date();
      const delayDays = Math.max(0, Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      if (!acc[clientName]) {
        acc[clientName] = {
          clientName,
          totalAmount: 0,
          averageDelay: 0,
          invoiceCount: 0,
          totalDelay: 0
        };
      }
      
      acc[clientName].totalAmount += invoice.totalTTC;
      acc[clientName].invoiceCount += 1;
      acc[clientName].totalDelay += delayDays;
      acc[clientName].averageDelay = acc[clientName].totalDelay / acc[clientName].invoiceCount;
      
      return acc;
    }, {});
    
    return Object.values(clientDelayStats)
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }, [invoices]);

  const periods = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-green-600" />
            <span>Gestion Financière</span>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">PRO</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Analyses financières complètes et KPIs de performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPIs Financiers */}
      <FinancialKPIs invoices={invoices || []} />

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueEvolutionChart data={revenueEvolutionData} />
        <CashflowChart invoices={invoices || []} />
      </div>

      {/* Top Clients */}
      <TopClientsChart invoices={invoices || []} />

      {/* Analyses de paiement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentStatusChart data={paymentStatusData} />
        {paymentMethodData.length > 0 && (
          <PaymentMethodChart data={paymentMethodData} />
        )}
      </div>

      {/* Retards de paiement */}
      {paymentDelayData.length > 0 && (
        <PaymentDelayChart data={paymentDelayData} />
      )}

      {/* Alertes financières */}
      <FinancialAlerts invoices={invoices || []} />
    </div>
  );
};

export default Reports;