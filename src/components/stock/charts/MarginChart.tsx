import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface MarginData {
  productName: string;
  margin: number;
  salesValue: number;
  purchaseValue: number;
  unit: string;
}

interface MarginChartProps {
  data: MarginData[];
}

export default function MarginChart({ data }: MarginChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  const maxAbsMargin = Math.max(...data.map(d => Math.abs(d.margin)));
  const totalMargin = data.reduce((sum, item) => sum + item.margin, 0);
  const profitableProducts = data.filter(d => d.margin > 0).length;

  const getBarWidth = (margin: number) => {
    return maxAbsMargin > 0 ? (Math.abs(margin) / maxAbsMargin) * 100 : 0;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Marge Brute par Produit</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Analyse de la rentabilité</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${totalMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalMargin >= 0 ? '+' : ''}{totalMargin.toLocaleString()} MAD
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {profitableProducts}/{data.length} produits rentables
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
              hoveredBar === index 
                ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 shadow-md' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            onMouseEnter={() => setHoveredBar(index)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.productName}</h4>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Vente: {item.salesValue.toLocaleString()} MAD</span>
                  <span>Achat: {item.purchaseValue.toLocaleString()} MAD</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${item.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.margin >= 0 ? '+' : ''}{item.margin.toLocaleString()} MAD
                </div>
                <div className="text-xs text-gray-500">
                  {item.salesValue > 0 ? ((item.margin / item.salesValue) * 100).toFixed(1) : '0'}% marge
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    item.margin >= 0 
                      ? 'bg-gradient-to-r from-green-400 to-green-500' 
                      : 'bg-gradient-to-r from-red-400 to-red-500'
                  }`}
                  style={{ 
                    width: `${getBarWidth(item.margin)}%`,
                    animationDelay: `${index * 0.1}s`
                  }}
                />
              </div>
              
              {/* Indicateur de performance */}
              <div className="absolute -top-1 -right-1">
                {item.margin >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            {/* Détails au survol */}
            {hoveredBar === index && (
              <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-purple-600 shadow-sm">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{item.salesValue.toLocaleString()}</div>
                    <div className="text-gray-500 dark:text-gray-400">Chiffre d'affaires</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-orange-600">{item.purchaseValue.toLocaleString()}</div>
                    <div className="text-gray-500 dark:text-gray-400">Coût d'achat</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-bold ${item.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.margin >= 0 ? '+' : ''}{item.margin.toLocaleString()}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Marge nette</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Aucune donnée de marge disponible</p>
        </div>
      )}
    </div>
  );
}