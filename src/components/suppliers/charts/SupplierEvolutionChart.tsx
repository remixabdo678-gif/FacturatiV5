import React, { useState  } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area  } from 'recharts';
import { TrendingUp, BarChart3, Activity, Calendar  } from 'lucide-react';

interface EvolutionData {
  month: string;
  orders: number;
  payments: number;
  balance: number;
}

interface SupplierEvolutionChartProps {
  data: EvolutionData[];
}

export default function SupplierEvolutionChart({ data }: SupplierEvolutionChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [viewMode, setViewMode] = useState<'absolute' | 'cumulative'>('absolute');

  // Calculer les données cumulatives
  const cumulativeData = data.reduce((acc, item, index) => {
    const prevOrders = index > 0 ? acc[index - 1].cumulativeOrders : 0;
    const prevPayments = index > 0 ? acc[index - 1].cumulativePayments : 0;
    
    acc.push({
      ...item,
      cumulativeOrders: prevOrders + item.orders,
      cumulativePayments: prevPayments + item.payments,
      cumulativeBalance: (prevOrders + item.orders) - (prevPayments + item.payments)
    });
    
    return acc;
  }, [] as any[]);

  const chartData = viewMode === 'cumulative' ? cumulativeData : data;

  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const totalPayments = data.reduce((sum, item) => sum + item.payments, 0);
  const finalBalance = totalOrders - totalPayments;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} MAD
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Évolution Commandes vs Paiements</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Analyse mensuelle sur 12 mois</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Indicateur de tendance */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              finalBalance > 0 ? 'bg-red-100 text-red-800' : 
              finalBalance < 0 ? 'bg-green-100 text-green-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {finalBalance > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : finalBalance < 0 ? (
                <TrendingUp className="w-4 h-4 rotate-180" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {finalBalance > 0 ? 'Dette' : finalBalance < 0 ? 'Crédit' : 'Équilibré'}
              </span>
            </div>

            {/* Toggle view mode */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('absolute')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'absolute' 
                    ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setViewMode('cumulative')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'cumulative' 
                    ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Cumulé
              </button>
            </div>

            {/* Toggle chart type */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  chartType === 'area' 
                    ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  chartType === 'line' 
                    ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-lg font-bold text-blue-600">{totalOrders.toLocaleString()}</div>
            <div className="text-xs text-blue-700 dark:text-blue-300">Total Commandes</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-lg font-bold text-green-600">{totalPayments.toLocaleString()}</div>
            <div className="text-xs text-green-700">Total Paiements</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-lg font-bold text-orange-600">
              {Math.abs(finalBalance).toLocaleString()}
            </div>
            <div className="text-xs text-orange-700 dark:text-orange-300">Différence (MAD)</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="text-lg font-bold text-purple-600">
              {data.length > 0 ? (totalOrders / data.length).toFixed(0) : '0'}
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300">Moyenne mensuelle</div>
          </div>
        </div>

        {/* Graphique */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="paymentsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey={viewMode === 'cumulative' ? 'cumulativeOrders' : 'orders'}
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#ordersGradient)"
                  name="Commandes"
                />
                <Area
                  type="monotone"
                  dataKey={viewMode === 'cumulative' ? 'cumulativePayments' : 'payments'}
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#paymentsGradient)"
                  name="Paiements"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={viewMode === 'cumulative' ? 'cumulativeOrders' : 'orders'}
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  name="Commandes"
                />
                <Line
                  type="monotone"
                  dataKey={viewMode === 'cumulative' ? 'cumulativePayments' : 'payments'}
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                  name="Paiements"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Analyse de tendance */}
        <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                finalBalance > 0 ? 'bg-red-500' : finalBalance < 0 ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                {finalBalance > 0 ? (
                  <TrendingUp className="w-5 h-5 text-white" />
                ) : finalBalance < 0 ? (
                  <TrendingUp className="w-5 h-5 text-white rotate-180" />
                ) : (
                  <Activity className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {finalBalance > 0 ? 'Augmentation des dettes' : 
                   finalBalance < 0 ? 'Excédent de paiements' : 'Équilibre parfait'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Balance finale: {finalBalance.toLocaleString()} MAD
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                {data.length > 0 ? (totalOrders / data.length).toFixed(0) : '0'} MAD
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">Moyenne mensuelle</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}