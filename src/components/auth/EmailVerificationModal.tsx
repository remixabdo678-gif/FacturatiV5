import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, X, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailVerificationModal({ isOpen, onClose }: EmailVerificationModalProps) {
  const { user, firebaseUser, sendEmailVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleResendEmail = async () => {
    setIsResending(true);
    setError('');
    
    try {
      await sendEmailVerification();
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    } catch (err: any) {
      setError('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">📧 Vérification d'email</h2>
                  <p className="text-sm opacity-90">Sécurisez votre compte</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Vérifiez votre adresse email
              </h3>
              
              <p className="text-gray-600 mb-4">
                Pour sécuriser votre compte, veuillez vérifier votre adresse email :
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="font-medium text-blue-900">{user?.email}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-medium text-amber-900 mb-1">Pourquoi vérifier ?</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Sécuriser votre compte contre les accès non autorisés</li>
                      <li>• Recevoir les notifications importantes</li>
                      <li>• Récupérer votre compte en cas d'oubli de mot de passe</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {emailSent && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Email de vérification envoyé ! Vérifiez votre boîte mail.</span>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">📋 Instructions :</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Vérifiez votre boîte email (et les spams)</li>
                <li>2. Cliquez sur le lien de vérification</li>
                <li>3. Revenez sur Facturati</li>
                <li>4. Votre compte sera automatiquement activé</li>
              </ol>
            </div>

            {/* Boutons d'action */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                Plus tard
              </button>
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <span className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Envoi...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Renvoyer l'email</span>
                  </span>
                )}
              </button>
            </div>

            {/* Note de sécurité */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🔒 La vérification d'email renforce la sécurité de votre compte
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}