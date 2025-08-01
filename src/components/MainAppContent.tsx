import React, { useState } from 'react';
import { useFirebaseData } from '../hooks/useFirebaseData';
import MigrationModal from './MigrationModal';
import Layout from './Layout';
import Dashboard from './Dashboard';
import Contacts from './Contacts';
import Orders from './Orders';
import Products from './Products';
import Timeline from './Timeline';
import NoteEntry from './NoteEntry';
import ContactForm from './ContactForm';
import EditContactForm from './EditContactForm';
import OrderDetails from './OrderDetails';
import VendorSettings, { VendorInfo } from './VendorSettings';
import Receipt from './Receipt';
import OrderForm from './OrderForm';
import ProductForm from './ProductForm';
import EditProductForm from './EditProductForm';
import { kefirCustomers, recentOrders, upcomingDeliveries, businessReminders, kefirProducts } from '../utils/kefirData';
import { Contact, Note, Reminder, Order, Product, Analytics, Delivery } from '../utils/types';

const MainAppContent: React.FC = () => {
  // Firebase integration
  const {
    contacts: firebaseContacts,
    products: firebaseProducts,
    orders: firebaseOrders,
    notes: firebaseNotes,
    reminders: firebaseReminders,
    vendorInfo: firebaseVendorInfo,
    loading: firebaseLoading,
    error: firebaseError,
    permissionError,
    indexError,
    firebaseAvailable,
    addContact: addFirebaseContact,
    updateContact: updateFirebaseContact,
    deleteContact: deleteFirebaseContact,
    addProduct: addFirebaseProduct,
    updateProduct: updateFirebaseProduct,
    deleteProduct: deleteFirebaseProduct,
    addOrder: addFirebaseOrder,
    updateOrder: updateFirebaseOrder,
    addNote: addFirebaseNote,
    updateReminder: updateFirebaseReminder,
    saveVendorInfo: saveFirebaseVendorInfo
  } = useFirebaseData();

  // Migration state
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [useFirebase, setUseFirebase] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'orders' | 'products' | 'timeline'>('dashboard');
  const [isNoteEntryOpen, setIsNoteEntryOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isEditContactFormOpen, setIsEditContactFormOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isVendorSettingsOpen, setIsVendorSettingsOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isEditProductFormOpen, setIsEditProductFormOpen] = useState(false);
  
  // Local data (fallback when not using Firebase)
  const [localContacts, setLocalContacts] = useState<Contact[]>(kefirCustomers);
  const [localOrders, setLocalOrders] = useState<Order[]>(recentOrders);
  const [localProducts, setLocalProducts] = useState<Product[]>(kefirProducts);
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [localReminders, setLocalReminders] = useState<Reminder[]>(businessReminders);
  const [localVendorInfo, setLocalVendorInfo] = useState({
    name: 'Kéfir Madagascar SARL',
    address: 'Lot II M 15 Bis Antanimena, 101 Antananarivo, Madagascar',
    phone: '+261 32 12 345 67',
    email: 'contact@kefir-madagascar.mg',
    nif: '1234567890123',
    stat: '12345 12 2023 0 12345'
  });

  // Use Firebase data if available and migration completed, otherwise use local data
  const contacts = useFirebase && migrationCompleted ? firebaseContacts : localContacts;
  const orders = useFirebase && migrationCompleted ? firebaseOrders : localOrders;
  const products = useFirebase && migrationCompleted ? firebaseProducts : localProducts;
  const notes = useFirebase && migrationCompleted ? firebaseNotes : localNotes;
  const reminders = useFirebase && migrationCompleted ? firebaseReminders : localReminders;
  const vendorInfo = useFirebase && migrationCompleted ? firebaseVendorInfo : localVendorInfo;

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Check if we should show migration modal on first load
  React.useEffect(() => {
    const hasShownMigration = localStorage.getItem('firebase-migration-shown');
    
    // Check if we should use Firebase
    if (firebaseAvailable && !firebaseLoading) {
      if (firebaseContacts.length > 0 || firebaseProducts.length > 0 || firebaseOrders.length > 0) {
        // Data exists in Firebase, use it
        setUseFirebase(true);
        setMigrationCompleted(true);
      } else if (!hasShownMigration && localContacts.length > 0) {
        // Local data exists but no Firebase data, show migration modal
        setShowMigrationModal(true);
        localStorage.setItem('firebase-migration-shown', 'true');
      } else {
        // No data anywhere, start with Firebase
        setUseFirebase(true);
        setMigrationCompleted(true);
      }
    } else if (!firebaseAvailable) {
      // Firebase not available, use local data
      setUseFirebase(true);
      setMigrationCompleted(true);
    }
  }, [firebaseLoading, firebaseContacts.length, firebaseProducts.length, firebaseOrders.length, firebaseAvailable, localContacts.length]);

  // Calcul des analytics
  const analytics: Analytics = {
    totalRevenue: contacts.reduce((sum, c) => sum + c.totalSpent, 0),
    monthlyRevenue: orders
      .filter(o => o.orderDate.getMonth() === new Date().getMonth())
      .reduce((sum, o) => sum + o.totalAmount, 0),
    totalCustomers: contacts.length,
    activeCustomers: contacts.filter(c => c.customerStatus === 'active').length,
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0,
    topProducts: products.map(p => ({
      productId: p.id,
      productName: p.name,
      quantity: orders.reduce((sum, o) => sum + ((o.items || []).find(i => i.productId === p.id)?.quantity || 0), 0),
      revenue: orders.reduce((sum, o) => sum + ((o.items || []).find(i => i.productId === p.id)?.totalPrice || 0), 0)
    })).sort((a, b) => b.revenue - a.revenue),
    topCustomers: contacts.map(c => ({
      customerId: c.id,
      customerName: c.name,
      totalSpent: c.totalSpent,
      orderCount: orders.filter(o => o.customerId === c.id).length
    })).sort((a, b) => b.totalSpent - a.totalSpent),
    deliveryStats: {
      onTime: upcomingDeliveries.filter(d => d.status === 'delivered').length,
      delayed: 0,
      failed: upcomingDeliveries.filter(d => d.status === 'failed').length
    }
  };

  const handleToggleStar = (contactId: string) => {
    if (useFirebase) {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        updateFirebaseContact(contactId, { starred: !contact.starred }).catch(console.error);
      }
    } else {
      setLocalContacts(localContacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, starred: !contact.starred }
          : contact
      ));
    }
  };

  const handleReminderComplete = (reminderId: string) => {
    if (useFirebase) {
      updateFirebaseReminder(reminderId, { completed: true }).catch(console.error);
    } else {
      setLocalReminders(localReminders.map(reminder =>
        reminder.id === reminderId
          ? { ...reminder, completed: true }
          : reminder
      ));
    }
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditContactFormOpen(true);
  };

  const handleSaveNote = (noteData: Omit<Note, 'id'>) => {
    if (useFirebase) {
      addFirebaseNote(noteData).catch(console.error);
      // Update contact's last contact date
      updateFirebaseContact(noteData.contactId, { lastContact: new Date() }).catch(console.error);
    } else {
      const newNote: Note = {
        ...noteData,
        id: Math.random().toString(36).substr(2, 9)
      };
      
      setLocalNotes([...localNotes, newNote]);
      
      // Mettre à jour la date de dernier contact et ajouter la note au contact
      setLocalContacts(localContacts.map(contact =>
        contact.id === noteData.contactId
          ? {
              ...contact,
              lastContact: new Date(),
              notes: [...contact.notes, newNote]
            }
          : contact
      ));
    }
  };

  const handleSaveContact = (contactData: Omit<Contact, 'id' | 'notes'>) => {
    if (useFirebase && migrationCompleted) {
      const newContact = {
        ...contactData,
        notes: [],
        totalSpent: 0,
        averageOrderValue: 0,
        preferredProducts: [],
        deliveryPreferences: {
          preferredDay: 'saturday' as const,
          preferredTime: 'morning' as const,
          frequency: 'weekly' as const
        }
      };
      addFirebaseContact(newContact);
    } else {
      const newContact: Contact = {
        ...contactData,
        id: Math.random().toString(36).substr(2, 9),
        notes: [],
        totalSpent: 0,
        averageOrderValue: 0,
        preferredProducts: [],
        deliveryPreferences: {
          preferredDay: 'saturday',
          preferredTime: 'morning',
          frequency: 'weekly'
        }
      };
      
      setLocalContacts([...localContacts, newContact]);
    }
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    if (useFirebase) {
      updateFirebaseContact(updatedContact.id, updatedContact).catch(console.error);
    } else {
      setLocalContacts(localContacts.map(contact =>
        contact.id === updatedContact.id ? updatedContact : contact
      ));
    }
  };

  const handleSaveOrder = (orderData: Omit<Order, 'id'>) => {
    if (useFirebase) {
      addFirebaseOrder(orderData).catch(console.error);
    } else {
      const newOrder: Order = {
        ...orderData,
        id: Math.random().toString(36).substr(2, 9)
      };
      
      setLocalOrders([...localOrders, newOrder]);
    }
  };

  const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
    if (useFirebase) {
      addFirebaseProduct(productData).catch(console.error);
    } else {
      const newProduct: Product = {
        ...productData,
        id: Math.random().toString(36).substr(2, 9)
      };
      
      setLocalProducts([...localProducts, newProduct]);
    }
  };
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    console.log('Modifier commande', order);
    // TODO: Implémenter la modification de commande
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      if (useFirebase) {
        deleteFirebaseProduct(productId).catch(console.error);
      } else {
        setLocalProducts(localProducts.filter(p => p.id !== productId));
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditProductFormOpen(true);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    if (useFirebase) {
      updateFirebaseProduct(updatedProduct.id, updatedProduct).catch(console.error);
    } else {
      setLocalProducts(localProducts.map(product =>
        product.id === updatedProduct.id ? updatedProduct : product
      ));
    }
  };

  const handleShowReceipt = (order: Order) => {
    setSelectedOrder(order);
    setIsReceiptOpen(true);
  };

  const handleMigrationComplete = () => {
    setUseFirebase(true);
    setMigrationCompleted(true);
  };

  const handleVendorInfoSave = (info: any) => {
    if (useFirebase) {
      saveFirebaseVendorInfo(info).catch(console.error);
    } else {
      setLocalVendorInfo(info);
    }
  };

  const handleMigrateToFirebase = () => {
    const shouldMigrate = confirm('Voulez-vous migrer vos données vers Firebase ? Cette opération est irréversible.');
    if (shouldMigrate) {
      // Reset migration flag to show modal again
      localStorage.removeItem('firebase-migration-shown');
      window.location.reload();
    }
  };

  // Show loading screen during Firebase initialization
  if (firebaseLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de l'application...</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Connexion à Firebase...</p>
        </div>
      </div>
    );
  }

  // Only show Firebase errors if we're trying to use Firebase
  if (firebaseError && firebaseAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">
            {permissionError ? '🔒' : indexError ? '📊' : '⚠️'}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {permissionError ? 'Permission Denied' : indexError ? 'Database Setup Required' : 'Error Loading Data'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{firebaseError}</p>
          
          {permissionError && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>To fix this:</strong> Go to your Firebase Console → Firestore Database → Rules and update the security rules to allow authenticated users access to their data.
              </p>
            </div>
          )}
          
          {indexError && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>To fix this:</strong> Check the browser console for specific index creation URLs and click them to create the required composite indexes in Firebase Console.
              </p>
            </div>
          )}
          
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => {
                setUseFirebase(false);
                setMigrationCompleted(false);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Utiliser en mode local
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            customers={contacts}
            orders={orders}
            deliveries={upcomingDeliveries}
            analytics={analytics}
            reminders={reminders}
            onContactClick={handleContactClick}
            onReminderComplete={handleReminderComplete}
          />
        );
      case 'contacts':
        return (
          <Contacts
            contacts={contacts}
            onContactClick={handleContactClick}
            onToggleStar={handleToggleStar}
            onAddContact={() => setIsContactFormOpen(true)}
          />
        );
      case 'orders':
        return (
          <Orders
            orders={orders}
            customers={contacts}
            products={products}
            onCreateOrder={() => setIsOrderFormOpen(true)}
            onViewOrder={handleViewOrder}
            onEditOrder={handleEditOrder}
            onShowReceipt={handleShowReceipt}
          />
        );
      case 'products':
        return (
          <Products
            products={products}
            onAddProduct={() => setIsProductFormOpen(true)}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'timeline':
        return <Timeline notes={notes} contacts={contacts} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewNote={() => setIsNoteEntryOpen(true)}
        onVendorSettings={() => setIsVendorSettingsOpen(true)}
        onMigrateToFirebase={handleMigrateToFirebase}
      >
        {renderActiveTab()}
      </Layout>
      
      <NoteEntry
        isOpen={isNoteEntryOpen}
        onClose={() => setIsNoteEntryOpen(false)}
        contacts={contacts}
        onSave={handleSaveNote}
      />
      
      <ContactForm
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        onSave={handleSaveContact}
      />
      
      <EditContactForm
        isOpen={isEditContactFormOpen}
        onClose={() => {
          setIsEditContactFormOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        onSave={handleUpdateContact}
      />
      
      <OrderDetails
        isOpen={isOrderDetailsOpen}
        onClose={() => {
          setIsOrderDetailsOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
      
      <VendorSettings
        isOpen={isVendorSettingsOpen}
        onClose={() => setIsVendorSettingsOpen(false)}
        vendorInfo={vendorInfo}
        onSave={handleVendorInfoSave}
      />
      
      <Receipt
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        vendorInfo={vendorInfo}
      />
      
      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        customers={contacts}
        products={products}
        onSave={handleSaveOrder}
      />
      
      <ProductForm
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        onSave={handleSaveProduct}
      />
      
      <EditProductForm
        isOpen={isEditProductFormOpen}
        onClose={() => {
          setIsEditProductFormOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleUpdateProduct}
      />
      
      <MigrationModal
        isOpen={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        localData={{
          contacts: localContacts,
          products: localProducts,
          orders: localOrders,
          notes: localNotes,
          reminders: localReminders,
          vendorInfo: localVendorInfo
        }}
        onMigrationComplete={handleMigrationComplete}
      />
    </>
  );
};

export default MainAppContent;