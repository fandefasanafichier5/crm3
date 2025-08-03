import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Contact, Product, Order, Note, Reminder, VendorInfo } from '../utils/types';

// Contacts Service
export const contactsService = {
  async add(contact: Omit<Contact, 'id'>, userId: string) {
    console.log('💾 Adding contact for user:', userId);
    try {
      const docRef = await addDoc(collection(db, 'contacts'), {
        ...contact,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Contact added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding contact:', error);
      throw error;
    }
  },

  async update(id: string, contact: Partial<Contact>) {
    console.log('📝 Updating contact:', id);
    try {
      await updateDoc(doc(db, 'contacts', id), {
        ...contact,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Contact updated successfully');
    } catch (error) {
      console.error('❌ Error updating contact:', error);
      throw error;
    }
  },

  async delete(id: string) {
    console.log('🗑️ Deleting contact:', id);
    try {
      await deleteDoc(doc(db, 'contacts', id));
      console.log('✅ Contact deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting contact:', error);
      throw error;
    }
  },

  subscribe(userId: string, callback: (contacts: Contact[]) => void) {
    console.log('👂 Subscribing to contacts for user:', userId);
    const q = query(
      collection(db, 'contacts'),
      where('userId', '==', userId),
      orderBy('name')
    );

    return onSnapshot(q, (snapshot) => {
      const contacts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      console.log('📥 Received contacts update:', contacts.length, 'contacts');
      callback(contacts);
    }, (error) => {
      console.error('❌ Error in contacts subscription:', error);
    });
  }
};

// Products Service
export const productsService = {
  async add(product: Omit<Product, 'id'>, userId: string) {
    console.log('💾 Adding product for user:', userId);
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Product added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding product:', error);
      throw error;
    }
  },

  async update(id: string, product: Partial<Product>) {
    console.log('📝 Updating product:', id);
    try {
      await updateDoc(doc(db, 'products', id), {
        ...product,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Product updated successfully');
    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
  },

  async delete(id: string) {
    console.log('🗑️ Deleting product:', id);
    try {
      await deleteDoc(doc(db, 'products', id));
      console.log('✅ Product deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      throw error;
    }
  },

  subscribe(userId: string, callback: (products: Product[]) => void) {
    console.log('👂 Subscribing to products for user:', userId);
    const q = query(
      collection(db, 'products'),
      where('userId', '==', userId),
      orderBy('name')
    );

    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      console.log('📥 Received products update:', products.length, 'products');
      callback(products);
    }, (error) => {
      console.error('❌ Error in products subscription:', error);
    });
  }
};

// Orders Service
export const ordersService = {
  async add(order: Omit<Order, 'id'>, userId: string) {
    console.log('💾 Adding order for user:', userId);
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Order added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding order:', error);
      throw error;
    }
  },

  async update(id: string, order: Partial<Order>) {
    console.log('📝 Updating order:', id);
    try {
      await updateDoc(doc(db, 'orders', id), {
        ...order,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Order updated successfully');
    } catch (error) {
      console.error('❌ Error updating order:', error);
      throw error;
    }
  },

  async delete(id: string) {
    console.log('🗑️ Deleting order:', id);
    try {
      await deleteDoc(doc(db, 'orders', id));
      console.log('✅ Order deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting order:', error);
      throw error;
    }
  },

  subscribe(userId: string, callback: (orders: Order[]) => void) {
    console.log('👂 Subscribing to orders for user:', userId);
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      console.log('📥 Received orders update:', orders.length, 'orders');
      callback(orders);
    }, (error) => {
      console.error('❌ Error in orders subscription:', error);
    });
  }
};

// Notes Service
export const notesService = {
  async add(note: Omit<Note, 'id'>, userId: string) {
    console.log('💾 Adding note for user:', userId);
    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        ...note,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Note added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding note:', error);
      throw error;
    }
  },

  async update(id: string, note: Partial<Note>) {
    console.log('📝 Updating note:', id);
    try {
      await updateDoc(doc(db, 'notes', id), {
        ...note,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Note updated successfully');
    } catch (error) {
      console.error('❌ Error updating note:', error);
      throw error;
    }
  },

  async delete(id: string) {
    console.log('🗑️ Deleting note:', id);
    try {
      await deleteDoc(doc(db, 'notes', id));
      console.log('✅ Note deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      throw error;
    }
  },

  subscribe(userId: string, callback: (notes: Note[]) => void) {
    console.log('👂 Subscribing to notes for user:', userId);
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      console.log('📥 Received notes update:', notes.length, 'notes');
      callback(notes);
    }, (error) => {
      console.error('❌ Error in notes subscription:', error);
    });
  }
};

// Reminders Service
export const remindersService = {
  async add(reminder: Omit<Reminder, 'id'>, userId: string) {
    console.log('💾 Adding reminder for user:', userId);
    try {
      const docRef = await addDoc(collection(db, 'reminders'), {
        ...reminder,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Reminder added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding reminder:', error);
      throw error;
    }
  },

  async update(id: string, reminder: Partial<Reminder>) {
    console.log('📝 Updating reminder:', id);
    try {
      await updateDoc(doc(db, 'reminders', id), {
        ...reminder,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Reminder updated successfully');
    } catch (error) {
      console.error('❌ Error updating reminder:', error);
      throw error;
    }
  },

  async delete(id: string) {
    console.log('🗑️ Deleting reminder:', id);
    try {
      await deleteDoc(doc(db, 'reminders', id));
      console.log('✅ Reminder deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting reminder:', error);
      throw error;
    }
  },

  subscribe(userId: string, callback: (reminders: Reminder[]) => void) {
    console.log('👂 Subscribing to reminders for user:', userId);
    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', userId),
      orderBy('dueDate')
    );

    return onSnapshot(q, (snapshot) => {
      const reminders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reminder[];
      console.log('📥 Received reminders update:', reminders.length, 'reminders');
      callback(reminders);
    }, (error) => {
      console.error('❌ Error in reminders subscription:', error);
    });
  }
};

// Vendor Info Service
export const vendorInfoService = {
  async update(vendorInfo: VendorInfo, userId: string) {
    console.log('💾 Updating vendor info for user:', userId);
    try {
      const docRef = doc(db, 'vendorInfo', userId);
      await updateDoc(docRef, {
        ...vendorInfo,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Vendor info updated successfully');
    } catch (error) {
      console.error('❌ Error updating vendor info:', error);
      throw error;
    }
  },

  async add(vendorInfo: VendorInfo, userId: string) {
    console.log('💾 Adding vendor info for user:', userId);
    try {
      await addDoc(collection(db, 'vendorInfo'), {
        ...vendorInfo,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Vendor info added successfully');
    } catch (error) {
      console.error('❌ Error adding vendor info:', error);
      throw error;
    }
  },

  subscribe(userId: string, callback: (vendorInfo: VendorInfo | null) => void) {
    console.log('👂 Subscribing to vendor info for user:', userId);
    const q = query(
      collection(db, 'vendorInfo'),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const vendorInfo = snapshot.docs.length > 0 
        ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as VendorInfo
        : null;
      console.log('📥 Received vendor info update:', vendorInfo ? 'found' : 'not found');
      callback(vendorInfo);
    }, (error) => {
      console.error('❌ Error in vendor info subscription:', error);
    });
  }
};