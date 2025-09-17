import React from 'react';
import { Invoice, Quote } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface TemplateProps {
  data: Invoice | Quote;
  type: 'invoice' | 'quote';
  includeSignature?: boolean;
}

export default function Template4Corporate({ data, type, includeSignature = false }: TemplateProps) {
  const { user } = useAuth();

  // Fonction pour récupérer l'unité d'un produit
  const getProductUnit = (productName: string) => {
    return 'unité';
  };

  return (
    <div
      className="bg-white mx-auto shadow-lg rounded overflow-hidden flex flex-col"
      style={{
    fontFamily: 'Arial, sans-serif',
    width: '100%',        // prend toute la largeur définie par le wrapper
    maxWidth: '750px',    // largeur A4
    height: '1100px',     // hauteur A4
    display: 'flex',
  }}
    >
      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="relative bg-[#24445C] text-white px-8 py-6">
          <div className="flex items-center justify-between">
            {user?.company.logo && (
              <img
                src={user.company.logo}
                alt="Logo"
                className="mx-auto"
                style={{ height: '140px', width: '140px' }}
              />
            )}

            <div className="flex-1 text-center">
              <h1 className="text-4xl font-extrabold uppercase tracking-wide">
                {user?.company.name}
              </h1>
              <h2 className="text-3xl font-semibold mt-5 tracking-widest">
                {type === 'invoice' ? 'FACTURE' : 'DEVIS'}
              </h2>
            </div>

            <div className="w-20" />
          </div>

          {/* Vague blanche en bas */}
          <svg
            className="absolute bottom-0 left-0 w-full h-10"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,48 C180,96 360,12 540,60 C720,108 900,36 1080,84 C1260,120 1440,72 1440,72 L1440,120 L0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* CLIENT + DATES */}
        <div className="p-8 border-b border-[#24445C]">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded border border-[#24445C]">
              <h3 className="font-bold text-sm text-[#24445C] mb-3 border-b border-[#24445C] pb-2 text-center">
                CLIENT : {data.client.name} {data.client.address}
              </h3>
              <div className="text-sm text-black space-y-1 text-center">
                <p>
                  <strong>ICE:</strong> {data.client.ice}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded border border-[#24445C]">
              <h3 className="font-bold text-sm text-[#24445C] mb-3 border-b border-[#24445C] pb-2 text-center">
                DATE : {new Date(data.date).toLocaleDateString('fr-FR')}
              </h3>
              <div className="text-sm text-black space-y-1 text-center">
                <p>
                  <strong>{type === 'invoice' ? 'FACTURE' : 'DEVIS'} N° :</strong> {data.number}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE PRODUITS */}
        <div className="p-8 border-b border-[#24445C]">
          <table className="w-full border border-[#24445C] rounded">
            <thead className="bg-[#24445C] text-white text-sm">
              <tr>
                <th className="px-4 py-2 text-center">Description</th>
                <th className="px-4 py-2 text-center">Quantité</th>
                <th className="px-4 py-2 text-center">Prix Unitaire</th>
                <th className="px-4 py-2 text-center">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-t border-[#24445C]">
                  <td className="px-4 py-2 text-center text-sm">{item.description}</td>
                  <td className="px-4 py-2 text-center text-sm">
                    {item.quantity.toFixed(3)} ({item.unit || 'unité'})
                  </td>
                  <td className="px-4 py-2 text-center text-sm">{item.unitPrice.toFixed(2)} MAD</td>
                  <td className="px-4 py-2 text-center text-sm font-semibold">
                    {item.total.toFixed(2)} MAD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="p-8">
          <div className="flex justify-between">
            <div className="w-80 bg-gray-50 rounded border border-[#24445C] p-4">
              <div className="text-sm font-bold pt-3 text-center text-[#24445C] pb-4">
                <p>Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :</p>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-2 border-[#24445C] text-black">
                <p>• {data.totalInWords}</p>
              </div>
            </div>

            <div className="w-80 bg-gray-50 rounded border border-[#24445C] p-4">
              <div className="flex justify-between mb-2">
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
              <div className="flex justify-between text-sm font-bold border-t pt-2 border-[#24445C] text-black">
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

        {/* FOOTER (toujours en bas) */}
        <div className="mt-auto relative bg-[#24445C] text-white">
          <svg
            className="absolute top-0 left-0 w-full h-10"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 L0,48 C180,72 360,12 540,48 C720,84 900,24 1080,60 C1260,96 1440,36 1440,36 L1440,0 Z"
              fill="#ffffff"
            />
          </svg>

          <div className="pt-10 p-6 text-center text-sm relative z-10">
            <p>
              <strong>{user?.company.name}</strong> | {user?.company.address} |{' '}
              <strong>Tél :</strong> {user?.company.phone} | <strong>ICE :</strong>{' '}
              {user?.company.ice} | <strong>IF:</strong> {user?.company.if} |{' '}
              <strong>RC:</strong> {user?.company.rc} | <strong>CNSS:</strong>{' '}
              {user?.company.cnss} | <strong>Patente :</strong> {user?.company.patente} |{' '}
              <strong>EMAIL :</strong> {user?.company.email} | <strong>SITE WEB :</strong>{' '}
              {user?.company.website}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
