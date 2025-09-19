// src/components/templates/Template5Premium.tsx
import React from 'react';
import { Invoice, Quote } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface TemplateProps {
  data: Invoice | Quote;
  type: 'invoice' | 'quote';
  includeSignature?: boolean;
}

export default function Template5Premium({ data, type, includeSignature = false }: TemplateProps) {
  const { user } = useAuth();
  const title = type === 'invoice' ? 'FACTURE' : 'DEVIS';
  const THEME = '#0a1f44';
  const ACCENT = '#c1121f';

  const HEADER_H = 170;
  const FOOTER_H = 120;

  // ----- format helpers -----
  const normUnit = (u?: string) => (u || 'unité').toLowerCase().trim();
  const is3decUnit = (u?: string) =>
    /^(t|tonne|tonnes|kg|kilogram(?:me|mes)?|l|litre|litres|liter|liters)$/.test(normUnit(u));
  const formatQty = (q: number, u?: string) =>
    q.toLocaleString('fr-FR', {
      minimumFractionDigits: is3decUnit(u) ? 3 : 0,
      maximumFractionDigits: is3decUnit(u) ? 3 : 0,
    });
  const formatAmount = (n: number) =>
    n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const vatGroups = data.items.reduce(
    (acc: Record<number, { amount: number; products: string[] }>, item) => {
      const vat = (item.unitPrice * item.quantity * item.vatRate) / 100;
      if (!acc[item.vatRate]) acc[item.vatRate] = { amount: 0, products: [] };
      acc[item.vatRate].amount += vat;
      acc[item.vatRate].products.push(item.description);
      return acc;
    },
    {}
  );
  const vatRates = Object.keys(vatGroups).map(Number).sort((a, b) => a - b);

  return (
    <div className="bg-white mx-auto relative" style={{ fontFamily: 'Arial, sans-serif', width: '100%', maxWidth: 750 }}>
      {/* ===== HEADER (exclu, repeint par page) ===== */}
      <div className="pdf-header pdf-exclude" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_H }}>
        <div className="relative" style={{ background: THEME, color: '#fff', height: '100%' }}>
          <div className="h-full flex items-center justify-between px-8">
            {user?.company.logo ? (
              <img src={user.company.logo} alt="Logo" className="mx-auto" style={{ height: 120, width: 120, objectFit: 'contain' }} />
            ) : (
              <div style={{ width: 160 }} />
            )}
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-extrabold">{user?.company.name}</h1>
              <h2 className="text-3xl font-bold mt-6 uppercase tracking-wide">{title}</h2>
            </div>
            <div className="w-5" />
          </div>
         
        </div>
      </div>

      {/* ===== CONTENU ===== */}
      <div className="pdf-content" style={{ paddingTop: HEADER_H + 16, paddingBottom: FOOTER_H + 16 }}>
        {/* CLIENT + DATES */}
        <div className="p-8 border-b border-black">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded border border-black text-center">
              <h3 className="font-bold text-sm text-black mb-3 border-b border-black pb-2">
                CLIENT : {data.client.name} {data.client.address}
              </h3>
              <p className="text-sm text-black"><strong>ICE:</strong> {data.client.ice}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded border border-black text-center">
              <h3 className="font-bold text-sm text-black mb-3 border-b border-black pb-2">
                DATE : {new Date(data.date).toLocaleDateString('fr-FR')}
              </h3>
              <p className="text-sm text-black"><strong>{title} N° :</strong> {data.number}</p>
            </div>
          </div>
        </div>

        {/* TABLE PRODUITS */}
        <div className="p-8 border-b border-black">
          <table className="w-full rounded" style={{ border: `1px solid ${THEME}` }}>
            <thead className="text-white text-sm" style={{ background: THEME }}>
              <tr>
                <th className="px-4 py-2 text-center">Désignation</th>
                <th className="px-4 py-2 text-center">Quantité</th>
                <th className="px-4 py-2 text-center">P.U. HT</th>
                <th className="px-4 py-2 text-center">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="avoid-break" style={{ borderTop: `1px solid ${THEME}` }}>
                  <td className="px-4 py-2 text-center text-sm">{item.description}</td>
                  <td className="px-4 py-2 text-center text-sm">
                    {formatQty(item.quantity, item.unit)} ({item.unit || 'unité'})
                  </td>
                  <td className="px-4 py-2 text-center text-sm">{formatAmount(item.unitPrice)} MAD</td>
                  <td className="px-4 py-2 text-center text-sm font-semibold">{formatAmount(item.total)} MAD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== BLOC TOTAUX (seul) ===== */}
        <section className="keep-together p-8">
          <div className="flex flex-wrap justify-between gap-6">
            {/* Montant en lettres */}
            <div className="w-[48%] min-w-[280px] bg-gray-50 rounded border p-4" style={{ borderColor: THEME }}>
              <div className="text-sm font-bold text-center">
                Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :
              </div>
              <div className="border-t my-2" style={{ borderColor: THEME }} />
              <p className="text-sm font-bold" style={{ color: THEME }}>• {data.totalInWords}</p>
            </div>

            {/* TVA / Totaux */}
            <div className="w-[48%] min-w-[280px] bg-gray-50 rounded border p-4" style={{ borderColor: THEME }}>
              <div className="flex justify-between mb-2 text-sm">
                <span>Total HT :</span>
                <span className="font-medium">{formatAmount(data.subtotal)} MAD</span>
              </div>
              <div className="text-sm mb-2">
                {vatRates.map((rate) => {
                  const g = vatGroups[rate];
                  const showProducts = g.products.length === 1; // pourquoi: montrer le nom uniquement si unique
                  return (
                    <div key={rate} className="flex justify-between">
                      <span>
                        TVA : {rate}%{' '}
                        {showProducts && <span style={{ fontSize: 10, color: '#555' }}>({g.products[0]})</span>}
                      </span>
                      <span className="font-medium">{formatAmount(g.amount)} MAD</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-2" style={{ color: THEME, borderColor: THEME }}>
                <span>TOTAL TTC :</span>
                <span>{formatAmount(data.totalTTC)} MAD</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SIGNATURE (séparée) ===== */}
        <section className="p-8 avoid-break">
          <div className="w-60 bg-gray-50 border rounded p-4 text-center" style={{ borderColor: THEME }}>
            <div className="text-sm font-bold mb-3">Signature</div>
            <div className="border-2 rounded-sm h-20 flex items-center justify-center relative" style={{ borderColor: THEME }}>
              {includeSignature && user?.company?.signature ? (
                <img
                  src={user.company.signature}
                  alt="Signature"
                  className="max-h-18 max-w-full object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} /* pourquoi: éviter image cassée */
                />
              ) : (
                <span className="text-gray-400 text-sm">&nbsp;</span>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ===== FOOTER (exclu; répété par page) ===== */}
      <div className="pdf-footer pdf-exclude" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: FOOTER_H }}>
        <div className="relative" style={{ background: THEME, color: '#fff', height: '100%' }}>
         
          <div className="pt-10 p-6 text-center text-sm relative z-10">
            <p>
              <strong>{user?.company.name}</strong> | {user?.company.address} | <strong>Tél :</strong> {user?.company.phone} |
              <strong> ICE :</strong> {user?.company.ice} | <strong>IF:</strong> {user?.company.if} | <strong>RC:</strong> {user?.company.rc} |
              <strong> CNSS:</strong> {user?.company.cnss} | <strong>Patente :</strong> {user?.company.patente} |
              <strong> EMAIL :</strong> {user?.company.email} | <strong>SITE WEB :</strong> {user?.company.website}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
