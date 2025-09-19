import React, { useState } from 'react';
import { useOrder } from '../../contexts/OrderContext';
import { X, Package, Truck, XCircle, AlertTriangle } from 'lucide-react';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderStatusModal({ isOpen, onClose, order }: OrderStatusModalProps) {
  const { updateOrderStatus } = useOrder();
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const statusOptions = [
    {
      value: 'en_cours_livraison',
      label: 'En cours de livraison',
      description: 'Commande en préparation ou en transit',
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-700'
    },
    {
      value: 'livre',
      label: 'Livré',
      description: 'Commande livrée au client',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700'
    },
    {
      value: 'annule',
      label: 'Annulé',
      description: 'Commande annulée (stock ré-injecté)',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-700'
    }
  ];

  const handleSave = async () => {
    if (selectedStatus === order.status) {
      onClose();
      return;
    }

    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, selectedStatus);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStockImpact = () => {
    const currentStatusActive = order.status === 'en_cours_livraison' || order.status === 'livre';
    const newStatusActive = selectedStatus === 'en_cours_livraison' || selectedStatus === 'livre';

    if (currentStatusActive && !newStatusActive) {
      return {
        type: 'return',
        message: 'Le stock sera ré-injecté (annulation)',
        color: 'text-green-600'
      };
    } else if (!currentStatusActive && newStatusActive) {
      return {
        type: 'debit',
        message: 'Le stock sera débité',
        color: 'text-red-600'
      };
    } else {
      return {
        type: 'none',
        message: 'Aucun impact sur le stock',
        color: 'text-gray-600'
      };
    }
  };

  const stockImpact = getStockImpact();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Changer le Statut</h3>
                <p className="text-sm opacity-90">Commande {order.number}</p>
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Nouveau statut
                </label>
                <div className="space-y-3">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedStatus === option.value
                            ? `${option.borderColor} ${option.bgColor}`
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={selectedStatus === option.value}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <Icon className={`w-6 h-6 ${option.color}`} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{option.label}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Impact sur le stock */}
              {stockImpact.type !== 'none' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h4 className="font-medium text-amber-900 dark:text-amber-100">Impact sur le Stock</h4>
                  </div>
                  <p className={`text-sm ${stockImpact.color}`}>
                    {stockImpact.message}
                  </p>
                  <div className="mt-2 text-xs text-amber-800 dark:text-amber-200">
                    Articles concernés: {order.items.map((item: any) => `${item.productName} (${item.quantity})`).join(', ')}
                  </div>
                </div>
              )}

              {/* Informations actuelles */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Informations actuelles</h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <p><strong>Statut actuel:</strong> {statusOptions.find(s => s.value === order.status)?.label}</p>
                  <p><strong>Stock débité:</strong> {order.stockDebited ? 'Oui' : 'Non'}</p>
                  <p><strong>Date commande:</strong> {new Date(order.orderDate).toLocaleString('fr-FR')}</p>
                  {order.deliveryDate && (
                    <p><strong>Date livraison:</strong> {new Date(order.deliveryDate).toLocaleString('fr-FR')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating || selectedStatus === order.status}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Mise à jour...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}