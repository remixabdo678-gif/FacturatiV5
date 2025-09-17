import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';

interface MonthlySalesData {
  month: string;
  quantity: number;
  value: number;
  ordersCount: number;
}

interface MonthlySalesChartProps {
  data: MonthlySalesData[];
  selectedYear: number;
}

export default function MonthlySalesChart({ data, selectedYear }: MonthlySalesChartProps) {
  const [viewMode, setViewMode] = useState<'quantity' | 'value'>('value');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const maxQuantity = Math.max(...data.map(d => d.quantity), 1);
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  const getBarHeight = (item: MonthlySalesData) => {
    if (viewMode === 'quantity') {
      return (item.quantity / maxQuantity) * 100;
    } else {
      return (item.value / maxValue) * 100;
    }
  };

  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.ordersCount, 0);

  const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-gray-600">
            {viewMode === 'value' ? `Valeur: ${data.value.toLocaleString()} MAD` : `Quantité: ${data.quantity.toFixed(1)} unités`}
          </p>
          <p className="text-sm text-gray-600">Commandes: {data.ordersCount}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ventes Mensuelles {selectedYear}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Performance mensuelle détaillée</p>
        </div>
        
        {/* Toggle View Mode */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('value')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'value' 
                ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Valeur (MAD)
          </button>
          <button
            onClick={() => setViewMode('quantity')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'quantity' 
                ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Quantité
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-lg font-bold text-blue-600">{totalQuantity.toFixed(0)}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Quantité totale</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <div className="text-lg font-bold text-green-600">{totalValue.toLocaleString()}</div>
          <div className="text-xs text-green-700 dark:text-green-300">MAD total</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="text-lg font-bold text-purple-600">{averageOrderValue.toFixed(0)}</div>
          <div className="text-xs text-purple-700 dark:text-purple-300">MAD/commande</div>
        </div>
      </div>

      {/* Graphique avec Recharts */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month"
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => viewMode === 'value' ? `${(value / 1000).toFixed(0)}k` : value.toString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={viewMode === 'value' ? 'value' : 'quantity'}
              fill={viewMode === 'value' ? '#10B981' : '#3B82F6'}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Résumé de performance */}
      {data.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900 dark:text-purple-100">Performance {selectedYear}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-purple-900 dark:text-purple-100">
                Moyenne: {(totalValue / 12).toLocaleString()} MAD/mois
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300">
                {(totalQuantity / 12).toFixed(1)} unités/mois
              </div>
            </div>
          </div>
        </div>
      )}

      {data.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Aucune donnée de vente disponible</p>
        </div>
      )}
    </div>
  );
}