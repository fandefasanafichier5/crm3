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
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.CONTACTS), ...constraints));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Contact[];
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
    const constraints: QueryConstraint[] = [];
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.VENDOR_INFO), ...constraints));
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    return null;
  },

  async set(vendorInfo: any, userId: string): Promise<void> {
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
    } else {
      // Create new
      await addDoc(collection(db, COLLECTIONS.VENDOR_INFO), {
        ...vendorInfo,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
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

      // Migrate vendor info
      if (localData.vendorInfo) {
        const docRef = doc(collection(db, COLLECTIONS.VENDOR_INFO));
        batch.set(docRef, {
          ...localData.vendorInfo,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
};