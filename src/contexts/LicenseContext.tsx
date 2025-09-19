// src/contexts/LicenseContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { useSupplier } from './SupplierContext';
import { useOrder } from './OrderContext'; // IMPORTANT: hook manquant

export type LicenseType = 'free' | 'pro';

interface LicenseLimits {
  invoices: number;
  clients: number;
  products: number;
  quotes: number;
  orders: number;
  suppliers: number;
}

interface LicenseContextType {
  licenseType: LicenseType;
  limits: LicenseLimits;
  canAddInvoice: boolean;
  canAddClient: boolean;
  canAddProduct: boolean;
  canAddQuote: boolean;
  canAddOrder: boolean;
  canAddSupplier: boolean;
  isLimitReached: boolean;
  limitMessage: string;
  upgradeToPro: () => Promise<void>;
  checkLimit: (type: 'invoices' | 'clients' | 'products' | 'quotes' | 'orders' | 'suppliers') => boolean;
  getRemainingCount: (type: 'invoices' | 'clients' | 'products' | 'quotes' | 'orders' | 'suppliers') => number;
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  upgradeExpiryDate: string | null;
}

const FREE_LIMITS: LicenseLimits = {
  invoices: 10,
  clients: 10,
  products: 20,
  quotes: 10,
  orders: 15,
  suppliers: 10,
};

const PRO_LIMITS: LicenseLimits = {
  invoices: Infinity,
  clients: Infinity,
  products: Infinity,
  quotes: Infinity,
  orders: Infinity,
  suppliers: Infinity,
};

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: ReactNode }): JSX.Element {
  const { user, upgradeSubscription } = useAuth();
  const { invoices, clients, products, quotes } = useData();
  const { orders } = useOrder();
  const { suppliers } = useSupplier();

  const [licenseType, setLicenseType] = useState<LicenseType>('free');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [upgradeExpiryDate, setUpgradeExpiryDate] = useState<string | null>(null);

  // Pourquoi: normaliser la valeur issue du backend
  useEffect(() => {
    const sub = user?.company?.subscription;
    setLicenseType(sub === 'pro' ? 'pro' : 'free');
  }, [user]);

  const limits = licenseType === 'free' ? FREE_LIMITS : PRO_LIMITS;

  const canAddInvoice = invoices.length < limits.invoices;
  const canAddClient = clients.length < limits.clients;
  const canAddProduct = products.length < limits.products;
  const canAddQuote = quotes.length < limits.quotes;
  const canAddOrder = orders.length < limits.orders;
  const canAddSupplier = suppliers.length < limits.suppliers;

  const isLimitReached =
    !canAddInvoice || !canAddClient || !canAddProduct || !canAddQuote || !canAddOrder || !canAddSupplier;

  const getLimitMessage = () => {
    const exceeded: string[] = [];
    if (!canAddInvoice) exceeded.push(`factures (${invoices.length}/${limits.invoices})`);
    if (!canAddClient) exceeded.push(`clients (${clients.length}/${limits.clients})`);
    if (!canAddProduct) exceeded.push(`produits (${products.length}/${limits.products})`);
    if (!canAddQuote) exceeded.push(`devis (${quotes.length}/${limits.quotes})`);
    if (!canAddOrder) exceeded.push(`commandes (${orders.length}/${limits.orders})`);
    if (!canAddSupplier) exceeded.push(`fournisseurs (${suppliers.length}/${limits.suppliers})`);
    if (exceeded.length === 0) return '';
    return `🚨 Limite atteinte pour: ${exceeded.join(', ')}. Passez à la version Pro pour continuer.`;
  };

  const checkLimit: LicenseContextType['checkLimit'] = (type) => {
    const currentCounts = {
      invoices: invoices.length,
      clients: clients.length,
      products: products.length,
      quotes: quotes.length,
      orders: orders.length,
      suppliers: suppliers.length,
    };
    return currentCounts[type] < limits[type];
  };

  const getRemainingCount: LicenseContextType['getRemainingCount'] = (type) => {
    const currentCounts = {
      invoices: invoices.length,
      clients: clients.length,
      products: products.length,
      quotes: quotes.length,
      orders: orders.length,
      suppliers: suppliers.length,
    };
    const remaining = limits[type] - currentCounts[type];
    return remaining === Infinity ? Infinity : Math.max(0, remaining);
  };

  const upgradeToPro = async (): Promise<void> => {
    if (!user || !upgradeSubscription) return; // Pourquoi: éviter crash si hook pas prêt
    await upgradeSubscription();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    setUpgradeExpiryDate(expiryDate.toISOString());
    setLicenseType('pro');
    setShowSuccessModal(true);
  };

  const value: LicenseContextType = {
    licenseType,
    limits,
    canAddInvoice,
    canAddClient,
    canAddProduct,
    canAddQuote,
    canAddOrder,
    canAddSupplier,
    isLimitReached,
    limitMessage: getLimitMessage(),
    upgradeToPro,
    checkLimit,
    getRemainingCount,
    showSuccessModal,
    setShowSuccessModal,
    upgradeExpiryDate,
  };

  return <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>;
}

export function useLicense(): LicenseContextType {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}
