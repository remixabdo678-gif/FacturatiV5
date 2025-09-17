import React from 'react';
import { Invoice, Quote } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface TemplateProps {
  data: Invoice | Quote;
  type: 'invoice' | 'quote';
  includeSignature?: boolean;
}

export default function Template1Classic({ data, type, includeSignature = false }: TemplateProps) {
  const { user } = useAuth();
  const title = type === 'invoice' ? 'FACTURE' : 'DEVIS';

  return (
    <div
      className="bg-white mx-auto border border-black flex flex-col"
     style={{
    fontFamily: 'Arial, sans-serif',
    width: '100%',        // prend toute la largeur définie par le wrapper
    maxWidth: '750px',    // largeur A4
    height: '1100px',     // hauteur A4
    display: 'flex',
  }}
    >
      {/* HEADER */}
      <div className="p-8 border-b border-gray-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            {user?.company.logo && (
              <img
                src={user.company.logo}
                alt="Logo"
                className="h-20 w-auto"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.company.name}</h2>
              <p className="text-sm text-gray-600">{user?.company.activity}</p>
              <p className="text-sm text-gray-600">{user?.company.address}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        </div>
      </div>

      {/* CLIENT + DATES */}
      <div className="p-8 border-b border-gray-300">
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded border border-gray-200">
            <h3 className="font-bold text-sm text-gray-900 mb-3 border-b border-gray-300 pb-2 text-center">
              CLIENT : {data.client.name} {data.client.address}
            </h3>
            <div className="text-sm text-gray-700 space-y-1 text-center">
              <p><strong>ICE:</strong> {data.client.ice}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded border border-gray-200">
            <h3 className="font-bold text-sm text-gray-900 mb-3 border-b border-gray-300 pb-2 text-center">
              DATES : {new Date(data.date).toLocaleDateString('fr-FR')}
            </h3>
            <div className="text-sm text-gray-700 text-center">
              <p><strong>{title} N° :</strong> {data.number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE PRODUITS */}
      <div className="p-8 border-b border-gray-300">
        <div className="border border-gray-300 rounded overflow-hidden">
          <table
            className="w-full border-collapse"
            style={{ tableLayout: 'fixed' }}
          >
            <thead className="bg-gray-100">
              <tr>
                <th className="border-r border-gray-300 px-4 py-3 text-center font-bold text-sm">DÉSIGNATION</th>
                <th className="border-r border-gray-300 px-4 py-3 text-center font-bold text-sm">QUANTITÉ</th>
                <th className="border-r border-gray-300 px-4 py-3 text-center font-bold text-sm">P.U. HT</th>
                <th className="px-4 py-3 text-center font-bold text-sm">TOTAL HT</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-t border-gray-200 break-inside-avoid">
                  <td className="border-r border-gray-300 px-4 text-center text-sm py-3">{item.description}</td>
                  <td className="border-r border-gray-300 px-4 py-3 text-sm text-center">
                    {item.quantity.toFixed(3)} ({item.unit || 'unité'})
                  </td>
                  <td className="border-r border-gray-300 px-4 py-3 text-sm text-center">
                    {item.unitPrice.toFixed(2)} MAD
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-sm">
                    {item.total.toFixed(2)} MAD
                  </td>
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
          <div className="w-80 bg-gray-50 border border-gray-200 rounded p-2">
            <p className="text-sm font-bold border-b border-gray-300 pb-2">
              Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :
            </p>
            <p className="text-sm pt-2">• {data.totalInWords}</p>
          </div>

          {/* Bloc droit */}
          <div className="w-80 bg-gray-50 border border-gray-200 rounded p-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Total HT :</span>
              <span className="font-medium">{data.subtotal.toFixed(2)} MAD</span>
            </div>

            {/* TVA */}
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

                return Object.keys(vatGroups).map((rate) => (
                  <div key={rate} className="flex justify-between">
                    <span>
                      TVA : {rate}%{" "}
                      {Object.keys(vatGroups).length > 1 && (
                        <span style={{ fontSize: "10px", color: "#555" }}>
                          ({vatGroups[+rate].products.join(", ")})
                        </span>
                      )}
                    </span>
                    <span className="font-medium">
                      {vatGroups[+rate].amount.toFixed(2)} MAD
                    </span>
                  </div>
                ));
              })()}
            </div>

            <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-3">
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
            <div className="border-2 border-black rounded-sm h-20 flex items-center justify-center">
              {includeSignature && user?.company?.signature ? (
                <img
                  src={user.company.signature}
                  alt="Signature"
                  className="max-h-18 max-w-full object-contain"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <span className="text-gray-400 text-sm"></span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER collé en bas */}
      <div
        className="bg-white text-black border-t border-gray-300 p-6 text-sm text-center mt-auto"
      >
        <p>
          <strong>{user?.company.name}</strong> | {user?.company.address} | <strong>Tél :</strong> {user?.company.phone} | <strong>ICE :</strong> {user?.company.ice} | <strong>IF:</strong> {user?.company.if} | <strong>RC:</strong> {user?.company.rc} | <strong>CNSS:</strong> {user?.company.cnss} | <strong>Patente :</strong> {user?.company.patente} | <strong>EMAIL :</strong> {user?.company.email} | <strong>SITE WEB :</strong> {user?.company.website}
        </p>
      </div>
    </div>
  );
}
