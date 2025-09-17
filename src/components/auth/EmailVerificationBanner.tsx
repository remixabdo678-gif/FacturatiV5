import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, X, RefreshCw, CheckCircle } from 'lucide-react';

export default function EmailVerificationBanner() {
  const { user, firebaseUser, sendEmailVerification } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Ne pas afficher si l'email est déjà vérifié ou si l'utilisateur n'est pas connecté via Firebase
  if (!firebaseUser || firebaseUser.emailVerified || !isVisible || user?.email === 'admin@facturati.ma') {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await sendEmailVerification();
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Masquer pendant 24h
    localStorage.setItem('emailVerificationDismissed', new Date().toISOString());
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-lg">📧 Vérification d'email requise</p>
            <p className="text-sm opacity-90">
              Veuillez vérifier votre adresse email <strong>{user?.email}</strong> pour sécuriser votre compte.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {emailSent ? (
            <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-100 px-4 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span>Email envoyé !</span>
            </div>
          ) : (
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-lg font-semibold transition-all duration-200 border border-white/30 disabled:opacity-50"
            >
              {isResending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              <span>{isResending ? 'Envoi...' : 'Renvoyer l\'email'}</span>
            </button>
          )}
          
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Masquer pendant 24h"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}