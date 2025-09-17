import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Crown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Invoice } from '../../../contexts/DataContext';

interface TopClientsChartProps {
  invoices: Invoice[];
}

export default function TopClientsChart({ invoices }: TopClientsChartProps) {
  const [viewMode, setViewMode] = useState<'total' | 'paid' | 'unpaid'>('total');
  
  // Calculer les vraies données des clients à partir des factures
  const getTopClientsData = () => {
    if (!invoices || invoices.length === 0) return [];
    
    const clientStats = invoices.reduce((acc: any, invoice: Invoice) => {
      const clientName = invoice.client.name;
      if (!acc[clientName]) {
        acc[clientName] = {
          name: clientName,
          totalAmount: 0,
          paidAmount: 0,
          unpaidAmount: 0,
          invoiceCount: 0
        };
      }
      
      const amount = invoice.totalTTC;
      acc[clientName].totalAmount += amount;
      acc[clientName].invoiceCount += 1;
      
      if (invoice.status === 'paid' || invoice.status === 'collected') {
        acc[clientName].paidAmount += amount;
      } else {
        acc[clientName].unpaidAmount += amount;
      }
      
      return acc;
    }, {});
    
    return Object.values(clientStats)
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  };

  const topClientsData = getTopClientsData();
  
  const getChartData = () => {
    return topClientsData.map((client: any) => ({
      name: client.name.length > 15 ? client.name.substring(0, 15) + '...' : client.name,
      fullName: client.name,
      total: client.totalAmount,
      paid: client.paidAmount,
      unpaid: client.unpaidAmount,
      invoices: client.invoiceCount,
      paymentRate: client.totalAmount > 0 ? (client.paidAmount / client.totalAmount) * 100 : 0
    }));
  };

  const chartData = getChartData();
  const totalRevenue = topClientsData.reduce((sum: number, client: any) => sum + client.totalAmount, 0);
  const totalPaid = topClientsData.reduce((sum: number, client: any) => sum + client.paidAmount, 0);
  const totalUnpaid = topClientsData.reduce((sum: number, client: any) => sum + client.unpaidAmount, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.fullName}</p>
          <p className="text-sm text-gray-600">Total: {data.total.toLocaleString()} MAD</p>
          <p className="text-sm text-green-600">Payé: {data.paid.toLocaleString()} MAD</p>
          <p className="text-sm text-red-600">Non payé: {data.unpaid.toLocaleString()} MAD</p>
          <p className="text-sm text-gray-600">Factures: {data.invoices}</p>
          <p className="text-sm text-blue-600">Taux paiement: {data.paymentRate.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = () => {
    switch (viewMode) {
      case 'paid':
        return '#10B981';
      case 'unpaid':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  const getDataKey = () => {
    switch (viewMode) {
      case 'paid':
        return 'paid';
      case 'unpaid':
        return 'unpaid';
      default:
        return 'total';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top 10 Clients</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Classement par chiffre d'affaires</p>
        </div>
        
        {/* Toggle view mode */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'total' 
                ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Total
          </button>
          <button
            onClick={() => setViewMode('paid')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'paid' 
                ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Payé
          </button>
          <button
            onClick={() => setViewMode('unpaid')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'unpaid' 
                ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Non payé
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-lg font-bold text-blue-600">{totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300">MAD Total</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <div className="text-lg font-bold text-green-600">{totalPaid.toLocaleString()}</div>
          <div className="text-xs text-green-700 dark:text-green-300">MAD Payé</div>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
          <div className="text-lg font-bold text-red-600">{totalUnpaid.toLocaleString()}</div>
          <div className="text-xs text-red-700 dark:text-red-300">MAD Non payé</div>
        </div>
      </div>

      {/* Graphique */}
      {chartData.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number"
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="#6B7280"
                fontSize={11}
                width={75}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={getDataKey()}
                fill={getBarColor()}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune donnée client disponible</p>
          <p className="text-sm text-gray-400 mt-1">
            Créez des factures pour voir le classement de vos clients
          </p>
        </div>
      )}

      {/* Analyse des clients */}
      {topClientsData.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Analyse des Clients</h4>
          {topClientsData.slice(0, 3).map((client: any, index: number) => {
            const paymentRate = client.totalAmount > 0 ? (client.paidAmount / client.totalAmount) * 100 : 0;
            const isGoodPayer = paymentRate >= 80;
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index === 0 ? <Crown className="w-4 h-4" /> : `#${index + 1}`}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{client.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {client.invoiceCount} factures • {paymentRate.toFixed(1)}% payé
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {client.totalAmount.toLocaleString()} MAD
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {client.unpaidAmount > 0 ? `${client.unpaidAmount.toLocaleString()} MAD en attente` : 'Tout payé'}
                    </p>
                  </div>
                  {isGoodPayer ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}