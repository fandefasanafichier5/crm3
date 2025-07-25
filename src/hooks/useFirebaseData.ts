import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  contactsService,
  productsService,
  ordersService,
  notesService,
  remindersService,
  vendorInfoService
} from '../services/firebaseService';
import { FirebaseError } from 'firebase/app';
import { Contact, Product, Order, Note, Reminder } from '../utils/types';
import { VendorInfo } from '../components/VendorSettings';

export const useFirebaseData = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [indexError, setIndexError] = useState<boolean>(false);
  
  const { user } = useAuth();

  const initializeData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      setPermissionError(false);
      setIndexError(false);

      // Load initial data
      const [contactsData, productsData, ordersData, notesData, remindersData, vendorData] = await Promise.all([
        contactsService.getAll(user.uid),
        productsService.getAll(user.uid),
        ordersService.getAll(user.uid),
        notesService.getAll(user.uid),
        remindersService.getAll(user.uid),
        vendorInfoService.get(user.uid)
      ]);

      setContacts(contactsData);
      setProducts(productsData);
      setOrders(ordersData);
      setNotes(notesData);
      setReminders(remindersData);
      setVendorInfo(vendorData);
      
    } catch (err) {
      console.error('Error initializing Firebase data:', err);
      
      if (err instanceof FirebaseError) {
        if (err.code === 'permission-denied') {
          setPermissionError(true);
          setError('Permission denied. Please check Firebase Security Rules.');
        } else if (err.code === 'failed-precondition') {
          setIndexError(true);
          setError('Database indexes are missing. Please create required indexes in Firebase Console.');
        } else {
          setError(`Firebase error: ${err.message}`);
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const handleSnapshotError = (error: Error) => {
      console.error('Snapshot listener error:', error);
      
      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied') {
          setPermissionError(true);
          setError('Permission denied. Please check Firebase Security Rules.');
        } else if (error.code === 'failed-precondition') {
          setIndexError(true);
          setError('Database indexes are missing. Please create required indexes in Firebase Console.');
        }
      }
    };

    // Set up real-time listeners
    const unsubscribeContacts = contactsService.onSnapshot(
      setContacts, 
      user.uid,
      handleSnapshotError
    );
    const unsubscribeProducts = productsService.onSnapshot(
      setProducts, 
      user.uid,
      handleSnapshotError
    );
    const unsubscribeOrders = ordersService.onSnapshot(
      setOrders, 
      user.uid,
      handleSnapshotError
    );
    const unsubscribeNotes = notesService.onSnapshot(
      setNotes, 
      user.uid,
      handleSnapshotError
    );
    const unsubscribeReminders = remindersService.onSnapshot(
      setReminders, 
      user.uid,
      handleSnapshotError
    );

    return () => {
      unsubscribeContacts();
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeNotes();
      unsubscribeReminders();
    };
  }, [user]);

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
    permissionError,
    indexError,
    
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