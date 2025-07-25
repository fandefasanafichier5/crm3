import React from 'react';
import { TrendingUp, Users, Package, Truck, Euro, Calendar, AlertCircle, Star } from 'lucide-react';
import { Contact, Order, Delivery, Analytics } from '../utils/types';

interface DashboardProps {
  customers: Contact[];
  orders: Order[];
  deliveries: Delivery[];
  analytics: Analytics;
}

const Dashboard: React.FC<DashboardProps> = ({ customers, orders, deliveries, analytics }) => {
  const todayDeliveries = deliveries.filter(d => {
    const today = new Date();
    return d.scheduledDate.toDateString() === today.toDateString();
  });

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const overduePayments = orders.filter(o => o.paymentStatus === 'overdue');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center py-6">
        <h2 className="text-3xl font-light text-gray-900 dark:text-white mb-2">
          Tableau de Bord Kéfir
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Vue d'ensemble de votre activité commerciale
        </p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-600/20 dark:to-emerald-700/20 border border-emerald-200 dark:border-emerald-600/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <Euro className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(analytics.monthlyRevenue)}
              </p>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">CA ce mois</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-600/20 dark:to-blue-700/20 border border-blue-200 dark:border-blue-600/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics.activeCustomers}
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-sm">Clients actifs</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-600/20 dark:to-purple-700/20 border border-purple-200 dark:border-purple-600/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {pendingOrders.length}
              </p>
              <p className="text-purple-700 dark:text-purple-300 text-sm">Commandes en attente</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-600/20 dark:to-orange-700/20 border border-orange-200 dark:border-orange-600/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <Truck className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {todayDeliveries.length}
              </p>
              <p className="text-orange-700 dark:text-orange-300 text-sm">Livraisons aujourd'hui</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Livraisons du jour */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Livraisons du jour</h3>
          </div>
          
          <div className="space-y-4">
            {todayDeliveries.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Aucune livraison prévue aujourd'hui
              </p>
            ) : (
              todayDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">{delivery.customerName}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {delivery.address.street}, {delivery.address.city}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                      {formatDate(delivery.scheduledDate)} • Route: {delivery.route}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {delivery.items.map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-600/20 dark:text-orange-300 text-xs rounded-full"
                        >
                          {item.quantity}x {item.productName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alertes importantes */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Alertes</h3>
          </div>
          
          <div className="space-y-4">
            {overduePayments.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                  Paiements en retard ({overduePayments.length})
                </h4>
                {overduePayments.slice(0, 3).map((order) => (
                  <p key={order.id} className="text-red-700 dark:text-red-400 text-sm">
                    {order.customerName} - {formatCurrency(order.totalAmount)}
                  </p>
                ))}
              </div>
            )}

            {pendingOrders.length > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                  Commandes à traiter ({pendingOrders.length})
                </h4>
                {pendingOrders.slice(0, 3).map((order) => (
                  <p key={order.id} className="text-amber-700 dark:text-amber-400 text-sm">
                    {order.customerName} - {formatDate(order.orderDate)}
                  </p>
                ))}
              </div>
            )}

            {overduePayments.length === 0 && pendingOrders.length === 0 && (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Aucune alerte pour le moment
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top clients et produits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Meilleurs clients</h3>
          </div>
          
          <div className="space-y-3">
            {analytics.topCustomers.slice(0, 5).map((customer, index) => (
              <div
                key={customer.customerId}
                className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{customer.customerName}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{customer.orderCount} commandes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Produits populaires</h3>
          </div>
          
          <div className="space-y-3">
            {analytics.topProducts.slice(0, 5).map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{product.productName}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{product.quantity} vendus</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;