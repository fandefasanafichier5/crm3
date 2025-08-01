import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  contactsService,
  productsService,
  ordersService,
  notesService,
  remindersService,
  vendorInfoService,
  migrationService
} from '../services/firebaseService';
import { Contact, Product, Order, Note, Reminder } from '../utils/types';

interface UseFirebaseDataReturn {
  // Data
  contacts: Contact[];
  products: Product[];
  orders: Order[];
  notes: Note[];
  reminders: Reminder[];
  vendorInfo: any;
  
  // Loading states
  loading: boolean;
  initializing: boolean;
  
  // Error states
  error: string | null;
  permissionError: boolean;
  indexError: boolean;
  firebaseAvailable: boolean;
  
  // CRUD operations
  addContact: (contact: Omit<Contact, 'id'>) => Promise<string>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  addOrder: (order: Omit<Order, 'id'>) => Promise<string>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  addNote: (note: Omit<Note, 'id'>) => Promise<string>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<string>;
  updateReminder: (id: string, reminder: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  
  setVendorInfo: (vendorInfo: any) => Promise<void>;
  
  // Migration
  migrateToFirebase: (localData: any) => Promise<void>;
  
  // Utility
  initializeData: () => Promise<void>;
  useLocalMode: () => void;
}

export const useFirebaseData = (): UseFirebaseDataReturn => {
  const { currentUser } = useAuth();
  
  // Data states
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [indexError, setIndexError] = useState(false);
  const [firebaseAvailable, setFirebaseAvailable] = useState(true);

  // Error handler
  const handleFirebaseError = useCallback((error: any) => {
    console.error('💥 Firebase error:', error);
    
    if (error?.code === 'permission-denied') {
      setPermissionError(true);
      setError('Permission refusée. Vérifiez les règles de sécurité Firebase.');
    } else if (error?.code === 'failed-precondition') {
      setIndexError(true);
      setError('Index Firebase manquant. Créez les index requis.');
    } else {
      setError(error?.message || 'Une erreur est survenue');
    }
    
    setFirebaseAvailable(false);
    setInitializing(false);
  }, []);

  // Initialize data
  const initializeData = useCallback(async () => {
    if (!currentUser) {
      setInitializing(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPermissionError(false);
      setIndexError(false);
      setFirebaseAvailable(true);

      // Load all data
      const [contactsData, productsData, ordersData, notesData, remindersData, vendorInfoData] = await Promise.all([
        contactsService.getAll(currentUser.uid),
        productsService.getAll(currentUser.uid),
        ordersService.getAll(currentUser.uid),
        notesService.getAll(currentUser.uid),
        remindersService.getAll(currentUser.uid),
        vendorInfoService.get(currentUser.uid)
      ]);

      setContacts(contactsData);
      setProducts(productsData);
      setOrders(ordersData);
      setNotes(notesData);
      setReminders(remindersData);
      setVendorInfo(vendorInfoData);

      // Set up real-time listeners
      const unsubscribeContacts = contactsService.onSnapshot(setContacts, currentUser.uid, handleFirebaseError);
      const unsubscribeProducts = productsService.onSnapshot(setProducts, currentUser.uid, handleFirebaseError);
      const unsubscribeOrders = ordersService.onSnapshot(setOrders, currentUser.uid, handleFirebaseError);
      const unsubscribeNotes = notesService.onSnapshot(setNotes, currentUser.uid, handleFirebaseError);
      const unsubscribeReminders = remindersService.onSnapshot(setReminders, currentUser.uid, handleFirebaseError);

      // Return cleanup function
      return () => {
        unsubscribeContacts();
        unsubscribeProducts();
        unsubscribeOrders();
        unsubscribeNotes();
        unsubscribeReminders();
      };
    } catch (error) {
      handleFirebaseError(error);
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  }, [currentUser, firebaseAvailable, handleFirebaseError]);

  // Initialize on mount and user change
  useEffect(() => {
    if (currentUser) {
      const cleanup = initializeData();
      return () => {
        if (cleanup instanceof Promise) {
          cleanup.then(fn => fn && fn());
        }
      };
    } else {
      setInitializing(false);
    }
  }, [currentUser, initializeData]);

  // CRUD operations
  const addContact = useCallback(async (contact: Omit<Contact, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    return await contactsService.add(contact, currentUser.uid);
  }, [currentUser]);

  const updateContact = useCallback(async (id: string, contact: Partial<Contact>) => {
    return await contactsService.update(id, contact);
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    return await contactsService.delete(id);
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    return await productsService.add(product, currentUser.uid);
  }, [currentUser]);

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    return await productsService.update(id, product);
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    return await productsService.delete(id);
  }, []);

  const addOrder = useCallback(async (order: Omit<Order, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    return await ordersService.add(order, currentUser.uid);
  }, [currentUser]);

  const updateOrder = useCallback(async (id: string, order: Partial<Order>) => {
    return await ordersService.update(id, order);
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    return await ordersService.delete(id);
  }, []);

  const addNote = useCallback(async (note: Omit<Note, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    return await notesService.add(note, currentUser.uid);
  }, [currentUser]);

  const updateNote = useCallback(async (id: string, note: Partial<Note>) => {
    return await notesService.update(id, note);
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    return await notesService.delete(id);
  }, []);

  const addReminder = useCallback(async (reminder: Omit<Reminder, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    return await remindersService.add(reminder, currentUser.uid);
  }, [currentUser]);

  const updateReminder = useCallback(async (id: string, reminder: Partial<Reminder>) => {
    return await remindersService.update(id, reminder);
  }, []);

  const deleteReminder = useCallback(async (id: string) => {
    return await remindersService.delete(id);
  }, []);

  const setVendorInfoData = useCallback(async (vendorInfo: any) => {
    if (!currentUser) throw new Error('User not authenticated');
    await vendorInfoService.set(vendorInfo, currentUser.uid);
    setVendorInfo(vendorInfo);
  }, [currentUser]);

  const migrateToFirebase = useCallback(async (localData: any) => {
    if (!currentUser) throw new Error('User not authenticated');
    await migrationService.migrateAllData(localData, currentUser.uid);
    await initializeData();
  }, [currentUser, initializeData]);

  const useLocalMode = useCallback(() => {
    setFirebaseAvailable(false);
    setError(null);
    setPermissionError(false);
    setIndexError(false);
    setInitializing(false);
  }, []);

  return {
    // Data
    contacts,
    products,
    orders,
    notes,
    reminders,
    vendorInfo,
    
    // Loading states
    loading,
    initializing,
    
    // Error states
    error,
    permissionError,
    indexError,
    firebaseAvailable,
    
    // CRUD operations
    addContact,
    updateContact,
    deleteContact,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrder,
    deleteOrder,
    addNote,
    updateNote,
    deleteNote,
    addReminder,
    updateReminder,
    deleteReminder,
    setVendorInfo: setVendorInfoData,
    
    // Migration
    migrateToFirebase,
    
    // Utility
    initializeData,
    useLocalMode
  };
};