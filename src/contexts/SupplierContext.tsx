import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface Supplier {
  id: string;
  name: string;
  ice: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  paymentTerms: number; // jours
  status: 'active' | 'inactive';
  createdAt: string;
  entrepriseId: string;
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  supplier: Supplier;
  productName: string;
  description: string;
  unitPrice: number;
  unit: string;
  lastOrderDate?: string;
  createdAt: string;
  entrepriseId: string;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  supplier: Supplier;
  date: string;
  dueDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  totalVat: number;
  totalTTC: number;
  status: 'draft' | 'sent' | 'received' | 'paid';
  createdAt: string;
  entrepriseId: string;
}

export interface PurchaseOrderItem {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
  unit: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplier: Supplier;
  amount: number;
  paymentMethod: 'virement' | 'cheque' | 'espece' | 'carte';
  paymentDate: string;
  reference: string;
  description?: string;
  createdAt: string;
  entrepriseId: string;
}

interface SupplierContextType {
  suppliers: Supplier[];
  supplierProducts: SupplierProduct[];
  purchaseOrders: PurchaseOrder[];
  supplierPayments: SupplierPayment[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addSupplierProduct: (product: Omit<SupplierProduct, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateSupplierProduct: (id: string, product: Partial<SupplierProduct>) => Promise<void>;
  deleteSupplierProduct: (id: string) => Promise<void>;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'number' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updatePurchaseOrder: (id: string, order: Partial<PurchaseOrder>) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  addSupplierPayment: (payment: Omit<SupplierPayment, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateSupplierPayment: (id: string, payment: Partial<SupplierPayment>) => Promise<void>;
  deleteSupplierPayment: (id: string) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  getSupplierById: (id: string) => Supplier | undefined;
  getSupplierBalance: (supplierId: string) => number;
  getSupplierStats: (supplierId: string) => {
    totalPurchases: number;
    totalPayments: number;
    balance: number;
    ordersCount: number;
  };
  isLoading: boolean;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

// Export du contexte pour utilisation dans LicenseContext
export { SupplierContext };

export function SupplierProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    // Utiliser l'ID de l'entreprise pour tous les utilisateurs (admin et gérés)
    const entrepriseId = user.isAdmin ? user.id : user.entrepriseId;

    // Fournisseurs
    const suppliersQuery = query(
      collection(db, 'suppliers'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeSuppliers = onSnapshot(suppliersQuery, (snapshot) => {
      const suppliersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSuppliers(suppliersData);
    });

    // Produits fournisseurs
    const supplierProductsQuery = query(
      collection(db, 'supplierProducts'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeSupplierProducts = onSnapshot(supplierProductsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SupplierProduct)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSupplierProducts(productsData);
    });

    // Commandes d'achat
    const purchaseOrdersQuery = query(
      collection(db, 'purchaseOrders'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribePurchaseOrders = onSnapshot(purchaseOrdersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PurchaseOrder)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPurchaseOrders(ordersData);
    });

    // Paiements fournisseurs
    const supplierPaymentsQuery = query(
      collection(db, 'supplierPayments'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeSupplierPayments = onSnapshot(supplierPaymentsQuery, (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SupplierPayment)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSupplierPayments(paymentsData);
      setIsLoading(false);
    });

    return () => {
      unsubscribeSuppliers();
      unsubscribeSupplierProducts();
      unsubscribePurchaseOrders();
      unsubscribeSupplierPayments();
    };
  }, [isAuthenticated, user]);

  const generatePurchaseOrderNumber = () => {
    if (!user?.company) return 'CMD-2025-001';
    
    const currentYear = new Date().getFullYear();
    const yearOrders = purchaseOrders.filter(order => 
      new Date(order.date).getFullYear() === currentYear
    );
    const counter = yearOrders.length + 1;
    const counterStr = String(counter).padStart(3, '0');
    
    return `CMD-${currentYear}-${counterStr}`;
  };

  // Fournisseurs
  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'suppliers'), {
        ...supplierData,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du fournisseur:', error);
    }
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    try {
      await updateDoc(doc(db, 'suppliers', id), {
        ...supplierData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fournisseur:', error);
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'suppliers', id));
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur:', error);
    }
  };

  // Produits fournisseurs
  const addSupplierProduct = async (productData: Omit<SupplierProduct, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'supplierProducts'), {
        ...productData,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit fournisseur:', error);
    }
  };

  const updateSupplierProduct = async (id: string, productData: Partial<SupplierProduct>) => {
    try {
      await updateDoc(doc(db, 'supplierProducts', id), {
        ...productData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit fournisseur:', error);
    }
  };

  const deleteSupplierProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'supplierProducts', id));
    } catch (error) {
      console.error('Erreur lors de la suppression du produit fournisseur:', error);
    }
  };

  // Commandes d'achat
  const addPurchaseOrder = async (orderData: Omit<PurchaseOrder, 'id' | 'number' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      const orderNumber = generatePurchaseOrderNumber();
      
      await addDoc(collection(db, 'purchaseOrders'), {
        ...orderData,
        number: orderNumber,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error);
    }
  };

  const updatePurchaseOrder = async (id: string, orderData: Partial<PurchaseOrder>) => {
    try {
      await updateDoc(doc(db, 'purchaseOrders', id), {
        ...orderData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'purchaseOrders', id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
    }
  };

  // Paiements fournisseurs
  const addSupplierPayment = async (paymentData: Omit<SupplierPayment, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'supplierPayments'), {
        ...paymentData,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du paiement:', error);
    }
  };

  const updateSupplierPayment = async (id: string, paymentData: Partial<SupplierPayment>) => {
    try {
      await updateDoc(doc(db, 'supplierPayments', id), {
        ...paymentData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
    }
  };

  const deleteSupplierPayment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'supplierPayments', id));
    } catch (error) {
      console.error('Erreur lors de la suppression du paiement:', error);
    }
  };

  // Getters et calculs
  const getSupplierById = (id: string) => suppliers.find(supplier => supplier.id === id);

  const getSupplierBalance = (supplierId: string) => {
    const totalPurchases = purchaseOrders
      .filter(order => order.supplierId === supplierId)
      .reduce((sum, order) => sum + order.totalTTC, 0);
    
    const totalPayments = supplierPayments
      .filter(payment => payment.supplierId === supplierId)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    return totalPurchases - totalPayments;
  };

  const getSupplierStats = (supplierId: string) => {
    const supplierOrders = purchaseOrders.filter(order => order.supplierId === supplierId);
    const supplierPaymentsData = supplierPayments.filter(payment => payment.supplierId === supplierId);
    
    const totalPurchases = supplierOrders.reduce((sum, order) => sum + order.totalTTC, 0);
    const totalPayments = supplierPaymentsData.reduce((sum, payment) => sum + payment.amount, 0);
    const balance = totalPurchases - totalPayments;
    const ordersCount = supplierOrders.length;
    
    return {
      totalPurchases,
      totalPayments,
      balance,
      ordersCount
    };
  };

  const value = {
    suppliers,
    supplierProducts,
    purchaseOrders,
    supplierPayments,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addSupplierProduct,
    updateSupplierProduct,
    deleteSupplierProduct,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    addSupplierPayment,
    updateSupplierPayment,
    deleteSupplierPayment,
    getSupplierById,
    getSupplierBalance,
    getSupplierStats,
    isLoading,
  };

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplier() {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSupplier must be used within a SupplierProvider');
  }
  return context;
}