import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../contexts/DataContext';
import Modal from '../common/Modal';
import StockEvolutionChart from './StockEvolutionChart';
import html2pdf from 'html2pdf.js';
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
  Filter,
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  // Générer l'historique complet du produit
  const generateProductHistory = () => {
    const history = [];
    
    // 1. Stock initial
    if (product.initialStock > 0) {
      history.push({
        id: `initial-${product.id}`,
        type: 'initial',
        date: product.createdAt,
        dateTime: product.createdAt,
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
            date: invoice.date,
            dateTime: invoice.createdAt,
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
        dateTime: adjustment.adjustmentDateTime || adjustment.createdAt,
        quantity: adjustment.quantity,
        previousStock: adjustment.previousStock,
        newStock: adjustment.newStock,
        reason: adjustment.reason || 'Rectification',
        userName: adjustment.userName,
        reference: adjustment.reference || ''
      });
    });
    
    // Trier par date et heure décroissante
    return history.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
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
    // Filtrage par dates personnalisées
    if (startDate && endDate) {
      const movementDate = new Date(movement.dateTime);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Inclure toute la journée de fin
      return movementDate >= start && movementDate <= end;
    }
    
    // Filtrage par période prédéfinie
    if (selectedPeriod === 'all') return true;
    
    const movementDate = new Date(movement.dateTime);
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
    const reportContent = generateStockReportHTML();
    
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '0';
    tempDiv.style.left = '0';
    tempDiv.style.width = '210mm';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.zIndex = '-1';
    tempDiv.style.opacity = '0';
    tempDiv.innerHTML = reportContent;
    document.body.appendChild(tempDiv);

    const options = {
      margin: [10, 10, 10, 10],
      filename: `Historique_${product.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    html2pdf()
      .set(options)
      .from(tempDiv)
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
      })
      .catch((error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
        alert('Erreur lors de la génération du PDF');
      });
  };

  const generateStockReportHTML = () => {
    const periodText = startDate && endDate 
      ? `du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`
      : 'Période complète';
      
    return `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #8B5CF6; padding-bottom: 20px;">
          <h1 style="font-size: 28px; color: #8B5CF6; margin: 0; font-weight: bold;">HISTORIQUE DE STOCK DÉTAILLÉ</h1>
          <h2 style="font-size: 20px; color: #1f2937; margin: 10px 0; font-weight: bold;">${product.name}</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">${periodText} - Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
        
        <!-- Informations produit -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📦 Informations Produit</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9;">
              <p style="font-size: 14px; color: #0c4a6e; margin: 0;"><strong>Nom:</strong> ${product.name}</p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b;">
              <p style="font-size: 14px; color: #92400e; margin: 0;"><strong>Catégorie:</strong> ${product.category}</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a;">
              <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Stock Initial:</strong> ${(product.initialStock || 0).toFixed(3)} ${product.unit}</p>
            </div>
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #dc2626;">
              <p style="font-size: 14px; color: #991b1b; margin: 0;"><strong>Stock Minimum:</strong> ${product.minStock.toFixed(3)} ${product.unit}</p>
            </div>
          </div>
        </div>
        
        <!-- Résumé -->
        ${summary ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📊 Résumé</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9; text-align: center;">
              <p style="font-size: 20px; font-weight: bold; color: #0c4a6e; margin: 0;">${summary.initialStock.toFixed(3)}</p>
              <p style="font-size: 12px; color: #0c4a6e; margin: 5px 0;">Stock Initial</p>
            </div>
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #dc2626; text-align: center;">
              <p style="font-size: 20px; font-weight: bold; color: #991b1b; margin: 0;">${summary.totalSales.toFixed(3)}</p>
              <p style="font-size: 12px; color: #991b1b; margin: 5px 0;">Total Vendu</p>
            </div>
            <div style="background: #f3e8ff; padding: 15px; border-radius: 8px; border: 1px solid #8b5cf6; text-align: center;">
              <p style="font-size: 20px; font-weight: bold; color: #6d28d9; margin: 0;">${summary.totalAdjustments > 0 ? '+' : ''}${summary.totalAdjustments.toFixed(3)}</p>
              <p style="font-size: 12px; color: #6d28d9; margin: 5px 0;">Rectifications</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a; text-align: center;">
              <p style="font-size: 20px; font-weight: bold; color: #166534; margin: 0;">${summary.currentStock.toFixed(3)}</p>
              <p style="font-size: 12px; color: #166534; margin: 5px 0;">Stock Actuel</p>
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- Historique des mouvements -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📋 Historique des Mouvements</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">Date/Heure</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Type</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Quantité</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Stock Après</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Motif</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Utilisateur</th>
              </tr>
            </thead>
            <tbody>
              ${filteredHistory.map(movement => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(movement.dateTime).toLocaleDateString('fr-FR')} ${new Date(movement.dateTime).toLocaleTimeString('fr-FR')}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${getMovementLabel(movement.type)}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb; ${movement.quantity > 0 ? 'color: #16a34a;' : 'color: #dc2626;'}">${movement.quantity > 0 ? '+' : ''}${movement.quantity.toFixed(3)} ${product.unit}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${movement.newStock.toFixed(3)} ${product.unit}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${movement.reason || '-'}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${movement.userName}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* En-tête avec résumé */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">{product.name}</h3>
                <p className="text-blue-700 dark:text-blue-300">{product.category} • {product.unit}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtrer par dates</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportStockReport}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </motion.button>
            </div>
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
        </motion.div>

        {/* Filtres par dates */}
        <AnimatePresence>
          {showDateFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Filtrer par période personnalisée</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    Réinitialiser
                  </motion.button>
                </div>
              </div>
              {startDate && endDate && (
                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                  <p className="text-purple-800 dark:text-purple-200 text-sm">
                    📅 Période sélectionnée : du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini graphique d'évolution */}
        {chartData.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Évolution du stock avec points de mouvement</span>
            </h4>
            <div className="h-32 relative">
              {/* Ligne de base */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* Points de mouvement */}
              {filteredHistory.slice(0, 20).map((movement, index) => {
                const x = (index / Math.max(filteredHistory.length - 1, 1)) * 100;
                const y = maxStock > 0 ? ((movement.newStock / maxStock) * 80) : 0;
                
                return (
                  <motion.div
                    key={movement.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="absolute"
                    style={{ 
                      left: `${x}%`, 
                      bottom: `${y}%`,
                      transform: 'translate(-50%, 50%)'
                    }}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full border-2 border-white shadow-lg cursor-pointer ${
                        movement.type === 'sale' ? 'bg-red-500' :
                        movement.type === 'adjustment' ? 'bg-purple-500' :
                        movement.type === 'initial' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                      title={`${new Date(movement.dateTime).toLocaleDateString('fr-FR')} ${new Date(movement.dateTime).toLocaleTimeString('fr-FR')}: ${getMovementLabel(movement.type)} - ${movement.quantity > 0 ? '+' : ''}${movement.quantity.toFixed(3)} ${product.unit}`}
                    />
                  </motion.div>
                );
              })}
              
              {/* Légende */}
              <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">Stock Initial</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">Vente</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">Rectification</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filtres */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Historique des mouvements</h4>
          <div className="flex items-center space-x-3">
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
            
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredHistory.length} mouvement{filteredHistory.length > 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>

        {/* Liste des mouvements */}
        <StockEvolutionChart product={product} />

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="max-h-96 overflow-y-auto"
        >
          <div className="space-y-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((movement, index) => (
                <motion.div 
                  key={movement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                >
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
                        <div className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span className="text-blue-700 dark:text-blue-300">
                            {new Date(movement.dateTime).toLocaleDateString('fr-FR')} à {new Date(movement.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
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
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucun mouvement de stock</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  L'historique apparaîtra après les premiers mouvements
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        <div className="flex justify-end pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Fermer
          </motion.button>
        </div>
      </motion.div>
    </Modal>
  );
}