import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import StockAdjustmentModal from './StockAdjustmentModal';
import StockHistoryModal from './StockHistoryModal';
import { Plus, Search, Edit, Trash2, AlertTriangle, RotateCcw, History } from 'lucide-react';
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

  // Fonction utilitaire pour formater selon l’unité
  const formatQuantity = (value: number, unit?: string) => {
    if (!unit) return value.toString();
    if (unit.toLowerCase() === 'kg' || unit.toLowerCase() === 'tonne') {
      return value.toFixed(3);
    }
    return value.toFixed(0);
  };

  // Calculer le stock restant selon la formule : Stock Initial + Rectifications - Ventes
  const calculateCurrentStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;

    const initialStock = product.initialStock || 0;

    const adjustments = stockMovements
      .filter(m => m.productId === productId && m.type === 'adjustment')
      .reduce((sum, m) => sum + m.quantity, 0);

    const sales = invoices.reduce((sum, invoice) => {
      return sum + invoice.items
        .filter(item => item.description === product.name)
        .reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    return initialStock + adjustments - sales;
  };

  const getProductStockSummary = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    const productMovements = stockMovements.filter(m => m.productId === productId);
    const totalAdjustments = productMovements
      .filter(m => m.type === 'adjustment')
      .reduce((sum, m) => sum + m.quantity, 0);

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

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium">Produit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Prix Achat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Prix Vente HT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Stock Initial</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Commandes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Stock Restant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Stock Rectif</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                
                {filteredProducts.map((product) => {
                  const stats = getProductStats(product.id);
                  const lastAdjustment = getLastStockAdjustment(product.id);

                  return (
                    <tr key={product.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs">{product.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        {product.purchasePrice.toLocaleString()} MAD
                      </td>
                      <td className="px-6 py-4">
                        {product.salePrice.toLocaleString()} MAD
                      </td>
                      <td className="px-6 py-4">
                        {formatQuantity(product.initialStock || 0, product.unit)} {product.unit}
                        <div className="text-xs text-gray-500">
                          Min: {formatQuantity(product.minStock || 0, product.unit)} {product.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {stats.ordersCount} commande{stats.ordersCount > 1 ? 's' : ''}
                        <div className="text-xs text-gray-500">
                          {formatQuantity(stats.totalOrdered, product.unit)} {product.unit} commandé
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {formatQuantity(stats.remainingStock, product.unit)} {product.unit}
                      </td>
                      <td className="px-6 py-4">
                        {lastAdjustment ? (
                          <>
                            {lastAdjustment.quantity > 0 ? '+' : ''}
                            {formatQuantity(lastAdjustment.quantity, product.unit)} {product.unit}
                            <div className="text-xs text-gray-500">
                              le {new Date(lastAdjustment.date).toLocaleDateString('fr-FR')}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">Aucune rectif</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(product)}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => setViewingHistory(product.id)}>
                          <History className="w-4 h-4" />
                        </button>
                        <button onClick={() => setAdjustingStock(product.id)}>
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEditProduct(product.id)}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit trouvé</p>
          </div>
        )}

        <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

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
            currentStock={calculateCurrentStock(adjustingSto
