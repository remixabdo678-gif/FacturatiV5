import React, { useState, useEffect } from 'react';
import PaymentModal from './PaymentModal';
import { 
  Crown, 
  X, 
  Sparkles,
  Download,
  Eye,
  Lock
} from 'lucide-react';

interface ProTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
}

export default function ProTemplateModal({ isOpen, onClose, templateName }: ProTemplateModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleBuyNow = () => {
    setIsVisible(false);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div 
          className={`inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all duration-300 transform bg-white shadow-2xl rounded-2xl ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header avec animation */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse opacity-50"></div>
            
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
                  <Lock className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">🔒 Template Pro</h2>
                  <p className="text-sm opacity-90">Fonctionnalité premium</p>
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
              {/* Icône de verrouillage avec animation */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Crown className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ce modèle est réservé à la version Pro
              </h3>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Eye className="w-6 h-6 text-purple-600" />
                  <span className="text-lg font-semibold text-gray-900">Template: {templateName}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-green-500" />
                    <span className="text-green-700">Aperçu autorisé</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-red-500" />
                    <span className="text-red-700">Export PDF bloqué</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Vous pouvez voir l'aperçu de ce magnifique template, mais pour le télécharger en PDF, 
                vous devez passer à la version Pro !
              </p>

              {/* Avantages Pro */}
              <div className="text-left bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-gray-900 mb-4 text-center flex items-center justify-center">
                  <Crown className="w-5 h-5 text-teal-600 mr-2" />
                  Avantages Version Pro
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Téléchargement PDF de tous les templates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-green-500" />
                    <span className="text-sm">5 templates premium exclusifs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Factures, clients et produits illimités</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
              >
                Plus tard
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Crown className="w-5 h-5" />
                  <span>Acheter maintenant</span>
                </span>
              </button>
            </div>

            {/* Prix */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                💳 Seulement <span className="font-bold text-purple-600">299 MAD/mois</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal 
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}