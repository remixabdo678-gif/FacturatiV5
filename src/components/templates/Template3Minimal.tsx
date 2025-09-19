// ==========================================
// src/components/templates/Template3Minimal.tsx
// ==========================================
import React from 'react';
import { Invoice, Quote } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface TemplateProps {
  data: Invoice | Quote;
  type: 'invoice' | 'quote';
  includeSignature?: boolean;
}

export default function Template3Minimal({ data, type, includeSignature = false }: TemplateProps) {
  const { user } = useAuth();
  const THEME = '#0a1f44';
  const HEADER_H = 200;
  const FOOTER_H = 90;

  // --- format helpers (pour cohérence PDF) ---
  const normUnit = (u?: string) => (u || 'unité').toLowerCase().trim();
  const is3decUnit = (u?: string) => /^(t|tonne|tonnes|kg|kilogram(?:me|mes)?|l|litre|litres|liter|liters)$/.test(normUnit(u));
  const formatQty = (q: number, u?: string) =>
    q.toLocaleString('fr-FR', { minimumFractionDigits: is3decUnit(u) ? 3 : 0, maximumFractionDigits: is3decUnit(u) ? 3 : 0 });
  const formatAmount = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const vatGroups = data.items.reduce(
    (acc: Record<number, { amount: number; products: string[] }>, item) => {
      const vat = (item.unitPrice * item.quantity * item.vatRate) / 100;
      if (!acc[item.vatRate]) acc[item.vatRate] = { amount: 0, products: [] };
      acc[item.vatRate].amount += vat;
      acc[item.vatRate].products.push(item.description);
      return acc;
    }, {}
  );
  const vatRates = Object.keys(vatGroups).map(Number).sort((a,b)=>a-b);

  return (
    <div className="bg-white mx-auto relative" style={{ fontFamily: 'Arial, sans-serif', width: '100%', maxWidth: 750 }}>
      {/* HEADER (exclu & répété en PDF) */}
      <div className="pdf-header pdf-exclude" style={{ position:'absolute', top:0, left:0, right:0, height: HEADER_H }}>
       
        <div className="p-5 text-center relative">
          {user?.company.logo && <img src={user.company.logo} alt="Logo" className="mx-auto" style={{ height: 85, width: 85, objectFit:'contain' }} />}
          <h1 className="text-3xl font-extrabold" style={{ color: THEME }}>{user?.company.name}</h1>
          <h2 className="text-2xl font-semibold mt-4 uppercase tracking-wide" style={{ color: THEME }}>
            {type === 'invoice' ? 'FACTURE' : 'DEVIS'}
          </h2>
        </div>
      </div>

      {/* CONTENU */}
      <div className="pdf-content relative z-10" style={{ paddingTop: HEADER_H + 16, paddingBottom: FOOTER_H + 16 }}>
        {/* CLIENT + DATES */}
        <div className="p-8" style={{ borderBottom: `1px solid ${THEME}` }}>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded border shadow-sm" style={{ borderColor: THEME }}>
              <h3 className="font-bold mb-3 pb-2 text-center text-sm" style={{ color: THEME, borderBottom: `1px solid ${THEME}` }}>
                CLIENT : {data.client.name} {data.client.address}
              </h3>
              <div className="text-sm text-gray-700 space-y-1 text-center">
                <p><strong>ICE:</strong> {data.client.ice}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded border shadow-sm" style={{ borderColor: THEME }}>
              <h3 className="font-bold text-sm mb-3 pb-2 text-center" style={{ color: THEME, borderBottom: `1px solid ${THEME}` }}>
                DATE : {new Date(data.date).toLocaleDateString('fr-FR')}
              </h3>
              <div className="text-sm text-gray-700 space-y-1 text-center">
                <p><strong>{type === 'invoice' ? 'FACTURE' : 'DEVIS'} N° :</strong> {data.number}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="p-8" style={{ borderBottom: `1px solid ${THEME}` }}>
          <table className="w-full rounded overflow-visible" style={{ border: `1px solid ${THEME}` }}>
            <thead className="text-white text-sm" style={{ backgroundColor: THEME }}>
              <tr>
                <th className="px-4 py-2 text-center">Description</th>
                <th className="px-4 py-2 text-center">Quantité</th>
                <th className="px-4 py-2 text-center">P.U. HT</th>
                <th className="px-4 py-2 text-center">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 avoid-break" style={{ borderTop: `1px solid ${THEME}` }}>
                  <td className="px-4 py-2 text-center text-sm">{item.description}</td>
                  <td className="px-4 py-2 text-center text-sm">
                    {formatQty(item.quantity, item.unit)} ({item.unit || 'unité'})
                  </td>
                  <td className="px-4 py-2 text-center text-sm">{formatAmount(item.unitPrice)} MAD</td>
                  <td className="px-4 py-2 text-center font-semibold text-sm">{formatAmount(item.total)} MAD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== BLOC TOTAUX (seul) ===== */}
        <section className="keep-together p-8">
          <div className="flex flex-wrap gap-6">
            {/* Montant en lettres */}
            <div className="w-[48%] min-w-[280px] bg-white rounded border p-4 shadow-sm" style={{ borderColor: THEME }}>
              <div className="text-sm font-bold pt-3 pb-4 text-center" style={{ color: THEME }}>
                <p>Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :</p>
              </div>
              <div className="text-sm font-bold pt-2" style={{ color: THEME, borderTop: `1px solid ${THEME}` }}>
                <p>• {data.totalInWords}</p>
              </div>
            </div>
            {/* TVA / Totaux */}
            <div className="w-[48%] min-w-[280px] bg-white rounded border p-4 shadow-sm" style={{ borderColor: THEME }}>
              <div className="flex justify-between mb-2 text-sm">
                <span>Total HT :</span><span className="font-medium">{formatAmount(data.subtotal)} MAD</span>
              </div>
              <div className="text-sm mb-2">
                {vatRates.map((rate) => {
                  const g = vatGroups[rate];
                  const showProducts = g.products.length === 1; // pourquoi: nom uniquement si unique
                  return (
                    <div key={rate} className="flex justify-between">
                      <span>TVA : {rate}% {showProducts && <span style={{ fontSize: 10, color: '#555' }}>({g.products[0]})</span>}</span>
                      <span className="font-medium">{formatAmount(g.amount)} MAD</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-sm font-bold pt-2" style={{ borderTop: `1px solid ${THEME}`, color: THEME }}>
                <span>TOTAL TTC :</span><span>{formatAmount(data.totalTTC)} MAD</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== BLOC SIGNATURE (séparé) ===== */}
        <section className="p-8 avoid-break">
          <div className="w-60 bg-gray-50 border rounded p-4 text-center" style={{ borderColor: THEME }}>
            <div className="text-sm font-bold mb-3" style={{ color: THEME }}>Signature</div>
            <div className="border-2 rounded-sm h-20 flex items-center justify-center relative" style={{ borderColor: THEME }}>
              {includeSignature && user?.company?.signature ? (
                <img
                  src={user.company.signature}
                  alt="Signature"
                  className="max-h-18 max-w-full object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} /* why: éviter image cassée */
                />
              ) : (<span className="text-gray-400 text-sm">&nbsp;</span>)}
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER (exclu & répété en PDF) */}
      <div className="pdf-footer pdf-exclude" style={{ position:'absolute', bottom:0, left:0, right:0, height: FOOTER_H }}>
        <div className="p-6 text-center text-sm text-white h-full" style={{ backgroundColor: THEME }}>
          <p>
            <strong>{user?.company.name}</strong> | {user?.company.address} | <strong>Tél :</strong> {user?.company.phone} |
            <strong> ICE :</strong> {user?.company.ice} | <strong>IF:</strong> {user?.company.if} | <strong>RC:</strong> {user?.company.rc} |
            <strong> CNSS:</strong> {user?.company.cnss} | <strong>Patente :</strong> {user?.company.patente} |
            <strong> EMAIL :</strong> {user?.company.email} | <strong>SITE WEB :</strong> {user?.company.website}
          </p>
        </div>
      </div>
    </div>
  );
}