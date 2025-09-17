import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    dashboard: 'Tableau de Bord',
    invoices: 'Factures',
    clients: 'Clients',
    products: 'Produits',
    stock: 'Stock',
    reports: 'Rapports',
    settings: 'Paramètres',
    
    // Dashboard
    totalRevenue: 'Chiffre d\'Affaires Total',
    pendingInvoices: 'Factures en Attente',
    totalClients: 'Total Clients',
    lowStock: 'Stock Faible',
    recentInvoices: 'Factures Récentes',
    topProducts: 'Produits les Plus Vendus',
    
    // Invoices
    createInvoice: 'Créer une Facture',
    invoiceNumber: 'N° Facture',
    date: 'Date',
    client: 'Client',
    amount: 'Montant',
    status: 'Statut',
    paid: 'Payé',
    pending: 'En Attente',
    overdue: 'En Retard',
    
    // Common
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher...',
    actions: 'Actions',
    loading: 'Chargement...',
    
    // Login
    welcome: 'Bienvenue sur Facture.ma',
    loginSubtitle: 'Solution ERP pour les entreprises marocaines',
    email: 'Email',
    password: 'Mot de passe',
    login: 'Se connecter',
    demoCredentials: 'Démo: admin@facture.ma / admin123'
  },
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    invoices: 'الفواتير',
    clients: 'العملاء',
    products: 'المنتجات',
    stock: 'المخزون',
    reports: 'التقارير',
    settings: 'الإعدادات',
    
    // Dashboard
    totalRevenue: 'إجمالي الإيرادات',
    pendingInvoices: 'الفواتير المعلقة',
    totalClients: 'إجمالي العملاء',
    lowStock: 'مخزون منخفض',
    recentInvoices: 'الفواتير الأخيرة',
    topProducts: 'المنتجات الأكثر مبيعاً',
    
    // Invoices
    createInvoice: 'إنشاء فاتورة',
    invoiceNumber: 'رقم الفاتورة',
    date: 'التاريخ',
    client: 'العميل',
    amount: 'المبلغ',
    status: 'الحالة',
    paid: 'مدفوع',
    pending: 'في الانتظار',
    overdue: 'متأخر',
    
    // Common
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث...',
    actions: 'الإجراءات',
    loading: 'جاري التحميل...',
    
    // Login
    welcome: 'مرحباً بكم في Facture.ma',
    loginSubtitle: 'حل ERP للشركات المغربية',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    login: 'تسجيل الدخول',
    demoCredentials: 'تجريبي: admin@facture.ma / admin123'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fr']] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      <div className={language === 'ar' ? 'rtl' : 'ltr'} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}