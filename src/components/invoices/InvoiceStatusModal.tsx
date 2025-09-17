import React, { useState } from 'react';
import { Invoice } from '../../contexts/DataContext';
import { X, CreditCard, Banknote, FileText, Calendar } from 'lucide-react';

interface InvoiceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onUpdateStatus: (status: 'unpaid' | 'paid' | 'collected', paymentMethod?: string, collectionDate?: string, collectionType?: string) => void;
}

export default function InvoiceStatusModal({ isOpen, onClose, invoice, onUpdateStatus }: InvoiceStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(invoice.status);
  const [paymentMethod, setPaymentMethod] = useState(invoice.paymentMethod || 'virement');
  const [collectionDate, setCollectionDate] = useState(invoice.collectionDate || new Date().toISOString().split('T')[0]);
  const [collectionType, setCollectionType] = useState(invoice.collectionType || 'cheque');

  if (!isOpen) return null;

  const handleStatusChange = (status: 'unpaid' | 'paid' | 'collected') => {
    setSelectedStatus(status);
  };

  const handleSave = () => {
    let updateData: any = { status: selectedStatus };
    
    if (selectedStatus === 'paid') {
      updateData.paymentMethod = paymentMethod;
      // Supprimer les données d'encaissement si on repasse à payé
      updateData.collectionDate = null;
      updateData.collectionType = null;
    } else if (selectedStatus === 'collected') {
      updateData.paymentMethod = paymentMethod;
      updateData.collectionDate = collectionDate;
      updateData.collectionType = collectionType;
    } else if (selectedStatus === 'unpaid') {
      // Supprimer toutes les données de paiement
      updateData.paymentMethod = null;
      updateData.collectionDate = null;
      updateData.collectionType = null;
    }

    onUpdateStatus(
      selectedStatus,
      updateData.paymentMethod,
      updateData.collectionDate,
      updateData.collectionType
    );
    onClose();
  };

  const paymentMethods = [
    { value: 'virement', label: 'Virement bancaire', icon: CreditCard },
    { value: 'espece', label: 'Espèces', icon: Banknote },
    { value: 'cheque', label: 'Chèque', icon: FileText },
    { value: 'effet', label: 'Effet de commerce', icon: FileText }
  ];

  const collectionTypes = [
    { value: 'cheque', label: 'Chèque' },
    { value: 'effet', label: 'Effet de commerce' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Statut de la Facture</h3>
                <p className="text-sm opacity-90">Facture {invoice.number}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choisir le statut
                </label>
                <div className="space-y-3">
                  {/* Non payé */}
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="status"
                      value="unpaid"
                      checked={selectedStatus === 'unpaid'}
                      onChange={() => handleStatusChange('unpaid')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <p className="font-medium text-red-600">Non payé</p>
                      <p className="text-xs text-gray-500">Facture en attente de paiement</p>
                    </div>
                  </label>

                  {/* Payé */}
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="status"
                      value="paid"
                      checked={selectedStatus === 'paid'}
                      onChange={() => handleStatusChange('paid')}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <p className="font-medium text-green-600">Payé</p>
                      <p className="text-xs text-gray-500">Paiement reçu</p>
                    </div>
                  </label>

                  {/* Encaissé */}
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="status"
                      value="collected"
                      checked={selectedStatus === 'collected'}
                      onChange={() => handleStatusChange('collected')}
                      className="text-yellow-600 focus:ring-yellow-500"
                    />
                    <div>
                      <p className="font-medium text-yellow-600">Encaissé</p>
                      <p className="text-xs text-gray-500">Chèque/effet encaissé</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Method (pour Payé et Encaissé) */}
              {(selectedStatus === 'paid' || selectedStatus === 'collected') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moyen de paiement
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.value}
                          className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">{method.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Collection Details (pour Encaissé uniquement) */}
              {selectedStatus === 'collected' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date d'encaissement
                    </label>
                    <input
                      type="date"
                      value={collectionDate}
                      onChange={(e) => setCollectionDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'encaissement
                    </label>
                    <div className="flex space-x-4">
                      {collectionTypes.map((type) => (
                        <label
                          key={type.value}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="collectionType"
                            value={type.value}
                            checked={collectionType === type.value}
                            onChange={(e) => setCollectionType(e.target.value)}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Info message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Information :</strong> Le statut par défaut d'une facture est "Non payé". 
                  Vous pouvez le modifier à tout moment en cliquant sur le bouton Statut.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}