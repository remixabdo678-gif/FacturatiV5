// src/components/dashboard/QuickActions.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  Users,
  Package,
  FileCheck,
  ShoppingBag,
  Zap,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

type Permissions = Record<string, boolean>;

interface Action {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
  hoverColor: string;
  permission: string;
}

export default function QuickActions(): JSX.Element {
  const { user } = useAuth();

  // Cast contrôlé: AuthContext peut exposer un shape libre
  const hasPermission = (permission: string) => {
    if (user?.isAdmin) return true;
    const perms = user?.permissions as Permissions | undefined;
    if (!perms) return false;
    return !!perms[permission];
  };

  const actions: Action[] = [
    {
      title: 'Nouvelle Facture',
      description: 'Créer une facture rapidement',
      icon: FileText,
      path: '/invoices/create',
      color: 'from-teal-500 to-blue-600',
      hoverColor: 'hover:from-teal-600 hover:to-blue-700',
      permission: 'invoices',
    },
    {
      title: 'Nouveau Devis',
      description: 'Proposer un devis client',
      icon: FileCheck,
      path: '/quotes/create',
      color: 'from-purple-500 to-indigo-600',
      hoverColor: 'hover:from-purple-600 hover:to-indigo-700',
      permission: 'quotes',
    },
    {
      title: 'Ajouter Client',
      description: 'Nouveau client dans la base',
      icon: Users,
      path: '/clients',
      color: 'from-blue-500 to-cyan-600',
      hoverColor: 'hover:from-blue-600 hover:to-cyan-700',
      permission: 'clients',
    },
    {
      title: 'Ajouter Produit',
      description: 'Enrichir votre catalogue',
      icon: Package,
      path: '/products',
      color: 'from-orange-500 to-red-600',
      hoverColor: 'hover:from-orange-600 hover:to-red-700',
      permission: 'products',
    }, // <-- virgule CORRIGÉE ici
    {
      title: 'Nouvelle Commande',
      description: 'Créer un bon de livraison',
      icon: ShoppingBag,
      path: '/commandes/nouveau',
      color: 'from-indigo-500 to-purple-600',
      hoverColor: 'hover:from-indigo-600 hover:to-purple-700',
      permission: 'orders',
    },
  ];

  const visibleActions = actions.filter((action) => hasPermission(action.permission));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacit
