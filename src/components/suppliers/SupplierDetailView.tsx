import React, { useState } from 'react';
import { useSupplier, Supplier } from '../../contexts/SupplierContext';
import AddPurchaseOrderModal from './AddPurchaseOrderModal';
import EditPurchaseOrderModal from './EditPurchaseOrderModal';
import AddSupplierPaymentModal from './AddSupplierPaymentModal';
import EditSupplierPaymentModal from './EditSupplierPaymentModal';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Calendar, 
  DollarSign,
  FileText,
  CreditCard,
  Download,
  AlertTriangle,
  CheckCircle,
  Target,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface SupplierDetailViewProps {
  supplier: Supplier;
  onBack: () => void;
}

export default function SupplierDetailView({ supplier, onBack }: SupplierDetailViewProps) {
  const { 
    purchaseOrders, 
    supplierPayments, 
    getSupplierStats,
    deletePurchaseOrder,
    deleteSupplierPayment
  } = useSupplier();
  
  const [activeTab, setActiveTab] = useState('orders');
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  
  const stats = getSupplierStats(supplier.id);
  const supplierOrders = purchaseOrders.filter(order => order.supplierId === supplier.id);
  const supplierPaymentsData = supplierPayments.filter(payment => payment.supplierId === supplier.id);

  const tabs = [
    { id: 'orders', label: 'Commandes', icon: FileText },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'balance', label: 'Balance', icon: DollarSign }
  ];

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Payé
          </span>
        );
      case 'received':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Reçu
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Envoyé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Brouillon
          </span>
        );
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const badges = {
      'virement': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Virement' },
      'cheque': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chèque' },
      'espece': { bg: 'bg-green-100', text: 'text-green-800', label: 'Espèces' },
      'carte': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Carte' }
    };
    
    const badge = badges[method as keyof typeof badges] || badges.virement;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      deletePurchaseOrder(id);
    }
  };

  const handleDeletePayment = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      deleteSupplierPayment(id);
    }
  };

  const handleExportPDF = () => {
    const reportContent = generateSupplierReportHTML();
    
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '0';
    tempDiv.style.left = '0';
    tempDiv.style.width = '210mm';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.zIndex = '-1';
    tempDiv.style.opacity = '0';
    tempDiv.innerHTML = reportContent;
    document.body.appendChild(tempDiv);

    const options = {
      margin: [10, 10, 10, 10],
      filename: `Fournisseur_${supplier.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    html2pdf()
      .set(options)
      .from(tempDiv)
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
      })
      .catch((error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
        alert('Erreur lors de la génération du PDF');
      });
  };

  const generateSupplierReportHTML = () => {
    return `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #EA580C; padding-bottom: 20px;">
          <h1 style="font-size: 28px; color: #EA580C; margin: 0; font-weight: bold;">FICHE FOURNISSEUR DÉTAILLÉE</h1>
          <h2 style="font-size: 20px; color: #1f2937; margin: 10px 0; font-weight: bold;">${supplier.name}</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <!-- Informations fournisseur -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📋 Informations Générales</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9;">
              <p style="font-size: 14px; color: #0c4a6e; margin: 0;"><strong>Nom:</strong> ${supplier.name}</p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b;">
              <p style="font-size: 14px; color: #92400e; margin: 0;"><strong>ICE:</strong> ${supplier.ice}</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a;">
              <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Contact:</strong> ${supplier.contactPerson}</p>
            </div>
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #dc2626;">
              <p style="font-size: 14px; color: #991b1b; margin: 0;"><strong>Délai:</strong> ${supplier.paymentTerms} jours</p>
            </div>
          </div>
        </div>
        
        <!-- Statistiques financières -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">💰 Résumé Financier</h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9; text-align: center;">
              <p style="font-size: 20px; font-weight: bold; color: #0c4a6e; margin: 0;">${stats.totalPurchases.toLocaleString()} MAD</p>
              <p style="font-size: 12px; color: #0c4a6e; margin: 5px 0;">Total Commandes</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a; text-align: center;">
              <p style="font-size: 20px; font-weight: bold; color: #166534; margin: 0;">${stats.totalPayments.toLocaleString()} MAD</p>
              <p style="font-size: 12px; color: #166534; margin: 5px 0;">Total Paiements</p>
            </div>
            <div style="background: ${stats.balance > 0 ? '#fee2e2' : '#dcfce7'}; padding: 15px; border-radius: 8px; border: 1px solid ${stats.balance > 0 ? '#dc2626' : '#16a34a'}; text-align: center;">
              <p style="font-size: 20px; font-weight: bold; color: ${stats.balance > 0 ? '#991b1b' : '#166534'}; margin: 0;">${stats.balance.toLocaleString()} MAD</p>
              <p style="font-size: 12px; color: ${stats.balance > 0 ? '#991b1b' : '#166534'}; margin: 5px 0;">${stats.balance > 0 ? 'À payer' : 'Crédit'}</p>
            </div>
          </div>
        </div>
        
        <!-- Commandes -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📦 Commandes</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">N° Commande</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Date</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Montant TTC</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Statut</th>
              </tr>
            </thead>
            <tbody>
              ${supplierOrders.map(order => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${order.number}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${new Date(order.date).toLocaleDateString('fr-FR')}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${order.totalTTC.toLocaleString()} MAD</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${order.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Paiements -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">💳 Paiements</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">Date</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Montant</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Mode</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Référence</th>
              </tr>
            </thead>
            <tbody>
              ${supplierPaymentsData.map(payment => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${payment.amount.toLocaleString()} MAD</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${payment.paymentMethod}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${payment.reference}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fiche Fournisseur</h1>
            <p className="text-gray-600 dark:text-gray-300">{supplier.name}</p>
          </div>
        </div>
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Informations générales */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2 transition-colors duration-300">
              <Building2 className="w-5 h-5 text-orange-600" />
              <span>Informations générales</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">{supplier.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">ICE: {supplier.ice}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">{supplier.contactPerson}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Personne de contact</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{supplier.phone}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{supplier.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{supplier.address}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2 transition-colors duration-300">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Résumé financier</span>
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalPurchases.toLocaleString()}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">MAD Total Commandes</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalPayments.toLocaleString()}</div>
                <div className="text-sm text-green-700 dark:text-green-300">MAD Total Paiements</div>
              </div>
              <div className={`border rounded-lg p-4 text-center ${
                stats.balance > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' : 
                stats.balance < 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}>
                <div className={`text-2xl font-bold flex items-center justify-center space-x-2 ${
                  stats.balance > 0 ? 'text-red-600' : 
                  stats.balance < 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {stats.balance > 0 ? (
                    <TrendingUp className="w-6 h-6" />
                  ) : stats.balance < 0 ? (
                    <TrendingDown className="w-6 h-6" />
                  ) : (
                    <Target className="w-6 h-6" />
                  )}
                  <span>{stats.balance.toLocaleString()}</span>
                </div>
                <div className={`text-sm ${
                  stats.balance > 0 ? 'text-red-700 dark:text-red-300' : 
                  stats.balance < 0 ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  MAD {stats.balance > 0 ? 'À payer' : stats.balance < 0 ? 'Crédit' : 'Soldé'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Commandes d'Achat</h3>
              <button
                onClick={() => setIsAddOrderModalOpen(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Commande</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    N° Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Articles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sous-total HT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    TVA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total TTC
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
                {supplierOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(order.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {order.items.map(item => item.productName).join(', ')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {order.subtotal.toLocaleString()} MAD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {order.totalVat.toLocaleString()} MAD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {order.totalTTC.toLocaleString()} MAD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getOrderStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setEditingOrder(order.id)}
                          className="text-amber-600 hover:text-amber-700 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
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

          {supplierOrders.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune commande pour ce fournisseur</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Historique des Paiements</h3>
              <button
                onClick={() => setIsAddPaymentModalOpen(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Paiement</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mode de paiement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {supplierPaymentsData.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      {payment.amount.toLocaleString()} MAD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentMethodBadge(payment.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {payment.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payment.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setEditingPayment(payment.id)}
                          className="text-amber-600 hover:text-amber-700 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
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

          {supplierPaymentsData.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun paiement pour ce fournisseur</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'balance' && (
        <div className="space-y-6">
          {/* Balance principale */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Balance Fournisseur</h3>
              
              <div className={`inline-flex items-center space-x-3 px-8 py-6 rounded-2xl ${
                stats.balance > 0 ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700' : 
                stats.balance < 0 ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700' : 
                'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
              }`}>
                {stats.balance > 0 ? (
                  <AlertTriangle className="w-12 h-12 text-red-600" />
                ) : stats.balance < 0 ? (
                  <CheckCircle className="w-12 h-12 text-green-600" />
                ) : (
                  <Target className="w-12 h-12 text-gray-600" />
                )}
                <div>
                  <div className={`text-4xl font-bold ${
                    stats.balance > 0 ? 'text-red-600' : 
                    stats.balance < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {stats.balance.toLocaleString()} MAD
                  </div>
                  <div className={`text-lg ${
                    stats.balance > 0 ? 'text-red-700 dark:text-red-300' : 
                    stats.balance < 0 ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {stats.balance > 0 ? 'Montant à payer' : 
                     stats.balance < 0 ? 'Crédit disponible' : 'Compte soldé'}
                  </div>
                </div>
              </div>

              {stats.balance > 0 && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-red-800 dark:text-red-300 text-sm">
                    ⚠️ Vous devez {stats.balance.toLocaleString()} MAD à ce fournisseur.
                    Délai de paiement: {supplier.paymentTerms} jours.
                  </p>
                </div>
              )}

              {stats.balance < 0 && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <p className="text-green-800 dark:text-green-300 text-sm">
                    ✅ Vous avez un crédit de {Math.abs(stats.balance).toLocaleString()} MAD chez ce fournisseur.
                  </p>
                </div>
              )}

              {stats.balance === 0 && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-300 text-sm">
                    ✅ Le compte est parfaitement soldé avec ce fournisseur.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Détail de la balance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Détail du Calcul</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Total des commandes</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{stats.ordersCount} commande{stats.ordersCount > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">+{stats.totalPurchases.toLocaleString()}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">MAD</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">Total des paiements</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{supplierPaymentsData.length} paiement{supplierPaymentsData.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">-{stats.totalPayments.toLocaleString()}</p>
                  <p className="text-sm text-green-700 dark:text-green-300">MAD</p>
                </div>
              </div>

              <div className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                stats.balance > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600' : 
                stats.balance < 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' : 
                'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`}>
                <div className="flex items-center space-x-3">
                  <DollarSign className={`w-6 h-6 ${
                    stats.balance > 0 ? 'text-red-600' : 
                    stats.balance < 0 ? 'text-green-600' : 'text-gray-600'
                  }`} />
                  <div>
                    <p className={`font-bold ${
                      stats.balance > 0 ? 'text-red-900 dark:text-red-100' : 
                      stats.balance < 0 ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      Balance finale
                    </p>
                    <p className={`text-sm ${
                      stats.balance > 0 ? 'text-red-700 dark:text-red-300' : 
                      stats.balance < 0 ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Commandes - Paiements
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    stats.balance > 0 ? 'text-red-600' : 
                    stats.balance < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {stats.balance > 0 ? '+' : ''}{stats.balance.toLocaleString()}
                  </p>
                  <p className={`text-sm ${
                    stats.balance > 0 ? 'text-red-700 dark:text-red-300' : 
                    stats.balance < 0 ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    MAD
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddPurchaseOrderModal 
        isOpen={isAddOrderModalOpen} 
        onClose={() => setIsAddOrderModalOpen(false)} 
      />

      {editingOrder && (
        <EditPurchaseOrderModal
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          order={purchaseOrders.find(order => order.id === editingOrder)!}
        />
      )}

      <AddSupplierPaymentModal 
        isOpen={isAddPaymentModalOpen} 
        onClose={() => setIsAddPaymentModalOpen(false)} 
      />

      {editingPayment && (
        (() => {
          const payment = supplierPayments.find(payment => payment.id === editingPayment);
          return payment ? (
            <EditSupplierPaymentModal
              isOpen={!!editingPayment}
              onClose={() => setEditingPayment(null)}
              payment={payment}
            />
          ) : null;
        })()
      )}
    </div>
  );
}