import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, Crown, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function SubscriptionAlert() {
  const { user, subscriptionStatus } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  // Vérifier si l'alerte a été fermée récemment
  useEffect(() => {
    const dismissed = localStorage.getItem('subscriptionAlertDismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const hoursDiff = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60);
      
      // Masquer pendant 24h
      if (hoursDiff < 24) {
        setIsVisible(false);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('subscriptionAlertDismissed', new Date().toISOString());
  };

  // Ne pas afficher si pas d'abonnement Pro ou si pas de problème
  if (!user?.company?.subscription || user.company.subscription !== 'pro') {
    return null;
  }

  // Ne pas afficher si pas de date d'expiration
  if (!user.company.expiryDate) {
    return null;
  }

  const currentDate = new Date();
  const expiryDate = new Date(user.company.expiryDate);
  const timeDiff = expiryDate.getTime() - currentDate.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;

  // Ne pas afficher si tout va bien
  if (!isExpired && !isExpiringSoon) {
    return null;
  }

  // Ne pas afficher si fermé manuellement
  if (!isVisible) {
    return null;
  }

  const alertConfig = isExpired ? {
    bgColor: 'from-red-500 to-red-600',
    textColor: 'text-white',
    icon: AlertTriangle,
    title: '🚨 Abonnement Expiré',
    message: `Votre abonnement Pro a expiré le ${expiryDate.toLocaleDateString('fr-FR')}. Renouvelez maintenant pour éviter l'interruption du service.`,
    buttonText: 'Renouveler maintenant',
    urgent: true
  } : {
    bgColor: 'from-orange-500 to-amber-500',
    textColor: 'text-white',
    icon: Calendar,
    title: '⏰ Expiration Proche',
    message: `Votre abonnement Pro expire dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}. Pensez à le renouveler.`,
    buttonText: 'Renouveler mon abonnement',
    urgent: false
  };

  const Icon = alertConfig.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className={`fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r ${alertConfig.bgColor} ${alertConfig.textColor} shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={alertConfig.urgent ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
              >
                <Icon className="w-6 h-6" />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg">{alertConfig.title}</h3>
                <p className="text-sm opacity-90">{alertConfig.message}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to="/billing"
                className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-lg font-semibold transition-all duration-200 border border-white/30"
              >
                <Crown className="w-4 h-4" />
                <span>{alertConfig.buttonText}</span>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Masquer pendant 24h"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}