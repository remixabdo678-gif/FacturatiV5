import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Product } from '../../contexts/DataContext';
import { BarChart3, TrendingUp, TrendingDown, Package, Calendar } from 'lucide-react';

interface StockEvolutionChartProps {
  product: Product;
}

export default function StockEvolutionChart({ product }: StockEvolutionChartProps) {
  const { stockMovements, invoices } = useData();
  
  // Générer l'historique complet du produit
  const generateProductHistory = () => {
    const history = [];
    
    // 1. Stock initial
    if (product.initialStock > 0) {
      history.push({
        id: `initial-${product.id}`,
        type: 'initial',
        date: product.createdAt,
        quantity: product.initialStock,
        previousStock: 0,
        newStock: product.initialStock,
        reason: 'Stock initial',
        userName: 'Système'
      });
      
    }
    
    // 2. Ventes (depuis les factures)
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (item.description === product.name) {
          const previousMovements = history.filter(h => new Date(h.date) <= new Date(invoice.date));
          const previousStock = previousMovements.length > 0 
            ? previousMovements[previousMovements.length - 1].newStock 
            : product.initialStock;
          
          history.push({
            id: `sale-${invoice.id}-${item.id}`,
            type: 'sale',
            date: invoice.date,
            quantity: -item.quantity,
            previousStock,
            newStock: previousStock - item.quantity,
            reason: 'Vente',
            userName: 'Système'
          });
        }
      });
    });
    
    // 3. Rectifications (depuis les mouvements de stock)
    const adjustments = stockMovements.filter(m => 
      m.productId === product.id && m.type === 'adjustment'
    );
    
    adjustments.forEach(adjustment => {
      history.push({
        id: adjustment.id,
        type: 'adjustment',
        date: adjustment.date,
        quantity: adjustment.quantity,
        previousStock: adjustment.previousStock,
        newStock: adjustment.newStock,
        reason: adjustment.reason || 'Rectification',
        userName: adjustment.userName
      });
    });
    
    // Trier par date
    return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const history = generateProductHistory();
  
  // Générer les données pour les 30 derniers jours
  const generateChartData = () => {
    const days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Trouver le stock à cette date
      const dayMovements = history.filter(movement => {
        const movementDate = new Date(movement.date);
        return movementDate <= date;
      });
      
      const stock = dayMovements.length > 0 ? 
        dayMovements[dayMovements.length - 1].newStock : 
        product.initialStock || 0;
      
      days.push({
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        stock,
        isToday: i === 0
      });
    }
    
    return days;
  };

  const chartData = generateChartData();
  const maxStock = Math.max(...chartData.map(d => d.stock), 1);
  const minStock = Math.min(...chartData.map(d => d.stock), 0);
  const currentStock = chartData[chartData.length - 1]?.stock || 0;
  const previousStock = chartData[chartData.length - 2]?.stock || 0;
  const trend = currentStock - previousStock;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Évolution du Stock - {product.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">30 derniers jours</p>
          {chartData.length > 1 ? (
            chartData[chartData.length - 1].stock > chartData[chartData.length - 2].stock ? (
        
        <div className="flex items-center space-x-2">
          {trend > 0 ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : trend < 0 ? (
            <TrendingDown className="w-5 h-5 text-red-500" />
          ) : (
            <Package className="w-5 h-5 text-gray-500" />
          )}
          <span className={`text-sm font-medium ${
            chartData.length > 1 && chartData[chartData.length - 1].stock > chartData[chartData.length - 2].stock ? 'text-green-600' : 'text-red-600'
          }`}>
      {chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-600">
            <div className="text-lg font-bold text-blue-600">{(product.initialStock || 0).toFixed(3)}</div>
            <div className="text-xs text-blue-700 dark:text-blue-300">Stock initial</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-600">
            <div className="text-lg font-bold text-red-600">
              {invoices.reduce((sum, invoice) => {
                return sum + invoice.items
                  .filter(item => item.description === product.name)
                  .reduce((itemSum, item) => itemSum + item.quantity, 0);
              }, 0).toFixed(3)}
            </div>
            <div className="text-xs text-red-700 dark:text-red-300">Total vendu</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-600">
            <div className="text-lg font-bold text-green-600">
              {chartData.length > 0 ? chartData[chartData.length - 1].stock.toFixed(3) : '0'}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">Stock actuel</div>
          </div>
        </div>
      )}

      {/* Graphique */}
      <div className="h-32 flex items-end space-x-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        {chartData.map((point, index) => {
          const height = maxStock > 0 ? (point.stock / maxStock) * 100 : 0;
          const isLowStock = point.stock <= product.minStock;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t transition-all duration-500 hover:opacity-80 ${
                  point.isToday 
                    ? 'bg-gradient-to-t from-purple-400 to-purple-500 ring-2 ring-purple-300' 
                    : isLowStock 
                      ? 'bg-gradient-to-t from-red-400 to-red-500'
                      : 'bg-gradient-to-t from-blue-400 to-blue-500'
                }`}
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${point.date}: ${point.stock.toFixed(1)} ${product.unit}`}
              />
              {index % 5 === 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45 origin-left">
                  {point.date}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ligne de seuil minimum */}
      <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="w-3 h-3 bg-red-400 rounded"></div>
        <span>Stock en dessous du seuil minimum ({product.minStock.toFixed(1)} {product.unit})</span>
      </div>
    </div>
  );
}