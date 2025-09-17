import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Building2, TrendingUp, Eye, EyeOff } from 'lucide-react';

interface DistributionData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface SupplierDistributionChartProps {
  data: DistributionData[];
  totalPurchases: number;
}

export default function SupplierDistributionChart({ data, totalPurchases }: SupplierDistributionChartProps) {
  const [hiddenSuppliers, setHiddenSuppliers] = useState<Set<number>>(new Set());
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const visibleData = data.filter((_, index) => !hiddenSuppliers.has(index));
  const visibleTotal = visibleData.reduce((sum, item) => sum + item.value, 0);

  const toggleSupplier = (index: number) => {
    const newHidden = new Set(hiddenSuppliers);
    if (newHidden.has(index)) {
      newHidden.delete(index);
    } else {
      newHidden.add(index);
    }
    setHiddenSuppliers(newHidden);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.name}</p>
          <p className="text-sm text-gray-600">Montant: {data.value.toLocaleString()} MAD</p>
          <p className="text-sm text-gray-600">Part: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Graphique de répartition */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Répartition des Commandes par Fournisseur</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Analyse de la distribution des achats</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalPurchases.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">MAD Total</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique en camembert */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibleData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={(_, index) => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  {visibleData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={hoveredSegment === index ? '#374151' : 'none'}
                      strokeWidth={hoveredSegment === index ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Légende interactive */}
          <div className="space-y-3">
            {data.map((supplier, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  hiddenSuppliers.has(index) 
                    ? 'bg-gray-50 opacity-50' 
                    : hoveredSegment === index 
                      ? 'bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-600' 
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => toggleSupplier(index)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full transition-all duration-200"
                    style={{ backgroundColor: supplier.color }}
                  />
                  <div>
                    <p className={`font-medium ${hiddenSuppliers.has(index) ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {supplier.name}
                    </p>
                    <p className={`text-sm ${hiddenSuppliers.has(index) ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                      {supplier.percentage.toFixed(1)}% du total
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${hiddenSuppliers.has(index) ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {supplier.value.toLocaleString()} MAD
                    </p>
                  </div>
                  <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                    {hiddenSuppliers.has(index) ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analyse de concentration */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Concentration des Achats</span>
            </h4>
            <div className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
              <p>Top 3 fournisseurs: {data.slice(0, 3).reduce((sum, s) => sum + s.percentage, 0).toFixed(1)}%</p>
              <p>Fournisseur principal: {data[0]?.name || 'N/A'}</p>
              <p>Diversification: {data.length > 5 ? 'Bonne' : data.length > 2 ? 'Moyenne' : 'Faible'}</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Statistiques</span>
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>Fournisseurs actifs: {data.length}</p>
              <p>Montant moyen: {data.length > 0 ? (totalPurchases / data.length).toFixed(0) : '0'} MAD</p>
              <p>Écart-type: {data.length > 1 ? calculateStandardDeviation(data.map(d => d.value)).toFixed(0) : '0'} MAD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fonction utilitaire pour calculer l'écart-type
function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
  const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(variance);
}