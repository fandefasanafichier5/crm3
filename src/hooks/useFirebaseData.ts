import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  contactsService,
  productsService,
  ordersService,
  notesService,
  remindersService,
  vendorInfoService
} from '../services/firebaseService';
import { Contact, Product, Order, Note, Reminder } from '../utils/types';
import { VendorInfo } from '../components/VendorSettings';

export const useFirebaseData = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vendorInfo, setVendorInfo] = useState<VendorInfo>({
    name: 'Kéfir Madagascar SARL',
    address: 'Lot II M 15 Bis Antanimena, 101 Antananarivo, Madagascar',
    phone: '+261 32 12 345 67',
    email: 'contact@kefir-madagascar.mg',
    nif: '',
    stat: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    const unsubscribers: (() => void)[] = [];

    const initializeData = async () => {
      try {
        setLoading(true);

        // Set up real-time listeners
        const unsubContacts = contactsService.onSnapshot(setContacts, currentUser.uid);
        const unsubProducts = productsService.onSnapshot(setProducts, currentUser.uid);
        const unsubOrders = ordersService.onSnapshot(setOrders, currentUser.uid);
        const unsubNotes = notesService.onSnapshot(setNotes, currentUser.uid);
        const unsubReminders = remindersService.onSnapshot(setReminders, currentUser.uid);

        unsubscribers.push(unsubContacts, unsubProducts, unsubOrders, unsubNotes, unsubReminders);

        // Load vendor info (not real-time)
        const vendorData = await vendorInfoService.get(currentUser.uid);
        if (vendorData) {
          setVendorInfo(vendorData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing Firebase data:', err);
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUser]);

  // CRUD operations
  const addContact = async (contact: Omit<Contact, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      await contactsService.add(contact, currentUser.uid);
    } catch (err) {
      console.error('Error adding contact:', err);
      throw err;
    }
  };

  const updateContact = async (id: string, contact: Partial<Contact>) => {
    try {
      await contactsService.update(id, contact);
    } catch (err) {
      console.error('Error updating contact:', err);
      throw err;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await contactsService.delete(id);
    } catch (err) {
      console.error('Error deleting contact:', err);
      throw err;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      await productsService.add(product, currentUser.uid);
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      await productsService.update(id, product);
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsService.delete(id);
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      await ordersService.add(order, currentUser.uid);
    } catch (err) {
      console.error('Error adding order:', err);
      throw err;
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      await ordersService.update(id, order);
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  };

  const addNote = async (note: Omit<Note, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      await notesService.add(note, currentUser.uid);
    } catch (err) {
      console.error('Error adding note:', err);
      throw err;
    }
  };

  const updateReminder = async (id: string, reminder: Partial<Reminder>) => {
    try {
      await remindersService.update(id, reminder);
    } catch (err) {
      console.error('Error updating reminder:', err);
      throw err;
    }
  };

  const saveVendorInfo = async (info: VendorInfo) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      await vendorInfoService.set(info, currentUser.uid);
      setVendorInfo(info);
    } catch (err) {
      console.error('Error saving vendor info:', err);
      throw err;
    }
  };

  return {
    // Data
    contacts,
    products,
    orders,
    notes,
    reminders,
    vendorInfo,
    loading,
    error,
    
    // CRUD operations
    addContact,
    updateContact,
    deleteContact,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrder,
    addNote,
    updateReminder,
    saveVendorInfo
  };
};