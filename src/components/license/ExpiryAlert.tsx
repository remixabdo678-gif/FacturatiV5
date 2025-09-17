import React, { useState, useEffect } from 'react';
import { AlertTriangle, Crown, Clock, X } from 'lucide-react';

interface ExpiryAlertProps {
  isOpen: boolean;
  onRenew: () => void;
  onLater: () => void;
  expiryDate: string;
}

export default function ExpiryAlert({ isOpen, onRenew, onLater, expiryDate }: ExpiryAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onLater();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div 
          className={`inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all duration-300 transform bg-white shadow-2xl rounded-2xl ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header avec animation */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 animate-pulse opacity-50"></div>
            <div className="relative flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">⏰ Abonnement Expiré</h2>
                <p className="text-sm opacity-90">Votre version Pro a expiré</p>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600 animate-pulse" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Votre abonnement Pro a expiré
              </h3>
              
              <p className="text-gray-600 mb-4">
                Expiré le: <span className="font-medium text-red-600">
                  {new Date(expiryDate).toLocaleDateString('fr-FR')}
                </span>
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-amber-800 text-sm">
                  🚨 Vous êtes maintenant en version gratuite avec des limitations.
                  Renouvelez votre abonnement pour retrouver tous les avantages Pro !
                </p>
              </div>

              {/* Avantages Pro rappel */}
              <div className="text-left bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Crown className="w-4 h-4 text-teal-600 mr-2" />
                  Avantages Version Pro
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ Factures illimitées</li>
                  <li>✅ Clients illimités</li>
                  <li>✅ Produits illimités</li>
                  <li>✅ Devis illimités</li>
                  <li>✅ Support prioritaire</li>
                </ul>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
              >
                Plus tard
              </button>
              <button
                onClick={onRenew}
                className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span>Renouveler maintenant</span>
                </span>
              </button>
            </div>

            {/* Prix */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                💳 Seulement <span className="font-bold text-teal-600">299 MAD/mois</span>
              </p>
            </div>
          </div>
          isRenewal={true}
        </div>
      </div>
    </div>
  );
}