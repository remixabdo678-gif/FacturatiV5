import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import StockAdjustmentModal from './StockAdjustmentModal';
import StockHistoryModal from './StockHistoryModal';
import { Plus, Search, Edit, Trash2, AlertTriangle, Package, RotateCcw, History, TrendingUp, TrendingDown, Info, HelpCircle } from 'lucide-react';
import StockOverviewWidget from './StockOverviewWidget';
import StockAlertsWidget from './StockAlertsWidget';
import ActionTooltip from './ActionTooltip';


export default function ProductsList() {
  const { t } = useLanguage();
  const { products, deleteProduct, invoices, stockMovements } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [adjustingStock, setAdjustingStock] = useState<string | null>(null);
  const [viewingHistory, setViewingHistory] = useState<string | null>(null);
  const [showActionsHelp, setShowActionsHelp] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  // Calculer le stock restant selon la formule : Stock Initial + Rectifications - Ventes
  const calculateCurrentStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;

    // Stock initial
    const initialStock = product.initialStock || 0;

    // Total des rectifications (ajustements)
    const adjustments = stockMovements
      .filter(m => m.productId === productId && m.type === 'adjustment')
      .reduce((sum, m) => sum + m.quantity, 0);

    // Total des ventes (quantités vendues dans les factures)
    const sales = invoices.reduce((sum, invoice) => {
      return sum + invoice.items
        .filter(item => item.description === product.name)
        .reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    return initialStock + adjustments - sales;
  };

  // Obtenir le résumé du stock d'un produit
  const getProductStockSummary = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    const productMovements = stockMovements.filter(m => m.productId === productId);
    
    // Total des ajustements
    const totalAdjustments = productMovements
      .filter(m => m.type === 'adjustment')
      .reduce((sum, m) => sum + m.quantity, 0);

    // Total des ventes
    const totalSales = invoices.reduce((sum, invoice) => {
      return sum + invoice.items
        .filter(item => item.description === product.name)
        .reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    const currentStock = calculateCurrentStock(productId);
    const lastMovement = productMovements.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return {
      initialStock: product.initialStock || 0,
      totalSales,
      totalAdjustments,
      currentStock,
      lastMovementDate: lastMovement?.date || product.createdAt
    };
  };
  const getProductStats = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { remainingStock: 0, ordersCount: 0, totalOrdered: 0 };

    // Calculer selon la nouvelle formule
    const remainingStock = calculateCurrentStock(productId);
    
    let totalOrdered = 0;
    let ordersCount = 0;
    const ordersSet = new Set();

    invoices.forEach(invoice => {
      let hasProduct = false;
      invoice.items.forEach(item => {
        if (item.description === product.name) {
          totalOrdered += item.quantity;
          hasProduct = true;
        }
      });
      if (hasProduct) {
        ordersSet.add(invoice.id);
      }
    });

    ordersCount = ordersSet.size;

    return { remainingStock, ordersCount, totalOrdered };
  };

  const getStatusBadge = (product: typeof products[0]) => {
    const stats = getProductStats(product.id);
    if (stats.remainingStock <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Rupture
        </span>
      );
    }
    if (stats.remainingStock <= product.minStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Stock Faible
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        En Stock
      </span>
    );
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct(id);
    }
  };

  const handleEditProduct = (id: string) => {
    setEditingProduct(id);
  };

  const getLastStockAdjustment = (productId: string) => {
    const summary = getProductStockSummary(productId);
    if (!summary || summary.totalAdjustments === 0) return null;
    
    return {
      quantity: summary.totalAdjustments,
      date: summary.lastMovementDate
    };
  };

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('products')}</h1>
        <motion.button 
          onClick={() => setIsAddModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Produit</span>
        </motion.button>
      </div>

      {/* Search and Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <StockOverviewWidget />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <StockAlertsWidget />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Rechercher par nom, SKU ou catégorie..."
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Products Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Prix Achat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Prix Vente HT
                </th>
              
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stock Initial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Commandes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stock Restant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stock Rectif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                  <div className="relative inline-block ml-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setShowActionsHelp(!showActionsHelp)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                      title="Aide sur les actions"
                    >
                      <HelpCircle className="w-3 h-3 text-gray-400" />
                    </motion.button>
                    <AnimatePresence>
                      {showActionsHelp && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10 }}
                          className="absolute top-8 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Guide des Actions</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <History className="w-4 h-4 text-purple-600" />
                              <span className="text-gray-700 dark:text-gray-300">Aperçu Stock : Voir l'historique complet</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RotateCcw className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-700 dark:text-gray-300">Rectifier : Ajuster le stock manuellement</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Edit className="w-4 h-4 text-amber-600" />
                              <span className="text-gray-700 dark:text-gray-300">Modifier : Éditer les informations produit</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Trash2 className="w-4 h-4 text-red-600" />
                              <span className="text-gray-700 dark:text-gray-300">Supprimer : Retirer définitivement</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => {
                const stats = getProductStats(product.id);
                const lastAdjustment = getLastStockAdjustment(product.id);
                
                return (
                <motion.tr 
                  key={product.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-900 dark:text-white">{product.purchasePrice.toLocaleString()} MAD</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {product.salePrice.toLocaleString()} MAD
                  </td>
                 
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {(product.initialStock || 0).toFixed(3)} {product.unit || 'unité'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Min: {(product.minStock || 0).toFixed(3)} {product.unit || 'unité'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.ordersCount} commande{stats.ordersCount > 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.totalOrdered.toFixed(3)} {product.unit || 'unité'} commandé{stats.totalOrdered > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        stats.remainingStock <= product.minStock ? 'text-red-600' : 'text-gray-900 dark:text-white'
                      }`}>
                        {stats.remainingStock.toFixed(3)} {product.unit || 'unité'}
                      </span>
                      {stats.remainingStock <= product.minStock && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    {stats.remainingStock <= 0 && (
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium">Rupture de stock</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lastAdjustment ? (
                      <div className="text-sm">
                        <span className={`font-medium ${lastAdjustment.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {lastAdjustment.quantity > 0 ? '+' : ''}{lastAdjustment.quantity.toFixed(3)}  {product.unit || 'unité'}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          le {new Date(lastAdjustment.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">Aucune rectif</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-3">
                      <ActionTooltip content="Voir l'historique complet du stock">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        onClick={() => setViewingHistory(product.id)}
                        className="text-purple-600 hover:text-purple-700 transition-colors"
                        title="Aperçu Stock"
                      >
                        <History className="w-4 h-4" />
                        </motion.button>
                      </ActionTooltip>
                      
                      <ActionTooltip content="Rectifier le stock (entrée/sortie)">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        onClick={() => setAdjustingStock(product.id)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="Rectifier Stock"
                      >
                        <RotateCcw className="w-4 h-4" />
                        </motion.button>
                      </ActionTooltip>
                      
                      <ActionTooltip content="Modifier les informations du produit">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditProduct(product.id)}
                        className="text-amber-600 hover:text-amber-700 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                        </motion.button>
                      </ActionTooltip>
                      
                      <ActionTooltip content="Supprimer définitivement ce produit">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </ActionTooltip>
                    </div>
                  </td>
                </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Aucun produit trouvé</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddProductModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingProduct && (
          <EditProductModal
            isOpen={!!editingProduct}
            onClose={() => setEditingProduct(null)}
            product={products.find(p => p.id === editingProduct)!}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {adjustingStock && (
          <StockAdjustmentModal
            isOpen={!!adjustingStock}
            onClose={() => setAdjustingStock(null)}
            product={products.find(p => p.id === adjustingStock)!}
            currentStock={calculateCurrentStock(adjustingStock)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingHistory && (
          <StockHistoryModal
            isOpen={!!viewingHistory}
            onClose={() => setViewingHistory(null)}
            product={products.find(p => p.id === viewingHistory)!}
          />
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
}

        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {editingProduct && (
        <EditProductModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          product={products.find(p => p.id === editingProduct)!}
        />
      )}

      {adjustingStock && (
        <StockAdjustmentModal
          isOpen={!!adjustingStock}
          onClose={() => setAdjustingStock(null)}
          product={products.find(p => p.id === adjustingStock)!}
          currentStock={calculateCurrentStock(adjustingStock)}
        />
      )}

      {viewingHistory && (
        <StockHistoryModal
          isOpen={!!viewingHistory}
          onClose={() => setViewingHistory(null)}
          product={products.find(p => p.id === viewingHistory)!}
        />
      )}
    </div>
    </>
  );
}