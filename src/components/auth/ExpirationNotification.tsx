import React, { useState, useEffect } from 'react';
import { AlertTriangle, Crown, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpirationNotificationProps {
  daysRemaining: number;
  onRenew: () => void;
  onDismiss: () => void;
}

export default function ExpirationNotification({ daysRemaining, onRenew, onDismiss }: ExpirationNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide après 10 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onDismiss();
      }, 500); // Attendre la fin de l'animation
    }, 10000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.5 
          }}
          className="fixed bottom-4 right-4 z-[100] w-full max-w-sm sm:max-w-md"
        >
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-2xl border border-orange-300 overflow-hidden mx-4 sm:mx-0">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0"
                  >
                    <Clock className="w-5 h-5" />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">⏰ Abonnement Pro</p>
                    <p className="text-xs opacity-90">Expiration proche</p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                  title="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm mb-4 leading-relaxed">
                Il reste <strong>{daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</strong> avant la fin de votre abonnement Pro.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onRenew}
                  className="flex-1 bg-white text-orange-600 hover:bg-gray-100 px-3 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm"
                >
                  <Crown className="w-4 h-4 inline mr-1" />
                  Renouveler
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                >
                  Plus tard
                </button>
              </div>
            </div>
            
            {/* Barre de progression pour l'auto-hide */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 10, ease: "linear" }}
              className="h-1 bg-white/30"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}