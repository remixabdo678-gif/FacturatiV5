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
  onSnapshot
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  updatePassword,
  deleteUser as deleteFirebaseUser
} from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface UserPermissions {
  dashboard: boolean;
  invoices: boolean;
  quotes: boolean;
  clients: boolean;
  products: boolean;
  suppliers: boolean;
  stockManagement: boolean;
  supplierManagement: boolean;
  hrManagement: boolean;
  reports: boolean;
  settings: boolean;
  projectManagement: boolean;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  password: string; // Stocké en clair pour que l'admin puisse le modifier
  permissions: UserPermissions;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  createdBy: string; // ID de l'admin qui a créé cet utilisateur
  entrepriseId: string;
}

interface UserManagementContextType {
  managedUsers: ManagedUser[];
  addUser: (userData: Omit<ManagedUser, 'id' | 'createdAt' | 'createdBy' | 'entrepriseId'>) => Promise<void>;
  updateUser: (id: string, userData: Partial<ManagedUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetUserPassword: (id: string, newPassword: string) => Promise<void>;
  getUserById: (id: string) => ManagedUser | undefined;
  canCreateUser: boolean;
  remainingUserSlots: number;
  isLoading: boolean;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

const DEFAULT_PERMISSIONS: UserPermissions = {
  dashboard: true,
  invoices: false,
  quotes: false,
  clients: false,
  products: false,
  suppliers: false,
  stockManagement: false,
  supplierManagement: false,
  hrManagement: false,
  reports: false,
  settings: false,
  projectManagement: false
};

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const MAX_USERS = 5;
  const canCreateUser = managedUsers.length < MAX_USERS;
  const remainingUserSlots = MAX_USERS - managedUsers.length;

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    // Utiliser l'ID de l'entreprise pour tous les utilisateurs (admin et gérés)
    const entrepriseId = user.isAdmin ? user.id : user.entrepriseId;

    const usersQuery = query(
      collection(db, 'managedUsers'),
      where('entrepriseId', '==', entrepriseId)
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ManagedUser)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setManagedUsers(usersData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  const addUser = async (userData: Omit<ManagedUser, 'id' | 'createdAt' | 'createdBy' | 'entrepriseId'>) => {
    if (!user) return;
    
    if (!canCreateUser) {
      throw new Error('Limite de 5 utilisateurs atteinte');
    }
    
    try {
      await addDoc(collection(db, 'managedUsers'), {
        ...userData,
        createdBy: user.isAdmin ? user.id : user.entrepriseId,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<ManagedUser>) => {
    try {
      await updateDoc(doc(db, 'managedUsers', id), {
        ...userData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'managedUsers', id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  };

  const resetUserPassword = async (id: string, newPassword: string) => {
    try {
      await updateUser(id, { password: newPassword });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw error;
    }
  };

  const getUserById = (id: string) => managedUsers.find(user => user.id === id);

  const value = {
    managedUsers,
    addUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    getUserById,
    canCreateUser,
    remainingUserSlots,
    isLoading
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
}

export function useUserManagement() {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
}