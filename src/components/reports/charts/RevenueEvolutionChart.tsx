import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

interface RevenueData {
  month: string;
  currentYear: number;
  previousYear: number;
  date: string;
}

interface RevenueEvolutionChartProps {
  data: RevenueData[];
}

export default function RevenueEvolutionChart({ data }: RevenueEvolutionChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  
  const currentYearTotal = data?.reduce((sum, item) => sum + item.currentYear, 0) || 0;
  const previousYearTotal = data?.reduce((sum, item) => sum + item.previousYear, 0) || 0;
  const growthRate = previousYearTotal > 0 ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100 : 0;

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

  // Vérifier s'il y a des données réelles
  const hasRealData = data && data.length > 0 && data.some(item => item.currentYear > 0 || item.previousYear > 0);

  if (!hasRealData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Évolution du Chiffre d'Affaires</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Comparaison sur 12 mois (année actuelle vs précédente)</p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Données insuffisantes
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Créez des factures payées pour voir l'évolution de votre chiffre d'affaires
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Astuce :</strong> Les données apparaîtront automatiquement après avoir créé et marqué des factures comme "payées" ou "encaissées".
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Évolution du Chiffre d'Affaires</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Comparaison sur 12 mois (année actuelle vs précédente)</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Indicateur de croissance */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            growthRate > 0 ? 'bg-green-100 text-green-800' : 
            growthRate < 0 ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {growthRate > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : growthRate < 0 ? (
              <TrendingUp className="w-4 h-4 rotate-180" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </span>
          </div>

          {/* Toggle chart type */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === 'area' 
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === 'line' 
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-lg font-bold text-blue-600">{currentYearTotal.toLocaleString()}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Année actuelle</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="text-lg font-bold text-gray-600 dark:text-gray-300">{previousYearTotal.toLocaleString()}</div>
          <div className="text-xs text-gray-700 dark:text-gray-400">Année précédente</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <div className="text-lg font-bold text-green-600">
            {Math.abs(currentYearTotal - previousYearTotal).toLocaleString()}
          </div>
          <div className="text-xs text-green-700 dark:text-green-300">Différence (MAD)</div>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="text-lg font-bold text-purple-600">
            {data && data.length > 0 ? (currentYearTotal / data.length).toFixed(0) : '0'}
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-300">Moyenne mensuelle</div>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="currentYearGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="previousYearGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B7280" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6B7280" stopOpacity={0.1}/>
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
                dataKey="currentYear"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#currentYearGradient)"
                name="Année actuelle"
              />
              <Area
                type="monotone"
                dataKey="previousYear"
                stroke="#6B7280"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#previousYearGradient)"
                name="Année précédente"
              />
            </AreaChart>
          ) : (
            <LineChart data={data || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                dataKey="currentYear"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                name="Année actuelle"
              />
              <Line
                type="monotone"
                dataKey="previousYear"
                stroke="#6B7280"
                strokeWidth={2}
                dot={{ fill: '#6B7280', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#6B7280', strokeWidth: 2 }}
                name="Année précédente"
                strokeDasharray="5 5"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Analyse de tendance */}
      <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              growthRate > 0 ? 'bg-green-500' : growthRate < 0 ? 'bg-red-500' : 'bg-gray-500'
            }`}>
              {growthRate > 0 ? (
                <TrendingUp className="w-5 h-5 text-white" />
              ) : growthRate < 0 ? (
                <TrendingUp className="w-5 h-5 text-white rotate-180" />
              ) : (
                <Activity className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {growthRate > 0 ? 'Croissance positive' : 
                 growthRate < 0 ? 'Décroissance' : 'Stabilité'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}% vs année précédente
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {Math.abs(currentYearTotal - previousYearTotal).toLocaleString()} MAD
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">Écart absolu</p>
          </div>
        </div>
      </div>
    </div>
  );
}