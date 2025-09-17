import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import StatsCards from './StatsCards';
import RecentInvoices from './RecentInvoices';
import TopProducts from './TopProducts';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';

export default function Dashboard() {
  const { user, checkSubscriptionExpiry } = useAuth();
  const { t } = useLanguage();
  const { invoices, clients, products } = useData();

  // Vérifier l'expiration à l'ouverture du dashboard
  React.useEffect(() => {
    if (user) {
      checkSubscriptionExpiry();
    }
  }, [user, checkSubscriptionExpiry]);

  const hasAnyData = invoices.length > 0 || clients.length > 0 || products.length > 0;

  // Message de bienvenue personnalisé
  const getWelcomeMessage = () => {
    if (user?.email === 'admin@facturati.ma') {
      return `Bienvenue Administrateur Facturati ! Vous gérez la plateforme.`;
    }
    if (user?.isAdmin) {
      return `Bienvenue ${user.name} ! Vous êtes connecté en tant qu'administrateur.`;
    } else {
      const permissionCount = user?.permissions ? Object.values(user.permissions).filter(Boolean).length : 0;
      return `Bienvenue ${user?.name} ! Vous avez accès à ${permissionCount} section${permissionCount > 1 ? 's' : ''} de l'entreprise ${user?.company?.name}.`;
    }
  };
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {t('dashboard')}
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </motion.div>
      </div>

      {/* Message de bienvenue personnalisé */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`rounded-xl border p-4 ${
        user?.isAdmin 
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700' 
          : 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700'
      }`}>
        <p className={`text-sm font-medium ${
          user?.isAdmin ? 'text-indigo-800' : 'text-blue-800'
        } dark:text-white transition-colors duration-300`}>
          {getWelcomeMessage()}
        </p>
      </motion.div>
      
      <StatsCards />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <QuickActions />
      </motion.div>

      {!hasAnyData && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl border border-teal-200 dark:border-teal-700 p-8 text-center"
        >
          <div className="max-w-md mx-auto">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <span className="text-2xl">🚀</span>
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bienvenue sur Facture.ma !</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez par ajouter vos premiers clients et produits pour voir vos données apparaître ici.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Ajouter un client
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Ajouter un produit
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
      
      </motion.div>

      <TopProducts />

      <RecentInvoices />
    </motion.div>
  );
}