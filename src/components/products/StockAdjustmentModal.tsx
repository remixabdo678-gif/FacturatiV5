import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Product } from '../../contexts/DataContext';
import Modal from '../common/Modal';
import { Package, Plus, Minus, RotateCcw, AlertTriangle, Clock } from 'lucide-react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  currentStock: number;
}

export default function StockAdjustmentModal({ isOpen, onClose, product, currentStock }: StockAdjustmentModalProps) {
  const { updateProduct, addStockMovement } = useData();
  const { user } = useAuth();
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'subtract'>('add');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [adjustmentDateTime, setAdjustmentDateTime] = useState(() => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDateTime.toISOString().slice(0, 16);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedReasons = [
    'Erreur de saisie',
    'Perte/Casse',
    'Vol/Disparition',
    'Retour client',
    'Inventaire physique',
    'Réception marchandise',
    'Correction administrative',
    'Autre'
  ];

  const calculateNewStock = () => {
    switch (adjustmentType) {
      case 'set':
        return quantity;
      case 'add':
        return currentStock + quantity;
      case 'subtract':
        return Math.max(0, currentStock - quantity);
      default:
        return currentStock;
    }
  };

  const calculateAdjustmentQuantity = () => {
    const newStock = calculateNewStock();
    return newStock - currentStock;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert('Veuillez saisir un motif de rectification');
      return;
    }

    if (adjustmentType === 'set' && quantity < 0) {
      alert('Le stock ne peut pas être négatif');
      return;
    }

    if (adjustmentType === 'subtract' && quantity > currentStock) {
      alert('Impossible de retirer plus que le stock actuel');
      return;
    }

    if (!user) {
      alert('Utilisateur non connecté');
      return;
    }
    setIsSubmitting(true);

    try {
      const adjustmentQuantity = calculateAdjustmentQuantity();
      const newStock = calculateNewStock();

      // Ajouter le mouvement de stock
      await addStockMovement({
        productId: product.id,
        productName: product.name,
        type: 'adjustment',
        quantity: adjustmentQuantity,
        previousStock: currentStock,
        newStock: newStock,
        reason: reason.trim(),
        userId: user.id,
        userName: user.name,
        date: adjustmentDateTime,
        adjustmentDateTime: adjustmentDateTime
      });

      // Mettre à jour le stock du produit
      await updateProduct(product.id, { stock: newStock });

      // Reset form
      setQuantity(0);
      setReason('');
      setAdjustmentType('add');

      onClose();
    } catch (error) {
      console.error('Erreur lors de la rectification:', error);
      alert('Erreur lors de la rectification du stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const newStock = calculateNewStock();
  const adjustmentQuantity = calculateAdjustmentQuantity();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rectifier le Stock" size="md">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Informations produit */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Package className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">{product.name}</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">{product.category}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Stock actuel:</span>
              <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                {currentStock.toFixed(3)} {product.unit}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Stock minimum:</span>
              <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                {product.minStock.toFixed(3)} {product.unit}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Date et heure de rectification */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Date et heure de rectification
          </label>
          <input
            type="datetime-local"
            value={adjustmentDateTime}
            onChange={(e) => setAdjustmentDateTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cette date/heure sera enregistrée dans l'historique du produit
          </p>
        </motion.div>

        {/* Type d'ajustement */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Type de rectification
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Ajouter */}
            <motion.label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                name="adjustmentType"
                value="add"
                checked={adjustmentType === 'add'}
                onChange={(e) => setAdjustmentType(e.target.value as any)}
                className="text-green-600 focus:ring-green-500"
              />
              <Plus className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Ajouter</span>
            </motion.label>

            {/* Retirer */}
            <motion.label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                name="adjustmentType"
                value="subtract"
                checked={adjustmentType === 'subtract'}
                onChange={(e) => setAdjustmentType(e.target.value as any)}
                className="text-red-600 focus:ring-red-500"
              />
              <Minus className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Retirer</span>
            </motion.label>

            {/* Définir */}
            <motion.label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                name="adjustmentType"
                value="set"
                checked={adjustmentType === 'set'}
                onChange={(e) => setAdjustmentType(e.target.value as any)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Définir</span>
            </motion.label>
          </div>
        </motion.div>

        {/* Quantité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {adjustmentType === 'set' ? 'Nouveau stock' : 'Quantité'} ({product.unit})
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.001"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder={adjustmentType === 'set' ? 'Stock final souhaité' : 'Quantité à ajuster'}
          />
        </div>

        {/* Motif */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Motif de rectification *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-2"
          >
            <option value="">Sélectionner un motif</option>
            {predefinedReasons.map(predefinedReason => (
              <option key={predefinedReason} value={predefinedReason}>
                {predefinedReason}
              </option>
            ))}
          </select>

          {reason === 'Autre' && (
            <input
              type="text"
              placeholder="Précisez le motif..."
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          )}
        </div>

        {/* Aperçu du changement */}
        {quantity > 0 && (
          <motion.div className="p-4 rounded-lg border-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Aperçu de la rectification</h4>
            ...
          </motion.div>
        )}

        {/* Boutons */}
        <div className="flex justify-end space-x-3 pt-6">
          <motion.button type="button" onClick={onClose}>Annuler</motion.button>
          <motion.button type="submit">{isSubmitting ? 'Rectification...' : 'Rectifier le Stock'}</motion.button>
        </div>
      </motion.form>
    </Modal>
  );
}
