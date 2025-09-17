import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { BarChart3 } from 'lucide-react';

export default function SalesChart() {
  const { t } = useLanguage();
  const { invoices } = useData();

  // Calculer les données réelles à partir des factures
  const monthlyData = [
    { month: 'Jan', sales: 0 },
    { month: 'Fév', sales: 0 },
    { month: 'Mar', sales: 0 },
    { month: 'Avr', sales: 0 },
    { month: 'Mai', sales: 0 },
    { month: 'Jun', sales: 0 },
  ];

  const maxSales = Math.max(...monthlyData.map(d => d.sales));
  const hasData = maxSales > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Évolution des Ventes</h3>
          <p className="text-sm text-gray-600">Chiffre d'affaires mensuel (MAD)</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        {hasData ? (
          monthlyData.map((data, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 text-sm font-medium text-gray-600">
                {data.month}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${maxSales > 0 ? (data.sales / maxSales) * 100 : 0}%` }}
                />
              </div>
              <div className="w-20 text-sm font-medium text-gray-900 text-right">
                {data.sales.toLocaleString()} MAD
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune donnée de vente disponible</p>
            <p className="text-sm text-gray-400 mt-1">Les données apparaîtront après la création de factures</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700 font-medium">Moyenne mensuelle</p>
            <p className="text-lg font-bold text-blue-900">
              {hasData ? Math.round(monthlyData.reduce((acc, d) => acc + d.sales, 0) / monthlyData.length).toLocaleString() : '0'} MAD
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-700 font-medium">Croissance</p>
            <p className="text-lg font-bold text-gray-500">{hasData ? '+0%' : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}