import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLicense } from '../../contexts/LicenseContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  BarChart3,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileCheck,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Truck,
  Shield,
  FolderKanban,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onUpgrade: () => void;
}

export default function Sidebar({ open, setOpen, onUpgrade }: SidebarProps) {
  const { t } = useLanguage();
  const { licenseType } = useLicense();
  const { user } = useAuth();

  // Abonnement PRO
  const isProActive =
    user?.company?.subscription === 'pro' &&
    user?.company?.expiryDate &&
    new Date(user.company.expiryDate) > new Date();

  // PRO expiré
  const isProExpired =
    user?.company?.subscription === 'pro' &&
    user?.company?.expiryDate &&
    new Date(user.company.expiryDate) <= new Date();

  // Accès aux features PRO uniquement si actif
  const canAccessProFeatures = isProActive;

  // Activation en cours ?
  const isActivationPending = localStorage.getItem('proActivationPending') === 'true';

  // Permissions
  const hasPermission = (permission: string) => {
    if (user?.isAdmin) return true;
    if (!user?.permissions) return false;
    return Boolean(user.permissions[permission as keyof typeof user.permissions]);
  };

  const handleProFeatureClick = (e: React.MouseEvent, path: string) => {
    if (!canAccessProFeatures) {
      e.preventDefault();
      onUpgrade();
    }
  };

  // Menus
  const primaryMenu = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard', permission: 'dashboard' },
    { icon: FileText, label: t('invoices'), path: '/invoices', permission: 'invoices' },
    { icon: FileCheck, label: 'Devis', path: '/quotes', permission: 'quotes' },
    { icon: Users, label: t('clients'), path: '/clients', permission: 'clients' },
    { icon: Package, label: t('products'), path: '/products', permission: 'products' },
    { icon: ShoppingBag, label: 'Commandes', path: '/commandes', permission: 'orders' },
    { icon: Truck, label: 'Fournisseurs', path: '/suppliers', permission: 'suppliers' }
  ];

  const gestionMenu = [
    { icon: FolderKanban, label: 'Gestion de Projet', path: '/project-management', isPro: true, permission: 'projectManagement' },
    { icon: Truck, label: 'Gest. Fournisseurs', path: '/supplier-management', isPro: true, permission: 'supplierManagement' },
    { icon: TrendingUp, label: 'Gest. de Stock', path: '/stock-management', isPro: true, permission: 'stockManagement' },
    { icon: BarChart3, label: 'Gest. financière', path: '/reports', isPro: true, permission: 'reports' },
    { icon: UserCheck, label: 'Gest. Humaine', path: '/hr-management', isPro: true, permission: 'hrManagement' },
    { icon: Shield, label: 'Gest. de Compte', path: '/account-management', isPro: true, permission: 'settings' }
  ];

  const settingsMenu = [{ icon: Settings, label: t('settings'), path: '/settings', permission: 'settings' }];

  const visiblePrimary = primaryMenu.filter((i) => hasPermission(i.permission || ''));
  const visibleGestion = gestionMenu.filter((i) => hasPermission(i.permission || ''));
  const visibleSettings = settingsMenu.filter((i) => hasPermission(i.permission || ''));

  const [isGestionOpen, setIsGestionOpen] = React.useState(false);

  // Rendu d'un item
  const renderItem = (
    item: {
      icon: any;
      label: string;
      path: string;
      isPro?: boolean;
    },
    depth: number = 0
  ) => {
    const Icon = item.icon;
    const isProFeature = item.isPro;
    const canAccess = !isProFeature || canAccessProFeatures;

    const basePadding = open ? (depth === 0 ? 'px-3' : 'pl-10 pr-3') : 'px-2';
    const iconSize = open ? 'w-5 h-5' : 'w-6 h-6';

    if (canAccess) {
      return (
        <motion.div
          whileHover={{ x: 2 }}
          transition={{ duration: 0.2 }}
        >
          <NavLink
            key={item.path}
            to={item.path}
            title={!open ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center ${open ? 'space-x-3' : 'justify-center'} ${basePadding} py-2.5 rounded-lg transition-all duration-200 group ${
                isActive ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <Icon className={`${iconSize} flex-shrink-0`} />
            {open && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">{item.label}</span>
                {item.isPro && (
                  <motion.span 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-orange-400 text-orange-900"
                  >
                    PRO
                  </motion.span>
                )}
              </div>
            )}
          </NavLink>
        </motion.div>
      );
    }

    // Inaccessible (PRO mais non actif)
    return (
      <motion.button
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
        key={item.path}
        onClick={(e) => handleProFeatureClick(e, item.path)}
        title={!open ? `${item.label} (PRO)` : undefined}
        className={`w-full flex items-center ${open ? 'space-x-3' : 'justify-center'} ${basePadding} py-2.5 rounded-lg transition-all duration-200 group text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400`}
      >
        <Icon className={`${iconSize} flex-shrink-0 text-red-500`} />
        {open && (
          <div className="flex items-center space-x-2">
            <span className="font-medium">{item.label}</span>
            <motion.span 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold"
            >
              🔒
            </motion.span>
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 shadow-xl transform transition-all duration-300 ease-in-out ${
          open ? 'w-64 translate-x-0' : 'w-16 translate-x-0'
        } border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen`}
      >
        {/* Header sticky */}
        <div className={`sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between h-16 ${open ? 'px-6' : 'px-3'}`}>
          <div className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-gradient-to-br from-black-200 to-red-600  rounded-lg flex items-center justify-center shadow-lg"
            >
              <img 
                src="https://i.ibb.co/kgVKRM9z/20250915-1327-Conception-Logo-Color-remix-01k56ne0szey2vndspbkzvezyp-1.png" 
                alt="Facturati Logo" 
                className="w-8 h-8 object-contain"
              />
            </motion.div>
            {open && (
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Facturati</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">ERP Morocco (V.1.25.5)</p>
              </div>
            )}
          </div>
          
          {/* Bouton toggle - visible sur toutes les tailles */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(!open)} 
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {open ? (
              <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </motion.button>
        </div>

        {/* Navigation scrollable */}
        <nav className={`flex-1 overflow-y-auto ${open ? 'px-3' : 'px-2'} py-6`}>
          <ul className="space-y-2">
            {/* Menu principal */}
            {visiblePrimary.map((item) => (
              <li key={item.path}>{renderItem(item)}</li>
            ))}

            {/* Dossier Gestion */}
            {visibleGestion.length > 0 && (
              <li>
                <motion.button
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsGestionOpen((v) => !v)}
                  className={`w-full flex items-center ${open ? 'space-x-3 px-3' : 'justify-center px-2'} py-2.5 rounded-lg transition-all duration-200 group text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
                  title={!open ? 'Gestion' : undefined}
                >
                  {/* Icône + pastille en mode réduit */}
                  <div className="relative">
                    <FolderKanban className={`${open ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0`} />
                    {!open && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-white ${
                          isProActive ? 'bg-orange-400' : 'bg-red-500'
                        }`}
                      />
                    )}
                  </div>

                  {/* Libellé + badge en mode ouvert */}
                  {open && (
                    <>
                      <span className="font-semibold">Gestion</span>

                      {/* Badge : PRO orange (actif) / 🔒 rouge (expiré) / PRO rouge (Free) */}
                      {isProActive ? (
                        <motion.span 
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold border bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-600"
                        >
                          PRO
                        </motion.span>
                      ) : isProExpired ? (
                        <motion.span 
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="ml-2 inline-flex items-center text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold"
                        >
                          🔒
                        </motion.span>
                      ) : (
                        <motion.span 
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="ml-2 inline-flex items-center text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold"
                        >
                          🔒
                        </motion.span>
                      )}

                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{visibleGestion.length}</span>
                      <motion.div
                        animate={{ rotate: isGestionOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </motion.div>
                    </>
                  )}
                </motion.button>

                {/* Sous-menus avec animation */}
                <AnimatePresence>
                  {isGestionOpen && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-1 space-y-1 overflow-hidden"
                    >
                      {visibleGestion.map((item, index) => (
                        <motion.li 
                          key={item.path}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          {renderItem(item, 1)}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            )}

            {/* Paramètres */}
            {visibleSettings.map((item) => (
              <li key={item.path}>{renderItem(item)}</li>
            ))}
          </ul>
        </nav>

        {/* Bandeau bas (licence / rôle) - collé en bas */}
        <div className={`mt-auto ${open ? 'px-3' : 'px-2'} pb-6 space-y-3`}>
          {user && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`${open ? 'p-2' : 'p-1'} rounded-lg text-center ${open ? 'text-xs' : 'text-[10px]'} ${
                user.email === 'admin@facture.ma'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                  : user.isAdmin
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
              }`}
            >
              {open
                ? user.email === 'admin@facture.ma'
                  ? '🔧 Admin Plateforme'
                  : user.isAdmin
                  ? '👑 Administrateur'
                  : '👤 Utilisateur'
                : user.email === 'admin@facture.ma'
                ? '🔧'
                : user.isAdmin
                ? '👑'
                : '👤'}
            </motion.div>
          )}

          {isProActive ? (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg ${open ? 'p-3' : 'p-2'} text-white text-center shadow-lg`}
            >
              <div className={`${open ? 'text-xs' : 'text-[10px]'} font-medium ${open ? 'mb-1' : ''}`}>{open ? '👑 Pro' : '👑'}</div>
              {user?.company?.expiryDate &&
                (() => {
                  const currentDate = new Date();
                  const expiry = new Date(user.company.expiryDate);
                  const timeDiff = expiry.getTime() - currentDate.getTime();
                  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                  return (
                    <motion.div 
                      animate={daysRemaining <= 5 ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                      className={`${open ? 'text-xs' : 'text-[8px]'} ${daysRemaining <= 5 ? 'font-bold' : 'opacity-90'}`}
                    >
                      {daysRemaining <= 5 && daysRemaining > 0 ? (
                        <span className="text-yellow-200">
                          {open ? `⚠️ Expire dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}` : '⚠️'}
                        </span>
                      ) : daysRemaining <= 0 ? (
                        <span className="text-red-200">{open ? '❌ Expiré' : '❌'}</span>
                      ) : (
                        <span>
                          {open
                            ? `Expire le: ${expiry.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
                            : expiry.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' })}
                        </span>
                      )}
                    </motion.div>
                  );
                })()}
            </motion.div>
          ) : isActivationPending ? (
            <motion.div 
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg ${open ? 'p-3' : 'p-2'} text-white text-center shadow-lg`}
            >
              <div className={`${open ? 'text-xs' : 'text-[10px]'} font-medium ${open ? 'mb-1' : ''}`}>{open ? '⏳ Activation en cours' : '⏳'}</div>
              {open && <div className="text-xs opacity-90">Traitement sous 2h</div>}
            </motion.div>
          ) : user?.isAdmin ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onUpgrade}
              title={!open ? 'Acheter version Pro' : undefined}
              className={`w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 rounded-lg ${open ? 'p-3' : 'p-2'} text-white text-center transition-all duration-200 hover:shadow-lg`}
            >
              <div className={`${open ? 'text-xs' : 'text-[10px]'} font-medium`}>{open ? '🆓 Free - Acheter version Pro' : '🆓'}</div>
            </motion.button>
          ) : (
            <div className={`bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg ${open ? 'p-3' : 'p-2'} text-white text-center shadow-lg`}>
              <div className={`${open ? 'text-xs' : 'text-[10px]'} font-medium`}>{open ? '👤 Compte Utilisateur' : '👤'}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}