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

  return (
    <div
      className="bg-white mx-auto shadow-lg rounded overflow-hidden flex flex-col relative"
      style={{
    fontFamily: 'Arial, sans-serif',
    width: '100%',        // prend toute la largeur définie par le wrapper
    maxWidth: '750px',    // largeur A4
    height: '1100px',     // hauteur A4
    display: 'flex',
  }}
    >
      {/* Motif en haut à droite */}
      <img
        src="https://i.ibb.co/svbQM5zT/p.png"
        alt="motif haut"
        className="absolute top-0 right-0 w-40 h-40 object-contain"
      />

      {/* Motif en bas à gauche */}
      <img
        src="https://i.ibb.co/d0JqGQsK/pp.png"
        alt="motif bas"
        className="absolute bottom-0 left-0 w-40 h-40 object-contain"
      />

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* HEADER */}
        <div className="p-5 text-center">
          {user?.company.logo && (
            <img
              src={user.company.logo}
              alt="Logo"
              className="mx-auto"
              style={{ height: '100px', width: '100px' }}
            />
          )}
          <h1 className="text-4xl font-extrabold text-[#0a1f44]">
            {user?.company.name}
          </h1>
          <h2 className="text-3xl font-semibold mt-4 uppercase tracking-wide text-[#0a1f44]">
            {type === 'invoice' ? 'FACTURE' : 'DEVIS'}
          </h2>
        </div>

        {/* CLIENT + DATES */}
        <div className="p-8 border-b border-[#0a1f44]">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded border border-[#0a1f44] shadow-sm">
              <h3 className="font-bold text-[#0a1f44] mb-3 border-b border-[#0a1f44] pb-2 text-center text-sm">
                CLIENT : {data.client.name} {data.client.address}
              </h3>
              <div className="text-sm text-gray-700 space-y-1 text-center">
                <p>
                  <strong>ICE:</strong> {data.client.ice}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded border border-[#0a1f44] shadow-sm">
              <h3 className="font-bold text-sm text-[#0a1f44] mb-3 border-b border-[#0a1f44] pb-2 text-center">
                DATE : {new Date(data.date).toLocaleDateString('fr-FR')}
              </h3>
              <div className="text-sm text-gray-700 space-y-1 text-center">
                <p>
                  <strong>{type === 'invoice' ? 'FACTURE' : 'DEVIS'} N° :</strong> {data.number}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE PRODUITS */}
        <div className="p-8 border-b border-[#0a1f44]">
          <table className="w-full border border-[#0a1f44] rounded overflow-hidden">
            <thead className="bg-[#0a1f44] text-white text-sm">
              <tr>
                <th className="px-4 py-2 text-center">Description</th>
                <th className="px-4 py-2 text-center">Quantité</th>
                <th className="px-4 py-2 text-center">Prix Unitaire</th>
                <th className="px-4 py-2 text-center">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-t border-[#0a1f44] hover:bg-gray-50">
                  <td className="px-4 py-2 text-center text-sm">{item.description}</td>
                  <td className="px-4 py-2 text-center text-sm">
                    {item.quantity.toFixed(3)} ({item.unit || 'unité'})
                  </td>
                  <td className="px-4 py-2 text-center text-sm">{item.unitPrice.toFixed(2)} MAD</td>
                  <td className="px-4 py-2 text-center font-semibold text-sm">{item.total.toFixed(2)} MAD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BLOCS TOTAUX */}
        <div className="p-8">
          <div className="flex justify-between">
            {/* Bloc gauche */}
            <div className="w-80 bg-white rounded border border-[#0a1f44] p-4 shadow-sm">
              <div className="text-sm font-bold pt-3 pb-4 text-center text-[#0a1f44]">
                <p>Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :</p>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-2 border-[#0a1f44] text-[#0a1f44]">
                <p>• {data.totalInWords}</p>
              </div>
            </div>

            {/* Bloc droit */}
            <div className="w-80 bg-white rounded border border-[#0a1f44] p-4 shadow-sm">
              <div className="flex justify-between mb-2 text-sm">
                <span>Total HT :</span>
                <span className="font-medium">{data.subtotal.toFixed(2)} MAD</span>
              </div>
              <div className="text-sm mb-2">
                {(() => {
                  const vatGroups = data.items.reduce(
                    (acc: Record<number, { amount: number; products: string[] }>, item) => {
                      const vatAmount = (item.unitPrice * item.quantity * item.vatRate) / 100;
                      if (!acc[item.vatRate]) {
                        acc[item.vatRate] = { amount: 0, products: [] };
                      }
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
              <div className="flex justify-between text-sm font-bold border-t pt-2 border-[#0a1f44] text-[#0a1f44]">
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
  

        {/* FOOTER collé en bas */}
        <div className="mt-auto bg-[#0a1f44] text-white p-6 text-center text-sm">
          <p>
            <strong>{user?.company.name}</strong> | {user?.company.address} | <strong>Tél :</strong>{' '}
            {user?.company.phone} | <strong>ICE :</strong> {user?.company.ice} | <strong>IF:</strong>{' '}
            {user?.company.if} | <strong>RC:</strong> {user?.company.rc} | <strong>CNSS:</strong>{' '}
            {user?.company.cnss} | <strong>Patente :</strong> {user?.company.patente} |{' '}
            <strong>EMAIL :</strong> {user?.company.email} | <strong>SITE WEB :</strong>{' '}
            {user?.company.website}
          </p>
        </div>
      </div>
    </div>
  );
}
