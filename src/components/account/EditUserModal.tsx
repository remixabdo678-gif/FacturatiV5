import React, { useState } from 'react';
import { useUserManagement, ManagedUser, UserPermissions } from '../../contexts/UserManagementContext';
import Modal from '../common/Modal';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ManagedUser;
}

export default function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const { updateUser } = useUserManagement();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: user.password,
    permissions: { ...user.permissions },
    status: user.status
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const permissionLabels = {
    dashboard: { label: 'Tableau de bord', description: 'Vue d\'ensemble et statistiques' },
    invoices: { label: 'Factures', description: 'Créer, modifier et gérer les factures' },
    quotes: { label: 'Devis', description: 'Créer, modifier et gérer les devis' },
    clients: { label: 'Clients', description: 'Gérer la base de données clients' },
    products: { label: 'Produits', description: 'Gérer le catalogue produits' },
    suppliers: { label: 'Fournisseurs', description: 'Gérer les fournisseurs (basique)' },
    stockManagement: { label: 'Gestion Stock', description: 'Gestion avancée du stock (PRO)' },
    supplierManagement: { label: 'Gestion Fournisseurs', description: 'Gestion avancée fournisseurs (PRO)' },
    hrManagement: { label: 'Gestion RH', description: 'Gestion des ressources humaines (PRO)' },
    reports: { label: 'Rapports', description: 'Tableaux de bord financiers (PRO)' },
    settings: { label: 'Paramètres', description: 'Configuration de l\'entreprise' },
    projectManagement: { label: 'Gestion de Projet', description: 'Gestion des projets et tâches (PRO)' }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Vérifier qu'au moins une permission est accordée
    const hasPermissions = Object.values(formData.permissions).some(Boolean);
    if (!hasPermissions) {
      alert('Veuillez accorder au moins une permission à l\'utilisateur');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        permissions: formData.permissions,
        status: formData.status
      });
      
      onClose();
    } catch (error) {
      alert('Erreur lors de la modification de l\'utilisateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePermissionChange = (permission: keyof UserPermissions, checked: boolean) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: checked
      }
    });
  };

  const selectAllPermissions = () => {
    const allTrue = Object.keys(formData.permissions).reduce((acc, key) => {
      acc[key as keyof UserPermissions] = true;
      return acc;
    }, {} as UserPermissions);
    
    setFormData({
      ...formData,
      permissions: allTrue
    });
  };

  const clearAllPermissions = () => {
    const allFalse = Object.keys(formData.permissions).reduce((acc, key) => {
      acc[key as keyof UserPermissions] = key === 'dashboard'; // Garder dashboard par défaut
      return acc;
    }, {} as UserPermissions);
    
    setFormData({
      ...formData,
      permissions: allFalse
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Modifier ${user.name}`} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors duration-300">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Informations de base</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email/Login *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>Permissions d'accès</span>
            </h4>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={selectAllPermissions}
                className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Tout sélectionner
              </button>
              <button
                type="button"
                onClick={clearAllPermissions}
                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(permissionLabels).map(([key, info]) => (
              <label
                key={key}
                className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.permissions[key as keyof UserPermissions]
                    ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.permissions[key as keyof UserPermissions]}
                  onChange={(e) => handlePermissionChange(key as keyof UserPermissions, e.target.checked)}
                  className="mt-1 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">{info.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{info.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Modification...' : 'Modifier Utilisateur'}
          </button>
        </div>
      </form>
    </Modal>
  );
}