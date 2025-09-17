import React from 'react';
import { useData } from '../../contexts/DataContext';
import { motion } from 'framer-motion';
import { 
  Activity, 
  FileText, 
  Users, 
  Package, 
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck
} from 'lucide-react';

export default function RecentActivity() {
  const { invoices, clients, products, quotes } = useData();

  // Générer les activités récentes
  const getRecentActivities = () => {
    const activities: any[] = [];

    // Dernières factures (5 plus récentes)
    invoices.slice(0, 3).forEach(invoice => {
      activities.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        title: `Facture ${invoice.number} créée`,
        subtitle: `${invoice.client.name} • ${invoice.totalTTC.toLocaleString()} MAD`,
        time: new Date(invoice.createdAt),
        icon: FileText,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        status: invoice.status
      });
    });

    // Derniers devis (3 plus récents)
    quotes.slice(0, 2).forEach(quote => {
      activities.push({
        id: `quote-${quote.id}`,
        type: 'quote',
        title: `Devis ${quote.number} créé`,
        subtitle: `${quote.client.name} • ${quote.totalTTC.toLocaleString()} MAD`,
        time: new Date(quote.createdAt),
        icon: FileCheck,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        status: quote.status
      });
    });

    // Derniers clients (2 plus récents)
    clients.slice(0, 2).forEach(client => {
      activities.push({
        id: `client-${client.id}`,
        type: 'client',
        title: `Client ${client.name} ajouté`,
        subtitle: `ICE: ${client.ice}`,
        time: new Date(client.createdAt),
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      });
    });

    // Derniers produits (2 plus récents)
    products.slice(0, 2).forEach(product => {
      activities.push({
        id: `product-${product.id}`,
        type: 'product',
        title: `Produit ${product.name} ajouté`,
        subtitle: `${product.category} • ${product.salePrice.toLocaleString()} MAD`,
        time: new Date(product.createdAt),
        icon: Package,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      });
    });

    // Trier par date décroissante et prendre les 8 plus récents
    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 8);
  };

  const activities = getRecentActivities();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'collected':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'unpaid':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'accepted':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `Il y a ${diffHours}h`;
    if (diffMinutes > 0) return `Il y a ${diffMinutes}min`;
    return 'À l\'instant';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activité Récente</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dernières actions effectuées</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {activities.length > 0 ? (
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { type: 'spring', stiffness: 300 }
                  }}
                  className={`flex items-center space-x-4 p-4 rounded-xl ${activity.bgColor} dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer group`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.bgColor} dark:bg-gray-700 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                      {activity.status && getStatusIcon(activity.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{activity.subtitle}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(activity.time)}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune activité récente
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Commencez à utiliser Facture.ma pour voir vos activités ici
            </p>
          </div>
        )}
      </div>
    </div>
  );
}