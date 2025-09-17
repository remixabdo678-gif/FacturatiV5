import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLicense } from '../../contexts/LicenseContext';
import { Invoice } from '../../contexts/DataContext';
import TemplateRenderer from '../templates/TemplateRenderer';
import ProTemplateModal from '../license/ProTemplateModal';
import { useNavigate } from 'react-router-dom';

import { X, Download, Edit, Printer, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface InvoiceViewerProps {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onUpgrade?: () => void;
}

export default function InvoiceViewer({ invoice, onClose, onEdit, onDownload, onUpgrade }: InvoiceViewerProps) {
  const { user } = useAuth();
  const { licenseType } = useLicense();
  const navigate = useNavigate();

  const [selectedTemplate, setSelectedTemplate] = React.useState(user?.company?.defaultTemplate || 'template1');
  const [showProModal, setShowProModal] = React.useState(false);
  const [includeSignature, setIncludeSignature] = React.useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showProSignatureModal, setShowProSignatureModal] = useState(false); // ✅ Modal spécial pour signature PRO

  const templates = [
    { id: 'template1', name: 'Classique', isPro: false },
    { id: 'template2', name: 'Moderne Coloré', isPro: true },
    { id: 'template3', name: 'Minimaliste', isPro: true },
    { id: 'template4', name: 'Corporate', isPro: true },
    { id: 'template5', name: 'Premium Élégant', isPro: true }
  ];

  const getTemplateName = (templateId: string) => {
    return templates.find(t => t.id === templateId)?.name || 'Template';
  };

  const isTemplateProOnly = (templateId: string) => {
    return templates.find(t => t.id === templateId)?.isPro || false;
  };

  const handlePrint = () => {
    if (isTemplateProOnly(selectedTemplate) && licenseType !== 'pro') {
      setShowProModal(true);
      return;
    }
    generatePDFWithTemplate();
  };

  const handleDownloadPDF = () => {
    if (isTemplateProOnly(selectedTemplate) && licenseType !== 'pro') {
      setShowProModal(true);
      return;
    }
    generatePDFWithTemplate();
  };

  const generatePDFWithTemplate = () => {
    const invoiceContent = document.getElementById('invoice-content');
    if (!invoiceContent) {
      alert('Erreur: Contenu de la facture non trouvé');
      return;
    }

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
        width: 794,
        height: 1124
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    html2pdf()
      .set(options)
      .from(invoiceContent)
      .save()
      .catch((error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        alert('Erreur lors de la génération du PDF');
      });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Facture {invoice.number}
            </h3>
            <div className="flex items-center space-x-3">
              
              {/* Sélecteur Template */}
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="template1">Classique</option>
                <option value="template2">Moderne</option>
                <option value="template3">Minimaliste</option>
                <option value="template4">Corporate</option>
                <option value="template5">Premium</option>
              </select>
           
              {/* PDF */}
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>

              {/* Impression */}
              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>

              {/* ✅ Checkbox Signature */}
              <label className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSignature}
                  onChange={(e) => {
                    if (e.target.checked) {
                      if (licenseType !== 'pro') {
                        setShowProSignatureModal(true); // ✅ modal si pas PRO
                        setIncludeSignature(false);
                      } else if (!user?.company?.signature) {
                        setShowSignatureModal(true);
                        setIncludeSignature(false);
                      } else {
                        setIncludeSignature(true);
                      }
                    } else {
                      setIncludeSignature(false);
                    }
                  }}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">Signature</span>
              </label>

              {/* Bouton Modifier */}
              <button
                onClick={onEdit}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>

              {/* Fermer */}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu facture */}
          <div id="invoice-content" style={{ backgroundColor: 'white', padding: '20px' }}>
            <TemplateRenderer 
              templateId={selectedTemplate}
              data={invoice}
              type="invoice"
              includeSignature={includeSignature}
            />
          </div>

          {/* Modal Signature manquante */}
          {showSignatureModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full text-center shadow-xl">
                <h2 className="text-xl font-bold mb-2">🖋️ Signature électronique manquante</h2>
                <p className="text-gray-600 mb-4">
                  Pour ajouter une signature sur vos factures, enregistrez-la dans vos paramètres.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setShowSignatureModal(false);
                      navigate('/settings');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ajouter maintenant
                  </button>
                  <button
                    onClick={() => setShowSignatureModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Plus tard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Modal PRO Signature */}
          {showProSignatureModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full text-center shadow-xl">
                <h2 className="text-xl font-bold mb-2">⚡ Fonctionnalité PRO</h2>
                <p className="text-gray-600 mb-6">
                  L’ajout de signature est réservé aux utilisateurs avec une <b>Licence PRO</b>.
                </p>
                <button
                  onClick={() => setShowProSignatureModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* Modal Pro Template */}
          {showProModal && (
            <ProTemplateModal
              isOpen={showProModal}
              onClose={() => setShowProModal(false)}
              templateName={getTemplateName(selectedTemplate)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

