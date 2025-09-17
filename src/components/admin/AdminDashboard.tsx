import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  Building2, 
  Users, 
  Crown, 
  Calendar, 
  Edit, 
  LogOut,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import EditCompanyModal from './EditCompanyModal';

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  useEffect(() => {
    loadCompanies();
  }, [navigate]);

  const loadCompanies = async () => {
    try {
      const companiesSnapshot = await getDocs(collection(db, 'entreprises'));
      const companiesData = companiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Company));
      
      setCompanies(companiesData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const getStatusBadge = (company: Company) => {
    if (company.subscription === 'free') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <span className="mr-1">🆓</span>
          Gratuit
        </span>
      );
    }

    if (company.subscription === 'pro') {
      const isExpired = company.expiryDate && new Date(company.expiryDate) < new Date();
      
      if (isExpired) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Expiré
          </span>
        );
      }

      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Crown className="w-3 h-3 mr-1" />
          Pro Actif
        </span>
      );
    }

    return null;
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
  };

  const handleSaveCompany = async (companyId: string, updates: { subscription: 'free' | 'pro'; expiryDate?: string }) => {
    try {
      const updateData: any = {
        subscription: updates.subscription,
        updatedAt: new Date().toISOString()
      };

      if (updates.subscription === 'pro' && updates.expiryDate) {
        updateData.expiryDate = updates.expiryDate;
        if (!companies.find(c => c.id === companyId)?.subscriptionDate) {
          updateData.subscriptionDate = new Date().toISOString();
        }
      } else if (updates.subscription === 'free') {
        updateData.expiryDate = new Date().toISOString();
      }

      await updateDoc(doc(db, 'entreprises', companyId), updateData);
      
      // Recharger les données
      await loadCompanies();
      setEditingCompany(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const stats = {
    total: companies.length,
    free: companies.filter(c => c.subscription === 'free').length,
    pro: companies.filter(c => c.subscription === 'pro').length,
    expired: companies.filter(c => 
      c.subscription === 'pro' && 
      c.expiryDate && 
      new Date(c.expiryDate) < new Date()
    ).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                <img 
                  src="https://i.ibb.co/Y4YSN46f/20250913-2301-Logo-Am-lior-remix-01k52hfbh2fyg8m99kngk626qm-1.png" 
                  alt="Facturati Logo" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administration Facturati</h1>
                <p className="text-xs text-gray-500">Gestion des entreprises</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

                 

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Entreprises</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.free}</p>
                <p className="text-sm text-gray-600">Version Gratuite</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pro}</p>
                <p className="text-sm text-gray-600">Version Pro</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
                <p className="text-sm text-gray-600">Abonnements Expirés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des entreprises */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Liste des Entreprises</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raison Sociale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Propriétaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type d'Abonnement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'Expiration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-xs text-gray-500">ICE: {company.ice}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.ownerEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company.subscription === 'pro' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {company.subscription === 'pro' ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Pro
                          </>
                        ) : (
                          <>
                            🆓 Gratuit
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.subscription === 'pro' && company.expiryDate ? (
                        <div>
                          <div>{new Date(company.expiryDate).toLocaleDateString('fr-FR')}</div>
                          <div className={`text-xs ${
                            new Date(company.expiryDate) < new Date() 
                              ? 'text-red-600 font-medium' 
                              : (() => {
                                  const daysRemaining = Math.ceil((new Date(company.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                  return daysRemaining <= 5 ? 'text-orange-600 font-medium animate-pulse' : 'text-green-600';
                                })()
                          }`}>
                            {(() => {
                              const expiry = new Date(company.expiryDate);
                              const now = new Date();
                              if (expiry < now) return 'Expiré';
                              const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                              if (daysRemaining <= 5) return `Expire dans ${daysRemaining}j`;
                              return 'Actif';
                            })()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(company)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleEditCompany(company)}
                        className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Modifier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {companies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune entreprise enregistrée</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      {editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          onSave={handleSaveCompany}
          onClose={() => setEditingCompany(null)}
        />
      )}
    </div>
  );
}