import React, { useState } from 'react';
import { useData, Product } from '../../contexts/DataContext';
import Modal from '../common/Modal';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function EditProductModal({ isOpen, onClose, product }: EditProductModalProps) {
  const { updateProduct } = useData();
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    purchasePrice: product.purchasePrice,
    salePrice: product.salePrice,
    unit: product.unit || 'Kg',
    customUnit: '',
    stock: product.stock,
    minStock: product.minStock,
    status: product.status
  });

  const categories = [
    'Informatique',
    'Téléphonie',
    'Bureautique',
    'Électronique',
    'Mobilier',
    'Consommables',
    'Services',
    'Autre'
  ];

  const units = [
    { value: 'Kg', label: 'Kg' },
    { value: 'Litre', label: 'Litre' },
    { value: 'Tonne', label: 'Tonne' },
    { value: 'Autre', label: 'Autre' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Le nom est obligatoire');
      return;
    }
    
    const finalUnit = formData.unit === 'Autre' ? formData.customUnit : formData.unit;
    
    await updateProduct(product.id, {
      ...formData,
      unit: finalUnit
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier Produit" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Nom du produit"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégorie
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prix d'achat (MAD)
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prix de vente HT (MAD)
            </label>
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unité
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {units.map(unit => (
                <option key={unit.value} value={unit.value}>{unit.label}</option>
              ))}
            </select>
          </div>
          
          {formData.unit === 'Autre' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unité personnalisée
              </label>
              <input
                type="text"
                name="customUnit"
                value={formData.customUnit}
                onChange={handleChange}
                placeholder="Ex: Carton, Boîte, Paquet..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock initial
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock minimum
            </label>
            <input
              type="number"
              name="minStock"
              value={formData.minStock}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       hover:bg-gray-50 dark:hover:bg-gray-600 
                       transition-colors bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-gray-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 
                       hover:from-teal-700 hover:to-blue-700 
                       text-white rounded-lg transition-all duration-200"
          >
            Modifier Produit
          </button>
        </div>
      </form>
    </Modal>
  );
}
