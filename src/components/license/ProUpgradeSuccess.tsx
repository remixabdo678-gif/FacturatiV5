import React, { useState, useEffect } from 'react';
import { Crown, Check, Sparkles, X, Calendar } from 'lucide-react';

interface ProUpgradeSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  expiryDate: string;
}

export default function ProUpgradeSuccess({ isOpen, onClose, expiryDate }: ProUpgradeSuccessProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Déclencher les confettis après un petit délai
      setTimeout(() => setShowConfetti(true), 500);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setShowConfetti(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      {/* Confettis animés */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div 
          className={`inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all duration-500 transform bg-white shadow-2xl rounded-2xl ${
            isVisible ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-12'
          }`}
        >
          {/* Header avec animation */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-8 py-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 animate-pulse opacity-50"></div>
            
            {/* Étoiles flottantes */}
            <div className="absolute top-2 left-4 animate-bounce">
              <Sparkles className="w-6 h-6 text-yellow-200" />
            </div>
            <div className="absolute top-4 right-6 animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Sparkles className="w-4 h-4 text-yellow-200" />
            </div>
            <div className="absolute bottom-2 right-4 animate-bounce" style={{ animationDelay: '1s' }}>
              <Sparkles className="w-5 h-5 text-yellow-200" />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <Crown className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold animate-pulse">🎉 Félicitations !</h2>
                  <p className="text-sm opacity-90">Bienvenue dans la version Pro</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-8">
            <div className="text-center mb-8">
              {/* Icône de succès avec animation */}
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Check className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Mise à niveau réussie ! 🚀
              </h3>
              
              <p className="text-gray-600 mb-6">
                Votre compte a été mis à niveau vers la version Pro avec succès. 
                Vous avez maintenant accès à toutes les fonctionnalités premium !
              </p>

              {/* Statut Pro avec date d'expiration */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Crown className="w-8 h-8 text-yellow-600" />
                  <span className="text-2xl font-bold text-gray-900">Version Pro</span>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-gray-700">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Expire le:</span>
                  <span className="font-bold text-orange-600">
                    {new Date(expiryDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-2">
                  (30 jours d'accès complet)
                </p>
              </div>

              {/* Avantages débloqués */}
              <div className="text-left bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-gray-900 mb-4 text-center flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-teal-600 mr-2" />
                  Fonctionnalités débloquées
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Factures illimitées</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Clients illimités</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Produits illimités</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Devis illimités</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Support prioritaire</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Rapports avancés</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton de fermeture */}
            <div className="text-center">
              <button
                onClick={handleClose}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Crown className="w-5 h-5" />
                  <span>Commencer avec Pro</span>
                </span>
              </button>
            </div>

            {/* Message de remerciement */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                🙏 Merci de votre confiance ! Profitez pleinement de Facture.ma Pro
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}