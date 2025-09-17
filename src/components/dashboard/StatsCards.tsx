import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { DollarSign, FileText, Users, Package, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsCards() {
  const { t } = useLanguage();
  const { clients, products, invoices } = useData();

  // Chiffre d'affaires total des factures créées cette année
  const currentYear = new Date().getFullYear();
  const paidInvoices = invoices.filter(invoice => 
    new Date(invoice.createdAt).getFullYear() === currentYear && 
    (invoice.status === 'paid' || invoice.status === 'collected')
  );
  
  const totalRevenue = paidInvoices
    .reduce((sum, invoice) => sum + invoice.totalTTC, 0);

  // Nombre total de factures créées cette année
  const totalInvoicesThisYear = invoices.filter(invoice => 
    new Date(invoice.createdAt).getFullYear() === currentYear
  ).length;

  // Factures en attente de paiement
  const unpaidInvoices = invoices.filter(invoice => 
    new Date(invoice.createdAt).getFullYear() === currentYear && 
    invoice.status === 'unpaid'
  ).length;

  // Calcul des tendances (comparaison avec le mois précédent)
  const currentMonth = new Date().getMonth();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthRevenue = invoices.filter(invoice => {
    const date = new Date(invoice.createdAt);
    return date.getMonth() === currentMonth && 
           date.getFullYear() === currentYear &&
           (invoice.status === 'paid' || invoice.status === 'collected');
  }).reduce((sum, invoice) => sum + invoice.totalTTC, 0);

  const previousMonthRevenue = invoices.filter(invoice => {
    const date = new Date(invoice.createdAt);
    return date.getMonth() === previousMonth && 
           date.getFullYear() === previousMonthYear &&
           (invoice.status === 'paid' || invoice.status === 'collected');
  }).reduce((sum, invoice) => sum + invoice.totalTTC, 0);

  const revenueTrend = previousMonthRevenue > 0 ? 
    ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return { icon: TrendingUp, color: 'text-green-500' };
    if (trend < -5) return { icon: TrendingDown, color: 'text-red-500' };
    return { icon: Minus, color: 'text-gray-500' };
  };

  const trendIcon = getTrendIcon(revenueTrend);
  const TrendIcon = trendIcon.icon;
  const stats = [
    {
      title: 'CA Encaissé ' + currentYear,
      value: `${totalRevenue.toLocaleString()} MAD`,
      subtitle: 'Factures payées/encaissées',
      trend: revenueTrend,
      trendLabel: `${revenueTrend > 0 ? '+' : ''}${revenueTrend.toFixed(1)}% vs mois dernier`,
      icon: DollarSign,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      hoverColor: 'hover:from-emerald-600 hover:to-teal-700',
    },
    {
      title: 'Factures Non Payées',
      value: unpaidInvoices.toString(),
      subtitle: 'En attente de paiement',
      trend: 0,
      trendLabel: `${unpaidInvoices} facture${unpaidInvoices > 1 ? 's' : ''} à suivre`,
      icon: FileText,
      bgColor: 'bg-gradient-to-br from-red-500 to-pink-600',
      hoverColor: 'hover:from-red-600 hover:to-pink-700',
    },
    {
      title: 'Total Clients',
      value: clients.length.toString(),
      subtitle: 'Clients enregistrés',
      trend: 0,
      trendLabel: `Base de données clients`,
      icon: Users,
      bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
      hoverColor: 'hover:from-violet-600 hover:to-purple-700',
    },
    {
      title: 'Total Produits',
      value: products.length.toString(),
      subtitle: 'Produits en catalogue',
      trend: 0,
      trendLabel: `Catalogue produits`,
      icon: Package,
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-600',
      hoverColor: 'hover:from-orange-600 hover:to-red-700',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <motion.div 
            key={index} 
            className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group`}
            variants={cardVariants}
            whileHover={{ 
              scale: 1.05,
              y: -8,
              transition: { type: 'spring', stiffness: 300 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <motion.p 
                    className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-xs text-gray-500">
                    {stat.subtitle}
                  </p>
                  {/* Indicateur de tendance */}
                  {stat.trend !== 0 && (
                    <div className="flex items-center space-x-1 mt-2">
                      <TrendIcon className={`w-3 h-3 ${trendIcon.color}`} />
                      <span className={`text-xs font-medium ${trendIcon.color}`}>
                        {stat.trendLabel}
                      </span>
                    </div>
                  )}
                  {stat.trend === 0 && (
                    <p className="text-xs text-gray-400 mt-2">{stat.trendLabel}</p>
                  )}
                </div>
                <motion.div 
                  className={`w-14 h-14 ${stat.bgColor} ${stat.hoverColor} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </motion.div>
              </div>
            </div>
            
            {/* Barre de progression animée en bas */}
            <div className="h-1 bg-gray-100 dark:bg-gray-800">
              <motion.div
                className={`h-full ${stat.bgColor.replace('bg-gradient-to-br', 'bg-gradient-to-r')}`}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}