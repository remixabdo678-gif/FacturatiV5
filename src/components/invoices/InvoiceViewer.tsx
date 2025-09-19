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

  const [selectedTemplate, setSelectedTemplate] = React.useState(user?.company?.defaultTemplate || 'template1');
  const [showProModal, setShowProModal] = React.useState(false);
  const [includeSignature, setIncludeSignature] = React.useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showProSignatureModal, setShowProSignatureModal] = useState(false);

  const isTemplateProOnly = (templateId: string) =>
    ([
      { id: 'template1', isPro: false },
      { id: 'template2', isPro: true },
      { id: 'template3', isPro: true },
      { id: 'template4', isPro: true },
      { id: 'template5', isPro: true },
    ] as const).find(t => t.id === templateId)?.isPro ?? false;

  const handlePDF = async () => {
    if (isTemplateProOnly(selectedTemplate) && licenseType !== 'pro') {
      setShowProModal(true);
      return;
    }
    await generatePDFWithTemplate();
  };

  // px -> mm (html dpi ~96)
  const pxToMm = (px: number) => (px * 25.4) / 96;

  const generatePDFWithTemplate = async () => {
    const root = document.getElementById('invoice-content');
    if (!root) return alert('Erreur: Contenu de la facture non trouvé');

    // signal "export" pour adapter le padding top/bottom (éviter double espace)
    root.classList.add('exporting');

    const headerEl = root.querySelector('.pdf-header') as HTMLElement | null;
    const footerEl = root.querySelector('.pdf-footer') as HTMLElement | null;

    // capture header/footer (images)
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

    // marge haute/basse par page = hauteur image à l’échelle A4 (210mm de large)
    const PAGE_W_MM = 210; // A4 portrait
    const headerMM = headerImg ? (hSize.h / hSize.w) * PAGE_W_MM : 0;
    const footerMM = footerImg ? (fSize.h / fSize.w) * PAGE_W_MM : 0;

    const options: html2pdf.Options = {
      // marge par page pour libérer la zone header/footer
      margin: [headerMM, 8, footerMM, 8],
      filename: `Facture_${invoice.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.avoid-break', '.keep-together'] },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        // exclure les vraies balises header/footer (on les repeindra)
        ignoreElements: (el: Element) => (el as HTMLElement).classList?.contains('pdf-exclude'),
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    try {
      const worker = html2pdf().set(options).from(root).toPdf();
      const pdf: any = await worker.get('pdf');

      const pageW = pdf.internal.pageSize.getWidth();   // mm
      const pageH = pdf.internal.pageSize.getHeight();  // mm
      const headerH = headerImg ? (hSize.h / hSize.w) * pageW : 0;
      const footerH = footerImg ? (fSize.h / fSize.w) * pageW : 0;
      const totalPages = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        if (headerImg) pdf.addImage(headerImg, 'PNG', 0, 0, pageW, headerH); // pourquoi: réserver visuel en haut
        if (footerImg) pdf.addImage(footerImg, 'PNG', 0, pageH - footerH, pageW, footerH); // et en bas
      }

      pdf.save(`Facture_${invoice.number}.pdf`);
    } catch (e) {
      console.error('Erreur PDF:', e);
      alert('Erreur lors de la génération du PDF');
    } finally {
      root.classList.remove('exporting'); // toujours retirer
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      {/* règles PDF */}
      <style>{`
        .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        .keep-together { break-inside: avoid; page-break-inside: avoid; }
        .html2pdf__page-break { height:0; page-break-before: always; break-before: page; }
        /* réduire le padding pendant export pour éviter double marge (header/footer déjà en margin) */
        #invoice-content.exporting .pdf-content { padding-top: 16px !important; padding-bottom: 16px !important; }
      `}</style>

      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
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
                <option value="template3">Moderne avec formes vertes Pro</option>
                <option value="template4">Bleu Élégant Pro</option>
                <option value="template5">Minimal Bleu Pro</option>
              </select>

              <button onClick={handlePDF} className="inline-flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                <Download className="w-4 h-4" /><span>PDF</span>
              </button>
              <button onClick={handlePDF} className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                <Printer className="w-4 h-4" /><span>Imprimer</span>
              </button>

              <label className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSignature}
                  onChange={(e) => setIncludeSignature(e.target.checked)}
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

          <div id="invoice-content" style={{ backgroundColor: 'white', padding: '20px' }}>
            <TemplateRenderer
              templateId={selectedTemplate}
              data={invoice}
              type="invoice"
              includeSignature={includeSignature}
            />
          </div>

          {/* Modals (inchangés) */}
          {showSignatureModal && <div />}
          {showProSignatureModal && <div />}
          {showProModal && <ProTemplateModal isOpen={showProModal} onClose={() => setShowProModal(false)} templateName={selectedTemplate} />}
        </div>
      </div>
    </div>
  );
}