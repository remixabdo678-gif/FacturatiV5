import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { Package, Trophy, TrendingUp, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopProducts() {
  const { t } = useLanguage();
  const { products, invoices } = useData();

  // Calculer les ventes réelles par produit
  const productSales = (products || []).map(product => {
    let totalQuantity = 0;
    let totalRevenue = 0;

    (invoices || []).forEach(invoice => {
      (invoice.items || []).forEach(item => {
        if (item.description === product.name) {
          totalQuantity += Number(item.quantity) || 0;
          totalRevenue += Number(item.total) || 0;
        }
      });
    });

    const purchasePrice = Number((product as any).purchasePrice) || 0;
    return {
      name: product.name,
      sales: totalQuantity,
      revenue: totalRevenue,
      category: (product as any).category || 'Non catégorisé',
      unit: (product as any).unit || 'unité',
      margin: totalRevenue - totalQuantity * purchasePrice,
      purchasePrice
    };
  });

  // Trier par quantité vendue et prendre le top 3
  const topProducts = productSales
    .filter(p => p.sales > 0)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Produits</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Les plus vendus</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
        >
          <Award className="w-6 h-6 text-yellow-500" />
        </motion.div>
      </div>

      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => {
            const isTopPerformer = index === 0;
            const badgeColors = [
              'from-yellow-400 to-yellow-600',
              'from-gray-400 to-gray-600',
              'from-orange-400 to-orange-600'
            ];

            // % marge (approximatif) = CA / coût * 100 si coût > 0
            const cost = product.sales * product.purchasePrice;
            const marginPercent = cost > 0 ? Math.round((product.revenue / cost) * 100) : null;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div
                  className={`flex items-center justify-between p-4 transition-all duration-300 ${
                    isTopPerformer
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-600 hover:border-yellow-300 dark:hover:border-yellow-500'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className={`w-12 h-12 bg-gradient-to-br ${badgeColors[index]} rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {isTopPerformer ? (
                        <Trophy className="w-6 h-6" />
                      ) : (
                        <span className="text-lg">#{index + 1}</span>
                      )}
                    </motion.div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</p>
                        {isTopPerformer && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{product.category}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                          {product.sales.toFixed(1)} {product.unit}
                        </span>
                        {product.margin > 0 && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                            +{product.margin.toLocaleString()} MAD
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <motion.div
                      className="text-xl font-bold text-gray-900 dark:text-gray-100"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {product.revenue.toLocaleString()} MAD
                    </motion.div>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      {marginPercent !== null ? (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">{marginPercent}% marge</span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Effet de brillance au survol */}
                {isTopPerformer && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.div>
            );
          })
        ) : (
          <motion.div className="text-center py-12" variants={itemVariants}>
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Aucun produit vendu</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Créez vos premières factures pour voir les statistiques
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Badge performance globale */}
      {topProducts.length > 0 && (
        <motion.div
          className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl border border-teal-200 dark:border-teal-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <div>
                <p className="font-medium text-teal-900 dark:text-teal-100">Performance Produits</p>
                <p className="text-sm text-teal-700 dark:text-teal-300">
                  {topProducts.length} produit{topProducts.length > 1 ? 's' : ''} génère
                  {topProducts.length === 1 ? '' : 'nt'} des ventes
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-teal-600">
                {topProducts.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()} MAD
              </p>
              <p className="text-xs text-teal-600">CA total top produits</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
