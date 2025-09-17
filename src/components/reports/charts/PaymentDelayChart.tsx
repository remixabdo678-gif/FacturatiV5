import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Clock, Users, TrendingDown, CheckCircle } from 'lucide-react';

interface DelayData {
  clientName: string;
  averageDelay: number;
  totalAmount: number;
  invoicesCount: number;
}

interface PaymentDelayChartProps {
  data: (DelayData | null)[];
}

export default function PaymentDelayChart({ data }: PaymentDelayChartProps) {
  const validData = data.filter(Boolean) as DelayData[];
  
  const chartData = validData.map(client => ({
    name: client.clientName.length > 15 ? client.clientName.substring(0, 15) + '...' : client.clientName,
    fullName: client.clientName,
    delay: Math.round(client.averageDelay),
    amount: client.totalAmount,
    invoices: client.invoicesCount
  }));

  const totalDelayedAmount = validData.reduce((sum, client) => sum + client.totalAmount, 0);
  const averageDelay = validData.length > 0 ? 
    validData.reduce((sum, client) => sum + client.averageDelay, 0) / validData.length : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.fullName}</p>
          <p className="text-sm text-red-600">Retard moyen: {data.delay} jours</p>
          <p className="text-sm text-gray-600">Montant en retard: {data.amount.toLocaleString()} MAD</p>
          <p className="text-sm text-gray-600">Factures: {data.invoices}</p>
        </div>
      );
    }
    return null;
  };

  const getRiskLevel = (delay: number) => {
    if (delay >= 60) return { level: 'Critique', color: 'text-red-600', bg: 'bg-red-100' };
    if (delay >= 30) return { level: 'Élevé', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (delay >= 15) return { level: 'Modéré', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Faible', color: 'text-green-600', bg: 'bg-green-100' };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analyse des Retards de Paiement</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Clients avec les plus gros retards (jours)</p>
        </div>
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">Surveillance requise</span>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-red-600" />
            <span className="text-lg font-bold text-red-600">
              {averageDelay.toFixed(0)}
            </span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">Jours de retard moyen</p>
        </div>
        
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <span className="text-lg font-bold text-orange-600">
              {totalDelayedAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300">MAD en retard</p>
        </div>
        
        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-yellow-600" />
            <span className="text-lg font-bold text-yellow-600">{validData.length}</span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">Clients en retard</p>
        </div>
      </div>

      {validData.length > 0 ? (
        <>
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
                  label={{ value: 'Jours', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="delay"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  name="Retard (jours)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Liste détaillée des clients en retard */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Clients à Surveiller</h4>
            {validData.map((client, index) => {
              const risk = getRiskLevel(client.averageDelay);
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-red-400">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{client.clientName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {client.invoicesCount} facture{client.invoicesCount > 1 ? 's' : ''} en retard
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        {Math.round(client.averageDelay)} jours
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {client.totalAmount.toLocaleString()} MAD
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${risk.bg} ${risk.color}`}>
                      {risk.level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommandations */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">🎯 Recommandations</h4>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
              <li>• Contactez les clients avec plus de 30 jours de retard</li>
              <li>• Mettez en place des relances automatiques</li>
              <li>• Considérez des conditions de paiement plus strictes</li>
              <li>• Proposez des facilités de paiement pour les gros montants</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🎉 Excellent ! Aucun retard de paiement
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Tous vos clients paient dans les délais. Continuez ainsi !
          </p>
        </div>
      )}
    </div>
  );
}