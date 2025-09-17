import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { useSupplier } from './SupplierContext';

export type LicenseType = 'free' | 'pro';

interface LicenseLimits {
  invoices: number;
  clients: number;
  products: number;
  quotes: number;
  suppliers: number;
}

interface LicenseContextType {
  licenseType: LicenseType;
  limits: LicenseLimits;
  canAddInvoice: boolean;
  canAddClient: boolean;
  canAddProduct: boolean;
  canAddQuote: boolean;
  canAddSupplier: boolean;
  isLimitReached: boolean;
  limitMessage: string;
  upgradeToPro: () => Promise<void>;
  checkLimit: (type: 'invoices' | 'clients' | 'products' | 'quotes' | 'suppliers') => boolean;
  getRemainingCount: (type: 'invoices' | 'clients' | 'products' | 'quotes' | 'suppliers') => number;
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  upgradeExpiryDate: string | null;
}

const FREE_LIMITS: LicenseLimits = {
  invoices: 10,
  clients: 10,
  products: 20,
  quotes: 10,
  suppliers: 10
};

const PRO_LIMITS: LicenseLimits = {
  invoices: Infinity,
  clients: Infinity,
  products: Infinity,
  quotes: Infinity,
  suppliers: Infinity
};

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const { user, upgradeSubscription } = useAuth();
  const { invoices, clients, products, quotes } = useData();
  const { suppliers } = useSupplier();
  const [licenseType, setLicenseType] = useState<LicenseType>('free');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [upgradeExpiryDate, setUpgradeExpiryDate] = useState<string | null>(null);

  // Initialiser le type de licence depuis les données utilisateur
  useEffect(() => {
    if (user?.company) {
      setLicenseType(user.company.subscription || 'free');
    }
  }, [user]);

  const limits = licenseType === 'free' ? FREE_LIMITS : PRO_LIMITS;

  const canAddInvoice = invoices.length < limits.invoices;
  const canAddClient = clients.length < limits.clients;
  const canAddProduct = products.length < limits.products;
  const canAddQuote = quotes.length < limits.quotes;
  const canAddSupplier = suppliers.length < limits.suppliers;

  const isLimitReached = !canAddInvoice || !canAddClient || !canAddProduct || !canAddQuote || !canAddSupplier;

  const getLimitMessage = () => {
    const exceeded = [];
    if (!canAddInvoice) exceeded.push(`factures (${invoices.length}/${limits.invoices})`);
    if (!canAddClient) exceeded.push(`clients (${clients.length}/${limits.clients})`);
    if (!canAddProduct) exceeded.push(`produits (${products.length}/${limits.products})`);
    if (!canAddQuote) exceeded.push(`devis (${quotes.length}/${limits.quotes})`);
    if (!canAddSupplier) exceeded.push(`fournisseurs (${suppliers.length}/${limits.suppliers})`);
    
    if (exceeded.length === 0) return '';
    
    return `🚨 Limite atteinte pour: ${exceeded.join(', ')}. Passez à la version Pro pour continuer.`;
  };

  const checkLimit = (type: 'invoices' | 'clients' | 'products' | 'quotes' | 'suppliers'): boolean => {
    const currentCounts = {
      invoices: invoices.length,
      clients: clients.length,
      products: products.length,
      quotes: quotes.length,
      suppliers: suppliers.length
    };
    
    return currentCounts[type] < limits[type];
  };

  const getRemainingCount = (type: 'invoices' | 'clients' | 'products' | 'quotes' | 'suppliers'): number => {
    const currentCounts = {
      invoices: invoices.length,
      clients: clients.length,
      products: products.length,
      quotes: quotes.length,
      suppliers: suppliers.length
    };
    
    return Math.max(0, limits[type] - currentCounts[type]);
  };

  const upgradeToPro = async (): Promise<void> => {
    if (!user || !upgradeSubscription) return;
    
    try {
      await upgradeSubscription();
      
      // Calculer la date d'expiration pour l'affichage
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      setUpgradeExpiryDate(expiryDate.toISOString());
      
      setLicenseType('pro');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erreur lors de la mise à niveau:', error);
      throw error;
    }
  };

  const value = {
    licenseType,
    limits,
    canAddInvoice,
    canAddClient,
    canAddProduct,
    canAddQuote,
    canAddSupplier,
    isLimitReached,
    limitMessage: getLimitMessage(),
    upgradeToPro,
    checkLimit,
    getRemainingCount,
    showSuccessModal,
    setShowSuccessModal,
    upgradeExpiryDate
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}