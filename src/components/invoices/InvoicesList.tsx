import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLicense } from '../../contexts/LicenseContext';
import InvoiceViewer from './InvoiceViewer';
import EditInvoice from './EditInvoice';
import InvoiceStatusModal from './InvoiceStatusModal';
import ProTemplateModal from '../license/ProTemplateModal';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Crown, CreditCard, FileText } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function InvoicesList() {
  const { t } = useLanguage();
  const { licenseType } = useLicense();
  const { invoices, deleteInvoice, updateInvoice } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingInvoice, setViewingInvoice] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [blockedTemplateName, setBlockedTemplateName] = useState('');
  const [showUpgradePage, setShowUpgradePage] = useState(false);
  const [statusModalInvoice, setStatusModalInvoice] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});

  const toggleYearExpansion = (year: number) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const isTemplateProOnly = (templateId: string = 'template1') => {
    const proTemplates = ['template2', 'template3', 'template4', 'template5'];
    return proTemplates.includes(templateId);
  };

  const getTemplateName = (templateId: string = 'template1') => {
    const templates = {
      'template1': 'Classique',
      'template2': 'Moderne Coloré',
      'template3': 'Minimaliste',
      'template4': 'Corporate',
      'template5': 'Premium Élégant'
    };
    return templates[templateId as keyof typeof templates] || 'Template';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unpaid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Non payé
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            Payé
          </span>
        );
      case 'collected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Encaissé
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Brouillon
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Non payé
          </span>
        );
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Grouper les factures par année
  const invoicesByYear = filteredInvoices.reduce((acc, invoice) => {
    const year = new Date(invoice.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(invoice);
    return acc;
  }, {} as Record<number, typeof filteredInvoices>);

  // Calculer les statistiques par année
  const getYearStats = (yearInvoices: typeof filteredInvoices) => {
    const count = yearInvoices.length;
    const totalTTC = yearInvoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0);
    return { count, totalTTC };
  };

  // Trier les années par ordre décroissant
  const sortedYears = Object.keys(invoicesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      deleteInvoice(id);
    }
  };

  const handleViewInvoice = (id: string) => {
    setViewingInvoice(id);
  };

  const handleDownloadInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
      // Vérifier si le template par défaut est Pro et l'utilisateur est Free
      if (isTemplateProOnly('template1') && licenseType !== 'pro') {
        setBlockedTemplateName(getTemplateName('template1'));
        setShowProModal(true);
        return;
      }
      downloadInvoicePDF(invoice, 'template1'); // Template par défaut pour la liste
    }
  };

  const downloadInvoicePDF = (invoice: any, templateId: string = 'template1') => {
    // Créer un élément visible temporaire pour la génération PDF
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '0';
    tempDiv.style.left = '0';
    tempDiv.style.width = '210mm';
    tempDiv.style.minHeight = '297mm';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.zIndex = '-1';
    tempDiv.style.opacity = '0';
    tempDiv.innerHTML = generateSimpleInvoiceHTML(invoice, false); // Pas de signature par défaut dans la liste
    document.body.appendChild(tempDiv);

    // Options pour html2pdf
    const options = {
      margin: [5, 5, 5, 5],
      filename: `Facture_${invoice.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: 800,
        height: 1200
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    // Générer et télécharger le PDF
    html2pdf()
      .set(options)
      .from(tempDiv)
      .save()
      .then(() => {
        // Nettoyer l'élément temporaire
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

  const handleEditInvoice = (id: string) => {
    setEditingInvoice(id);
  };

  const handleSaveEdit = (id: string, updatedData: any) => {
    updateInvoice(id, updatedData);
    setEditingInvoice(null);
  };

  const handleUpdateStatus = (id: string, status: string, paymentMethod?: string, collectionDate?: string, collectionType?: string) => {
    const updateData: any = { status };
    
    if (status === 'paid' && paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }
    
    if (status === 'collected' && collectionDate && collectionType) {
      updateData.collectionDate = collectionDate;
      updateData.collectionType = collectionType;
    }
    
    updateInvoice(id, updateData);
    setStatusModalInvoice(null);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      'bank_transfer': 'Virement',
      'cash': 'Espèces',
      'check': 'Chèque',
      'promissory_note': 'Effet'
    };
    return labels[method as keyof typeof labels] || method;
  };
  const generateTemplateHTMLWithTemplate = (invoice: any, templateId: string) => {
    // Générer le HTML selon le template spécifié
    let templateContent = '';
    
    switch (templateId) {
      case 'template1':
        templateContent = generateTemplate1HTML(invoice);
        break;
      case 'template2':
        templateContent = generateTemplate2HTML(invoice);
        break;
      case 'template3':
        templateContent = generateTemplate3HTML(invoice);
        break;
      case 'template4':
        templateContent = generateTemplate4HTML(invoice);
        break;
      case 'template5':
        templateContent = generateTemplate5HTML(invoice);
        break;
      default:
        templateContent = generateTemplate1HTML(invoice);
    }
    
    const baseStyles = `
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        @media print {
          body { 
            margin: 0; 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          color: #333;
          margin: 0;
          padding: 0;
          font-size: 14px;
          background: white;
          max-width: 800px;
          margin: 0 auto;
        }
      </style>
    `;

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facture ${invoice.number}</title>
        ${baseStyles}
      </head>
      <body>
        ${templateContent}
      </body>
      </html>
    `;
  };

  const generateTemplate1HTML = (invoice: any) => {
    return `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #d1d5db;">
          <div>
            <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #1f2937; font-weight: bold;">${invoice.client.name || 'Entreprise'}</h2>
            <p style="margin: 2px 0; font-size: 12px;">${invoice.client.address || ''}</p>
            <p style="margin: 2px 0; font-size: 12px;">${invoice.client.phone || ''}</p>
            <div style="margin-top: 8px; font-size: 11px; color: #6b7280;">
              <p style="margin: 1px 0;">ICE: ${invoice.client.ice || ''}</p>
            </div>
          </div>
          <div style="text-align: right;">
            <h1 style="margin: 0 0 8px 0; font-size: 28px; color: #059669; font-weight: bold;">FACTURE</h1>
            <p style="margin: 2px 0; font-size: 12px;"><strong>N°:</strong> ${invoice.number}</p>
            <p style="margin: 2px 0; font-size: 12px;"><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        
        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">DÉSIGNATION</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">QUANTITÉ</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">P.U. HT</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">TOTAL HT</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">${item.description}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${item.quantity.toFixed(3)}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${item.unitPrice.toFixed(2)} MAD</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-weight: 500;">${item.total.toFixed(2)} MAD</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div style="display: flex; justify-content: space-between; margin: 20px 0;">
          <!-- Bloc gauche -->
          <div style="width: 45%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
            <p style="font-size: 14px; font-weight: bold; text-align: center; margin-bottom: 10px;">Arrêtée la présente facture à la somme de :</p>
            <p style="font-size: 14px; margin: 0;">• ${invoice.totalInWords}</p>
          </div>

          <!-- Bloc droit -->
          <div style="width: 45%; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px;">
              <span>Sous-total HT:</span>
              <span><strong>${invoice.subtotal.toFixed(2)} MAD</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px;">
              <span>TVA:</span>
              <span><strong>${invoice.totalVat.toFixed(2)} MAD</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; color: #059669; border-top: 1px solid #d1d5db; padding-top: 8px; margin-top: 8px;">
              <span>Total TTC:</span>
              <span>${invoice.totalTTC.toFixed(2)} MAD</span>
            </div>
          </div>
        </div>
        
        <!-- Signature -->
        <div style="margin: 20px 0;">
          <div style="width: 300px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center;">
            <div style="font-weight: bold; margin-bottom: 15px;">Signature</div>
            <div style="border: 2px solid #d1d5db; border-radius: 8px; height: 100px;"></div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f3f4f6; border-top: 2px solid #9ca3af; padding: 20px; text-align: center; font-size: 12px; color: #374151;">
          <p style="margin: 0;">
            <strong>${invoice.client.name || ''}</strong> | ${invoice.client.address || ''} |
            <strong>Tél :</strong> ${invoice.client.phone || ''} |
            <strong>Email :</strong> ${invoice.client.email || ''} |
            <strong>Site :</strong> ${invoice.client.website || ''} |
            <strong>ICE :</strong> ${invoice.client.ice || ''} |
            <strong>Patente :</strong> ${invoice.client.patente || ''}
          </p>
        </div>
      </div>
    `;
  };

  // Ajouter les autres fonctions de génération de templates (template2, 3, 4, 5)
  const generateTemplate2HTML = (invoice: any) => {
    return generateTemplate1HTML(invoice);
  };

  const generateTemplate3HTML = (invoice: any) => {
    return generateTemplate1HTML(invoice);
  };

  const generateTemplate4HTML = (invoice: any) => {
    return generateTemplate1HTML(invoice);
  };

  const generateTemplate5HTML = (invoice: any) => {
    return generateTemplate1HTML(invoice);
  };

  const generateSimpleInvoiceHTML = (invoice: any, includeSignature: boolean = false) => {
    return `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white; width: 100%; min-height: 297mm;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #059669; padding-bottom: 20px;">
          <h1 style="font-size: 32px; color: #059669; margin: 0; font-weight: bold;">FACTURE</h1>
          <h2 style="font-size: 24px; color: #1f2937; margin: 10px 0; font-weight: bold;">${user?.company?.name || ''}</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">${user?.company?.address || ''}</p>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Tél: ${user?.company?.phone || ''} | Email: ${user?.company?.email || ''}</p>
        </div>
        
        <!-- Info facture et client -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div style="width: 48%;">
            <h3 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 10px; border-bottom: 1px solid #d1d5db; padding-bottom: 5px;">FACTURÉ À:</h3>
            <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">${invoice.client.name}</p>
            <p style="margin: 5px 0; font-size: 12px;">${invoice.client.address || ''}</p>
            <p style="margin: 5px 0; font-size: 12px;">ICE: ${invoice.client.ice}</p>
            <p style="margin: 5px 0; font-size: 12px;">Tél: ${invoice.client.phone || ''}</p>
            <p style="margin: 5px 0; font-size: 12px;">Email: ${invoice.client.email || ''}</p>
          </div>
          <div style="width: 48%; text-align: right;">
            <p style="margin: 5px 0; font-size: 14px;"><strong>Facture N°:</strong> ${invoice.number}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Échéance:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : 'À réception'}</p>
          </div>
        </div>
        
        <!-- Table des articles -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0; font-weight: bold;">DESCRIPTION</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">QTÉ</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">PRIX UNIT.</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">TOTAL HT</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.description}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #e2e8f0;">${item.quantity}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #e2e8f0;">${item.unitPrice.toFixed(2)} MAD</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">${item.total.toFixed(2)} MAD</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Totaux -->
        <div style="margin-top: 30px;">
          <div style="float: right; width: 300px; background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px;">
              <span>Sous-total HT:</span>
              <span><strong>${invoice.subtotal.toFixed(2)} MAD</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px;">
              <span>TVA:</span>
              <span><strong>${invoice.totalVat.toFixed(2)} MAD</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; color: #059669; border-top: 2px solid #059669; padding-top: 10px; margin-top: 10px;">
              <span>Total TTC:</span>
              <span>${invoice.totalTTC.toFixed(2)} MAD</span>
            </div>
          </div>
          <div style="clear: both;"></div>
        </div>
        
        <!-- Montant en lettres -->
        <div style="margin-top: 30px; background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #0c4a6e;">
            Arrêtée la présente facture à la somme de: ${invoice.totalInWords}
          </p>
        </div>
        
        <!-- Conditions -->
        <div style="margin-top: 20px; background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
              <p style="margin: 0; font-size: 12px; color: #92400e;">
                <strong>Conditions:</strong> Règlement à 30 jours. Merci de votre confiance.
              </p>
            </div>
            ${includeSignature && user?.company?.signature ? 
              `<div style="width: 120px; height: 80px; border: 1px solid #f59e0b; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: white;">
                <img src="${user.company.signature}" alt="Signature" style="max-height: 70px; max-width: 110px; object-fit: contain;" />
              </div>` : 
              ''
            }
          </div>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; text-align: center; font-size: 11px; color: #6b7280;">
          <p style="margin: 0;">
            <strong>${user?.company?.name || ''}</strong> | ${user?.company?.address || ''} | 
            Tél: ${user?.company?.phone || ''} | Email: ${user?.company?.email || ''} | 
            ICE: ${user?.company?.ice || ''} | IF: ${user?.company?.if || ''} | 
            RC: ${user?.company?.rc || ''} | Patente: ${user?.company?.patente || ''}
          </p>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('invoices')}</h1>
        <Link
          to="/invoices/create"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createInvoice')}</span>
        </Link>
      </div>

      {/* Filters */}
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
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Rechercher par client ou numéro..."
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
          
            
  
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      {/* Blocs par année */}
      <div className="space-y-6">
        {sortedYears.length > 0 ? (
          sortedYears.map((year) => {
            const yearInvoices = invoicesByYear[year];
            const stats = getYearStats(yearInvoices);
            
            return (
              <div key={year} className="space-y-4">
                {/* Bloc statistiques de l'année */}
                <div 
                  className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:from-teal-700 hover:to-blue-700 transition-all duration-200"
                  onClick={() => toggleYearExpansion(year)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Factures - {year}</h2>
                        <p className="text-sm opacity-90">Résumé de l'année {year}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-white">{stats.count}</p>
                          <p className="text-sm opacity-90 text-white">Factures</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-white">{stats.totalTTC.toLocaleString()}</p>
                          <p className="text-sm opacity-90 text-white">MAD Total TTC</p>
                        </div>
                      </div>
                      </div>
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        {expandedYears[year] ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tableau des factures de l'année - Collapsible */}
                {expandedYears[year] && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Facture
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Client
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Date émission
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Montant TTC
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
                          {yearInvoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.number}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.client.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">ICE: {invoice.client.ice}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(invoice.date).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {invoice.totalTTC.toLocaleString()} MAD
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  {getStatusBadge(invoice.status)}
                                  {invoice.status === 'paid' && invoice.paymentMethod && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {getPaymentMethodLabel(invoice.paymentMethod)}
                                    </div>
                                  )}
                                  {invoice.status === 'collected' && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {invoice.collectionDate && new Date(invoice.collectionDate).toLocaleDateString('fr-FR')}
                                      {invoice.collectionType && ` (${invoice.collectionType})`}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-3">
                                  <button 
                                    onClick={() => setStatusModalInvoice(invoice.id)}
                                    className="text-purple-600 hover:text-purple-700 transition-colors" 
                                    title="Statut"
                                  >
                                    <CreditCard className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleViewInvoice(invoice.id)}
                                    className="text-blue-600 hover:text-blue-700 transition-colors" 
                                    title="Voir"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleEditInvoice(invoice.id)}
                                    className="text-amber-600 hover:text-amber-700 transition-colors" 
                                    title="Modifier"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteInvoice(invoice.id)}
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
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Aucune facture trouvée</p>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 <strong>Astuce :</strong> Le statut par défaut d'une facture est "Non payé". 
                Vous pouvez le modifier en cliquant sur le bouton Statut dans les actions.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewingInvoice && (
        <InvoiceViewer
          invoice={invoices.find(inv => inv.id === viewingInvoice)!}
          onClose={() => setViewingInvoice(null)}
          onEdit={() => {
            setViewingInvoice(null);
            setEditingInvoice(viewingInvoice);
          }}
          onDownload={() => handleDownloadInvoice(viewingInvoice)}
          onUpgrade={() => setShowUpgradePage(true)}
        />
      )}

      {editingInvoice && (
        <EditInvoice
          invoice={invoices.find(inv => inv.id === editingInvoice)!}
          onSave={(updatedData) => handleSaveEdit(editingInvoice, updatedData)}
          onCancel={() => setEditingInvoice(null)}
        />
      )}

      {/* Modal Pro Template */}
      {showProModal && (
        <ProTemplateModal
          isOpen={showProModal}
          onClose={() => setShowProModal(false)}
          templateName={blockedTemplateName}
        />
      )}

      {/* Page d'upgrade */}
      {showUpgradePage && (
        <div className="fixed inset-0 z-[60] bg-gray-500 bg-opacity-75">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Passez à la version Pro</h3>
                <p className="text-gray-600 mb-6">
                  Débloquez tous les templates premium et fonctionnalités avancées !
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowUpgradePage(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg">
                    Acheter Pro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusModalInvoice && (
        <InvoiceStatusModal
          isOpen={!!statusModalInvoice}
          onClose={() => setStatusModalInvoice(null)}
          invoice={invoices.find(inv => inv.id === statusModalInvoice)!}
          onUpdateStatus={(status, paymentMethod, collectionDate, collectionType) => 
            handleUpdateStatus(statusModalInvoice, status, paymentMethod, collectionDate, collectionType)
          }
        />
      )}

      {/* Info message pour les nouvelles factures */}
      {invoices.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Information :</strong> Le statut par défaut d'une facture est "Non payé". 
            Vous pouvez le modifier en cliquant sur l'icône 💳 dans la colonne Actions.
          </p>
        </div>
      )}
    </div>
  );
}