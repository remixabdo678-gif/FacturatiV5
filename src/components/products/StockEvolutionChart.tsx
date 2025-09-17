import React from 'react';
import { motion } from 'framer-motion';
import { useStock } from '../../contexts/StockContext';
import { Product } from '../../contexts/DataContext';
import { BarChart3, TrendingUp, TrendingDown, Package, Calendar, Clock, Activity } from 'lucide-react';

interface StockEvolutionChartProps {
  product: Product;
}

export default function StockEvolutionChart({ product }: StockEvolutionChartProps) {
  const { getProductStockHistory } = useStock();
  
  const history = getProductStockHistory(product.id);
  
  // Générer les données avec points de mouvement
  const generateChartData = () => {
    // Utiliser directement l'historique des mouvements pour créer la courbe
    return history.slice(0, 30).reverse().map((movement, index) => ({
      date: new Date(movement.dateTime).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      dateTime: movement.dateTime,
      stock: movement.newStock,
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      userName: movement.userName,
      isRecent: index >= history.length - 5
    }));
  };

  const chartData = generateChartData();
  const maxStock = Math.max(...chartData.map(d => d.stock), product.minStock, 1);
  const minStock = Math.min(...chartData.map(d => d.stock), 0);
  const currentStock = chartData[chartData.length - 1]?.stock || 0;
  const previousStock = chartData[chartData.length - 2]?.stock || 0;
  const trend = currentStock - previousStock;

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-red-500';
      case 'adjustment':
        return 'bg-purple-500';
      case 'initial':
        return 'bg-blue-500';
      case 'return':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Évolution du Stock - {product.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Derniers mouvements avec date/heure</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {trend > 0 ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : trend < 0 ? (
            <TrendingDown className="w-5 h-5 text-red-500" />
          ) : (
            <Package className="w-5 h-5 text-gray-500" />
          )}
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)} {product.unit}
          </span>
        </div>
      </div>

      {/* Statistiques rapides */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-4 gap-4 mb-6"
      >
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
        >
          <div className="text-lg font-bold text-blue-600">{currentStock.toFixed(1)}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Stock actuel</div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
        >
          <div className="text-lg font-bold text-green-600">{maxStock.toFixed(1)}</div>
          <div className="text-xs text-green-700 dark:text-green-300">Maximum</div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700"
        >
          <div className="text-lg font-bold text-red-600">{minStock.toFixed(1)}</div>
          <div className="text-xs text-red-700 dark:text-red-300">Minimum</div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700"
        >
          <div className="text-lg font-bold text-purple-600">{history.length}</div>
          <div className="text-xs text-purple-700 dark:text-purple-300">Mouvements</div>
        </motion.div>
      </motion.div>

      {/* Graphique */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="h-40 relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-hidden"
      >
        {/* Ligne de seuil minimum */}
        <div 
          className="absolute left-4 right-4 border-t-2 border-dashed border-red-400 z-10"
          style={{ bottom: `${20 + (product.minStock / maxStock) * 60}%` }}
        >
          <span className="absolute -top-6 right-0 text-xs text-red-600 bg-white dark:bg-gray-800 px-2 py-1 rounded">
            Seuil min: {product.minStock.toFixed(1)} {product.unit}
          </span>
        </div>
        
        {/* Courbe de stock */}
        <svg className="absolute inset-4 w-full h-full" style={{ width: 'calc(100% - 32px)', height: 'calc(100% - 32px)' }}>
          {chartData.length > 1 && (
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              d={chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 100;
                const y = 100 - (maxStock > 0 ? (point.stock / maxStock) * 80 : 0);
                return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
              }).join(' ')}
              stroke="#8B5CF6"
              strokeWidth="2"
              fill="none"
              className="drop-shadow-sm"
            />
          )}
          
          {/* Points de mouvement */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * 100;
            const y = 100 - (maxStock > 0 ? (point.stock / maxStock) * 80 : 0);
            
            return (
              <motion.circle
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                className={`${getMovementColor(point.type)} cursor-pointer hover:scale-125 transition-transform`}
                title={`${new Date(point.dateTime).toLocaleDateString('fr-FR')} ${new Date(point.dateTime).toLocaleTimeString('fr-FR')}: ${point.reason} - ${point.quantity > 0 ? '+' : ''}${point.quantity.toFixed(3)} ${product.unit}`}
              />
            );
          })}
        </svg>
        
        {/* Axes et labels */}
        <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          {chartData.length > 0 && (
            <>
              <span>{new Date(chartData[0].dateTime).toLocaleDateString('fr-FR')}</span>
              <span>{new Date(chartData[chartData.length - 1].dateTime).toLocaleDateString('fr-FR')}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Légende améliorée */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-blue-700 dark:text-blue-300">Stock Initial</span>
        </div>
        <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs text-red-700 dark:text-red-300">Vente</span>
        </div>
        <div className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-xs text-purple-700 dark:text-purple-300">Rectification</span>
        </div>
        <div className="flex items-center space-x-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="w-3 h-3 bg-red-400 rounded border-dashed border-2 border-red-600"></div>
          <span className="text-xs text-orange-700 dark:text-orange-300">Seuil minimum</span>
        </div>
      </div>
    </motion.div>
  );
}