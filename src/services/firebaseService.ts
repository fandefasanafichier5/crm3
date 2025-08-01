import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../config/firebase';
import { Contact, Product, Order, Note, Reminder } from '../utils/types';

// Collections
const COLLECTIONS = {
  CONTACTS: 'contacts',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  NOTES: 'notes',
  REMINDERS: 'reminders',
  VENDOR_INFO: 'vendorInfo'
};

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any): any => {
  if (!data) return data;
  
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    } else if (converted[key] && typeof converted[key] === 'object') {
      converted[key] = convertTimestamps(converted[key]);
    }
  });
  
  return converted;
};

// Helper function to convert Date objects to Firestore timestamps
const convertDatesToTimestamps = (data: any): any => {
  if (!data) return data;
  
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Date) {
      converted[key] = Timestamp.fromDate(converted[key]);
    } else if (converted[key] && typeof converted[key] === 'object' && !Array.isArray(converted[key])) {
      converted[key] = convertDatesToTimestamps(converted[key]);
    }
  });
  
  return converted;
};

// Contacts Service
export const contactsService = {
  // Get all contacts
  async getAll(userId?: string): Promise<Contact[]> {
    console.log('🔍 Fetching contacts for user:', userId);
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    try {
      const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.CONTACTS), ...constraints));
      const contacts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Contact[];
      console.log('✅ Contacts fetched:', contacts.length);
      return contacts;
    } catch (error) {
      console.error('❌ Error fetching contacts:', error);
      throw error;
    }
  },

  // Get contact by ID
  async getById(id: string): Promise<Contact | null> {
    const docRef = doc(db, COLLECTIONS.CONTACTS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...convertTimestamps(docSnap.data())
      } as Contact;
    }
    return null;
  },

  // Add new contact
  async add(contact: Omit<Contact, 'id'>, userId: string): Promise<string> {
    console.log('💾 Adding contact for user:', userId, contact.name);
    try {
      const contactData = convertDatesToTimestamps(contact);
      const docRef = await addDoc(collection(db, COLLECTIONS.CONTACTS), {
        ...contactData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Contact added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding contact:', error);
      throw error;
    }
  },

  // Update contact
  async update(id: string, contact: Partial<Contact>): Promise<void> {
    console.log('🔄 Updating contact:', id);
    try {
      const docRef = doc(db, COLLECTIONS.CONTACTS, id);
      const contactData = convertDatesToTimestamps(contact);
      await updateDoc(docRef, {
        ...contactData,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Contact updated:', id);
    } catch (error) {
      console.error('❌ Error updating contact:', error);
      throw error;
    }
  },

  // Delete contact
  async delete(id: string): Promise<void> {
    console.log('🗑️ Deleting contact:', id);
    try {
      await deleteDoc(doc(db, COLLECTIONS.CONTACTS, id));
      console.log('✅ Contact deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting contact:', error);
      throw error;
    }
  },

  // Listen to contacts changes
  onSnapshot(callback: (contacts: Contact[]) => void, userId?: string, onError?: (error: Error) => void) {
    console.log('👂 Setting up contacts listener for user:', userId);
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(query(collection(db, COLLECTIONS.CONTACTS), ...constraints), (snapshot) => {
      const contacts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Contact[];
      console.log('🔄 Contacts updated via listener:', contacts.length);
      callback(contacts);
    }, (error) => {
      console.error('❌ Contacts listener error:', error);
      if (onError) onError(error);
    });
  }
};

// Products Service
export const productsService = {
  async getAll(userId?: string): Promise<Product[]> {
    console.log('🔍 Fetching products for user:', userId);
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    try {
      const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.PRODUCTS), ...constraints));
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Product[];
      console.log('✅ Products fetched:', products.length);
      return products;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  },

  async add(product: Omit<Product, 'id'>, userId: string): Promise<string> {
    console.log('💾 Adding product for user:', userId, product.name);
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
        ...product,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Product added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding product:', error);
      throw error;
    }
  },

  async update(id: string, product: Partial<Product>): Promise<void> {
    console.log('🔄 Updating product:', id);
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
      await updateDoc(docRef, {
        ...product,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Product updated:', id);
    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    console.log('🗑️ Deleting product:', id);
    try {
      await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
      console.log('✅ Product deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      throw error;
    }
  },

  onSnapshot(callback: (products: Product[]) => void, userId?: string, onError?: (error: Error) => void) {
    console.log('👂 Setting up products listener for user:', userId);
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(query(collection(db, COLLECTIONS.PRODUCTS), ...constraints), (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Product[];
      
      // Sort by name alphabetically since createdAt may not exist
      const sortedProducts = products.sort((a, b) => a.name.localeCompare(b.name));
      console.log('🔄 Products updated via listener:', sortedProducts.length);
      callback(sortedProducts);
    }, (error) => {
      console.error('❌ Products listener error:', error);
      if (onError) onError(error);
    });
  }
};

// Orders Service
export const ordersService = {
  async getAll(userId?: string): Promise<Order[]> {
    console.log('🔍 Fetching orders for user:', userId);
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.ORDERS), ...constraints)
      );
      
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Order[];
      
      // Sort client-side to avoid Firebase index requirements
      const sortedOrders = orders.sort((a, b) => {
        const dateA = new Date(a.orderDate);
        const dateB = new Date(b.orderDate);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });
      console.log('✅ Orders fetched:', sortedOrders.length);
      return sortedOrders;
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      throw error;
    }
  },

  async add(order: Omit<Order, 'id'>, userId: string): Promise<string> {
    console.log('💾 Adding order for user:', userId);
    try {
      const orderData = convertDatesToTimestamps(order);
      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        ...orderData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Order added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding order:', error);
      throw error;
    }
  },

  async update(id: string, order: Partial<Order>): Promise<void> {
    console.log('🔄 Updating order:', id);
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, id);
      const orderData = convertDatesToTimestamps(order);
      await updateDoc(docRef, {
        ...orderData,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Order updated:', id);
    } catch (error) {
      console.error('❌ Error updating order:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    console.log('🗑️ Deleting order:', id);
    try {
      await deleteDoc(doc(db, COLLECTIONS.ORDERS, id));
      console.log('✅ Order deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting order:', error);
      throw error;
    }
  },

  onSnapshot(callback: (orders: Order[]) => void, userId?: string, onError?: (error: Error) => void) {
    console.log('👂 Setting up orders listener for user:', userId);
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(
      query(collection(db, COLLECTIONS.ORDERS), ...constraints),
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...convertTimestamps(doc.data())
        })) as Order[];
        
        // Sort client-side to avoid Firebase index requirements
        const sortedOrders = orders.sort((a, b) => {
          const dateA = new Date(a.orderDate);
          const dateB = new Date(b.orderDate);
          return dateB.getTime() - dateA.getTime(); // Descending order
        });
        console.log('🔄 Orders updated via listener:', sortedOrders.length);
        callback(sortedOrders);
      },
      (error) => {
        console.error('❌ Orders listener error:', error);
        if (onError) onError(error);
      }
    );
  }
};

// Notes Service
export const notesService = {
  async getAll(userId?: string): Promise<Note[]> {
    console.log('🔍 Fetching notes for user:', userId);
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.NOTES), ...constraints)
      );
      
      const notes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Note[];
      
      // Sort client-side to avoid Firebase index requirements
      const sortedNotes = notes.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });
      console.log('✅ Notes fetched:', sortedNotes.length);
      return sortedNotes;
    } catch (error) {
      console.error('❌ Error fetching notes:', error);
      throw error;
    }
  },

  async add(note: Omit<Note, 'id'>, userId: string): Promise<string> {
    console.log('💾 Adding note for user:', userId);
    try {
      const noteData = convertDatesToTimestamps(note);
      const docRef = await addDoc(collection(db, COLLECTIONS.NOTES), {
        ...noteData,
        userId,
        createdAt: serverTimestamp()
      });
      console.log('✅ Note added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding note:', error);
      throw error;
    }
  },

  async update(id: string, note: Partial<Note>): Promise<void> {
    console.log('🔄 Updating note:', id);
    try {
      const docRef = doc(db, COLLECTIONS.NOTES, id);
      const noteData = convertDatesToTimestamps(note);
      await updateDoc(docRef, noteData);
      console.log('✅ Note updated:', id);
    } catch (error) {
      console.error('❌ Error updating note:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    console.log('🗑️ Deleting note:', id);
    try {
      await deleteDoc(doc(db, COLLECTIONS.NOTES, id));
      console.log('✅ Note deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      throw error;
    }
  },

  onSnapshot(callback: (notes: Note[]) => void, userId?: string, onError?: (error: Error) => void) {
    console.log('👂 Setting up notes listener for user:', userId);
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(
      query(collection(db, COLLECTIONS.NOTES), ...constraints),
      (snapshot) => {
        const notes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...convertTimestamps(doc.data())
        })) as Note[];
        
        // Sort client-side to avoid Firebase index requirements
        const sortedNotes = notes.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime(); // Descending order
        });
        console.log('🔄 Notes updated via listener:', sortedNotes.length);
        callback(sortedNotes);
      },
      (error) => {
        console.error('❌ Notes listener error:', error);
        if (onError) onError(error);
      }
    );
  }
};

// Reminders Service - CORRIGÉ POUR ÉVITER L'ERREUR D'INDEX
export const remindersService = {
  async getAll(userId?: string): Promise<Reminder[]> {
    console.log('🔍 Fetching reminders for user:', userId);
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.REMINDERS), ...constraints)
      );
      
      const reminders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Reminder[];
      
      // Tri côté client pour éviter l'erreur d'index Firebase
      const sortedReminders = reminders.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime(); // Tri croissant
      });
      console.log('✅ Reminders fetched:', sortedReminders.length);
      return sortedReminders;
    } catch (error) {
      console.error('❌ Error fetching reminders:', error);
      throw error;
    }
  },

  async add(reminder: Omit<Reminder, 'id'>, userId: string): Promise<string> {
    console.log('💾 Adding reminder for user:', userId);
    try {
      const reminderData = convertDatesToTimestamps(reminder);
      const docRef = await addDoc(collection(db, COLLECTIONS.REMINDERS), {
        ...reminderData,
        userId,
        createdAt: serverTimestamp()
      });
      console.log('✅ Reminder added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding reminder:', error);
      throw error;
    }
  },

  async update(id: string, reminder: Partial<Reminder>): Promise<void> {
    console.log('🔄 Updating reminder:', id);
    try {
      const docRef = doc(db, COLLECTIONS.REMINDERS, id);
      const reminderData = convertDatesToTimestamps(reminder);
      await updateDoc(docRef, reminderData);
      console.log('✅ Reminder updated:', id);
    } catch (error) {
      console.error('❌ Error updating reminder:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    console.log('🗑️ Deleting reminder:', id);
    try {
      await deleteDoc(doc(db, COLLECTIONS.REMINDERS, id));
      console.log('✅ Reminder deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting reminder:', error);
      throw error;
    }
  },

  onSnapshot(callback: (reminders: Reminder[]) => void, userId?: string, onError?: (error: Error) => void) {
    console.log('👂 Setting up reminders listener for user:', userId);
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(
      query(collection(db, COLLECTIONS.REMINDERS), ...constraints),
        })) as Reminder[];
        
        // Tri côté client pour éviter l'erreur d'index Firebase
        const sortedReminders = reminders.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime(); // Tri croissant
        });
        console.log('🔄 Reminders updated via listener:', sortedReminders.length);
        callback(sortedReminders);
      },
      (error) => {
        console.error('❌ Reminders listener error:', error);
        if (onError) onError(error);
      }
    );
  },

  // Get contact by ID
  async getById(id: string): Promise<Contact | null> {
    const docRef = doc(db, COLLECTIONS.CONTACTS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...convertTimestamps(docSnap.data())
      } as Contact;
    }
    return null;
  },

  // Add new contact
  async add(contact: Omit<Contact, 'id'>, userId: string): Promise<string> {
    const contactData = convertDatesToTimestamps(contact);
    const docRef = await addDoc(collection(db, COLLECTIONS.CONTACTS), {
      ...contactData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update contact
  async update(id: string, contact: Partial<Contact>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CONTACTS, id);
    const contactData = convertDatesToTimestamps(contact);
    await updateDoc(docRef, {
      ...contactData,
      updatedAt: serverTimestamp()
    });
  },

  // Delete contact
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.CONTACTS, id));
  },

  // Listen to contacts changes
  onSnapshot(callback: (contacts: Contact[]) => void, userId?: string, onError?: (error: Error) => void) {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(query(collection(db, COLLECTIONS.CONTACTS), ...constraints), (snapshot) => {
      const contacts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Contact[];
      callback(contacts);
    }, onError);
  }
};

// Products Service
export const productsService = {
  async getAll(userId?: string): Promise<Product[]> {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.PRODUCTS), ...constraints));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Product[];
  },

  async add(product: Omit<Product, 'id'>, userId: string): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      ...product,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, product: Partial<Product>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await updateDoc(docRef, {
      ...product,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
  },

  onSnapshot(callback: (products: Product[]) => void, userId?: string, onError?: (error: Error) => void) {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(query(collection(db, COLLECTIONS.PRODUCTS), ...constraints), (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Product[];
      
      // Sort by name alphabetically since createdAt may not exist
      const sortedProducts = products.sort((a, b) => a.name.localeCompare(b.name));
      
      callback(sortedProducts);
    }, onError);
  }
};

// Orders Service
export const ordersService = {
  async getAll(userId?: string): Promise<Order[]> {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.ORDERS), ...constraints)
    );
    
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Order[];
    
    // Sort client-side to avoid Firebase index requirements
    return orders.sort((a, b) => {
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);
      return dateB.getTime() - dateA.getTime(); // Descending order
    });
  },

  async add(order: Omit<Order, 'id'>, userId: string): Promise<string> {
    const orderData = convertDatesToTimestamps(order);
    const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
      ...orderData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, order: Partial<Order>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ORDERS, id);
    const orderData = convertDatesToTimestamps(order);
    await updateDoc(docRef, {
      ...orderData,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.ORDERS, id));
  },

  onSnapshot(callback: (orders: Order[]) => void, userId?: string, onError?: (error: Error) => void) {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(
      query(collection(db, COLLECTIONS.ORDERS), ...constraints),
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...convertTimestamps(doc.data())
        })) as Order[];
        
        // Sort client-side to avoid Firebase index requirements
        const sortedOrders = orders.sort((a, b) => {
          const dateA = new Date(a.orderDate);
          const dateB = new Date(b.orderDate);
          return dateB.getTime() - dateA.getTime(); // Descending order
        });
        
        callback(sortedOrders);
      },
      onError
    );
  }
};

// Notes Service
export const notesService = {
  async getAll(userId?: string): Promise<Note[]> {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.NOTES), ...constraints)
    );
    
    const notes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Note[];
    
    // Sort client-side to avoid Firebase index requirements
    return notes.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // Descending order
    });
  },

  async add(note: Omit<Note, 'id'>, userId: string): Promise<string> {
    const noteData = convertDatesToTimestamps(note);
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTES), {
      ...noteData,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, note: Partial<Note>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.NOTES, id);
    const noteData = convertDatesToTimestamps(note);
    await updateDoc(docRef, noteData);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.NOTES, id));
  },

  onSnapshot(callback: (notes: Note[]) => void, userId?: string, onError?: (error: Error) => void) {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(
      query(collection(db, COLLECTIONS.NOTES), ...constraints),
      (snapshot) => {
        const notes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...convertTimestamps(doc.data())
        })) as Note[];
        
        // Sort client-side to avoid Firebase index requirements
        const sortedNotes = notes.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime(); // Descending order
        });
        
        callback(sortedNotes);
      },
      onError
    );
  }
};

// Reminders Service - CORRIGÉ POUR ÉVITER L'ERREUR D'INDEX
export const remindersService = {
  async getAll(userId?: string): Promise<Reminder[]> {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTIONS.REMINDERS), ...constraints)
    );
    
    const reminders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Reminder[];
    
    // Tri côté client pour éviter l'erreur d'index Firebase
    return reminders.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime(); // Tri croissant
    });
  },

  async add(reminder: Omit<Reminder, 'id'>, userId: string): Promise<string> {
    const reminderData = convertDatesToTimestamps(reminder);
    const docRef = await addDoc(collection(db, COLLECTIONS.REMINDERS), {
      ...reminderData,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, reminder: Partial<Reminder>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.REMINDERS, id);
    const reminderData = convertDatesToTimestamps(reminder);
    await updateDoc(docRef, reminderData);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.REMINDERS, id));
  },

  onSnapshot(callback: (reminders: Reminder[]) => void, userId?: string, onError?: (error: Error) => void) {
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    return onSnapshot(
      query(collection(db, COLLECTIONS.REMINDERS), ...constraints),
      (snapshot) => {
        const reminders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...convertTimestamps(doc.data())
        })) as Reminder[];
        
        // Tri côté client pour éviter l'erreur d'index Firebase
        const sortedReminders = reminders.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime(); // Tri croissant
        });
        
        callback(sortedReminders);
      },
      onError
    );
  }
};

// Vendor Info Service
export const vendorInfoService = {
  async get(userId?: string): Promise<any> {
    console.log('🔍 Fetching vendor info for user:', userId);
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    try {
      const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.VENDOR_INFO), ...constraints));
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const vendorInfo = {
          id: doc.id,
          ...doc.data()
        };
        console.log('✅ Vendor info fetched');
        return vendorInfo;
      }
      console.log('ℹ️ No vendor info found');
      return null;
    } catch (error) {
      console.error('❌ Error fetching vendor info:', error);
      throw error;
    }
  },

  async set(vendorInfo: any, userId: string): Promise<void> {
    console.log('💾 Setting vendor info for user:', userId);
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.VENDOR_INFO), where('userId', '==', userId))
      );
      
      if (!querySnapshot.empty) {
        // Update existing
        const docRef = doc(db, COLLECTIONS.VENDOR_INFO, querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          ...vendorInfo,
          userId,
          updatedAt: serverTimestamp()
        });
        console.log('✅ Vendor info updated');
      } else {
        // Create new
        await addDoc(collection(db, COLLECTIONS.VENDOR_INFO), {
          ...vendorInfo,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('✅ Vendor info created');
      }
    } catch (error) {
      console.error('❌ Error setting vendor info:', error);
      throw error;
    }
  }
};

// Migration Service - to migrate existing data to Firebase
export const migrationService = {
  async migrateAllData(localData: {
    contacts: Contact[];
    products: Product[];
    orders: Order[];
    notes: Note[];
    reminders: Reminder[];
    vendorInfo: any;
  }, userId: string): Promise<void> {
    console.log('🚀 Starting migration for user:', userId);
    console.log('📊 Data to migrate:', {
      contacts: localData.contacts.length,
      products: localData.products.length,
      orders: localData.orders.length,
      notes: localData.notes.length,
      reminders: localData.reminders.length,
      vendorInfo: !!localData.vendorInfo
    });
    
    const batch = writeBatch(db);
    
    try {
      // Migrate contacts
      for (const contact of localData.contacts) {
        const { id, ...contactData } = contact;
        const docRef = doc(collection(db, COLLECTIONS.CONTACTS));
        const dataWithTimestamps = convertDatesToTimestamps(contactData);
        batch.set(docRef, {
          ...dataWithTimestamps,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      console.log('✅ Contacts prepared for migration');

      // Migrate products
      for (const product of localData.products) {
        const { id, ...productData } = product;
        const docRef = doc(collection(db, COLLECTIONS.PRODUCTS));
        batch.set(docRef, {
          ...productData,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      console.log('✅ Products prepared for migration');

      // Migrate orders
      for (const order of localData.orders) {
        const { id, ...orderData } = order;
        const docRef = doc(collection(db, COLLECTIONS.ORDERS));
        const dataWithTimestamps = convertDatesToTimestamps(orderData);
        batch.set(docRef, {
          ...dataWithTimestamps,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      console.log('✅ Orders prepared for migration');

      // Migrate notes
      for (const note of localData.notes) {
        const { id, ...noteData } = note;
        const docRef = doc(collection(db, COLLECTIONS.NOTES));
        const dataWithTimestamps = convertDatesToTimestamps(noteData);
        batch.set(docRef, {
          ...dataWithTimestamps,
          userId,
          createdAt: serverTimestamp()
        });
      }
      console.log('✅ Notes prepared for migration');

      // Migrate reminders
      for (const reminder of localData.reminders) {
        const { id, ...reminderData } = reminder;
        const docRef = doc(collection(db, COLLECTIONS.REMINDERS));
        const dataWithTimestamps = convertDatesToTimestamps(reminderData);
        batch.set(docRef, {
          ...dataWithTimestamps,
          userId,
          createdAt: serverTimestamp()
        });
      }
      console.log('✅ Reminders prepared for migration');

      // Migrate vendor info
      if (localData.vendorInfo) {
        const docRef = doc(collection(db, COLLECTIONS.VENDOR_INFO));
        batch.set(docRef, {
          ...localData.vendorInfo,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('✅ Vendor info prepared for migration');
      }

      await batch.commit();
      console.log('🎉 Migration completed successfully!');
    } catch (error) {
      console.error('💥 Migration failed:', error);
      throw error;
    }
  }
};