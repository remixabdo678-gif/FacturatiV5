import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Users, Package, Command, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const { invoices, clients, products, quotes } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Recherche dans toutes les données
  const searchResults = React.useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    const results: any[] = [];

    // Recherche dans les factures
    invoices.forEach(invoice => {
      if (
        invoice.number.toLowerCase().includes(term) ||
        invoice.client.name.toLowerCase().includes(term)
      ) {
        results.push({
          type: 'invoice',
          id: invoice.id,
          title: `Facture ${invoice.number}`,
          subtitle: `${invoice.client.name} • ${invoice.totalTTC.toLocaleString()} MAD`,
          icon: FileText,
          action: () => navigate('/invoices'),
          color: 'text-teal-600'
        });
      }
    });

    // Recherche dans les devis
    quotes.forEach(quote => {
      if (
        quote.number.toLowerCase().includes(term) ||
        quote.client.name.toLowerCase().includes(term)
      ) {
        results.push({
          type: 'quote',
          id: quote.id,
          title: `Devis ${quote.number}`,
          subtitle: `${quote.client.name} • ${quote.totalTTC.toLocaleString()} MAD`,
          icon: FileText,
          action: () => navigate('/quotes'),
          color: 'text-purple-600'
        });
      }
    });

    // Recherche dans les clients
    clients.forEach(client => {
      if (
        client.name.toLowerCase().includes(term) ||
        client.ice.includes(term) ||
        client.email.toLowerCase().includes(term)
      ) {
        results.push({
          type: 'client',
          id: client.id,
          title: client.name,
          subtitle: `ICE: ${client.ice} • ${client.email}`,
          icon: Users,
          action: () => navigate('/clients'),
          color: 'text-blue-600'
        });
      }
    });

    // Recherche dans les produits
    products.forEach(product => {
      if (
        product.name.toLowerCase().includes(term) ||
        (product.sku || '').toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      ) {
        results.push({
          type: 'product',
          id: product.id,
          title: product.name,
          subtitle: `${product.category} • ${product.salePrice.toLocaleString()} MAD`,
          icon: Package,
          action: () => navigate('/products'),
          color: 'text-orange-600'
        });
      }
    });





    

    return results.slice(0, 8); // Limiter à 8 résultats
  }, [searchTerm, invoices, clients, products, quotes, navigate]);

  // Navigation au clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            searchResults[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, onClose]);

  // Reset quand on ouvre/ferme
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="flex items-start justify-center min-h-screen px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center space-x-4 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 flex-1">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher facture, devis, client, produit..."
                  className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-lg"
                  autoFocus
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Résultats */}
            <div className="max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((result, index) => {
                    const Icon = result.icon;
                    return (
                      <motion.button
                        key={`${result.type}-${result.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          result.action();
                          onClose();
                        }}
                        className={`w-full flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 text-left ${
                          selectedIndex === index
                            ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedIndex === index ? 'bg-teal-100 dark:bg-teal-800' : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <Icon className={`w-5 h-5 ${result.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{result.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{result.subtitle}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    );
                  })}
                </div>
              ) : searchTerm.trim() ? (
                <div className="p-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Aucun résultat trouvé</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Essayez avec d'autres mots-clés
                  </p>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Command className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Commencez à taper pour rechercher</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Factures, devis, clients, produits...
                  </p>
                </div>
              )}
            </div>

            {/* Footer avec raccourcis */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">↑↓</kbd>
                    <span>Naviguer</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">↵</kbd>
                    <span>Sélectionner</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
                  <span>Fermer</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
