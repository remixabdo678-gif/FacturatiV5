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
import { Client, Product } from './DataContext';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
  unit?: string;
}

export interface Order {
  id: string;
  number: string;
  clientType: 'personne_physique' | 'societe';
  clientId?: string; // Pour les sociétés
  client?: Client; // Pour les sociétés
  clientName?: string; // Pour les personnes physiques
  orderDate: string; // Date + heure
  deliveryDate?: string; // Date + heure optionnelle
  items: OrderItem[];
  subtotal: number;
  totalVat: number;
  totalTTC: number;
  status: 'en_cours_livraison' | 'livre' | 'annule';
  stockDebited: boolean; // Flag pour éviter les doubles mouvements
  applyVat: boolean; // Pour les personnes physiques
  createdAt: string;
  entrepriseId: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'number' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    const entrepriseId = user.isAdmin ? user.id : user.entrepriseId;

    const ordersQuery = query(
      collection(db, 'orders'),
      where('entrepriseId', '==', entrepriseId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      setOrders(ordersData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  const generateOrderNumber = () => {
    if (!user?.company) return 'CMD-2025-001';
    
    const currentYear = new Date().getFullYear();
    const yearOrders = orders.filter(order => 
      new Date(order.orderDate).getFullYear() === currentYear
    );
    const counter = yearOrders.length + 1;
    const counterStr = String(counter).padStart(3, '0');
    
    return `CMD-${currentYear}-${counterStr}`;
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'number' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      const orderNumber = generateOrderNumber();
      
      // Déterminer le statut initial selon les règles
      let initialStatus: Order['status'];
      const now = new Date();
      
      if (!orderData.deliveryDate) {
        initialStatus = 'livre'; // Livré le jour même
      } else {
        const deliveryDate = new Date(orderData.deliveryDate);
        if (deliveryDate <= now) {
          initialStatus = 'livre'; // Date passée ou égale
        } else {
          initialStatus = 'en_cours_livraison'; // Date future
        }
      }
      
      // Déterminer si on doit débiter le stock
      const shouldDebitStock = initialStatus === 'en_cours_livraison' || initialStatus === 'livre';
      
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        number: orderNumber,
        status: initialStatus,
        stockDebited: shouldDebitStock,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });

      // Débiter le stock si nécessaire
      if (shouldDebitStock) {
        await debitStock(orderData.items, orderNumber);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error);
      throw error;
    }
  };

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    try {
      await updateDoc(doc(db, 'orders', id), {
        ...orderData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const order = orders.find(o => o.id === id);
      if (order && order.stockDebited) {
        // Ré-injecter le stock avant suppression
        await returnStock(order.items, order.number);
      }
      
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, newStatus: Order['status']) => {
    try {
      const order = orders.find(o => o.id === id);
      if (!order) return;

      const isNewStatusActive = newStatus === 'en_cours_livraison' || newStatus === 'livre';
      const isOldStatusActive = order.status === 'en_cours_livraison' || order.status === 'livre';

      // Gestion du stock selon les changements de statut
      if (isNewStatusActive && !order.stockDebited) {
        // Passer à un statut actif sans avoir débité → débiter
        await debitStock(order.items, order.number);
        await updateDoc(doc(db, 'orders', id), {
          status: newStatus,
          stockDebited: true,
          updatedAt: new Date().toISOString()
        });
      } else if (!isNewStatusActive && order.stockDebited) {
        // Passer à annulé avec stock débité → ré-injecter
        await returnStock(order.items, order.number);
        await updateDoc(doc(db, 'orders', id), {
          status: newStatus,
          stockDebited: false,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Pas de changement de stock nécessaire
        await updateDoc(doc(db, 'orders', id), {
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  };

  // Fonctions utilitaires pour la gestion du stock
  const debitStock = async (items: OrderItem[], orderNumber: string) => {
    if (!user) return;

    for (const item of items) {
      try {
        // Ajouter un mouvement de stock
        await addDoc(collection(db, 'stockMovements'), {
          productId: item.productId,
          productName: item.productName,
          type: 'order_out',
          quantity: -item.quantity, // Négatif pour sortie
          reason: 'Commande',
          reference: orderNumber,
          userId: user.id,
          userName: user.name,
          date: new Date().toISOString().split('T')[0],
          adjustmentDateTime: new Date().toISOString(),
          entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Erreur lors du débit de stock:', error);
      }
    }
  };

  const returnStock = async (items: OrderItem[], orderNumber: string) => {
    if (!user) return;

    for (const item of items) {
      try {
        // Ajouter un mouvement de stock de retour
        await addDoc(collection(db, 'stockMovements'), {
          productId: item.productId,
          productName: item.productName,
          type: 'order_cancel_return',
          quantity: item.quantity, // Positif pour retour
          reason: 'Annulation commande',
          reference: orderNumber,
          userId: user.id,
          userName: user.name,
          date: new Date().toISOString().split('T')[0],
          adjustmentDateTime: new Date().toISOString(),
          entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Erreur lors du retour de stock:', error);
      }
    }
  };

  const getOrderById = (id: string) => orders.find(order => order.id === id);

  const value = {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    getOrderById,
    isLoading
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}