import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  action: () => void;
  icon?: string;
  category: string;
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const commands: Command[] = [
    // Navigation
    { id: 'nav-dashboard', title: 'Tableau de bord', action: () => navigate('/dashboard'), category: 'Navigation', icon: '📊' },
    { id: 'nav-invoices', title: 'Factures', action: () => navigate('/invoices'), category: 'Navigation', icon: '📄' },
    { id: 'nav-quotes', title: 'Devis', action: () => navigate('/quotes'), category: 'Navigation', icon: '📋' },
    { id: 'nav-clients', title: 'Clients', action: () => navigate('/clients'), category: 'Navigation', icon: '👥' },
    { id: 'nav-products', title: 'Produits', action: () => navigate('/products'), category: 'Navigation', icon: '📦' },
    { id: 'nav-suppliers', title: 'Fournisseurs', action: () => navigate('/suppliers'), category: 'Navigation', icon: '🚚' },
    { id: 'nav-settings', title: 'Paramètres', action: () => navigate('/settings'), category: 'Navigation', icon: '⚙️' },
    
    // Actions rapides
    { id: 'create-invoice', title: 'Nouvelle facture', action: () => navigate('/invoices/create'), category: 'Actions', icon: '➕' },
    { id: 'create-quote', title: 'Nouveau devis', action: () => navigate('/quotes/create'), category: 'Actions', icon: '➕' },
    
    // Gestion PRO
    { id: 'nav-stock', title: 'Gestion de Stock', action: () => navigate('/stock-management'), category: 'Gestion PRO', icon: '📈' },
    { id: 'nav-hr', title: 'Gestion Humaine', action: () => navigate('/hr-management'), category: 'Gestion PRO', icon: '👤' },
    { id: 'nav-projects', title: 'Gestion de Projet', action: () => navigate('/project-management'), category: 'Gestion PRO', icon: '📁' },
    { id: 'nav-reports', title: 'Gestion financière', action: () => navigate('/reports'), category: 'Gestion PRO', icon: '💰' },
    { id: 'nav-supplier-mgmt', title: 'Gest. Fournisseurs', action: () => navigate('/supplier-management'), category: 'Gestion PRO', icon: '🏭' },
    { id: 'nav-account', title: 'Gest. de Compte', action: () => navigate('/account-management'), category: 'Gestion PRO', icon: '🛡️' }
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(search.toLowerCase()) ||
    command.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const executeCommand = (command: Command) => {
    command.action();
    setIsOpen(false);
    setSearch('');
  };

  return {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    commands: filteredCommands,
    executeCommand
  };
}