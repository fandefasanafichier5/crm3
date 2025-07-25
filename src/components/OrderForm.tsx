import React, { useState } from 'react';
import { X, Package, User, Calendar, MapPin, CreditCard, Save } from 'lucide-react';
import { Order, Contact, Product, OrderItem } from '../utils/types';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Contact[];
  products: Product[];
  onSave: (order: Omit<Order, 'id'>) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose, customers, products, onSave }) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mvola' | 'orange-money' | 'airtel-money' | 'transfer' | 'check'>('cash');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const updateItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleSave = async () => {
    if (!selectedCustomer || items.length === 0 || !deliveryDate) return;
    
    setIsSaving(true);
    
    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    const orderItems: OrderItem[] = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error('Produit non trouvé');
      
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity
      };
    });

    const order: Omit<Order, 'id'> = {
      customerId: selectedCustomer,
      customerName: customer.name,
      orderDate: new Date(),
      deliveryDate: new Date(deliveryDate),
      status: 'pending',
      items: orderItems,
      totalAmount: calculateTotal(),
      paymentStatus: 'pending',
      paymentMethod,
      deliveryAddress: customer.address || {
        street: '',
        city: 'Antananarivo',
        postalCode: '101',
        country: 'Madagascar'
      },
      notes: notes.trim() || undefined
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave(order);
    
    // Reset form
    setSelectedCustomer('');
    setDeliveryDate('');
    setPaymentMethod('cash');
    setNotes('');
    setItems([]);
    setIsSaving(false);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nouvelle commande</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Client et livraison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Client *
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              >
                <option value="">Sélectionner un client...</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date de livraison *
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Méthode de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Méthode de paiement
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'cash', label: 'Espèces' },
                { value: 'mvola', label: 'MVola' },
                { value: 'orange-money', label: 'Orange Money' },
                { value: 'airtel-money', label: 'Airtel Money' },
                { value: 'transfer', label: 'Virement' },
                { value: 'check', label: 'Chèque' }
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    paymentMethod === method.value
                      ? 'bg-sage-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Articles */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Package className="w-4 h-4 inline mr-1" />
                Articles de la commande *
              </label>
              <button
                onClick={addItem}
                className="px-3 py-1 bg-sage-600 hover:bg-sage-700 text-white text-sm rounded-lg transition-colors"
              >
                Ajouter un article
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    <option value="">Sélectionner un produit...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.price)}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
                  />
                  
                  <div className="w-24 text-right text-gray-900 dark:text-white font-medium">
                    {item.productId ? formatCurrency((products.find(p => p.id === item.productId)?.price || 0) * item.quantity) : '-'}
                  </div>
                  
                  <button
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Aucun article ajouté. Cliquez sur "Ajouter un article" pour commencer.
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-4 p-4 bg-sage-50 dark:bg-sage-900/20 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-sage-600 dark:text-sage-400">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions spéciales, remarques..."
              rows={3}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedCustomer || items.length === 0 || !deliveryDate || isSaving}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
              !selectedCustomer || items.length === 0 || !deliveryDate || isSaving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-sage-600 hover:bg-sage-700 text-white hover:scale-105 hover:shadow-lg hover:shadow-sage-600/25'
            }`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
            <span>{isSaving ? 'Création...' : 'Créer la commande'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;