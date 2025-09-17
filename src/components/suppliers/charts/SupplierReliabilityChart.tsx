import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,Cell  } from 'recharts';
import { Target, Award, AlertTriangle, CheckCircle, TrendingUp, Users  } from 'lucide-react';

interface ReliabilitySupplier {
  id: string;
  name: string;
  totalPurchases: number;
  totalPayments: number;
  balance: number;
  ordersCount: number;
  paymentTerms: number;
}

interface SupplierReliabilityChartProps {
  suppliers: ReliabilitySupplier[];
  averagePaymentDelay: number;
}

export default function SupplierReliabilityChart({ suppliers, averagePaymentDelay }: SupplierReliabilityChartProps) {
  const [sortBy, setSortBy] = useState<'reliability' | 'volume' | 'balance'>('reliability');

  // Calculer le score de fiabilité pour chaque fournisseur
  const calculateReliabilityScore = (supplier: ReliabilitySupplier) => {
    let score = 0;
    
    // Points pour le volume d'achats (max 30 points)
    score += Math.min(30, (supplier.totalPurchases / 10000) * 10);
    
    // Points pour la régularité (max 25 points)
    score += Math.min(25, supplier.ordersCount * 2);
    
    // Points pour la balance (max 25 points)
    if (supplier.balance <= 0) {
      score += 25; // Fournisseur payé à temps
    } else if (supplier.balance < supplier.totalPurchases * 0.1) {
      score += 15; // Petit retard acceptable
    } else {
      score -= 10; // Gros retard
    }
    
    // Points pour les délais de paiement (max 20 points)
    if (supplier.paymentTerms <= 30) {
      score += 20;
    } else if (supplier.paymentTerms <= 60) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const enrichedSuppliers = suppliers.map(supplier => ({
    ...supplier,
    reliabilityScore: calculateReliabilityScore(supplier),
    riskLevel: supplier.balance > supplier.totalPurchases * 0.2 ? 'high' : 
               supplier.balance > 0 ? 'medium' : 'low'
  }));

  // Trier selon le critère sélectionné
  const sortedSuppliers = [...enrichedSuppliers].sort((a, b) => {
    switch (sortBy) {
      case 'reliability':
        return b.reliabilityScore - a.reliabilityScore;
      case 'volume':
        return b.totalPurchases - a.totalPurchases;
      case 'balance':
        return b.balance - a.balance;
      default:
        return b.reliabilityScore - a.reliabilityScore;
    }
  });

  const chartData = sortedSuppliers.slice(0, 10).map(supplier => ({
    name: supplier.name.length > 12 ? supplier.name.substring(0, 12) + '...' : supplier.name,
    fullName: supplier.name,
    score: supplier.reliabilityScore,
    volume: supplier.totalPurchases,
    balance: supplier.balance,
    orders: supplier.ordersCount
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const supplier = enrichedSuppliers.find(s => s.name === data.fullName);
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.fullName}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">Score fiabilité: {data.score.toFixed(0)}/100</p>
            <p className="text-blue-600">Volume: {data.volume.toLocaleString()} MAD</p>
            <p className={`${data.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              Balance: {data.balance.toLocaleString()} MAD
            </p>
            <p className="text-gray-600">Commandes: {data.orders}</p>
            <p className="text-gray-600">Délai: {supplier?.paymentTerms} jours</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'Faible';
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Faible
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Moyen
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Élevé
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Score de fiabilité */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Score de Fiabilité Fournisseurs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Évaluation basée sur volume, régularité et paiements</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="reliability">Score fiabilité</option>
              <option value="volume">Volume d'achats</option>
              <option value="balance">Balance</option>
            </select>
          </div>
        </div>

        {/* Graphique */}
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name"
                stroke="#6B7280"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="score"
                radius={[4, 4, 0, 0]}
                fill={(entry: any) => getScoreColor(entry.score)}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-lg font-bold text-green-600">
              {enrichedSuppliers.filter(s => s.reliabilityScore >= 80).length}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">Excellents</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="text-lg font-bold text-yellow-600">
              {enrichedSuppliers.filter(s => s.reliabilityScore >= 60 && s.reliabilityScore < 80).length}
            </div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300">Bons</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
            <div className="text-lg font-bold text-red-600">
              {enrichedSuppliers.filter(s => s.reliabilityScore < 60).length}
            </div>
            <div className="text-xs text-red-700 dark:text-red-300">À surveiller</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-lg font-bold text-blue-600">
              {enrichedSuppliers.length > 0 ? (enrichedSuppliers.reduce((sum, s) => sum + s.reliabilityScore, 0) / enrichedSuppliers.length).toFixed(0) : '0'}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">Score moyen</div>
          </div>
        </div>

        {/* Liste détaillée */}
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900 dark:text-gray-100">Classement Détaillé</h5>
          {sortedSuppliers.slice(0, 8).map((supplier, index) => (
            <div key={supplier.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                  supplier.reliabilityScore >= 80 ? 'bg-green-500' :
                  supplier.reliabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{supplier.name}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{supplier.ordersCount} commandes</span>
                    <span>{supplier.paymentTerms} jours délai</span>
                    {getRiskBadge(supplier.riskLevel)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  supplier.reliabilityScore >= 80 ? 'text-green-600' :
                  supplier.reliabilityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {supplier.reliabilityScore.toFixed(0)}/100
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getScoreLabel(supplier.reliabilityScore)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analyse des délais */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <span>Analyse des Délais de Paiement</span>
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="text-2xl font-bold text-blue-600">
                {averagePaymentDelay.toFixed(0)}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Jours délai moyen</div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-gray-900 dark:text-gray-100">Fournisseurs par délai</h5>
              {suppliers.map(supplier => {
                const isLatePayment = supplier.paymentTerms > averagePaymentDelay;
                return (
                  <div key={supplier.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{supplier.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{supplier.paymentTerms} jours</span>
                      {isLatePayment ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
              <h5 className="font-medium text-orange-900 dark:text-orange-100 mb-3 flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Recommandations</span>
              </h5>
              <div className="text-sm text-orange-800 dark:text-orange-200 space-y-2">
             <div className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Privilégiez les fournisseurs avec score &gt; 80</span>
             </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <span>Négociez des délais plus courts avec les gros volumes</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-red-600">⚠</span>
                  <span>Surveillez les fournisseurs avec balance élevée</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-600">💡</span>
                  <span>Diversifiez pour réduire les risques</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📊 Métriques Clés</h5>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>Score moyen: {(enrichedSuppliers.reduce((sum, s) => sum + s.reliabilityScore, 0) / enrichedSuppliers.length).toFixed(0)}/100</p>
                <p>Fournisseurs fiables: {enrichedSuppliers.filter(s => s.reliabilityScore >= 70).length}/{enrichedSuppliers.length}</p>
                <p>Risque portfolio: {enrichedSuppliers.filter(s => s.riskLevel === 'high').length > 0 ? 'Élevé' : 'Contrôlé'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}