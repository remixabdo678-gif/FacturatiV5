import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOrder, OrderItem } from '../../contexts/OrderContext';
import { useData, Client } from '../../contexts/DataContext';
import { ArrowLeft, Plus, Trash2, Save, User, Building2, Calendar, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addOrder } = useOrder();
  const { clients, products, getClientById } = useData();
  
  const [clientType, setClientType] = useState<'personne_physique' | 'societe'>('societe');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientName, setClientName] = useState('');
  const [orderDate, setOrderDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [hasDeliveryDate, setHasDeliveryDate] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [applyVat, setApplyVat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: '1',
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      vatRate: 0,
      total: 0,
      unit: undefined
    }
  ]);

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = getClientById(clientId);
    setSelectedClient(client || null);
  };

  const handleProductSelect = (itemId: string, productId: string) => {
    const selectedProduct = products.find(product => product.id === productId);
    
    if (selectedProduct) {
      setItems(items.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            unitPrice: selectedProduct.salePrice,
            total: item.quantity * selectedProduct.salePrice,
            unit: selectedProduct.unit || 'unité'
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
            productId: '',
            productName: '',
            unitPrice: 0,
            vatRate: 0,
            total: 0,
            unit: undefined
          };
        }
        return item;
      }));
    }
  };

  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
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

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
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
    
    let totalVat = 0;
    if (clientType === 'societe' || (clientType === 'personne_physique' && applyVat)) {
      totalVat = items.reduce((sum, item) => sum + (item.total * item.vatRate / 100), 0);
    }
    
    const totalTTC = subtotal + totalVat;
    return { subtotal, totalVat, totalTTC };
  };

  const { subtotal, totalVat, totalTTC } = calculateTotals();

  const handleSave = async () => {
    // Validation
    if (clientType === 'societe' && !selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }
    
    if (clientType === 'personne_physique' && !clientName.trim()) {
      alert('Veuillez saisir le nom du client');
      return;
    }

    if (items.some(item => !item.productId)) {
      alert('Veuillez sélectionner un produit pour tous les articles');
      return;
    }

    if (hasDeliveryDate && !deliveryDate) {
      alert('Veuillez saisir la date de livraison');
      return;
    }

    setIsLoading(true);
    
    try {
      const orderData = {
        clientType,
        clientId: clientType === 'societe' ? selectedClientId : undefined,
        client: clientType === 'societe' ? selectedClient : undefined,
        clientName: clientType === 'personne_physique' ? clientName : undefined,
        orderDate,
        deliveryDate: hasDeliveryDate ? deliveryDate : undefined,
        items,
        subtotal,
        totalVat,
        totalTTC,
        applyVat: clientType === 'personne_physique' ? applyVat : true,
        stockDebited: false // Sera géré automatiquement
      };
      
      await addOrder(orderData);
      navigate('/commandes');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/commandes')}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nouvelle Commande</h1>
            <p className="text-gray-600 dark:text-gray-300">Créer une nouvelle commande avec gestion de stock</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? 'Enregistrement...' : 'Enregistrer'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Type de client */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Type de Client</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="clientType"
                  value="societe"
                  checked={clientType === 'societe'}
                  onChange={(e) => setClientType(e.target.value as any)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <Building2 className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Société</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Client existant</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="clientType"
                  value="personne_physique"
                  checked={clientType === 'personne_physique'}
                  onChange={(e) => setClientType(e.target.value as any)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <User className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Particulier</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Saisie manuelle</p>
                </div>
              </label>
            </div>
          </motion.div>

          {/* Informations client */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informations Client</h3>
            
            {clientType === 'societe' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sélectionner un client *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Choisir un client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - ICE: {client.ice}
                    </option>
                  ))}
                </select>

                {selectedClient && (
                  <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">{selectedClient.name}</h4>
                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <p><strong>ICE:</strong> {selectedClient.ice}</p>
                      <p><strong>Adresse:</strong> {selectedClient.address}</p>
                      <p><strong>Téléphone:</strong> {selectedClient.phone}</p>
                      <p><strong>Email:</strong> {selectedClient.email}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du client *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Nom complet du client particulier"
                />
              </div>
            )}
          </motion.div>

          {/* Dates */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Dates</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de commande *
                </label>
                <input
                  type="datetime-local"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={hasDeliveryDate}
                    onChange={(e) => setHasDeliveryDate(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Planifier une date de livraison
                  </span>
                </label>
                
                {hasDeliveryDate && (
                  <input
                    type="datetime-local"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* TVA pour particuliers */}
          {clientType === 'personne_physique' && (
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">TVA</h3>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={applyVat}
                  onChange={(e) => setApplyVat(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Appliquer la TVA ?
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Pour les particuliers, la TVA est optionnelle
              </p>
            </motion.div>
          )}

          {/* Articles */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Articles/Produits</h3>
              <button
                onClick={addItem}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>

            {products.length === 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-4">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  ⚠️ Aucun produit enregistré. Veuillez d'abord ajouter des produits dans la section Produits.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Article #{index + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Produit *
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductSelect(item.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Sélectionner un produit...</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.salePrice.toFixed(2)} MAD ({product.unit || 'unité'})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prix unit. HT
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        disabled={!user?.isAdmin}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total HT
                      </label>
                      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.total.toFixed(2)} MAD
                      </div>
                    </div>
                  </div>
                  
                  {/* TVA */}
                  {(clientType === 'societe' || (clientType === 'personne_physique' && applyVat)) && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        TVA
                      </label>
                      <select
                        value={item.vatRate}
                        onChange={(e) => updateItem(item.id, 'vatRate', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value={0}>0% (Exonéré)</option>
                        <option value={7}>7% (Produits alimentaires)</option>
                        <option value={10}>10% (Hôtellerie)</option>
                        <option value={20}>20% (Taux normal)</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Récapitulatif</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Sous-total HT</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{subtotal.toFixed(2)} MAD</span>
              </div>
              
              {(clientType === 'societe' || (clientType === 'personne_physique' && applyVat)) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">TVA</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{totalVat.toFixed(2)} MAD</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Total TTC</span>
                  <span className="text-lg font-bold text-blue-600">{totalTTC.toFixed(2)} MAD</span>
                </div>
              </div>
            </div>

            {/* Informations sur le statut */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📋 Statut automatique</h4>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                {!hasDeliveryDate ? (
                  <p>✅ Sera marquée comme <strong>"Livré"</strong> (livraison immédiate)</p>
                ) : (
                  <p>
                    {deliveryDate && new Date(deliveryDate) <= new Date() ? (
                      <>✅ Sera marquée comme <strong>"Livré"</strong> (date passée)</>
                    ) : (
                      <>🚚 Sera marquée comme <strong>"En cours de livraison"</strong> (date future)</>
                    )}
                  </p>
                )}
                <p className="text-xs mt-1 opacity-75">
                  Le stock sera automatiquement débité selon le statut
                </p>
              </div>
            </div>

            {/* Résumé des quantités */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">📦 Résumé</h4>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p><strong>Articles:</strong> {items.filter(i => i.productId).length}</p>
                <p><strong>Quantité totale:</strong> {getTotalQuantity(items).toFixed(1)}</p>
                <p><strong>Type client:</strong> {clientType === 'personne_physique' ? 'Particulier' : 'Société'}</p>
                {clientType === 'personne_physique' && (
                  <p><strong>TVA:</strong> {applyVat ? 'Oui' : 'Non'}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Validation finale */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">✅ Prêt à enregistrer</h4>
        <p className="text-sm text-green-800 dark:text-green-200">
          Cette commande sera automatiquement liée à vos produits pour la gestion de stock. 
          Le stock sera débité selon le statut déterminé automatiquement.
        </p>
      </div>
    </div>
  );
}

// Fonction utilitaire
function getTotalQuantity(items: any[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}