import React from 'react';
import { Invoice, Quote } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface TemplateProps {
  data: Invoice | Quote;
  type: 'invoice' | 'quote';
  includeSignature?: boolean;
}

export default function Template2Modern({ data, type, includeSignature = false }: TemplateProps) {
  const { user } = useAuth();
  const title = type === 'invoice' ? 'FACTURE' : 'DEVIS';
  const HEADER_H = 130;
  const FOOTER_H = 100;

  // --- format helpers ---
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
      {/* HEADER (exclu, répété) */}
      <div className="pdf-header pdf-exclude" style={{ position:'absolute', top:0, left:0, right:0, height: HEADER_H }}>
        <div className="p-8 border-b border-black bg-black text-white text-center h-full">
          <div className="flex items-center justify-between h-full">
            {user?.company.logo && (<img src={user.company.logo} alt="Logo" className="h-24 w-auto" />)}
            <div className="flex-1 text-center">
              <h2 className="text-4xl font-extrabold">{user?.company.name}</h2>
              <h1 className="text-2xl font-bold mt-2">{title}</h1>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="pdf-content" style={{ paddingTop: HEADER_H + 16, paddingBottom: FOOTER_H + 16 }}>
        {/* CLIENT + DATES */}
        <div className="p-8 border-b border-black">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded border border-black">
              <h3 className="font-bold text-sm text-black mb-3 border-b border-black pb-2 text-center">
                CLIENT : {data.client.name} {data.client.address}
              </h3>
              <div className="text-sm text-black space-y-1 text-center">
                <p><strong>ICE:</strong> {data.client.ice}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded border border-black">
              <h3 className="font-bold text-sm text-black mb-3 border-b border-black pb-2 text-center">
                DATE : {new Date(data.date).toLocaleDateString('fr-FR')}
              </h3>
              <div className="text-sm text-black space-y-1 text-center">
                <p><strong>{type === 'invoice' ? 'FACTURE' : 'DEVIS'} N° :</strong> {data.number}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="p-8 border-b border-black">
          <div className="border border-black rounded overflow-visible">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="border-r border-white px-4 py-3 text-center font-bold text-sm">DÉSIGNATION</th>
                  <th className="border-r border-white px-4 py-3 text-center font-bold text-sm">QUANTITÉ</th>
                  <th className="border-r border-white px-4 py-3 text-center font-bold text-sm">P.U. HT</th>
                  <th className="px-4 py-3 text-center font-bold">TOTAL HT</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={idx} className="border-t border-black hover:bg-gray-50 avoid-break">
                    <td className="border-r border-black px-4 py-3 text-center text-sm">{item.description}</td>
                    <td className="border-r border-black px-4 py-3 text-center text-sm">
                      {formatQty(item.quantity, item.unit)} ({item.unit || 'unité'})
                    </td>
                    <td className="border-r border-black px-4 py-3 text-center text-sm">{formatAmount(item.unitPrice)} MAD</td>
                    <td className="px-4 py-3 text-center font-medium">{formatAmount(item.total)} MAD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== BLOC TOTAUX (seul) ===== */}
        <section className="keep-together p-8">
          <div className="flex flex-wrap gap-6">
            <div className="border border-black rounded p-2 bg-gray-50 w-[48%] min-w-[280px]">
              <div className="text-sm font-bold pt-3 text-center pb-4 border-b border-black">
                <p>Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :</p>
              </div>
              <div className="text-sm pt-3">
                <p className="text-black">• {data.totalInWords}</p>
              </div>
            </div>

            <div className="border border-black rounded p-6 bg-gray-50 w-[48%] min-w-[280px]">
              <div className="flex justify-between text-sm mb-2">
                <span>Total HT :</span><span className="font-medium">{formatAmount(data.subtotal)} MAD</span>
              </div>
              <div className="text-sm mb-2">
                {vatRates.map((rate) => {
                  const g = vatGroups[rate];
                  const showProducts = g.products.length === 1;
                  return (
                    <div key={rate} className="flex justify-between">
                      <span>TVA : {rate}% {showProducts && <span style={{ fontSize: 10, color: '#555' }}>({g.products[0]})</span>}</span>
                      <span className="font-medium">{formatAmount(g.amount)} MAD</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-black pt-3">
                <span>TOTAL TTC :</span><span>{formatAmount(data.totalTTC)} MAD</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== BLOC SIGNATURE (séparé) ===== */}
        <section className="p-8 avoid-break">
          <div className="w-60 bg-gray-50 border border-black rounded p-4 text-center">
            <div className="text-sm font-bold mb-3">Signature</div>
            <div className="border-2 border-black rounded-sm h-20 flex items-center justify-center relative">
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

      {/* FOOTER (exclu, répété) */}
      <div className="pdf-footer pdf-exclude" style={{ position:'absolute', bottom:0, left:0, right:0, height: FOOTER_H }}>
        <div className="bg-black text-white border-t-2 border-white p-6 text-sm text-center h-full">
          <p>
            <strong>{user?.company.name}</strong> | {user?.company.address} | <strong>Tél :</strong> {user?.company.phone} | <strong>ICE :</strong> {user?.company.ice} | <strong>IF:</strong> {user?.company.if} | <strong>RC:</strong> {user?.company.rc} | <strong>CNSS:</strong> {user?.company.cnss} | <strong>Patente :</strong> {user?.company.patente} | <strong>EMAIL :</strong> {user?.company.email} | <strong>SITE WEB :</strong> {user?.company.website}
          </p>
        </div>
      </div>
    </div>
  );
}
