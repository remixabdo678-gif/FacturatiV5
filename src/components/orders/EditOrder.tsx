import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOrder, OrderItem } from '../../contexts/OrderContext';
import { useData, Client } from '../../contexts/DataContext';
import { ArrowLeft, Plus, Trash2, Save, User, Building2 } from 'lucide-react';

export default function EditOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, updateOrder, getOrderById } = useOrder();
  const { clients, products, getClientById } = useData();
  
  const order = id ? getOrderById(id) : null;
  
  const [clientType, setClientType] = useState(order?.clientType || 'societe');
  const [selectedClientId, setSelectedClientId] = useState(order?.clientId || '');
  const [selectedClient, setSelectedClient] = useState<Client | null>(order?.client || null);
  const [clientName, setClientName] = useState(order?.clientName || '');
  const [orderDate, setOrderDate] = useState(() => {
    if (order?.orderDate) {
      return new Date(order.orderDate).toISOString().slice(0, 16);
    }
    return '';
  });
  const [hasDeliveryDate, setHasDeliveryDate] = useState(!!order?.deliveryDate);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    if (order?.deliveryDate) {
      return new Date(order.deliveryDate).toISOString().slice(0, 16);
    }
    return '';
  });
  const [applyVat, setApplyVat] = useState(order?.applyVat || false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [items, setItems] = useState<OrderItem[]>(order?.items || []);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Commande non trouvée
          </h2>
          <button
            onClick={() => navigate('/commandes')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retour aux commandes
          </button>
        </div>
      </div>
    );
  }

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

    setIsLoading(true);
    
    try {
      const updateData = {
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
        applyVat: clientType === 'personne_physique' ? applyVat : true
      };
      
      await updateOrder(order.id, updateData);
      navigate(`/commandes/${order.id}`);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification de la commande');
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
            onClick={() => navigate(`/commandes/${order.id}`)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Modifier Commande {order.number}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Modification des détails de la commande
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Type de client */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Type de Client</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                clientType === 'societe' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'
              }`}>
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

              <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                clientType === 'personne_physique' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600'
              }`}>
                <input
                  type="radio"
                  name="clientType"
                  value="personne_physique"
                  checked={clientType === 'personne_physique'}
                  onChange={(e) => setClientType(e.target.value as any)}
                  className="text-green-600 focus:ring-green-500"
                />
                <User className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Particulier</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Saisie manuelle</p>
                </div>
              </label>
            </div>
          </div>

          {/* Informations client */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
          </div>

          {/* Dates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
          </div>

          {/* Articles */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
                            {product.name} - {product.salePrice.toFixed(2)} MAD
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
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
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

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ <strong>Attention:</strong> La modification d'une commande n'affecte pas automatiquement le stock. 
                Utilisez le changement de statut pour gérer l'impact sur le stock.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fonction utilitaire
function addItem() {
  // Cette fonction sera définie dans le composant
}