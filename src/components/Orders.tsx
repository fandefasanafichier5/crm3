import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Eye, Edit, Truck } from 'lucide-react';
import { Order, Contact, Product } from '../utils/types';

interface OrdersProps {
  orders: Order[];
  customers: Contact[];
  products: Product[];
  onCreateOrder: () => void;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onShowReceipt: (order: Order) => void;
}

const Orders: React.FC<OrdersProps> = ({ 
  orders, 
  customers, 
  products, 
  onCreateOrder, 
  onViewOrder, 
  onEditOrder,
  onShowReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled'>('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

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
      year: 'numeric'
    }).format(date);
  };

  const statusLabels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  };

  const paymentLabels = {
    paid: 'Payé',
    pending: 'En attente',
    overdue: 'En retard'
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Commandes</h2>
          <p className="text-gray-600 dark:text-gray-400">Gérez toutes vos commandes de kéfir</p>
        </div>
        <button
          onClick={onCreateOrder}
          className="flex items-center space-x-2 bg-sage-600 hover:bg-sage-700 text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-sage-600/25"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle commande</span>
        </button>
      </div>

      {/* Recherche et filtres */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par client ou numéro de commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="delivered">Livrées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Essayez d\'ajuster vos critères de recherche' : 'Créez votre première commande'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sage-600 to-sage-700 rounded-full flex items-center justify-center text-white font-semibold">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Commande #{order.id}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{order.customerName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {formatDate(order.orderDate)}
                      {order.deliveryDate && ` • Livraison: ${formatDate(order.deliveryDate)}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {statusLabels[order.status]}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {paymentLabels[order.paymentStatus]}
                  </span>
                </div>
              </div>

              {/* Articles de la commande */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-sage-100 text-sage-700 dark:bg-sage-600/20 dark:text-sage-300 text-sm rounded-full border border-sage-200 dark:border-sage-600/30"
                    >
                      {item.quantity}x {item.productName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Adresse de livraison */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-start space-x-2">
                  <Truck className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {order.deliveryAddress.street}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {order.deliveryAddress.postalCode} {order.deliveryAddress.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total: {formatCurrency(order.totalAmount)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewOrder(order)}
                    className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Voir</span>
                  </button>
                  <button
                    onClick={() => onEditOrder(order)}
                    className="flex items-center space-x-1 px-3 py-2 text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 hover:bg-sage-100 dark:hover:bg-sage-600/20 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => onShowReceipt(order)}
                    className="flex items-center space-x-1 px-3 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-600/20 rounded-lg transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    <span>Reçu</span>
                  </button>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> {order.notes}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;