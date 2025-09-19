import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrder } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Edit, 
  Calendar, 
  User, 
  Package,
  DollarSign,
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, getOrderById } = useOrder();
  const { user } = useAuth();
  
  const order = id ? getOrderById(id) : null;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Commande non trouvée
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            La commande demandée n'existe pas ou a été supprimée.
          </p>
          <Link
            to="/commandes"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux commandes</span>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'livre':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            ✅ Livré
          </span>
        );
      case 'en_cours_livraison':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
            🚚 En cours de livraison
          </span>
        );
      case 'annule':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            ❌ Annulé
          </span>
        );
      default:
        return null;
    }
  };

  const getClientName = () => {
    if (order.clientType === 'personne_physique') {
      return order.clientName || 'Client particulier';
    } else {
      return order.client?.name || 'Client société';
    }
  };

  const handlePrintDeliveryNote = () => {
    const deliveryNoteContent = generateDeliveryNoteHTML();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(deliveryNoteContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleDownloadPDF = () => {
    const deliveryNoteContent = generateDeliveryNoteHTML();
    
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '0';
    tempDiv.style.left = '0';
    tempDiv.style.width = '210mm';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.zIndex = '-1';
    tempDiv.style.opacity = '0';
    tempDiv.innerHTML = deliveryNoteContent;
    document.body.appendChild(tempDiv);

    const options = {
      margin: [10, 10, 10, 10],
      filename: `Bon_Livraison_${order.number}.pdf`,
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

  const generateDeliveryNoteHTML = () => {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bon de Livraison ${order.number}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: Arial, sans-serif; line-height: 1.5; color: #333; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
          .company-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .client-info { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .order-info { background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: bold; }
          .totals { margin-top: 20px; text-align: right; }
          .signature { margin-top: 30px; display: flex; justify-content: space-between; }
          .signature-box { width: 200px; height: 100px; border: 2px solid #d1d5db; text-align: center; padding: 10px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="font-size: 32px; color: #3B82F6; margin: 0;">BON DE LIVRAISON</h1>
          <h2 style="font-size: 24px; color: #1f2937; margin: 10px 0;">${user?.company?.name || ''}</h2>
          <p style="color: #6b7280;">${user?.company?.address || ''}</p>
        </div>
        
        <div class="company-info">
          <div class="client-info" style="width: 48%;">
            <h3 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 10px;">CLIENT</h3>
            <p style="font-weight: bold; margin: 5px 0;">${getClientName()}</p>
            ${order.clientType === 'societe' && order.client ? `
              <p style="margin: 5px 0;">ICE: ${order.client.ice}</p>
              <p style="margin: 5px 0;">Adresse: ${order.client.address}</p>
              <p style="margin: 5px 0;">Tél: ${order.client.phone}</p>
              <p style="margin: 5px 0;">Email: ${order.client.email}</p>
            ` : `
              <p style="margin: 5px 0; font-style: italic;">Client particulier</p>
            `}
          </div>
          
          <div class="order-info" style="width: 48%;">
            <h3 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 10px;">COMMANDE</h3>
            <p style="margin: 5px 0;"><strong>N°:</strong> ${order.number}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString('fr-FR')}</p>
            ${order.deliveryDate ? `
              <p style="margin: 5px 0;"><strong>Livraison:</strong> ${new Date(order.deliveryDate).toLocaleString('fr-FR')}</p>
            ` : ''}
            <p style="margin: 5px 0;"><strong>Statut:</strong> ${
              order.status === 'livre' ? 'Livré' :
              order.status === 'en_cours_livraison' ? 'En cours' : 'Annulé'
            }</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>PRODUIT</th>
              <th style="text-align: center;">QUANTITÉ</th>
              <th style="text-align: center;">PRIX UNIT. HT</th>
              <th style="text-align: center;">TOTAL HT</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr>
                <td>${item.productName}</td>
                <td style="text-align: center;">${item.quantity.toFixed(3)} ${item.unit || 'unité'}</td>
                <td style="text-align: center;">${item.unitPrice.toFixed(2)} MAD</td>
                <td style="text-align: center; font-weight: bold;">${item.total.toFixed(2)} MAD</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p style="margin: 5px 0;"><strong>Sous-total HT:</strong> ${order.subtotal.toFixed(2)} MAD</p>
          ${order.totalVat > 0 ? `<p style="margin: 5px 0;"><strong>TVA:</strong> ${order.totalVat.toFixed(2)} MAD</p>` : ''}
          <p style="margin: 10px 0; font-size: 18px; font-weight: bold; color: #3B82F6;">
            <strong>TOTAL TTC: ${order.totalTTC.toFixed(2)} MAD</strong>
          </p>
        </div>
        
        <div class="signature">
          <div class="signature-box">
            <p style="margin: 0; font-weight: bold;">Signature Client</p>
            <p style="margin: 5px 0; font-size: 12px;">Bon pour accord</p>
          </div>
          <div class="signature-box">
            <p style="margin: 0; font-weight: bold;">Signature Livreur</p>
            <p style="margin: 5px 0; font-size: 12px;">Date et heure</p>
          </div>
        </div>
        
        <div class="footer">
          <p>
            <strong>${user?.company?.name || ''}</strong> | ${user?.company?.address || ''} | 
            Tél: ${user?.company?.phone || ''} | Email: ${user?.company?.email || ''} | 
            ICE: ${user?.company?.ice || ''} | IF: ${user?.company?.if || ''} | 
            RC: ${user?.company?.rc || ''} | Patente: ${user?.company?.patente || ''}
          </p>
        </div>
      </body>
      </html>
    `;
  };

  const getTotalQuantity = () => {
    return order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/commandes')}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Commande {order.number}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Détails et bon de livraison
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={handlePrintDeliveryNote}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
          <Link
            to={`/commandes/${order.id}/modifier`}
            className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Modifier</span>
          </Link>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations commande */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Package className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Informations Commande</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Numéro:</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">{order.number}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Date de commande:</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(order.orderDate).toLocaleString('fr-FR')}
              </p>
            </div>
            {order.deliveryDate && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Date de livraison:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(order.deliveryDate).toLocaleString('fr-FR')}
                </p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Statut:</span>
              <div className="mt-1">
                {getStatusBadge(order.status)}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Stock débité:</span>
              <p className={`font-medium ${order.stockDebited ? 'text-red-600' : 'text-green-600'}`}>
                {order.stockDebited ? 'Oui' : 'Non'}
              </p>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            {order.clientType === 'personne_physique' ? (
              <User className="w-6 h-6 text-green-600" />
            ) : (
              <Building2 className="w-6 h-6 text-blue-600" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {order.clientType === 'personne_physique' ? 'Client Particulier' : 'Client Société'}
            </h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Nom:</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">{getClientName()}</p>
            </div>
            
            {order.clientType === 'societe' && order.client && (
              <>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">ICE:</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{order.client.ice}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.client.address}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.client.phone}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.client.email}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Totaux */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Totaux</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sous-total HT:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{order.subtotal.toFixed(2)} MAD</span>
            </div>
            
            {order.totalVat > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">TVA:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{order.totalVat.toFixed(2)} MAD</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900 dark:text-gray-100">Total TTC:</span>
                <span className="text-xl font-bold text-blue-600">{order.totalTTC.toFixed(2)} MAD</span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Quantité totale:</span>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {getTotalQuantity().toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles détaillés */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Articles Commandés</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Prix Unitaire HT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  TVA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total HT
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {order.items.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.productName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Unité: {item.unit || 'unité'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.quantity.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.unitPrice.toFixed(2)} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.vatRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.total.toFixed(2)} MAD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📋 Informations de Livraison</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <p><strong>Type de client:</strong> {order.clientType === 'personne_physique' ? 'Particulier' : 'Société'}</p>
            <p><strong>TVA appliquée:</strong> {order.applyVat ? 'Oui' : 'Non'}</p>
          </div>
          <div>
            <p><strong>Articles:</strong> {order.items.length}</p>
            <p><strong>Quantité totale:</strong> {getTotalQuantity().toFixed(1)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}