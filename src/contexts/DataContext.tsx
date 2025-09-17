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
import { convertNumberToWords } from '../utils/numberToWords';

export interface Client {
  id: string;
  name: string;
  ice: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  entrepriseId: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  unit: string;
  stock: number;
  minStock: number;
  status: 'active' | 'inactive';
  createdAt: string;
  entrepriseId: string;
}

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  client: Client;
  date: string;
  validUntil: string;
  items: QuoteItem[];
  subtotal: number;
  totalVat: number;
  totalTTC: number;
  totalInWords: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  entrepriseId: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
  unit?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client: Client;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  totalVat: number;
  totalTTC: number;
  totalInWords: string;
  status: 'draft' | 'sent' | 'unpaid' | 'paid' | 'collected';
  paymentMethod?: 'virement' | 'espece' | 'cheque' | 'effet';
  collectionDate?: string;
  collectionType?: 'cheque' | 'effet';
  createdAt: string;
  quoteId?: string;
  entrepriseId: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
  unit?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phone: string;
  hireDate: string;
  baseSalary: number;
  annualLeaveDays: number;
  status: 'active' | 'inactive';
  createdAt: string;
  entrepriseId: string;
}

export interface Overtime {
  id: string;
  employeeId: string;
  employee: Employee;
  date: string;
  hours: number;
  rate: number;
  total: number;
  description?: string;
  createdAt: string;
  entrepriseId: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  employee: Employee;
  startDate: string;
  endDate: string;
  type: 'annual' | 'sick' | 'maternity' | 'other';
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt: string;
  entrepriseId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  client: Client;
  budget: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  entrepriseId: string;
}

export interface Task {
  id: string;
  projectId: string;
  project: Project;
  title: string;
  description: string;
  assignedTo: string; // Employee ID
  assignedEmployee?: Employee;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  deadline: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  entrepriseId: string;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  taskId?: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  entrepriseId: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  taskId?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
  entrepriseId: string;
}

interface DataContextType {
  clients: Client[];
  products: Product[];
  invoices: Invoice[];
  quotes: Quote[];
  employees: Employee[];
  overtimes: Overtime[];
  leaves: Leave[];
  projects: Project[];
  tasks: Task[];
  projectComments: ProjectComment[];
  projectFiles: ProjectFile[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addQuote: (quote: Omit<Quote, 'id' | 'number' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateQuote: (id: string, quote: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  convertQuoteToInvoice: (quoteId: string) => Promise<void>;
  updateProductStock: (productName: string, quantity: number) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addOvertime: (overtime: Omit<Overtime, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateOvertime: (id: string, overtime: Partial<Overtime>) => Promise<void>;
  deleteOvertime: (id: string) => Promise<void>;
  addLeave: (leave: Omit<Leave, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateLeave: (id: string, leave: Partial<Leave>) => Promise<void>;
  deleteLeave: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addProjectComment: (comment: Omit<ProjectComment, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  addProjectFile: (file: Omit<ProjectFile, 'id' | 'createdAt' | 'entrepriseId'>) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getProductById: (id: string) => Product | undefined;
  getInvoiceById: (id: string) => Invoice | undefined;
  getQuoteById: (id: string) => Quote | undefined;
  getEmployeeById: (id: string) => Employee | undefined;
  getProjectById: (id: string) => Project | undefined;
  getTaskById: (id: string) => Task | undefined;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [overtimes, setOvertimes] = useState<Overtime[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectComments, setProjectComments] = useState<ProjectComment[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Générer un SKU automatique pour les produits
  const generateSKU = (name: string, category: string) => {
    const categoryPrefix = category ? category.substring(0, 3).toUpperCase() : 'PRD';
    const namePrefix = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${categoryPrefix}-${namePrefix}-${timestamp}`;
  };

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    // Utiliser l'ID de l'entreprise pour tous les utilisateurs (admin et gérés)
    const entrepriseId = user.isAdmin ? user.id : user.entrepriseId;

    // Clients
    const clientsQuery = query(
      collection(db, 'clients'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Client)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setClients(clientsData);
    });

    // Produits
    const productsQuery = query(
      collection(db, 'products'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProducts(productsData);
    });

    // Factures
    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Invoice)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setInvoices(invoicesData);
    });

    // Devis
    const quotesQuery = query(
      collection(db, 'quotes'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeQuotes = onSnapshot(quotesQuery, (snapshot) => {
      const quotesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Quote)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setQuotes(quotesData);
      setIsLoading(false);
    });

    // Employés
    const employeesQuery = query(
      collection(db, 'employees'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeEmployees = onSnapshot(employeesQuery, (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Employee)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setEmployees(employeesData);
    });

    // Heures supplémentaires
    const overtimesQuery = query(
      collection(db, 'overtimes'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeOvertimes = onSnapshot(overtimesQuery, (snapshot) => {
      const overtimesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Overtime)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOvertimes(overtimesData);
    });

    // Congés
    const leavesQuery = query(
      collection(db, 'leaves'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeLeaves = onSnapshot(leavesQuery, (snapshot) => {
      const leavesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Leave)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLeaves(leavesData);
    });

    // Projets
    const projectsQuery = query(
      collection(db, 'projects'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProjects(projectsData);
    });

    // Tâches
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTasks(tasksData);
    });

    // Commentaires
    const commentsQuery = query(
      collection(db, 'projectComments'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProjectComment)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProjectComments(commentsData);
    });

    // Fichiers
    const filesQuery = query(
      collection(db, 'projectFiles'),
      where('entrepriseId', '==', entrepriseId)
    );
    const unsubscribeFiles = onSnapshot(filesQuery, (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProjectFile)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProjectFiles(filesData);
    });

    return () => {
      unsubscribeClients();
      unsubscribeProducts();
      unsubscribeInvoices();
      unsubscribeQuotes();
      unsubscribeEmployees();
      unsubscribeOvertimes();
      unsubscribeLeaves();
      unsubscribeProjects();
      unsubscribeTasks();
      unsubscribeComments();
      unsubscribeFiles();
    };
  }, [isAuthenticated, user]);

  const generateInvoiceNumber = (invoiceDate?: string) => {
    if (!user?.company) return 'FAC-2025-001';
    
    // Utiliser l'année de la date de la facture au lieu de l'année actuelle
    const invoiceYear = new Date(invoiceDate || new Date()).getFullYear();
    const format = user.company.invoiceNumberingFormat || 'format2';
    const prefix = user.company.invoicePrefix || 'FAC';
    
    // Compter les factures existantes pour cette année spécifique
    const yearInvoices = invoices.filter(invoice => 
      new Date(invoice.date).getFullYear() === invoiceYear
    );
    const counter = yearInvoices.length + 1;
    const counterStr = String(counter).padStart(3, '0');
    
    // Note: Plus besoin de mettre à jour un compteur global car on compte dynamiquement
    
    // Générer le numéro selon le format choisi
    switch (format) {
      case 'format1': // 2025-001
        return `${invoiceYear}-${counterStr}`;
      case 'format2': // FAC-2025-001
        return `${prefix}-${invoiceYear}-${counterStr}`;
      case 'format3': // 001/2025
        return `${counterStr}/${invoiceYear}`;
      case 'format4': // 2025/001-FAC
        return `${invoiceYear}/${counterStr}-${prefix}`;
      case 'format5': // FAC001-2025
        return `${prefix}${counterStr}-${invoiceYear}`;
      default:
        return `${prefix}-${invoiceYear}-${counterStr}`;
    }
  };

  const generateQuoteNumber = (quoteDate?: string) => {
    if (!user?.company) return 'DEV-2025-001';
    
    // Utiliser l'année de la date du devis
    const quoteYear = new Date(quoteDate || new Date()).getFullYear();
    const format = user.company.invoiceNumberingFormat || 'format2';
    const prefix = 'DEV'; // Préfixe fixe pour les devis
    
    // Compter les devis de l'année spécifique pour la numérotation
    const yearQuotes = quotes.filter(quote => 
      new Date(quote.date).getFullYear() === quoteYear
    );
    const counter = yearQuotes.length + 1;
    const counterStr = String(counter).padStart(3, '0');
    
    // Générer le numéro selon le même format que les factures
    switch (format) {
      case 'format1': // 2025-001
        return `${quoteYear}-${counterStr}`;
      case 'format2': // DEV-2025-001
        return `${prefix}-${quoteYear}-${counterStr}`;
      case 'format3': // 001/2025
        return `${counterStr}/${quoteYear}`;
      case 'format4': // 2025/001-DEV
        return `${quoteYear}/${counterStr}-${prefix}`;
      case 'format5': // DEV001-2025
        return `${prefix}${counterStr}-${quoteYear}`;
      default:
        return `${prefix}-${quoteYear}-${counterStr}`;
    }
  };

  // Clients
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'clients'), {
        ...clientData,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      await updateDoc(doc(db, 'clients', id), {
        ...clientData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
    }
  };

  // Produits
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      // Générer un SKU automatique si pas fourni
      const sku = generateSKU(productData.name, productData.category);
      
      await addDoc(collection(db, 'products'), {
        ...productData,
        sku,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        ...productData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
    }
  };

  const updateProductStock = async (productName: string, quantity: number) => {
    const product = products.find(p => p.name === productName);
    if (product) {
      const newStock = Math.max(0, product.stock - quantity);
      await updateProduct(product.id, { stock: newStock });
    }
  };

  // Factures
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'entrepriseId' | 'dueDate' | 'totalInWords'>, invoiceDate?: string) => {
    if (!user) return;
    
    try {
      // Passer la date de la facture pour la numérotation
      const invoiceNumber = generateInvoiceNumber(invoiceData.date);
      
      const totalInWords = convertNumberToWords(invoiceData.totalTTC);
      
      await addDoc(collection(db, 'invoices'), {
        ...invoiceData,
        number: invoiceNumber,
        totalInWords,
        status: 'unpaid', // Statut par défaut
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });

      // Note: Le stock initial ne change jamais
      // Les quantités vendues sont calculées dynamiquement depuis les factures
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la facture:', error);
    }
  };

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    try {
      await updateDoc(doc(db, 'invoices', id), {
        ...invoiceData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la facture:', error);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'invoices', id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la facture:', error);
    }
  };

  // Devis
  const addQuote = async (quoteData: Omit<Quote, 'id' | 'number' | 'createdAt' | 'entrepriseId' | 'totalInWords'>, quoteDate?: string) => {
    if (!user) return;
    
    try {
      // Passer la date du devis pour la numérotation
      const quoteNumber = generateQuoteNumber(quoteData.date);
      const totalInWords = convertNumberToWords(quoteData.totalTTC);
      
      await addDoc(collection(db, 'quotes'), {
        ...quoteData,
        number: quoteNumber,
        totalInWords,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du devis:', error);
    }
  };

  const updateQuote = async (id: string, quoteData: Partial<Quote>) => {
    try {
      await updateDoc(doc(db, 'quotes', id), {
        ...quoteData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du devis:', error);
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'quotes', id));
    } catch (error) {
      console.error('Erreur lors de la suppression du devis:', error);
    }
  };


  const convertQuoteToInvoice = async (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const invoiceData = {
      clientId: quote.clientId,
      client: quote.client,
      date: new Date().toISOString().split('T')[0],
      items: quote.items,
      subtotal: quote.subtotal,
      totalVat: quote.totalVat,
      totalTTC: quote.totalTTC,
      status: 'draft' as const,
      quoteId: quote.id
    };

    await addInvoice(invoiceData);
    await updateQuote(quoteId, { status: 'accepted' });
  };

  // Getters
  const getClientById = (id: string) => clients.find(client => client.id === id);
  const getProductById = (id: string) => products.find(product => product.id === id);
  const getInvoiceById = (id: string) => invoices.find(invoice => invoice.id === id);
  const getQuoteById = (id: string) => quotes.find(quote => quote.id === id);
  const getEmployeeById = (id: string) => employees.find(employee => employee.id === id);
  const getProjectById = (id: string) => projects.find(project => project.id === id);
  const getTaskById = (id: string) => tasks.find(task => task.id === id);

  // Employés
  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'employees'), {
        ...employeeData,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
    }
  };

  const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
    try {
      await updateDoc(doc(db, 'employees', id), {
        ...employeeData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error);
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'employees', id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
    }
  };

  // Heures supplémentaires
  const addOvertime = async (overtimeData: Omit<Overtime, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'overtimes'), {
        ...overtimeData,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout des heures supplémentaires:', error);
    }
  };

  const updateOvertime = async (id: string, overtimeData: Partial<Overtime>) => {
    try {
      await updateDoc(doc(db, 'overtimes', id), {
        ...overtimeData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des heures supplémentaires:', error);
    }
  };

  const deleteOvertime = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'overtimes', id));
    } catch (error) {
      console.error('Erreur lors de la suppression des heures supplémentaires:', error);
    }
  };

  // Congés
  const addLeave = async (leaveData: Omit<Leave, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'leaves'), {
        ...leaveData,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du congé:', error);
    }
  };

  const updateLeave = async (id: string, leaveData: Partial<Leave>) => {
    try {
      await updateDoc(doc(db, 'leaves', id), {
        ...leaveData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du congé:', error);
    }
  };

  const deleteLeave = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'leaves', id));
    } catch (error) {
      console.error('Erreur lors de la suppression du congé:', error);
    }
  };

  // Projets
  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'projects'), {
        ...projectData,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du projet:', error);
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      await updateDoc(doc(db, 'projects', id), {
        ...projectData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
    }
  };

  // Tâches
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      await updateDoc(doc(db, 'tasks', id), {
        ...taskData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
    }
  };

  // Commentaires
  const addProjectComment = async (commentData: Omit<ProjectComment, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'projectComments'), {
        ...commentData,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    }
  };

  // Fichiers
  const addProjectFile = async (fileData: Omit<ProjectFile, 'id' | 'createdAt' | 'entrepriseId'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'projectFiles'), {
        ...fileData,
        entrepriseId: user.isAdmin ? user.id : user.entrepriseId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du fichier:', error);
    }
  };
  const value = {
    clients,
    products,
    invoices,
    quotes,
    employees,
    overtimes,
    leaves,
    projects,
    tasks,
    projectComments,
    projectFiles,
    addClient,
    updateClient,
    deleteClient,
    addProduct,
    updateProduct,
    deleteProduct,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addQuote,
    updateQuote,
    deleteQuote,
    convertQuoteToInvoice,
    updateProductStock,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addOvertime,
    updateOvertime,
    deleteOvertime,
    addLeave,
    updateLeave,
    deleteLeave,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addProjectComment,
    addProjectFile,
    getClientById,
    getProductById,
    getInvoiceById,
    getQuoteById,
    getEmployeeById,
    getProjectById,
    getTaskById,
    updateInvoiceStatus: updateInvoice,
    isLoading,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

