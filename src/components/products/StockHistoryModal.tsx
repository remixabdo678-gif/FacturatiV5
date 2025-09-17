import React, { useState } from 'react';
import { useStock } from '../../contexts/StockContext';
import { Product } from '../../contexts/DataContext';
import Modal from '../common/Modal';
import StockEvolutionChart from './StockEvolutionChart';
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
  BarChart3
} from 'lucide-react';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function StockHistoryModal({ isOpen, onClose, product }: StockHistoryModalProps) {
  const { getProductStockHistory, getProductStockSummary, exportStockReport } = useStock();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  
  const history = getProductStockHistory(product.id);
  const summary = getProductStockSummary(product.id);

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
              onClick={() => exportStockReport(product.id)}
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

        {/* Mini graphique d'évolution */}
        {chartData.length > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Évolution du stock (30 derniers jours)</span>
            </h4>
            <div className="h-20 flex items-end space-x-1">
              {chartData.map((point, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-400 to-blue-500 rounded-t transition-all duration-500 hover:from-blue-500 hover:to-blue-600"
                    style={{ height: `${(point.stock / maxStock) * 100}%`, minHeight: '2px' }}
                    title={`${point.date}: ${point.stock.toFixed(1)} ${product.unit}`}
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45 origin-left">
                    {point.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Historique des mouvements</h4>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Toute la période</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="quarter">3 derniers mois</option>
          </select>
        </div>

        {/* Liste des mouvements */}
        <StockEvolutionChart product={product} />

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
                          <span>{new Date(movement.date).toLocaleDateString('fr-FR')}</span>
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