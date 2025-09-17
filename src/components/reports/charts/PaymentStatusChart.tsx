import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CheckCircle, XCircle, Clock} from 'lucide-react';

interface PaymentStatusData {
  name: string;
  value: number;
  percentage: number;
  amount: number;
  color: string;
}

interface PaymentStatusChartProps {
  data: PaymentStatusData[];
}


export default function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.name}</p>
          <p className="text-sm text-gray-600">Factures: {data.value}</p>
          <p className="text-sm text-gray-600">Montant: {data.amount.toLocaleString()} MAD</p>
          <p className="text-sm text-gray-600">Pourcentage: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Payées':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Non payées':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Encaissées':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Répartition des Factures</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Statut de paiement (nombre et montant)</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total factures</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Légende détaillée */}
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-3">
                {getIcon(item.name)}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.value} factures</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {item.amount.toLocaleString()} MAD
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé */}
      <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {total > 0 ? ((data.find(d => d.name === 'Payées')?.value || 0) / total * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">Taux de paiement</div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-600">
              {totalAmount.toLocaleString()}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-300">MAD Total</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {total > 0 ? (totalAmount / total).toFixed(0) : 0}
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300">MAD Moyen/facture</div>
          </div>
        </div>
      </div>
    </div>
  );
}