import React from 'react';
import { Invoice } from '../../contexts/DataContext';
import { AlertTriangle, Clock, TrendingDown, Users, Bell } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

interface FinancialAlertsProps {
  invoices: Invoice[];
}

export default function FinancialAlerts({ invoices }: FinancialAlertsProps) {
  // Factures en retard de plus de 30 jours
  const overdueInvoices = invoices.filter(invoice => {
    if (invoice.status !== 'unpaid' || !invoice.dueDate) return false;
    const dueDate = parseISO(invoice.dueDate);
    return differenceInDays(new Date(), dueDate) > 30;
  });

  // Calcul du taux de recouvrement
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
  const totalPaid = invoices
    .filter(inv => inv.status === 'paid' || inv.status === 'collected')
    .reduce((sum, inv) => sum + inv.totalTTC, 0);
  const recoveryRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

  // Clients avec le plus de retards
  const clientsWithDelays = invoices
    .filter(inv => inv.status === 'unpaid' && inv.dueDate)
    .reduce((acc, invoice) => {
      const clientName = invoice.client.name;
      if (!acc[clientName]) {
        acc[clientName] = { count: 0, totalAmount: 0 };
      }
      acc[clientName].count++;
      acc[clientName].totalAmount += invoice.totalTTC;
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);

  const topDelayedClients = Object.entries(clientsWithDelays)
    .sort(([,a], [,b]) => b.totalAmount - a.totalAmount)
    .slice(0, 3);

  const alerts = [];

  // Alerte factures en retard
  if (overdueInvoices.length > 0) {
    const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
    alerts.push({
      type: 'critical',
      icon: AlertTriangle,
      title: `${overdueInvoices.length} factures en retard`,
      description: `${totalOverdueAmount.toLocaleString()} MAD non encaissés depuis plus de 30 jours`,
      action: 'Relancer les clients'
    });
  }

  // Alerte taux de recouvrement faible
  if (recoveryRate < 60) {
    alerts.push({
      type: 'warning',
      icon: TrendingDown,
      title: 'Taux de recouvrement faible',
      description: `${recoveryRate.toFixed(1)}% seulement des factures sont payées`,
      action: 'Améliorer le suivi des paiements'
    });
  }

  // Alerte clients problématiques
  if (topDelayedClients.length > 0) {
    alerts.push({
      type: 'info',
      icon: Users,
      title: 'Clients à surveiller',
      description: `${topDelayedClients.length} clients cumulent des retards importants`,
      action: 'Contacter ces clients prioritairement'
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">🎉 Situation financière saine</h3>
            <p className="text-sm opacity-90">
              Aucune alerte détectée. Vos paiements sont à jour !
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Bell className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">Alertes Financières</h3>
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
          {alerts.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          const alertStyles = {
            critical: {
              bg: 'bg-red-50',
              border: 'border-red-200',
              iconBg: 'bg-red-500',
              textColor: 'text-red-800',
              titleColor: 'text-red-900'
            },
            warning: {
              bg: 'bg-yellow-50',
              border: 'border-yellow-200',
              iconBg: 'bg-yellow-500',
              textColor: 'text-yellow-800',
              titleColor: 'text-yellow-900'
            },
            info: {
              bg: 'bg-blue-50',
              border: 'border-blue-200',
              iconBg: 'bg-blue-500',
              textColor: 'text-blue-800',
              titleColor: 'text-blue-900'
            }
          };

          const style = alertStyles[alert.type as keyof typeof alertStyles];

          return (
            <div key={index} className={`${style.bg} ${style.border} border rounded-xl p-4 hover:shadow-md transition-all duration-200`}>
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 ${style.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${style.titleColor} mb-1`}>
                    {alert.title}
                  </h4>
                  <p className={`text-sm ${style.textColor} mb-2`}>
                    {alert.description}
                  </p>
                  <button className={`text-xs ${style.textColor} font-medium hover:underline`}>
                    {alert.action} →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Détails des factures en retard */}
      {overdueInvoices.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4">
            📋 Factures en Retard (+ de 30 jours)
          </h4>
          <div className="space-y-3">
            {overdueInvoices.slice(0, 5).map((invoice) => {
              const daysOverdue = invoice.dueDate ? 
                differenceInDays(new Date(), parseISO(invoice.dueDate)) : 0;
              
              return (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.number}</p>
                    <p className="text-sm text-gray-600">{invoice.client.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      {daysOverdue} jours de retard
                    </p>
                    <p className="text-sm text-gray-600">
                      {invoice.totalTTC.toLocaleString()} MAD
                    </p>
                  </div>
                </div>
              );
            })}
            
            {overdueInvoices.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  ... et {overdueInvoices.length - 5} autres factures en retard
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clients problématiques */}
      {topDelayedClients.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4">
            ⚠️ Clients avec Retards Récurrents
          </h4>
          <div className="space-y-3">
            {topDelayedClients.map(([clientName, data], index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{clientName}</p>
                    <p className="text-sm text-gray-600">{data.count} factures en retard</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">
                    {data.totalAmount.toLocaleString()} MAD
                  </p>
                  <p className="text-xs text-gray-500">En attente</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}