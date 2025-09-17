import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, Bell, AlertTriangle, CheckCircle, Clock, Package, FileText, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInDays, parseISO } from 'date-fns';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { invoices, products } = useData();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  // Générer les notifications
  useEffect(() => {
    const newNotifications: any[] = [];

    // Factures en retard
    const overdueInvoices = invoices.filter(invoice => {
      if (invoice.status !== 'unpaid' || !invoice.dueDate) return false;
      const dueDate = parseISO(invoice.dueDate);
      return differenceInDays(new Date(), dueDate) > 0;
    });

    if (overdueInvoices.length > 0) {
      newNotifications.push({
        id: 'overdue-invoices',
        type: 'warning',
        icon: AlertTriangle,
        title: `${overdueInvoices.length} facture${overdueInvoices.length > 1 ? 's' : ''} en retard`,
        message: `Total: ${overdueInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0).toLocaleString()} MAD`,
        time: 'Maintenant',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      });
    }

    // Stock bas
    const lowStockProducts = products.filter(product => {
      const soldQuantity = invoices.reduce((sum, invoice) => {
        return sum + invoice.items
          .filter(item => item.description === product.name)
          .reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0);
      const remainingStock = product.stock - soldQuantity;
      return remainingStock <= product.minStock;
    });

    if (lowStockProducts.length > 0) {
      newNotifications.push({
        id: 'low-stock',
        type: 'warning',
        icon: Package,
        title: `${lowStockProducts.length} produit${lowStockProducts.length > 1 ? 's' : ''} en stock bas`,
        message: 'Réapprovisionnement nécessaire',
        time: 'Maintenant',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      });
    }

    // Factures récemment payées (dernières 24h)
    const recentlyPaidInvoices = invoices.filter(invoice => {
      if (invoice.status !== 'paid') return false;
      const invoiceDate = new Date(invoice.createdAt);
      const daysDiff = differenceInDays(new Date(), invoiceDate);
      return daysDiff <= 1;
    });

    if (recentlyPaidInvoices.length > 0) {
      newNotifications.push({
        id: 'recent-payments',
        type: 'success',
        icon: CheckCircle,
        title: `${recentlyPaidInvoices.length} paiement${recentlyPaidInvoices.length > 1 ? 's' : ''} reçu${recentlyPaidInvoices.length > 1 ? 's' : ''}`,
        message: `Total: ${recentlyPaidInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0).toLocaleString()} MAD`,
        time: 'Aujourd\'hui',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      });
    }

    // Expiration abonnement
    if (user?.company.subscription === 'pro' && user?.company.expiryDate) {
      const expiryDate = new Date(user.company.expiryDate);
      const daysRemaining = differenceInDays(expiryDate, new Date());
      
      if (daysRemaining <= 5 && daysRemaining > 0) {
        newNotifications.push({
          id: 'subscription-expiry',
          type: 'warning',
          icon: Clock,
          title: 'Abonnement Pro expire bientôt',
          message: `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`,
          time: 'Urgent',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        });
      }
    }

    setNotifications(newNotifications);
  }, [invoices, products, user]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const markAllAsRead = () => {
    setNotifications([]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={markAllAsRead}
                className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
              >
                Marquer tout comme lu
              </button>
            </div>
          )}

          {/* Liste des notifications */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="p-4 space-y-3">
                {notifications.map((notification, index) => {
                  const Icon = notification.icon;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border ${notification.bgColor} ${notification.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer group`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${notification.bgColor}`}>
                          <Icon className={`w-4 h-4 ${notification.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {notification.time}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucune notification
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Vous êtes à jour ! 🎉
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}