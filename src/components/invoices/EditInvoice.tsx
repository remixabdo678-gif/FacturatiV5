import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData, Client, InvoiceItem, Invoice } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { convertNumberToWords } from '../../utils/numberToWords';
import { ArrowLeft, Plus, Trash2, Save, Eye } from 'lucide-react';

interface EditInvoiceProps {
  invoice: Invoice;
  onSave: (updatedInvoice: Partial<Invoice>) => void;
  onCancel: () => void;
}

export default function EditInvoice({ invoice, onSave, onCancel }: EditInvoiceProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { clients, products, getClientById } = useData();
  
  const [invoiceDate, setInvoiceDate] = useState(invoice.date);
  const [dueDate, setDueDate] = useState(invoice.dueDate || '');
  const [selectedClientId, setSelectedClientId] = useState(invoice.clientId);
  const [selectedClient, setSelectedClient] = useState<Client | null>(invoice.client);
  const [items, setItems] = useState<InvoiceItem[]>(invoice.items);


  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = getClientById(clientId);
    setSelectedClient(client || null);
  };

  const getProductBySku = (productName: string) => {
    return products.find(product => product.name === productName);
  };

  const handleProductSelect = (itemId: string, productName: string) => {
    const selectedProduct = products.find(product => product.name === productName);
    
    if (selectedProduct) {
      setItems(items.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            description: productName,
            unitPrice: selectedProduct.salePrice,
            total: item.quantity * selectedProduct.salePrice
          };
          return updatedItem;
        }
        return item;
      }));
    } else {
      setItems(items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            description: '',
            unitPrice: 0,
            vatRate: 0,
            total: 0
          };
        }
        return item;
      }));
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      vatRate: 0,
      total: 0,
      unit: undefined
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const vatByRate = items.reduce((acc, item) => {
      const vatAmount = item.total * (item.vatRate / 100);
      acc[item.vatRate] = (acc[item.vatRate] || 0) + vatAmount;
      return acc;
    }, {} as Record<number, number>);
    
    const totalVat = Object.values(vatByRate).reduce((sum, vat) => sum + vat, 0);
    const totalTTC = subtotal + totalVat;

    return { subtotal, vatByRate, totalVat, totalTTC };
  };

  const { subtotal, vatByRate, totalVat, totalTTC } = calculateTotals();

  const handleSave = () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }

    if (items.some(item => !item.description)) {
      alert('Veuillez sélectionner un produit pour tous les articles');
      return;
    }

    onSave({
      clientId: selectedClient.id,
      client: selectedClient,
      date: invoiceDate,
      dueDate,
      items,
      subtotal,
      totalVat,
      totalTTC
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Modifier la facture {invoice.number}
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>Sauvegarder</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Invoice Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 transition-colors duration-300">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Informations Facture</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date d'émission
                      </label>
                      <input
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Client Selection */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 transition-colors duration-300">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Client</h4>
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleClientSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                  >
                    <option value="">Choisir un client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} - ICE: {client.ice}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Items */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Articles/Services</h4>
                    <button
                      onClick={addItem}
                      className="inline-flex items-center space-x-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter</span>
                    </button>
                  </div>

                  {products.length === 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <p className="text-amber-800 text-sm">
                        ⚠️ Aucun produit enregistré. Veuillez d'abord ajouter des produits dans la section Produits pour pouvoir modifier une facture.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 transition-colors duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Article #{index + 1}</span>
                          {items.length > 1 && (
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-12">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Produit *
                            </label>
                            <select
                              value={item.description}
                              onChange={(e) => handleProductSelect(item.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                            >
                              <option value="">Sélectionner un produit...</option>
                              {products.map(product => (
                                <option key={product.id} value={product.name}>
                                  {product.name} - {product.salePrice.toFixed(2)} MAD
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        {/* Première ligne: Quantité et Prix unitaire */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Quantité
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Prix unit. HT (MAD)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors duration-300"
                            />
                          </div>
                        </div>
                        
                        {/* Deuxième ligne: TVA et Total */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              TVA
                            </label>
                            <select
                              value={item.vatRate}
                              onChange={(e) => updateItem(item.id, 'vatRate', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                            >
                              <option value={0}>0% (Exonéré)</option>
                              <option value={7}>7% (Produits alimentaires)</option>
                              <option value={10}>10% (Hôtellerie)</option>
                              <option value={20}>20% (Taux normal)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Total HT (MAD)
                            </label>
                            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                              {item.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        {/* SKU en petit en bas */}
                        <div className="mt-2">
                          <div className="text-xs text-gray-500">
                            SKU: {getProductBySku(item.description)?.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Summary */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Récapitulatif</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Sous-total HT</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{subtotal.toFixed(2)} MAD</span>
                    </div>
                    
                    {Object.entries(vatByRate).map(([rate, amount]) => (
                      <div key={rate} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">TVA {rate}%</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{amount.toFixed(2)} MAD</span>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Total TTC</span>
                        <span className="text-lg font-bold text-teal-600">{totalTTC.toFixed(2)} MAD</span>
                      </div>
                    </div>
                    
                    {/* Montant en lettres */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 transition-colors duration-300">
                        <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Montant en lettres:</p>
                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                          {convertNumberToWords(totalTTC)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors duration-300">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Cette facture sera conforme à la réglementation fiscale marocaine avec toutes les mentions légales obligatoires.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}