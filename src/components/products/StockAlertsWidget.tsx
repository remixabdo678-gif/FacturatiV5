import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Package, X, Bell, TrendingDown } from 'lucide-react';

export default function StockAlertsWidget() {
  const { products, invoices, stockMovements } = useData();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Calculer le stock actuel selon la formule correcte
  const calculateCurrentStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;

    // Stock initial
    const initialStock = product.initialStock || 0;

    // Total des rectifications
    const adjustments = stockMovements
      .filter(m => m.productId === productId && m.type === 'adjustment')
      .reduce((sum, m) => sum + m.quantity, 0);

    // Total des ventes
    const sales = invoices.reduce((sum, invoice) => {
      return sum + invoice.items
        .filter(item => item.description === product.name)
        .reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    return initialStock + adjustments - sales;
  };
  useEffect(() => {
    // Générer les alertes de stock
    const newAlerts = products
      .map(product => {
        const currentStock = calculateCurrentStock(product.id);
        
        if (currentStock <= 0) {
          return {
            id: `out-${product.id}`,
            productId: product.id,
            productName: product.name,
            type: 'out_of_stock',
            currentStock,
            minStock: product.minStock,
            unit: product.unit,
            severity: 'critical'
          };
        } else if (currentStock <= product.minStock) {
          return {
            id: `low-${product.id}`,
            productId: product.id,
            productName: product.name,
            type: 'low_stock',
            currentStock,
            minStock: product.minStock,
            unit: product.unit,
            severity: 'warning'
          };
        }
        
        return null;
      })
      .filter(Boolean)
      .filter(alert => !dismissedAlerts.has(alert!.id));

    setAlerts(newAlerts);
  }, [products, invoices, stockMovements, dismissedAlerts]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    // Masquer pendant 24h
    localStorage.setItem(`stockAlert_${alertId}`, new Date().toISOString());
  };

  const getAlertConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          text: 'text-red-800 dark:text-red-200',
          icon: 'text-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-700',
          text: 'text-orange-800 dark:text-orange-200',
          icon: 'text-orange-600'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-200',
          icon: 'text-gray-600'
        };
    }
  };

  if (alerts.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <div className="flex items-center space-x-2 mb-4">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Bell className="w-5 h-5 text-orange-600" />
        </motion.div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alertes de Stock</h3>
        <motion.span 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium px-2 py-1 rounded-full"
        >
          {alerts.length}
        </motion.span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {alerts.map((alert) => {
            const config = getAlertConfig(alert.severity);
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.3 }}
                className={`${config.bg} ${config.border} border rounded-lg p-4 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bg}`}>
                      {alert.type === 'out_of_stock' ? (
                        <TrendingDown className={`w-5 h-5 ${config.icon}`} />
                      ) : (
                        <AlertTriangle className={`w-5 h-5 ${config.icon}`} />
                      )}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${config.text}`}>
                        {alert.type === 'out_of_stock' ? '🚨 Rupture de stock' : '⚠️ Stock faible'}
                      </h4>
                      <p className={`text-sm ${config.text}`}>
                        <strong>{alert.productName}</strong> - 
                        Stock: {alert.currentStock.toFixed(3)} {alert.unit}
                        {alert.type === 'low_stock' && ` (Min: ${alert.minStock.toFixed(3)} ${alert.unit})`}
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => dismissAlert(alert.id)}
                    className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                    title="Masquer pendant 24h"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}