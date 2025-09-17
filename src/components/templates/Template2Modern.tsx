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

  return (
    <div
      className="bg-white mx-auto border border-black flex flex-col relative"
      style={{
    fontFamily: 'Arial, sans-serif',
    width: '100%',        // prend toute la largeur définie par le wrapper
    maxWidth: '750px',    // largeur A4
    height: '1100px',     // hauteur A4
    display: 'flex',
  }}
    >
      {/* HEADER */}
      <div className="p-8 border-b border-black bg-black text-white text-center">
        <div className="flex items-center justify-between">
          {/* Logo */}
          {user?.company.logo && (
            <img src={user.company.logo} alt="Logo" className="h-28 w-auto" />
          )}
          {/* Nom de l'entreprise centré */}
          <div className="flex-1 text-center">
            <h2 className="text-4xl font-extrabold">{user?.company.name}</h2>
            <h1 className="text-2xl font-bold mt-2">{title}</h1>
          </div>
          <div className="w-28"></div> {/* espace vide pour équilibrer */}
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col pb-32"> {/* 🔹 padding bas ajouté */}
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

        {/* TABLE PRODUITS */}
        <div className="p-8 border-b border-black flex-1">
          <div className="border border-black rounded overflow-hidden">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="border-r border-white px-4 py-3 text-center font-bold text-sm">DÉSIGNATION</th>
                  <th className="border-r border-white px-4 py-3 text-center font-bold text-sm">QUANTITÉ </th>
                  <th className="border-r border-white px-4 py-3 text-center font-bold text-sm">P.U. HT</th>
                  <th className="px-4 py-3 text-center font-bold">TOTAL HT</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="border-t border-black hover:bg-gray-50">
                    <td className="border-r border-black px-4 py-3 text-center text-sm">{item.description}</td>
                    <td className="border-r border-black px-4 py-3 text-center text-sm">{item.quantity.toFixed(3)} ({item.unit || 'unité'})</td>
                    <td className="border-r border-black px-4 py-3 text-center text-sm">{item.unitPrice.toFixed(2)} MAD</td>
                    <td className="px-4 py-3 text-center font-medium">{item.total.toFixed(2)} MAD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOTALS */}
        <div className="p-8">
          <div className="flex justify-between">
            {/* Bloc gauche */}
            <div className="w-80 bg-gray-50 border border-black rounded p-2">
              <div className="text-sm font-bold border-black pt-3 text-center pb-4">
                <p>Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :</p>
              </div>
              <div className="text-sm border-t border-black pt-3">
                <p className="text-black">• {data.totalInWords}</p>
              </div>
            </div>

            {/* Bloc droit */}
            <div className="w-80 bg-gray-50 border border-black rounded p-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Total HT :</span>
                <span className="font-medium">{data.subtotal.toFixed(2)} MAD</span>
              </div>
              <div className="text-sm mb-2">
                {(() => {
                  const vatGroups = data.items.reduce(
                    (acc: Record<number, { amount: number; products: string[] }>, item) => {
                      const vatAmount = (item.unitPrice * item.quantity * item.vatRate) / 100;
                      if (!acc[item.vatRate]) acc[item.vatRate] = { amount: 0, products: [] };
                      acc[item.vatRate].amount += vatAmount;
                      acc[item.vatRate].products.push(item.description);
                      return acc;
                    },
                    {}
                  );
                  const vatRates = Object.keys(vatGroups);
                  return vatRates.map((rate) => (
                    <div key={rate} className="flex justify-between">
                      <span>
                        TVA : {rate}%{' '}
                        {vatRates.length > 1 && (
                          <span style={{ fontSize: '10px', color: '#555' }}>
                            ({vatGroups[+rate].products.join(', ')})
                          </span>
                        )}
                      </span>
                      <span className="font-medium">{vatGroups[+rate].amount.toFixed(2)} MAD</span>
                    </div>
                  ));
                })()}
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-black pt-3">
                <span>TOTAL TTC :</span>
                <span>{data.totalTTC.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIGNATURE */}
        <div className="p-6">
          <div className="flex justify-start">
            <div className="w-60 bg-gray-50 border border-black rounded p-4 text-center">
              <div className="text-sm font-bold mb-3">Signature</div>
              <div className="border-2 border-black rounded-sm h-20 flex items-center justify-center relative">
                {includeSignature && user?.company?.signature ? (
                  <img 
                    src={user.company.signature} 
                    alt="Signature" 
                    className="max-h-18 max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-gray-400 text-sm"> </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER collé en bas */}
      <div 
        className="bg-black text-white border-t-2 border-white p-6 text-sm text-center"
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
        }}
      >
        <p>
          <strong>{user?.company.name}</strong> | {user?.company.address} | <strong>Tél :</strong> {user?.company.phone} | <strong>ICE :</strong> {user?.company.ice} | <strong>IF:</strong> {user?.company.if} | <strong>RC:</strong> {user?.company.rc} | <strong>CNSS:</strong> {user?.company.cnss} | <strong>Patente :</strong> {user?.company.patente} | <strong>EMAIL :</strong> {user?.company.email} | <strong>SITE WEB :</strong> {user?.company.website}
        </p>
      </div>
    </div>
  );
}
