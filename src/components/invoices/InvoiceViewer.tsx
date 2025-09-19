import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLicense } from '../../contexts/LicenseContext';
import { Invoice } from '../../contexts/DataContext';
import TemplateRenderer from '../templates/TemplateRenderer';
import ProTemplateModal from '../license/ProTemplateModal';
import { useNavigate } from 'react-router-dom';
import { X, Download, Edit, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';

interface InvoiceViewerProps {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onUpgrade?: () => void;
}

export default function InvoiceViewer({ invoice, onClose, onEdit }: InvoiceViewerProps) {
  const { user } = useAuth();
  const { licenseType } = useLicense();
  const navigate = useNavigate();

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
    { id: 'template5', name: 'Premium Élégant', isPro: true }
  ];

  const getTemplateName = (templateId: string) => templates.find(t => t.id === templateId)?.name || 'Template';
  const isTemplateProOnly = (templateId: string) => templates.find(t => t.id === templateId)?.isPro || false;

  // ---------- PDF helpers ----------
  const findHeaderFooter = () => {
    const root = document.getElementById('invoice-content') as HTMLElement | null;
    if (!root) throw new Error('Contenu introuvable');
    const header = root.querySelector('.pdf-header') as HTMLElement | null;
    const footer = root.querySelector('.pdf-footer') as HTMLElement | null;
    return { root, header, footer };
  };

  const captureHF = async (el: HTMLElement | null) => {
    if (!el) return { dataUrl: null as string | null, w: 0, h: 0 };
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
    return { dataUrl: canvas.toDataURL('image/png'), w: canvas.width, h: canvas.height };
  };

  const buildOptions = (filename: string, headerMM: number, footerMM: number): html2pdf.Options => ({
    margin: [headerMM, 8, footerMM, 8],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    pagebreak: { mode: ['css', 'legacy'], avoid: ['.avoid-break', '.keep-together'] },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (el: Element) => (el as HTMLElement).classList?.contains('pdf-exclude'),
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  });

  const renderPdfWithHF = async (action: 'download' | 'print') => {
    const { root, header, footer } = findHeaderFooter();

    
    // capture header/footer pour les repeindre
    const [hImg, fImg] = await Promise.all([captureHF(header), captureHF(footer)]);
    const PAGE_W_MM = 210;
    const headerMM = hImg.dataUrl ? (hImg.h / hImg.w) * PAGE_W_MM : 0;
    const footerMM = fImg.dataUrl ? (fImg.h / fImg.w) * PAGE_W_MM : 0;

    const options = buildOptions(`Facture_${invoice.number}.pdf`, headerMM, footerMM);

    root.classList.add('exporting'); // pourquoi: on laisse la marge au moteur PDF
    try {
      // construit le pdf sans header/footer (exclus)
      const worker: any = (html2pdf() as any).set(options).from(root).toPdf();
      const pdf: any = await worker.get('pdf');

      // repeindre header/footer sur chaque page
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const hH = hImg.dataUrl ? (hImg.h / hImg.w) * pageW : 0;
      const fH = fImg.dataUrl ? (fImg.h / fImg.w) * pageW : 0;
      const total = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        pdf.setPage(i);
        if (hImg.dataUrl) pdf.addImage(hImg.dataUrl, 'PNG', 0, 0, pageW, hH);
        if (fImg.dataUrl) pdf.addImage(fImg.dataUrl, 'PNG', 0, pageH - fH, pageW, fH);
      }

      if (action === 'download') {
        pdf.save(`Facture_${invoice.number}.pdf`);
      } else {
        const blob: Blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        const win = window.open('', '_blank');
        if (!win) {
          alert("Autorisez les pop-ups pour l'impression.");
          return;
        }
        win.document.write(`
          <html><head><title>Facture_${invoice.number}</title><meta charset="utf-8"/></head>
          <body style="margin:0">
            <iframe src="${url}" style="border:0;width:100%;height:100vh"
              onload="this.contentWindow && this.contentWindow.focus && this.contentWindow.print && this.contentWindow.print()"></iframe>
          </body></html>
        `);
        win.document.close();
      }
    } finally {
      root.classList.remove('exporting');
    }
  };

  const handlePrint = async () => {
    if (isTemplateProOnly(selectedTemplate) && licenseType !== 'pro') { setShowProModal(true); return; }
    try { await renderPdfWithHF('print'); } catch (e) { console.error(e); alert('Erreur impression'); }
  };

  const handleDownloadPDF = async () => {
    if (isTemplateProOnly(selectedTemplate) && licenseType !== 'pro') { setShowProModal(true); return; }
    try { await renderPdfWithHF('download'); } catch (e) { console.error(e); alert('Erreur PDF'); }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <style>{`
        .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        .keep-together { break-inside: avoid; page-break-inside: avoid; }
        #invoice-content.exporting .pdf-content { padding-top:16px !important; padding-bottom:16px !important; }
      `}</style>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Facture {invoice.number}</h3>
            <div className="flex items-center space-x-3">
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

              <button onClick={handleDownloadPDF} className="inline-flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                <Download className="w-4 h-4" /><span>PDF</span>
              </button>
              <button onClick={handlePrint} className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                <Printer className="w-4 h-4" /><span>Imprimer</span>
              </button>

              <label className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSignature}
                  onChange={(e) => {
                    if (e.target.checked) {
                      if (licenseType !== 'pro') { setShowProSignatureModal(true); setIncludeSignature(false); }
                      else if (!user?.company?.signature) { setShowSignatureModal(true); setIncludeSignature(false); }
                      else { setIncludeSignature(true); }
                    } else { setIncludeSignature(false); }
                  }}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">Signature</span>
              </label>

              <button onClick={onEdit} className="inline-flex items-center space-x-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm">
                <Edit className="w-4 h-4" /><span>Modifier</span>
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu facture */}
          <div id="invoice-content" style={{ backgroundColor: 'white', padding: '20px' }}>
            <TemplateRenderer templateId={selectedTemplate} data={invoice} type="invoice" includeSignature={includeSignature} />
          </div>

          {/* Modals Signature */}
          {showSignatureModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full text-center shadow-xl">
                <h2 className="text-xl font-bold mb-2">🖋️ Signature électronique manquante</h2>
                <p className="text-gray-600 mb-4">Ajoutez votre signature dans les paramètres.</p>
                <div className="flex justify-center space-x-3">
                  <button onClick={() => { setShowSignatureModal(false); navigate('/settings'); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Ajouter maintenant</button>
                  <button onClick={() => setShowSignatureModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Plus tard</button>
                </div>
              </div>
            </div>
          )}
          {showProSignatureModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full text-center shadow-xl">
                <h2 className="text-xl font-bold mb-2">⚡ Fonctionnalité PRO</h2>
                <p className="text-gray-600 mb-6">L’ajout de signature est réservé aux utilisateurs avec une <b>Licence PRO</b>.</p>
                <button onClick={() => setShowProSignatureModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">OK</button>
              </div>
            </div>
          )}
          {showProModal && (
            <ProTemplateModal isOpen={showProModal} onClose={() => setShowProModal(false)} templateName={getTemplateName(selectedTemplate)} />
          )}
        </div>
      </div>
    </div>
  );
}
