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

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'initial' | 'sale' | 'adjustment' | 'return';
  quantity: number; // Positif pour entrée, négatif pour sortie
  previousStock: number;
  newStock: number;
  reason?: string;
  reference?: string; // Numéro de facture, commande, etc.
  userId: string;
  userName: string;
  date: string;
  createdAt: string;
  entrepriseId: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  alertType: 'low_stock' | 'out_of_stock';
  isActive: boolean;
  createdAt: string;
  entrepriseId: string;
}

export interface StockSummary {
  productId: string;
  productName: string;
  initialStock: number;
  totalSales: number;
  totalAdjustments: number;
  currentStock: number;
  lastMovementDate: string;
  movementCount: number;
}

interface StockContextType {
  stockMovements: StockMovement[];
  stockAlerts: StockAlert[];
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  addStockAdjustment: (productId: string, productName: string, quantity: number, reason: string, currentStock: number) => Promise<void>;
  getProductStockHistory: (productId: string) => StockMovement[];
  getProductStockSummary: (productId: string) => StockSummary | null;
  calculateCurrentStock: (productId: string) => number;
  checkStockAlerts: () => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  exportStockReport: (productId?: string) => void;
  isLoading: boolean;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    const entrepriseId = user.isAdmin ? user.id : user.entrepriseId;

    // Mouvements de stock
    const movementsQuery = query(
      collection(db, 'stockMovements'),
      where('entrepriseId', '==', entrepriseId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeMovements = onSnapshot(movementsQuery, (snapshot) => {
      const movementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockMovement));
      setStockMovements(movementsData);
    });

    // Alertes de stock
    const alertsQuery = query(
      collection(db, 'stockAlerts'),
      where('entrepriseId', '==', entrepriseId),
      where('isActive', '==', true)
    );
    const unsubscribeAlerts = onSnapshot(alertsQuery, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockAlert));
      setStockAlerts(alertsData);
      setIsLoading(false);
    });

    return () => {
      unsubscribeMovements();
      unsubscribeAlerts();
    };
  }, [isAuthenticated, user]);

  const addStockMovement = async (movementData: Omit<StockMovement, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'stockMovements'), {
        ...movementData,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du mouvement de stock:', error);
    }
  };

  const addStockAdjustment = async (
    productId: string, 
    productName: string, 
    quantity: number, 
    reason: string, 
    currentStock: number
  ) => {
    if (!user) return;
    
    try {
      const newStock = currentStock + quantity;
      
      await addStockMovement({
        productId,
        productName,
        type: 'adjustment',
        quantity,
        previousStock: currentStock,
        newStock,
        reason,
        userId: user.id,
        userName: user.name,
        date: new Date().toISOString().split('T')[0]
      });
      
      // Mettre à jour le stock du produit dans la base de données
      const { updateProduct } = await import('./DataContext');
      // Note: Cette approche nécessite une refactorisation pour éviter les imports circulaires
      // Pour l'instant, on va gérer cela différemment
    } catch (error) {
      console.error('Erreur lors de l\'ajustement du stock:', error);
      throw error;
    }
  };

  const getProductStockHistory = (productId: string): StockMovement[] => {
    return stockMovements
      .filter(movement => movement.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getProductStockSummary = (productId: string): StockSummary | null => {
    const movements = getProductStockHistory(productId);
    if (movements.length === 0) return null;

    const initialMovement = movements.find(m => m.type === 'initial');
    const salesMovements = movements.filter(m => m.type === 'sale');
    const adjustmentMovements = movements.filter(m => m.type === 'adjustment');

    const initialStock = initialMovement?.newStock || 0;
    const totalSales = Math.abs(salesMovements.reduce((sum, m) => sum + m.quantity, 0));
    const totalAdjustments = adjustmentMovements.reduce((sum, m) => sum + m.quantity, 0);
    const currentStock = calculateCurrentStock(productId);
    const lastMovement = movements[0];

    return {
      productId,
      productName: movements[0].productName,
      initialStock,
      totalSales,
      totalAdjustments,
      currentStock,
      lastMovementDate: lastMovement.date,
      movementCount: movements.length
    };
  };

  const calculateCurrentStock = (productId: string): number => {
    const movements = getProductStockHistory(productId);
    if (movements.length === 0) return 0;

    // Le stock actuel est le newStock du dernier mouvement
    return movements[0].newStock;
  };

  const checkStockAlerts = async () => {
    // Cette fonction sera appelée périodiquement pour vérifier les seuils
    // Pour l'instant, elle est vide car les alertes seront gérées dans le composant
  };

  const dismissAlert = async (alertId: string) => {
    try {
      await updateDoc(doc(db, 'stockAlerts', alertId), {
        isActive: false,
        dismissedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'alerte:', error);
    }
  };

  const exportStockReport = (productId?: string) => {
    const movements = productId 
      ? getProductStockHistory(productId)
      : stockMovements;

    const csvContent = [
      ['Date', 'Produit', 'Type', 'Quantité', 'Stock Précédent', 'Nouveau Stock', 'Motif', 'Utilisateur'].join(','),
      ...movements.map(m => [
        new Date(m.date).toLocaleDateString('fr-FR'),
        m.productName,
        m.type,
        m.quantity,
        m.previousStock,
        m.newStock,
        m.reason || '',
        m.userName
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stock_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const value = {
    stockMovements,
    stockAlerts,
    addStockMovement,
    addStockAdjustment,
    getProductStockHistory,
    getProductStockSummary,
    calculateCurrentStock,
    checkStockAlerts,
    dismissAlert,
    exportStockReport,
    isLoading
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}