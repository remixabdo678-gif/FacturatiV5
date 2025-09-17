import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserManagement } from '../../contexts/UserManagementContext';
import { useLicense } from '../../contexts/LicenseContext';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import { 
  Shield, 
  Users, 
  Crown, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  UserCheck,
  Settings,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Calendar
} from 'lucide-react';

export default function AccountManagement() {
  const { user } = useAuth();
  const { managedUsers, deleteUser, canCreateUser, remainingUserSlots } = useUserManagement();
  const { licenseType } = useLicense();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Vérifier l'accès PRO
  const isProActive = user?.company.subscription === 'pro' && user?.company.expiryDate && 
    new Date(user.company.expiryDate) > new Date();

  if (!isProActive) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔒 Fonctionnalité PRO
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            La Gestion de Compte est réservée aux abonnés PRO. 
            Passez à la version PRO pour accéder à cette fonctionnalité avancée.
          </p>
          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
            <span className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Passer à PRO - 299 MAD/mois</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = managedUsers.filter(managedUser => {
    const matchesSearch = managedUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         managedUser.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || managedUser.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser(id);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Actif
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Inactif
          </span>
        );
      default:
        return null;
    }
  };

  const getPermissionsCount = (permissions: any) => {
    return Object.values(permissions).filter(Boolean).length;
  };

  const getLastLoginDisplay = (lastLogin?: string) => {
    if (!lastLogin) return 'Jamais connecté';
    
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffTime = now.getTime() - loginDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return loginDate.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <Shield className="w-8 h-8 text-indigo-600" />
            <span>Gestion de Compte</span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Gérez les comptes utilisateurs de votre entreprise avec des permissions granulaires. 
            Fonctionnalité PRO limitée à 5 utilisateurs.
          </p>
        </div>
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          disabled={!canCreateUser}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{managedUsers.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Utilisateurs Total</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {remainingUserSlots} slot{remainingUserSlots > 1 ? 's' : ''} restant{remainingUserSlots > 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {managedUsers.filter(u => u.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Utilisateurs Actifs</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {managedUsers.filter(u => u.lastLogin).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Déjà Connectés</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {managedUsers.length > 0 ? 
                  Math.round(managedUsers.reduce((sum, u) => sum + getPermissionsCount(u.permissions), 0) / managedUsers.length) : 
                  0
                }
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Permissions Moyennes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerte limite */}
      {!canCreateUser && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Limite d'utilisateurs atteinte</h3>
              <p className="text-red-800 dark:text-red-200">
                Vous avez atteint la limite de 5 utilisateurs de la version PRO. 
                Supprimez un utilisateur existant pour en créer un nouveau.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Rechercher par nom ou email..."
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Utilisateurs de l'entreprise ({managedUsers.length}/5)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email/Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mot de passe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((managedUser) => (
                <tr key={managedUser.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {managedUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{managedUser.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Créé le {new Date(managedUser.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{managedUser.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                        {showPasswords[managedUser.id] ? managedUser.password : '••••••••'}
                      </div>
                      <button
                        onClick={() => togglePasswordVisibility(managedUser.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title={showPasswords[managedUser.id] ? 'Masquer' : 'Afficher'}
                      >
                        {showPasswords[managedUser.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getPermissionsCount(managedUser.permissions)}/12
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">sections</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {getLastLoginDisplay(managedUser.lastLogin)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(managedUser.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setEditingUser(managedUser.id)}
                        className="text-amber-600 hover:text-amber-700 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(managedUser.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {managedUsers.length === 0 ? 'Aucun utilisateur créé' : 'Aucun utilisateur trouvé'}
            </p>
            {managedUsers.length === 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Créez votre premier utilisateur pour commencer
              </p>
            )}
          </div>
        )}
      </div>

      {/* Informations sur les permissions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span>Guide des Permissions</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 transition-colors duration-300">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 transition-colors duration-300">📊 Sections de Base</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 transition-colors duration-300">
              <li>• Tableau de bord (toujours accordé)</li>
              <li>• Factures (création, modification)</li>
              <li>• Devis (création, modification)</li>
              <li>• Clients (gestion base de données)</li>
              <li>• Produits (catalogue)</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 transition-colors duration-300">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 transition-colors duration-300">🚀 Sections PRO</h4>
            <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 transition-colors duration-300">
              <li>• Gestion de Stock (avancée)</li>
              <li>• Gestion Fournisseurs (avancée)</li>
              <li>• Gestion RH (employés, congés)</li>
              <li>• Rapports financiers (KPIs)</li>
              <li>• Gestion de Projet (tâches)</li>
            </ul>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 transition-colors duration-300">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 transition-colors duration-300">⚙️ Administration</h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 transition-colors duration-300">
              <li>• Paramètres (configuration)</li>
              <li>• Fournisseurs (basique)</li>
              <li>• Gestion de Compte (cette section)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Conseils de sécurité */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="w-8 h-8" />
          <h3 className="text-lg font-semibold">Conseils de Sécurité</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">🔐 Mots de passe</h4>
            <ul className="text-sm opacity-90 space-y-1">
              <li>• Utilisez des mots de passe forts (min 6 caractères)</li>
              <li>• Changez-les régulièrement</li>
              <li>• Ne les partagez jamais par email</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">👥 Permissions</h4>
            <ul className="text-sm opacity-90 space-y-1">
              <li>• Accordez uniquement les permissions nécessaires</li>
              <li>• Révisez les accès périodiquement</li>
              <li>• Désactivez les comptes inutilisés</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal 
        isOpen={isAddUserModalOpen} 
        onClose={() => setIsAddUserModalOpen(false)} 
      />

      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          user={managedUsers.find(u => u.id === editingUser)!}
        />
      )}
    </div>
  );
}