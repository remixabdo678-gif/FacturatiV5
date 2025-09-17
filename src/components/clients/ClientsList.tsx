import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AddClientModal from './AddClientModal';
import EditClientModal from './EditClientModal';
import { Plus, Search, Edit, Trash2, Phone, Mail, Eye } from 'lucide-react';

export default function ClientsList() {
  const { t } = useLanguage();
  const { clients, deleteClient, invoices } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.ice.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour calculer les statistiques d'un client
  const getClientStats = (clientId: string) => {
    const clientInvoices = invoices.filter(invoice => invoice.clientId === clientId);
    const totalInvoices = clientInvoices.length;
    const totalAmount = clientInvoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0);
    const paidAmount = clientInvoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.totalTTC, 0);
    const pendingAmount = clientInvoices
      .filter(invoice => invoice.status === 'pending' || invoice.status === 'sent')
      .reduce((sum, invoice) => sum + invoice.totalTTC, 0);
    
    return {
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount
    };
  };
  const handleDeleteClient = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      deleteClient(id);
    }
  };

  const handleEditClient = (id: string) => {
    setEditingClient(id);
  };

  const getLastInvoiceDate = (clientId: string) => {
    const clientInvoices = invoices.filter(invoice => invoice.clientId === clientId);
    if (clientInvoices.length === 0) return null;
    
    const sortedInvoices = clientInvoices.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return new Date(sortedInvoices[0].createdAt).toLocaleDateString('fr-FR');
  };
  return (
    <>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('clients')}</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Rechercher par nom, ICE ou email..."
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const stats = getClientStats(client.id);
          const lastInvoiceDate = getLastInvoiceDate(client.id);
          
          return (
          <div key={client.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{client.name}</h3>
              <div className="flex space-x-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleEditClient(client.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteClient(client.id)}
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
                <span>{client.ice}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="truncate">{client.email}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-teal-600">{stats.totalInvoices}</p>
                  <p className="text-xs text-gray-500">Factures</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">MAD Total</p>
                </div>
              </div>
              
              {stats.totalInvoices > 0 && lastInvoiceDate && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Dernière facture: {lastInvoiceDate}
                  </p>
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Aucun client trouvé</p>
        </div>
      )}

      <AddClientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>

    {editingClient && (
      <EditClientModal
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        client={clients.find(c => c.id === editingClient)!}
      />
    )}
    </>
  );
}