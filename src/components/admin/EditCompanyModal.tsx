import React, { useState } from 'react';
import { X, Crown, Calendar } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  subscription: 'free' | 'pro';
  expiryDate?: string;
  subscriptionDate?: string;
  ownerEmail: string;
  ice: string;
  createdAt: string;
}

interface EditCompanyModalProps {
  company: Company;
  onSave: (companyId: string, updates: { subscription: 'free' | 'pro'; expiryDate?: string }) => Promise<void>;
  onClose: () => void;
}

export default function EditCompanyModal({ company, onSave, onClose }: EditCompanyModalProps) {
  const [subscription, setSubscription] = useState<'free' | 'pro'>(company.subscription);
  const [expiryDate, setExpiryDate] = useState(() => {
    if (company.expiryDate) {
      return new Date(company.expiryDate).toISOString().split('T')[0];
    }
    // Par défaut, 30 jours à partir d'aujourd'hui
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    return defaultDate.toISOString().split('T')[0];
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updates: { subscription: 'free' | 'pro'; expiryDate?: string } = {
        subscription
      };

      if (subscription === 'pro') {
        updates.expiryDate = new Date(expiryDate).toISOString();
      }

      await onSave(company.id, updates);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Modifier l'Abonnement</h3>
                <p className="text-sm opacity-90">{company.name}</p>
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
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Informations entreprise */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Informations Entreprise</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Raison sociale:</span> {company.name}</p>
                  <p><span className="font-medium">Email:</span> {company.ownerEmail}</p>
                  <p><span className="font-medium">ICE:</span> {company.ice}</p>
                  <p><span className="font-medium">Inscrit le:</span> {new Date(company.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Type d'abonnement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type d'Abonnement
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="subscription"
                      value="free"
                      checked={subscription === 'free'}
                      onChange={(e) => setSubscription(e.target.value as 'free' | 'pro')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🆓</span>
                      <div>
                        <p className="font-medium text-gray-900">Version Gratuite</p>
                        <p className="text-xs text-gray-500">Limitations: 10 factures, 10 clients, 20 produits</p>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="subscription"
                      value="pro"
                      checked={subscription === 'pro'}
                      onChange={(e) => setSubscription(e.target.value as 'free' | 'pro')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Crown className="w-6 h-6 text-yellow-600" />
                      <div>
                        <p className="font-medium text-gray-900">Version Pro</p>
                        <p className="text-xs text-gray-500">Illimité: factures, clients, produits, support prioritaire</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Date d'expiration (si Pro) */}
              {subscription === 'pro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date d'Expiration
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    L'abonnement sera actif jusqu'à cette date
                  </p>
                </div>
              )}

              {/* Statut actuel */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Statut Actuel</h4>
                <div className="text-sm text-blue-800">
                  <p><span className="font-medium">Abonnement:</span> {company.subscription === 'pro' ? '👑 Pro' : '🆓 Gratuit'}</p>
                  {company.subscription === 'pro' && company.expiryDate && (
                    <p><span className="font-medium">Expire le:</span> {new Date(company.expiryDate).toLocaleDateString('fr-FR')}</p>
                  )}
                  {company.subscriptionDate && (
                    <p><span className="font-medium">Souscrit le:</span> {new Date(company.subscriptionDate).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex space-x-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}