import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  MessageCircle, 
  Check, 
  Sparkles,
  Copy,
  CheckCircle
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  isRenewal?: boolean;
}

export default function PaymentModal({ isOpen, onClose, onComplete, isRenewal = false }: PaymentModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankInfo = {
    bank: 'CIH',
    holder: 'ABDERRAHMANE IDRISSI',
    rib: '230 815 2553323211015100 48',
    iban: 'MA64 2308 1525 5332 3211 0151 0048',
    swift: 'CIHMMAMC'
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent('Bonjour, voici mon reçu pour l\'activation de mon abonnement PRO Facturati.');
    const whatsappUrl = `https://wa.me/212522123456?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Afficher la confirmation après un délai
    setTimeout(() => {
      setShowConfirmation(true);
    }, 1000);
  };

  const handleComplete = () => {
    onComplete();
    // Marquer l'activation en cours dans le localStorage
    localStorage.setItem('proActivationPending', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all duration-300 transform bg-white shadow-2xl rounded-2xl">
          
          {!showConfirmation ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse opacity-50"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">💳 Paiement Version Pro</h2>
                      <p className="text-sm opacity-90">
                        {isRenewal ? 'Renouvellement - 299 MAD / mois' : '299 MAD / mois'}
                      </p>
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

              {/* Bank Information */}
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🏦 {isRenewal ? 'Renouvellement - Informations Bancaires' : 'Informations Bancaires'}
                  </h3>
                  <p className="text-gray-600">
                    {isRenewal 
                      ? 'Effectuez votre virement de renouvellement avec les informations ci-dessous'
                      : 'Effectuez votre virement bancaire avec les informations ci-dessous'
                    }
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Banque</p>
                        <p className="text-lg font-bold text-gray-900">{bankInfo.bank}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(bankInfo.bank, 'bank')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {copiedField === 'bank' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Titulaire</p>
                        <p className="text-lg font-bold text-gray-900">{bankInfo.holder}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(bankInfo.holder, 'holder')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {copiedField === 'holder' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div>
                        <p className="text-sm font-medium text-gray-700">RIB</p>
                        <p className="text-lg font-bold text-gray-900 font-mono">{bankInfo.rib}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(bankInfo.rib, 'rib')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {copiedField === 'rib' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div>
                        <p className="text-sm font-medium text-gray-700">IBAN</p>
                        <p className="text-lg font-bold text-gray-900 font-mono">{bankInfo.iban}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(bankInfo.iban, 'iban')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {copiedField === 'iban' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Code SWIFT</p>
                        <p className="text-lg font-bold text-gray-900 font-mono">{bankInfo.swift}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(bankInfo.swift, 'swift')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {copiedField === 'swift' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 Instructions</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Effectuez un virement de <strong>299 MAD</strong> {isRenewal && '(renouvellement)'}</li>
                    <li>2. Prenez une capture d'écran du reçu</li>
                    <li>3. Cliquez sur le bouton WhatsApp ci-dessous</li>
                    <li>4. Envoyez-nous votre reçu via WhatsApp</li>
                  </ol>
                </div>

                {/* WhatsApp Button */}
                <button
                  onClick={handleWhatsAppRedirect}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <MessageCircle className="w-6 h-6" />
                    <span>📱 {isRenewal ? 'Envoyer le reçu de renouvellement' : 'Envoyer le reçu sur WhatsApp'}</span>
                  </span>
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    💬 Support WhatsApp : +212 666 736 446
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Confirmation Screen */
            <div className="p-8 text-center">
              {/* Animated Success Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Check className="w-10 h-10 text-white" />
              </div>

              {/* Sparkles Animation */}
              <div className="relative mb-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-bounce"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${Math.random() * 20}px`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </div>
                ))}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ✅ Merci pour votre confiance !
              </h3>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
                <p className="text-lg text-green-800 font-semibold mb-2">
                  🚀 Votre abonnement PRO sera {isRenewal ? 'renouvelé' : 'activé'} dans un délai maximum de 2h.
                </p>
                <p className="text-green-700">
                  {isRenewal 
                    ? 'Vos comptes utilisateurs seront automatiquement débloqués après activation.'
                    : 'Si vous avez un problème, contactez notre support via WhatsApp.'
                  }
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>

              <button
                onClick={handleComplete}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Continuer
              </button>

              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  📞 Support : +212 522 123 456 • 📧 support@facturati.ma
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}