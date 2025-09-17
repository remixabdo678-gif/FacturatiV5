import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  Users, 
  Package, 
  FileCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function QuickActions() {
  const { user } = useAuth();

  const hasPermission = (permission: string) => {
    if (user?.isAdmin) return true;
    if (!user?.permissions) return false;
    return Boolean(user.permissions[permission as keyof typeof user.permissions]);
  };

  const actions = [
    {
      title: 'Nouvelle Facture',
      description: 'Créer une facture rapidement',
      icon: FileText,
      path: '/invoices/create',
      color: 'from-teal-500 to-blue-600',
      hoverColor: 'hover:from-teal-600 hover:to-blue-700',
      permission: 'invoices'
    },
    {
      title: 'Nouveau Devis',
      description: 'Proposer un devis client',
      icon: FileCheck,
      path: '/quotes/create',
      color: 'from-purple-500 to-indigo-600',
      hoverColor: 'hover:from-purple-600 hover:to-indigo-700',
      permission: 'quotes'
    },
    {
      title: 'Ajouter Client',
      description: 'Nouveau client dans la base',
      icon: Users,
      path: '/clients',
      color: 'from-blue-500 to-cyan-600',
      hoverColor: 'hover:from-blue-600 hover:to-cyan-700',
      permission: 'clients'
    },
    {
      title: 'Ajouter Produit',
      description: 'Enrichir votre catalogue',
      icon: Package,
      path: '/products',
      color: 'from-orange-500 to-red-600',
      hoverColor: 'hover:from-orange-600 hover:to-red-700',
      permission: 'products'
    }
  ];

  const visibleActions = actions.filter(action => hasPermission(action.permission));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actions Rapides</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Créez rapidement vos documents</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Zap className="w-6 h-6 text-teal-500" />
        </motion.div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {visibleActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                y: -5,
                transition: { type: 'spring', stiffness: 300 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={action.path}
                className={`group block p-6 bg-gradient-to-br ${action.color} ${action.hoverColor} rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                </div>
                <h4 className="font-semibold text-lg mb-2">{action.title}</h4>
                <p className="text-sm opacity-90">{action.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {visibleActions.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Aucune action rapide disponible avec vos permissions actuelles
          </p>
        </div>
      )}
    </div>
  );
}