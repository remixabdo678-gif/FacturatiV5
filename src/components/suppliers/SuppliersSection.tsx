import React, { useState } from 'react';
import { useSupplier } from '../../contexts/SupplierContext';
import { useLicense } from '../../contexts/LicenseContext';
import SupplierDetailView from './SupplierDetailView';
import AddSupplierModal from './AddSupplierModal';
import EditSupplierModal from './EditSupplierModal';
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, Building2, Crown, AlertTriangle } from 'lucide-react';

export default function SuppliersSection() {
  const { suppliers, deleteSupplier, getSupplierStats } = useSupplier();
  const { checkLimit, getRemainingCount, licenseType } = useLicense();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Si on visualise un fournisseur, afficher la vue détaillée
  if (viewingSupplier) {
    const supplier = suppliers.find(s => s.id === viewingSupplier);
    if (supplier) {
      return (
        <SupplierDetailView 
          supplier={supplier}
          onBack={() => setViewingSupplier(null)}
        />
      );
    }
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.ice.includes(searchTerm) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      deleteSupplier(id);
    }
  };

  const handleAddSupplier = () => {
    if (!checkLimit('suppliers')) {
      setShowUpgradeModal(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Actif
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Inactif
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <Building2 className="w-8 h-8 text-orange-600" />
          <span>Fournisseurs</span>
          {licenseType === 'free' && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
              {getRemainingCount('suppliers')}/{10} restants
            </span>
          )}
        </h1>
        <button 
          onClick={handleAddSupplier}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Fournisseur</span>
        </button>
      </div>

      {/* Alerte limite */}
      {licenseType === 'free' && !checkLimit('suppliers') && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300">Limite atteinte</h3>
              <p className="text-red-800 dark:text-red-300 text-sm">
                Vous avez atteint la limite de 10 fournisseurs. Passez à la version PRO pour débloquer un nombre illimité.
              </p>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Passer en PRO
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Rechercher par nom, ICE, email ou contact..."
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grille des fournisseurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => {
          const stats = getSupplierStats(supplier.id);
          
          return (
            <div key={supplier.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{supplier.name}</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setViewingSupplier(supplier.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Voir détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setEditingSupplier(supplier.id)}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">ICE:</span>
                  <span>{supplier.ice}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{supplier.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Contact:</span>
                  <span className="truncate">{supplier.contactPerson}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 gap-4 text-center mb-3">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{stats.ordersCount}</p>
                    <p className="text-xs text-gray-500">Commandes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalPurchases.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">MAD Achats</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className={`text-lg font-bold ${
                    stats.balance > 0 ? 'text-red-600' : 
                    stats.balance < 0 ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {stats.balance.toLocaleString()} MAD
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.balance > 0 ? 'À payer' : stats.balance < 0 ? 'Crédit' : 'Soldé'}
                  </p>
                </div>
                
                <div className="mt-3 flex justify-center">
                  {getStatusBadge(supplier.status)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Aucun fournisseur trouvé</p>
        </div>
      )}

      {/* Modal d'upgrade */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">🔒 Limite Atteinte</h3>
                    <p className="text-sm opacity-90">Version Gratuite</p>
                  </div>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Limite de fournisseurs atteinte
                  </h3>
                  <p className="text-gray-600">
                    Vous avez atteint la limite de <strong>10 fournisseurs</strong> de la version gratuite. 
                    Passez à la version PRO pour débloquer un nombre illimité.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-orange-900 mb-2">🚀 Avantages Version PRO</h4>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>✅ Fournisseurs illimités</li>
                    <li>✅ Gestion avancée des commandes</li>
                    <li>✅ Tableaux de bord détaillés</li>
                    <li>✅ Export PDF/Excel</li>
                    <li>✅ Support prioritaire</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Plus tard
                  </button>
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      // Rediriger vers la page d'upgrade (vous pouvez adapter selon votre logique)
                      window.location.href = '/upgrade';
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <Crown className="w-4 h-4" />
                      <span>Passer en PRO</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddSupplierModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {editingSupplier && (
        <EditSupplierModal
          isOpen={!!editingSupplier}
          onClose={() => setEditingSupplier(null)}
          supplier={suppliers.find(s => s.id === editingSupplier)!}
        />
      )}
    </div>
  );
}