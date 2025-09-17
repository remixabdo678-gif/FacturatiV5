import React from 'react';
import { Lock, AlertTriangle, Crown, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlockedUserMessageProps {
  expiryDate: string;
  companyName: string;
}

export default function BlockedUserMessage({ expiryDate, companyName }: BlockedUserMessageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      {/* Bouton retour */}
      <Link
        to="/"
        className="fixed top-6 left-6 inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-white/80 px-3 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Retour</span>
      </Link>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Icône de verrouillage animée */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🔒 Compte Bloqué
          </h2>
          <p className="text-gray-600 mb-6">Accès temporairement suspendu</p>
        </div>

        {/* Message principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Ce compte est bloqué
            </h3>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm mb-2">
                <strong>Raison du blocage :</strong> Abonnement Pro expiré
              </p>
              <p className="text-red-700 text-sm">
                💬 Support technique : +212 522 123 456
                <span className="font-bold">
                  {new Date(expiryDate).toLocaleDateString('fr-FR')}
                📧 Email : support@facturati.ma
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">📞 Que faire ?</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>1. Contactez l'administrateur de votre entreprise</p>
                <p>2. Demandez-lui de renouveler l'abonnement Pro</p>
                <p>3. Votre accès sera automatiquement rétabli après renouvellement</p>
              </div>
            </div>

            {/* Avantages Pro rappel */}
            <div className="text-left bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Crown className="w-4 h-4 text-teal-600 mr-2" />
                Avantages Version Pro
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✅ Factures illimitées</li>
                <li>✅ Clients illimités</li>
                <li>✅ Produits illimités</li>
                <li>✅ Jusqu'à 5 comptes utilisateurs</li>
                <li>✅ Support prioritaire</li>
              </ul>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              💬 Support technique : +212 666 736 446
            </p>
            <p className="text-sm text-gray-500">
              📧 Email : support@facture.ma
            </p>
          </div>
        </div>

        {/* Prix de renouvellement */}
        <div className="text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">
              💳 Renouvellement : <span className="font-bold text-teal-600">299 MAD/mois</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
  )
}