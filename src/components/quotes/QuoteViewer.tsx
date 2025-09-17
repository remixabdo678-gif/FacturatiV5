import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLicense } from '../../contexts/LicenseContext';
import { Quote } from '../../contexts/DataContext';
import TemplateRenderer from '../templates/TemplateRenderer';
import ProTemplateModal from '../license/ProTemplateModal';
import { X, Download, Edit, Printer, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface QuoteViewerProps {
  quote: Quote;
  onClose: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onUpgrade?: () => void;
}

export default function QuoteViewer({ quote, onClose, onEdit, onDownload, onUpgrade }: QuoteViewerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { licenseType } = useLicense();

  const [selectedTemplate, setSelectedTemplate] = React.useState(user?.company?.defaultTemplate || 'template1');
  const [showProModal, setShowProModal] = React.useState(false);
  const [includeSignature, setIncludeSignature] = React.useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showProSignatureModal, setShowProSignatureModal] = useState(false);

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
    // Obtenir le contenu directement depuis l'élément affiché
    const quoteContent = document.getElementById('quote-content');
    if (!quoteContent) {
      alert('Erreur: Contenu du devis non trouvé');
      return;
    }
    const options = {
      margin: [5, 5, 5, 5],
      filename: `Devis_${quote.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
         width: 794,
        height: 1135
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    html2pdf()
      .set(options)
      .from(quoteContent)
      .save()
      .catch((error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        alert('Erreur lors de la génération du PDF');
      });
  };

  const generateTemplate1HTML = () => {
    return `
      <div>
        <!-- Contenu du template -->
        <h1>DEVIS ${quote.number}</h1>
      </div>
    `;
  };

  const generateTemplate2HTML = () => generateTemplate1HTML();
  const generateTemplate3HTML = () => generateTemplate1HTML();
  const generateTemplate4HTML = () => generateTemplate1HTML();
  const generateTemplate5HTML = () => generateTemplate1HTML();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Devis {quote.number}</h3>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

               {/* PDF */}
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>

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
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quote Content */}
          <div id="quote-content" className="p-6 bg-white">
            <TemplateRenderer
              templateId={selectedTemplate}
              data={quote}
              type="quote"
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


          {/* Modal Pro Signature */}
          {showProSignatureModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full text-center shadow-xl">
                <h2 className="text-xl font-bold mb-2">⚡ Fonctionnalité PRO</h2>
                <p className="text-gray-600 mb-6">L’ajout de signature est réservé aux utilisateurs PRO.</p>
                <button
                  onClick={() => setShowProSignatureModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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
