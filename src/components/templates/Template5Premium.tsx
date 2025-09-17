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

  return (
    <div
      className="bg-white mx-auto flex flex-col relative"
       style={{
    fontFamily: 'Arial, sans-serif',
    width: '100%',        // prend toute la largeur définie par le wrapper
    maxWidth: '750px',    // largeur A4
    height: '1100px',     // hauteur A4
    display: 'flex',
  }}
    >
    {/* HEADER avec wave intégré dans le bleu */}
<div className="relative bg-[#0a1f44] text-white">
  <div className="h-64 flex items-center justify-between px-8">
    {user?.company.logo && (
      <img src={user.company.logo} alt="Logo" className="h-40 w-auto" />
    )}
    <div className="flex-1 text-center">
      <h1 className="text-4xl font-extrabold">{user?.company.name}</h1>
      <h2 className="text-3xl font-bold mt-6 uppercase tracking-wide">
        {type === 'invoice' ? 'FACTURE' : 'DEVIS'}
      </h2>
    </div>
    <div className="w-20"></div>
  </div>

  {/* vague rouge DANS le bleu */}
  <svg
    className="absolute bottom-0 left-0 w-full"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1440 80"
  >
    <path
      fill="#c1121f"
      d="M0,64L60,58.7C120,53,240,43,360,37.3C480,32,600,32,720,42.7C840,53,960,75,1080,74.7C1200,75,1320,53,1380,42.7L1440,32V80H0Z"
    ></path>
  </svg>
</div>


      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col">
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
              <p className="text-sm text-black">
                <strong>{title} N° :</strong> {data.number}
              </p>
            </div>
          </div>
        </div>

        {/* TABLE PRODUITS */}
        <div className="p-8 border-b border-black flex-1">
          <table className="w-full border border-[#0a1f44] rounded">
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
                <tr key={index} className="border-t border-[#0a1f44] text-sm">
                  <td className="px-4 py-2 text-center">{item.description}</td>
                  <td className="px-4 py-2 text-center">{item.quantity.toFixed(3)} ({item.unit || 'unité'})</td>
                  <td className="px-4 py-2 text-center">{item.unitPrice.toFixed(2)} MAD</td>
                  <td className="px-4 py-2 text-center font-semibold">{item.total.toFixed(2)} MAD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        
        <div className="p-8 flex justify-between">
          {/* Bloc gauche */}
          
          <div className="w-80 bg-gray-50 rounded border border-[#0a1f44] p-4">
    <div className="text-sm font-bold pt-3 text-center">
      <p>Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :</p>
      
      {/* Ligne séparatrice */}
      <div className="border-t border-[#03224C] my-2"></div>
      
      <p className="text-sm font-bold text-[#0a1f44]">• {data.totalInWords}</p>
    </div>
  </div>


          {/* Bloc droit */}
          <div className="w-80 bg-gray-50 rounded border border-[#0a1f44] p-4">
            <div className="flex justify-between mb-2 text-sm">
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
                      TVA : {rate}% {vatRates.length > 1 && <span style={{ fontSize: '10px', color: '#555' }}>({vatGroups[+rate].products.join(', ')})</span>}
                    </span>
                    <span className="font-medium">{vatGroups[+rate].amount.toFixed(2)} MAD</span>
                  </div>
                ));
              })()}
            </div>
            <div className="flex justify-between text-sm font-bold border-t pt-2 border-[#03224C] text-[#03224C]">
              <span>TOTAL TTC :</span>
              <span>{data.totalTTC.toFixed(2)} MAD</span>
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
      <div className="mt-auto bg-[#0a1f44] text-white p-6 text-center text-sm">
        <p>
          <strong>{user?.company.name}</strong> | {user?.company.address} | <strong>Tél :</strong> {user?.company.phone} | <strong>ICE :</strong> {user?.company.ice} | <strong>IF:</strong> {user?.company.if} | <strong>RC:</strong> {user?.company.rc} | <strong>CNSS:</strong> {user?.company.cnss} | <strong>Patente :</strong> {user?.company.patente} | <strong>EMAIL :</strong> {user?.company.email} | <strong>SITE WEB :</strong> {user?.company.website}
        </p>
      </div>
    </div>
  );
}
