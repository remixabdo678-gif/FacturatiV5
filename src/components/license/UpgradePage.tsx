import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLicense } from '../../contexts/LicenseContext';
import PaymentModal from './PaymentModal';
import { 
  Crown, 
  Check, 
  X, 
  Infinity, 
  FileText, 
  Users, 
  Package, 
  BarChart3,
  Shield,
  Headphones,
  Zap
} from 'lucide-react';

interface UpgradePageProps {
  onClose: () => void;
  isRenewal?: boolean;
}

export default function UpgradePage({ onClose, isRenewal = false }: UpgradePageProps) {
  const { limits, getRemainingCount } = useLicense();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleUpgrade = () => {
    setShowPaymentModal(true);
  };

  const freeFeatures = [
    { icon: FileText, label: 'Factures', limit: limits.invoices, remaining: getRemainingCount('invoices') },
    { icon: Users, label: 'Clients', limit: limits.clients, remaining: getRemainingCount('clients') },
    { icon: Package, label: 'Produits', limit: limits.products, remaining: getRemainingCount('products') },
    { icon: FileText, label: 'Devis', limit: limits.quotes, remaining: getRemainingCount('quotes') }
  ];

  const proFeatures = [
    { icon: Infinity, label: 'Factures illimitées', description: 'Créez autant de factures que nécessaire' },
    { icon: Users, label: 'Clients illimités', description: 'Gérez tous vos clients sans restriction' },
    { icon: Package, label: 'Produits illimités', description: 'Catalogue produits sans limite' },
    { icon: FileText, label: 'Devis illimités', description: 'Propositions commerciales sans restriction' },
    { icon: BarChart3, label: 'Rapports avancés', description: 'Analyses détaillées de vos performances' },
    { icon: Shield, label: 'Sauvegarde automatique', description: 'Vos données protégées en permanence' },
    { icon: Headphones, label: 'Support prioritaire', description: 'Assistance dédiée et rapide' },
    { icon: Zap, label: 'Nouvelles fonctionnalités', description: 'Accès anticipé aux nouveautés' }
  ];

  return (
    <>
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Passez à la version Pro</h2>
                  <p className="opacity-90">Débloquez tout le potentiel de Facture.ma</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Current Limits */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vos limites actuelles (Version Gratuite)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {freeFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  const isLimitReached = feature.remaining === 0;
                  
                  return (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      isLimitReached ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className={`w-5 h-5 ${isLimitReached ? 'text-red-600' : 'text-gray-600'}`} />
                        <span className="font-medium text-gray-900">{feature.label}</span>
                      </div>
                      <p className={`text-sm ${isLimitReached ? 'text-red-600' : 'text-gray-600'}`}>
                        {feature.remaining} restant(s) / {feature.limit}
                      </p>
                      {isLimitReached && (
                        <p className="text-xs text-red-600 font-medium mt-1">Limite atteinte !</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pro Features */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ce que vous obtenez avec la version Pro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg border border-teal-200">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.label}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 mb-8 border border-teal-200">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Crown className="w-8 h-8 text-teal-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Version Pro</h3>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-teal-600">299 MAD</span>
                  <span className="text-gray-600 ml-2">/ mois</span>
                </div>
                <p className="text-gray-600 mb-6">Tout illimité + support prioritaire</p>
                
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center space-x-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Factures illimitées</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Support 24/7</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Rapports avancés</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {isRenewal ? 'Fermer' : 'Peut-être plus tard'}
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Crown className="w-5 h-5" />
                    <span>Payer maintenant - 299 MAD/mois</span>
                  </span>
                )}
              </button>
            </div>

            {/* Guarantee */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                🛡️ Garantie satisfait ou remboursé 30 jours • 🇲🇦 Paiement sécurisé au Maroc
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Payment Modal */}
    {showPaymentModal && (
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onComplete={() => {
          setShowPaymentModal(false);
          onClose();
        }}
        isRenewal={isRenewal}
      />
    )}
    </>
  );
}