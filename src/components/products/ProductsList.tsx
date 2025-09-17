import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import StockAdjustmentModal from './StockAdjustmentModal';
import StockHistoryModal from './StockHistoryModal';
import { Plus, Search, Edit, Trash2, AlertTriangle, Package, RotateCcw, History, TrendingUp, TrendingDown } from 'lucide-react';
import StockOverviewWidget from './StockOverviewWidget';
import StockAlertsWidget from './StockAlertsWidget';


export default function ProductsList() {
  const { t } = useLanguage();
  const { products, deleteProduct, invoices, stockMovements } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [adjustingStock, setAdjustingStock] = useState<string | null>(null);
  const [viewingHistory, setViewingHistory] = useState<string | null>(null);

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

// Fonction utilitaire
const formatQuantity = (value: number, unit?: string) => {
  if (!unit) return value.toString();

  const lowerUnit = unit.toLowerCase();
  if (lowerUnit === 'kg' || lowerUnit === 'tonne' || lowerUnit === 'tonnes') {
    return value.toFixed(3).replace('.', ','); // 3 décimales avec virgule
  }
  return Math.round(value).toString(); // pas de virgule pour les autres
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('products')}</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Produit</span>
        </button>
      </div>

      {/* Search and Stats */}
      <StockOverviewWidget />
      <StockAlertsWidget />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
          </div>
        </div>
        
      
        
      
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => {
                const stats = getProductStats(product.id);
                const lastAdjustment = getLastStockAdjustment(product.id);
                
                return (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm font-medium text-gray-900 dark:text-white">
    {formatQuantity(product.initialStock || 0, product.unit)} {product.unit || 'unité'}
  </div>
  <div className="text-xs text-gray-500 dark:text-gray-400">
    Min: {formatQuantity(product.minStock || 0, product.unit)} {product.unit || 'unité'}
  </div>
</td>

<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm font-medium text-gray-900 dark:text-white">
    {stats.ordersCount} commande{stats.ordersCount > 1 ? 's' : ''}
  </div>
  <div className="text-xs text-gray-500 dark:text-gray-400">
    {formatQuantity(stats.totalOrdered, product.unit)} {product.unit || 'unité'} commandé{stats.totalOrdered > 1 ? 's' : ''}
  </div>
</td>

<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center space-x-2">
    <span className={`text-sm font-medium ${
      stats.remainingStock <= product.minStock ? 'text-red-600' : 'text-gray-900 dark:text-white'
    }`}>
      {formatQuantity(stats.remainingStock, product.unit)} {product.unit || 'unité'}
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
        {lastAdjustment.quantity > 0 ? '+' : ''}
        {formatQuantity(lastAdjustment.quantity, product.unit)} {product.unit || 'unité'}
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
                      <button 
                        onClick={() => setViewingHistory(product.id)}
                        className="text-purple-600 hover:text-purple-700 transition-colors"
                        title="Aperçu Stock"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setAdjustingStock(product.id)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="Rectifier Stock"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditProduct(product.id)}
                        className="text-amber-600 hover:text-amber-700 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
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
      </div>

      <AddProductModal 
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
