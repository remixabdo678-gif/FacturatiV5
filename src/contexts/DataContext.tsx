import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { useStock } from './StockContext';
import { convertNumberToWords } from '../utils/numberToWords';

// ---------------------- INTERFACES ----------------------

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
  initialStock: number;
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
  progress: number;
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
  assignedTo: string;
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

// ---------------------- CONTEXT ----------------------

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
  const stockContext = useStock(); // ✅ Correction ici
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

  // ... 🔥 ici tu gardes tout le reste de ton code tel qu’il est (ajout/maj/suppression des clients, produits, factures, devis, etc.)
  // Rien ne change, sauf qu’on a remplacé `require` par `useStock()`

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
