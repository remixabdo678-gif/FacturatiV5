// src/components/quotes/QuoteViewer.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLicense } from '../../contexts/LicenseContext';
import { Quote } from '../../contexts/DataContext';
import TemplateRenderer from '../templates/TemplateRenderer';
import ProTemplateModal from '../license/ProTemplateModal';
import { X, Download, Edit, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';

interface QuoteViewerProps {
  quote: Quote;
  onClose: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onUpgrade?: () => void;
}

export default function QuoteViewer({ quote, onClose, onEdit }: QuoteViewerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { licenseType } = useLicense();

  const [selectedTemplate, setSelectedTemplate] = useState(user?.company?.defaultTemplate || 'template1');
  const [showProModal, setShowProModal] = useState(false);
  const [includeSignature, setIncludeSignature] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showProSignatureModal, setShowProSignatureModal] = useState(false);

  const templates = [
    { id: 'template1', name: 'Classique', isPro: false },
    { id: 'template2', name: 'Moderne Coloré', isPro: true },
    { id: 'template3', name: 'Minimaliste', isPro: true },
    { id: 'template4', name: 'Corporate', isPro: true },
    { id: 'template5', name: 'Premium Élégant', isPro: true },
  ] as const;

  const getTemplateName = (templateId: string) =>
    templates.find(t => t.id === templateId)?.name || 'Template';

  const isTemplateProOnly = (templateId: string) =>
    templates.find(t => t.id === templateId)?.isPro || false;

  const handlePDF = async () => {
    if (isTemplateProOnly(selectedTemplate) && licenseType !== 'pro') {
      setShowProModal(true);
      return;
    }
    await generatePDFWithTemplate();
  };

  // px -> mm
  const pxToMm = (px: number) => (px * 25.4) / 96;

  const generatePDFWithTemplate = async () => {
    const root = document.getElementById('quote-content');
    if (!root) {
      alert('Erreur: Contenu du devis non trouvé');
      return;
    }

    // réduire le padding top/bottom pendant l’export (les marges PDF remplacent le header/footer)
    root.classList.add('exporting');

    const headerEl = root.querySelector('.pdf-header') as HTMLElement | null;
    const footerEl = root.querySelector('.pdf-footer') as HTMLElement | null;

    // capture header/footer comme images (pour les repeindre sur chaque page)
    const [headerImg, hSize, footerImg, fSize] = await (async () => {
      const res: [string | null, { w: number; h: number }, string | null, { w: number; h: number }] = [
        null,
        { w: 0, h: 0 },
        null,
        { w: 0, h: 0 },
      ];
      if (headerEl) {
        const c = await html2canvas(headerEl, { scale: 2, useCORS: true, backgroundColor: null });
        res[0] = c.toDataURL('image/png');
        res[1] = { w: c.width, h: c.height };
      }
      if (footerEl) {
        const c = await html2canvas(footerEl, { scale: 2, useCORS: true, backgroundColor: null });
        res[2] = c.toDataURL('image/png');
        res[3] = { w: c.width, h: c.height };
      }
      return res;
    })();

    // marges dynamiques = hauteur header/footer mis à l’échelle largeur page
    const PAGE_W_MM = 210; // A4 portrait
    const headerMM = headerImg ? (hSize.h / hSize.w) * PAGE_W_MM : 0;
    const footerMM = footerImg ? (fSize.h / fSize.w) * PAGE_W_MM : 0;

    const options: html2pdf.Options = {
      margin: [headerMM, 8, footerMM, 8],
      filename: `Devis_${quote.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.avoid-break', '.keep-together'] },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        // ne pas rasteriser les vrais header/footer, on les repeindra
        ignoreElements: (el: Element) => (el as HTMLElement).classList?.contains('pdf-exclude'),
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    try {
      const worker = html2pdf().set(options).from(root).toPdf();
      const pdf: any = await worker.get('pdf');

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const headerH = headerImg ? (hSize.h / hSize.w) * pageW : 0;
      const footerH = footerImg ? (fSize.h / fSize.w) * pageW : 0;
      const totalPages = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        if (headerImg) pdf.addImage(headerImg, 'PNG', 0, 0, pageW, headerH); // pourquoi: garantir header fixe
        if (footerImg) pdf.addImage(footerImg, 'PNG', 0, pageH - footerH, pageW, footerH); // pourquoi: garantir footer fixe
      }

      pdf.save(`Devis_${quote.number}.pdf`);
    } catch (e) {
      console.error('Erreur PDF:', e);
      alert('Erreur lors de la génération du PDF');
    } finally {
      root.classList.remove('exporting');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      {/* Règles PDF communes */}
      <style>{`
        .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        .keep-together { break-inside: avoid; page-break-inside: avoid; }
        .html2pdf__page-break { height:0; page-break-before: always; break-before: page; }
        /* réduire padding pendant export: marges PDF occupent l'espace header/footer */
        #quote-content.exporting .pdf-content { padding-top: 16px !important; padding-bottom: 16px !important; }
      `}</style>

      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Devis {quote.number}</h3>
            <div className="flex items-center space-x-3">
              {/* Sélecteur Template */}
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="template1">Classic Free</option>
                <option value="template2">Noir Classique Pro</option>
                <option value="template3">Minimaliste Pro</option>
                <option value="template4">Corporate Pro</option>
                <option value="template5">Premium Élégant Pro</option>
              </select>

              {/* PDF */}
              <button onClick={handlePDF} className="inline-flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                <Download className="w-4 h-4" /><span>PDF</span>
              </button>

              {/* Impression */}
              <button onClick={handlePDF} className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                <Printer className="w-4 h-4" /><span>Imprimer</span>
              </button>

              {/* Signature (PRO) */}
              <label className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSignature}
                  onChange={(e) => {
                    if (e.target.checked) {
                      if (licenseType !== 'pro') {
                        setShowProSignatureModal(true);
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

              {/* Modifier */}
              <button onClick={onEdit} className="inline-flex items-center space-x-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm">
                <Edit className="w-4 h-4" /><span>Modifier</span>
              </button>

              {/* Fermer */}
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu devis */}
          <div id="quote-content" style={{ backgroundColor: 'white', padding: '20px' }}>
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
                <p className="text-gray-600 mb-4">Pour ajouter une signature sur vos devis, enregistrez-la dans vos paramètres.</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => { setShowSignatureModal(false); navigate('/settings'); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ajouter maintenant
                  </button>
                  <button onClick={() => setShowSignatureModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                    Plus tard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal PRO Signature */}
          {showProSignatureModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full text-center shadow-xl">
                <h2 className="text-xl font-bold mb-2">⚡ Fonctionnalité PRO</h2>
                <p className="text-gray-600 mb-6">L’ajout de signature est réservé aux utilisateurs avec une <b>Licence PRO</b>.</p>
                <button onClick={() => setShowProSignatureModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
