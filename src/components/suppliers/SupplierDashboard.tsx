import React from 'react';
import { useSupplier } from '../../contexts/SupplierContext';
import { 
  Truck, 
  DollarSign, 
  FileText, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target
} from 'lucide-react';

export default function SupplierDashboard() {
  const { 
    suppliers, 
    purchaseOrders, 
    supplierPayments, 
    getSupplierStats 
  } = useSupplier();

  // Calculs des statistiques globales
  const totalSuppliers = suppliers.length;
  const totalPurchases = purchaseOrders.reduce((sum, order) => sum + order.totalTTC, 0);
  const totalPayments = supplierPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalBalance = totalPurchases - totalPayments;

  // Statistiques mensuelles
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyPurchases = purchaseOrders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
  }).reduce((sum, order) => sum + order.totalTTC, 0);

  const monthlyPayments = supplierPayments.filter(payment => {
    const paymentDate = new Date(payment.paymentDate);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  }).reduce((sum, payment) => sum + payment.amount, 0);

  // Top 5 fournisseurs par volume d'achats
  const topSuppliers = suppliers.map(supplier => {
    const stats = getSupplierStats(supplier.id);
    return {
      ...supplier,
      ...stats
    };
  }).sort((a, b) => b.totalPurchases - a.totalPurchases).slice(0, 5);

  // Fournisseurs avec balance positive (à payer)
  const suppliersWithBalance = suppliers.filter(supplier => {
    const balance = getSupplierStats(supplier.id).balance;
    return balance > 0;
  }).length;

  // Délai moyen de paiement
  const averagePaymentDelay = purchaseOrders.length > 0 ? 
    purchaseOrders.reduce((sum, order) => {
      const orderDate = new Date(order.date);
      const dueDate = new Date(order.dueDate);
      return sum + Math.max(0, (dueDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    }, 0) / purchaseOrders.length : 0;

  const stats = [
    {
      title: 'Total Fournisseurs',
      value: totalSuppliers.toString(),
      subtitle: 'Fournisseurs actifs',
      icon: Truck,
      color: 'from-orange-500 to-red-600',
      change: `${suppliers.filter(s => s.status === 'active').length} actifs`
    },
    {
      title: 'Total Achats',
      value: `${totalPurchases.toLocaleString()}`,
      subtitle: 'MAD (toutes périodes)',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      change: `${monthlyPurchases.toLocaleString()} MAD ce mois`
    },
    {
      title: 'Total Paiements',
      value: `${totalPayments.toLocaleString()}`,
      subtitle: 'MAD versés',
      icon: CreditCard,
      color: 'from-green-500 to-emerald-600',
      change: `${monthlyPayments.toLocaleString()} MAD ce mois`
    },
    {
      title: 'Balance Globale',
      value: `${totalBalance.toLocaleString()}`,
      subtitle: totalBalance > 0 ? 'MAD à payer' : totalBalance < 0 ? 'MAD en crédit' : 'MAD soldé',
      icon: totalBalance > 0 ? TrendingUp : totalBalance < 0 ? TrendingDown : Target,
      color: totalBalance > 0 ? 'from-red-500 to-pink-600' : totalBalance < 0 ? 'from-green-500 to-emerald-600' : 'from-gray-500 to-gray-600',
      change: `${suppliersWithBalance} fournisseurs à payer`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.subtitle}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Suppliers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Top 5 Fournisseurs</h3>
            <p className="text-sm text-gray-600">Classement par volume d'achats</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          {topSuppliers.length > 0 ? (
            topSuppliers.map((supplier, index) => (
              <div key={supplier.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                    'bg-gradient-to-br from-orange-400 to-orange-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{supplier.name}</p>
                    <p className="text-sm text-gray-500">{supplier.contactPerson}</p>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {supplier.totalPurchases.toLocaleString()} MAD
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${
                      supplier.balance > 0 ? 'text-red-600' : supplier.balance < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      Balance: {supplier.balance.toLocaleString()} MAD
                    </span>
                    {supplier.balance > 0 ? (
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    ) : supplier.balance < 0 ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <Target className="w-3 h-3 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun fournisseur enregistré</p>
              <p className="text-sm text-gray-400 mt-1">Ajoutez des fournisseurs pour voir les statistiques</p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse des Balances</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-gray-900">Montants à payer</span>
              <span className="font-bold text-red-600">
                {suppliers.filter(s => getSupplierStats(s.id).balance > 0)
                  .reduce((sum, s) => sum + getSupplierStats(s.id).balance, 0).toLocaleString()} MAD
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-900">Crédits disponibles</span>
              <span className="font-bold text-green-600">
                {Math.abs(suppliers.filter(s => getSupplierStats(s.id).balance < 0)
                  .reduce((sum, s) => sum + getSupplierStats(s.id).balance, 0)).toLocaleString()} MAD
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-t-2 border-gray-300">
              <span className="font-bold text-gray-900">Balance nette</span>
              <span className={`font-bold ${totalBalance > 0 ? 'text-red-600' : totalBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {totalBalance.toLocaleString()} MAD
              </span>
            </div>
          </div>
        </div>

        {/* Payment Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Paiements</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-gray-900">Délai moyen</span>
              <span className="font-bold text-blue-600">{averagePaymentDelay.toFixed(0)} jours</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="font-medium text-gray-900">Paiements ce mois</span>
              <span className="font-bold text-purple-600">{monthlyPayments.toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <span className="font-medium text-gray-900">Achats ce mois</span>
              <span className="font-bold text-amber-600">{monthlyPurchases.toLocaleString()} MAD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {suppliersWithBalance > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">⚠️ Paiements en Attente</h3>
          </div>
          <p className="text-red-800">
            Vous avez <strong>{suppliersWithBalance} fournisseur{suppliersWithBalance > 1 ? 's' : ''}</strong> avec des montants à payer.
            Total à régler: <strong>{suppliers.filter(s => getSupplierStats(s.id).balance > 0)
              .reduce((sum, s) => sum + getSupplierStats(s.id).balance, 0).toLocaleString()} MAD</strong>
          </p>
        </div>
      )}

      {suppliersWithBalance === 0 && totalSuppliers > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">✅ Tous les Paiements à Jour</h3>
          </div>
          <p className="text-green-800">
            Excellent ! Tous vos fournisseurs sont payés. Aucun montant en attente.
          </p>
        </div>
      )}
    </div>
  );
}