import React, { useState } from 'react';
import { Calendar, Thermometer, Filter, TrendingUp } from 'lucide-react';

interface SupplierHeatmapChartProps {
  suppliers: any[];
  purchaseOrders: any[];
  supplierPayments: any[];
}

export default function SupplierHeatmapChart({ suppliers, purchaseOrders, supplierPayments }: SupplierHeatmapChartProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'orders' | 'payments'>('orders');
  const [hoveredCell, setHoveredCell] = useState<{ month: number; supplier: string } | null>(null);

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const availableYears = [...new Set([
    ...purchaseOrders.map(order => new Date(order.date).getFullYear()),
    ...supplierPayments.map(payment => new Date(payment.paymentDate).getFullYear())
  ])].sort((a, b) => b - a);

  // Générer les données de la heatmap
  const generateHeatmapData = () => {
    const data: any[] = [];
    let maxValue = 0;

    suppliers.forEach(supplier => {
      months.forEach((month, monthIndex) => {
        let value = 0;
        let count = 0;

        if (viewMode === 'orders') {
          const monthOrders = purchaseOrders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.getMonth() === monthIndex && 
                   orderDate.getFullYear() === selectedYear &&
                   order.supplierId === supplier.id;
          });
          value = monthOrders.reduce((sum, order) => sum + order.totalTTC, 0);
          count = monthOrders.length;
        } else {
          const monthPayments = supplierPayments.filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate.getMonth() === monthIndex && 
                   paymentDate.getFullYear() === selectedYear &&
                   payment.supplierId === supplier.id;
          });
          value = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
          count = monthPayments.length;
        }

        maxValue = Math.max(maxValue, value);
        
        data.push({
          supplier: supplier.name,
          month: monthIndex,
          monthName: month,
          value,
          count,
          intensity: 0 // sera calculé après
        });
      });
    });

    // Calculer l'intensité (0-1)
    return data.map(item => ({
      ...item,
      intensity: maxValue > 0 ? item.value / maxValue : 0
    }));
  };

  const heatmapData = generateHeatmapData();

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100';
    
    const colors = [
      'bg-orange-100',    // 0-20%
      'bg-orange-200',    // 20-40%
      'bg-orange-300',    // 40-60%
      'bg-orange-400',    // 60-80%
      'bg-orange-500'     // 80-100%
    ];
    
    const colorIndex = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
    return colors[colorIndex];
  };

  const getCellData = (supplier: string, month: number) => {
    return heatmapData.find(d => d.supplier === supplier && d.month === month);
  };

  const getTooltipContent = (cellData: any) => {
    if (!cellData || cellData.value === 0) {
      return {
        title: `${cellData?.supplier || ''} - ${cellData?.monthName || ''}`,
        content: `Aucun${viewMode === 'orders' ? 'e commande' : ' paiement'}`
      };
    }

    return {
      title: `${cellData.supplier} - ${cellData.monthName}`,
      content: `${cellData.value.toLocaleString()} MAD • ${cellData.count} ${viewMode === 'orders' ? 'commande' : 'paiement'}${cellData.count > 1 ? 's' : ''}`
    };
  };

  const monthlyTotals = months.map((month, monthIndex) => {
    const monthData = heatmapData.filter(d => d.month === monthIndex);
    return monthData.reduce((sum, d) => sum + d.value, 0);
  });

  const supplierTotals = suppliers.map(supplier => {
    const supplierData = heatmapData.filter(d => d.supplier === supplier.name);
    return {
      name: supplier.name,
      total: supplierData.reduce((sum, d) => sum + d.value, 0)
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
     
      

      {/* Analyse des tendances mensuelles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Top Mois {selectedYear}</span>
          </h4>
          <div className="space-y-3">
            {monthlyTotals
              .map((total, index) => ({ month: months[index], total, index }))
              .sort((a, b) => b.total - a.total)
              .slice(0, 6)
              .map((item, rank) => (
                <div key={item.index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                      rank === 0 ? 'bg-yellow-500' : rank === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {rank + 1}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.month}</span>
                  </div>
                  <span className="font-bold text-blue-600">{item.total.toLocaleString()} MAD</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span>Top Fournisseurs {selectedYear}</span>
          </h4>
          <div className="space-y-3">
            {supplierTotals.slice(0, 6).map((supplier, index) => (
              <div key={supplier.name} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{supplier.name}</span>
                </div>
                <span className="font-bold text-orange-600">{supplier.total.toLocaleString()} MAD</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights et recommandations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
          <Thermometer className="w-5 h-5 text-red-600" />
          <span>Insights et Recommandations</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📊 Saisonnalité</h5>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p>Mois le plus actif: {months[monthlyTotals.indexOf(Math.max(...monthlyTotals))]}</p>
                <p>Mois le moins actif: {months[monthlyTotals.indexOf(Math.min(...monthlyTotals))]}</p>
                <p>Écart saisonnier: {((Math.max(...monthlyTotals) - Math.min(...monthlyTotals)) / Math.max(...monthlyTotals) * 100).toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">🎯 Performance</h5>
              <div className="text-sm text-green-800 dark:text-green-200">
                <p>Fournisseurs réguliers: {suppliers.filter(s => {
                  const supplierData = heatmapData.filter(d => d.supplier === s.name);
                  const activeMonths = supplierData.filter(d => d.value > 0).length;
                  return activeMonths >= 6;
                }).length}</p>
                <p>Concentration: {supplierTotals.length > 0 ? ((supplierTotals[0].total / supplierTotals.reduce((sum, s) => sum + s.total, 0)) * 100).toFixed(1) : 0}% sur le top 1</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <h5 className="font-medium text-amber-900 dark:text-amber-100 mb-2">⚠️ Points d'Attention</h5>
              <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <p>• Diversifiez vos fournisseurs si concentration &gt; 50%</p>
                <p>• Négociez les prix avec vos fournisseurs principaux</p>
                <p>• Planifiez les achats selon la saisonnalité</p>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-2">🚀 Optimisations</h5>
              <div className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                <p>• Groupez les commandes des mois creux</p>
                <p>• Négociez des remises sur volume</p>
                <p>• Établissez des contrats annuels</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}