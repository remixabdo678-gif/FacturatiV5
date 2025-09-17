import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Product } from '../../contexts/DataContext';
import Modal from '../common/Modal';
import EnhancedStockEvolutionChart from './EnhancedStockEvolutionChart';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  ShoppingCart,
  Download,
  Calendar,
  User,
  FileText,
  BarChart3,
  Clock
} from 'lucide-react';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function StockHistoryModal({ isOpen, onClose, product }: StockHistoryModalProps) {
  const { stockMovements, invoices } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  
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
        userName: 'Système',
        reference: ''
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
            date: invoice.createdAt, // Utiliser createdAt pour avoir l'heure exacte
            quantity: -item.quantity,
            previousStock,
            newStock: previousStock - item.quantity,
            reason: 'Vente',
            userName: 'Système',
            reference: invoice.number
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
        userName: adjustment.userName,
        reference: adjustment.reference || ''
      });
    });
    
    // Trier par date
    return history.sort((a, b) => {
      const dateA = new Date(a.adjustmentDateTime || a.date);
      const dateB = new Date(b.adjustmentDateTime || b.date);
      return dateB.getTime() - dateA.getTime();
    });
  };
  
  const history = generateProductHistory();
  
  // Calculer le résumé
  const summary = {
    initialStock: product.initialStock || 0,
    totalSales: invoices.reduce((sum, invoice) => {
      return sum + invoice.items
        .filter(item => item.description === product.name)
        .reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0),
    totalAdjustments: stockMovements
      .filter(m => m.productId === product.id && m.type === 'adjustment')
      .reduce((sum, m) => sum + m.quantity, 0),
    currentStock: (product.initialStock || 0) + 
      stockMovements.filter(m => m.productId === product.id && m.type === 'adjustment')
        .reduce((sum, m) => sum + m.quantity, 0) -
      invoices.reduce((sum, invoice) => {
        return sum + invoice.items
          .filter(item => item.description === product.name)
          .reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0)
  };

  // Filtrer par période
  const filteredHistory = history.filter(movement => {
    if (selectedPeriod === 'all') return true;
    
    const movementDate = new Date(movement.date);
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        return movementDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return movementDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarter':
        return movementDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  });

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'initial':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'sale':
        return <ShoppingCart className="w-4 h-4 text-red-600" />;
      case 'adjustment':
        return <RotateCcw className="w-4 h-4 text-purple-600" />;
      case 'return':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'initial':
        return 'Stock initial';
      case 'sale':
        return 'Vente';
      case 'adjustment':
        return 'Rectification';
      case 'return':
        return 'Retour';
      default:
        return 'Mouvement';
    }
  };

  const getMovementColor = (quantity: number) => {
    return quantity > 0 ? 'text-green-600' : quantity < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const exportStockReport = () => {
    const csvContent = [
      ['Date', 'Heure', 'Type', 'Quantité', 'Stock Précédent', 'Nouveau Stock', 'Motif', 'Référence', 'Utilisateur'].join(','),
      ...filteredHistory.map(h => [
        new Date(h.adjustmentDateTime || h.date).toLocaleDateString('fr-FR'),
        new Date(h.adjustmentDateTime || h.date).toLocaleTimeString('fr-FR'),
        getMovementLabel(h.type),
        h.quantity,
        h.previousStock,
        h.newStock,
        h.reason || '',
        h.reference || '',
        h.userName
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historique_${product.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Générer les données pour le mini graphique
  const generateChartData = () => {
    const last30Days = history
      .filter(m => {
        const date = new Date(m.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date >= thirtyDaysAgo;
      })
      .reverse(); // Ordre chronologique

    return last30Days.map(movement => ({
      date: new Date(movement.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      stock: movement.newStock
    }));
  };

  const chartData = generateChartData();
  const maxStock = Math.max(...chartData.map(d => d.stock), 1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Historique du Stock" size="xl">
      <div className="space-y-6">
        {/* En-tête avec résumé */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">{product.name}</h3>
                <p className="text-blue-700 dark:text-blue-300">{product.category} • {product.unit}</p>
              </div>
            </div>
            <button
              onClick={exportStockReport}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-600">
                <div className="text-lg font-bold text-blue-600">{summary.initialStock.toFixed(3)}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Stock initial</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-600">
                <div className="text-lg font-bold text-red-600">{summary.totalSales.toFixed(3)}</div>
                <div className="text-xs text-red-700 dark:text-red-300">Total vendu</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-600">
                <div className={`text-lg font-bold ${summary.totalAdjustments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.totalAdjustments > 0 ? '+' : ''}{summary.totalAdjustments.toFixed(3)}
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Rectifications</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-600">
                <div className="text-lg font-bold text-green-600">{summary.currentStock.toFixed(3)}</div>
                <div className="text-xs text-green-700 dark:text-green-300">Stock actuel</div>
              </div>
            </div>
          )}
        </div>

       


        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                      {getMovementIcon(movement.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {getMovementLabel(movement.type)}
                        </span>
                        <span className={`font-bold ${getMovementColor(movement.quantity)}`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity.toFixed(3)} {product.unit}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(movement.adjustmentDateTime || movement.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(movement.adjustmentDateTime || movement.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{movement.userName}</span>
                        </div>
                        {movement.reason && (
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>{movement.reason}</span>
                          </div>
                        )}
                        {movement.reference && (
                          <div className="flex items-center space-x-1">
                            <span className="font-mono text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                              {movement.reference}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {movement.previousStock.toFixed(3)} → {movement.newStock.toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Stock après mouvement
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucun mouvement de stock</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  L'historique apparaîtra après les premiers mouvements
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}