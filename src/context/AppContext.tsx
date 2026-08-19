'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  StoredCustomer,
  Booking,
  CleanerAvailability,
  ConflictAlert,
  ServicePackage,
  ExtraAddon,
  BookingStatus,
  PAYMENT_ACCOUNT_DETAILS,
} from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

// Simple deterministic hash for demo password storage
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

const LS_CUSTOMERS_KEY = 'sparkle_customers';
const LS_SESSION_KEY  = 'sparkle_session';

export const INITIAL_SERVICES: ServicePackage[] = [
  {
    id: 'deep-clean',
    name: 'Deep Home Clean',
    description: 'Thorough top-to-bottom scrub including baseboards, high dusting, and detail sanitization.',
    basePrice: 45000,
    iconName: 'Sparkles',
    estimatedHours: 4,
  },
  {
    id: 'standard-clean',
    name: 'Standard Routine Clean',
    description: 'Essential recurring upkeep for kitchens, bathrooms, living areas, and bed making.',
    basePrice: 25000,
    iconName: 'Home',
    estimatedHours: 2.5,
  },
  {
    id: 'move-in-out',
    name: 'Move In / Move Out',
    description: 'Deep spotless reset for vacant properties. Guaranteed checklist compliance for landlords.',
    basePrice: 65000,
    iconName: 'Truck',
    estimatedHours: 5,
  },
  {
    id: 'post-construction',
    name: 'Post-Renovation Clean',
    description: 'Heavy duty dust removal, adhesive scrape, and shine polish for freshly remodeled homes.',
    basePrice: 90000,
    iconName: 'Wrench',
    estimatedHours: 6,
  },
];

export const INITIAL_ADDONS: ExtraAddon[] = [
  { id: 'fridge', name: 'Inside Fridge', price: 6000, iconName: 'Refrigerator' },
  { id: 'oven', name: 'Inside Oven', price: 7000, iconName: 'Flame' },
  { id: 'windows', name: 'Interior Windows', price: 8000, iconName: 'Sun' },
  { id: 'laundry', name: 'Wash & Fold Laundry', price: 8000, iconName: 'Shirt' },
  { id: 'balcony', name: 'Balcony / Patio Sweep', price: 5000, iconName: 'Wind' },
];

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'u-cust-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+234 803 123 4567',
  },
  {
    id: 'u-clean-1',
    name: 'Amina Adebayo',
    email: 'amina.cleaner@example.com',
    role: 'cleaner',
    avatar: '/amina_cleaner.png',
    phone: '+234 812 345 6789',
    rating: 4.9,
    completedJobsCount: 142,
  },
  {
    id: 'u-clean-2',
    name: 'Emeka Nnamdi',
    email: 'emeka.n@example.com',
    role: 'cleaner',
    avatar: '/emeka_cleaner.png',
    phone: '+234 809 876 5432',
    rating: 4.8,
    completedJobsCount: 98,
  },
  {
    id: 'u-admin-1',
    name: 'Alex Rivera (Manager)',
    email: 'admin@sparkleclean.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

export const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:30 AM - 12:30 PM',
  '01:00 PM - 03:00 PM',
  '03:30 PM - 05:30 PM',
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'BK-1001',
    customerId: 'u-cust-1',
    customerName: 'Sarah Jenkins',
    customerPhone: '+234 803 123 4567',
    address: '742 Evergreen Terrace, Lekki Phase 1',
    serviceId: 'deep-clean',
    serviceName: 'Deep Home Clean',
    bedrooms: 2,
    bathrooms: 2,
    addons: ['fridge', 'windows'],
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00 AM - 10:00 AM',
    totalAmount: 59000,
    status: 'in_progress',
    cleanerId: 'u-clean-1',
    cleanerName: 'Amina Adebayo',
    paymentMethod: 'Bank Transfer (OPAY)',
    paymentAccount: `${PAYMENT_ACCOUNT_DETAILS.bankName} - ${PAYMENT_ACCOUNT_DETAILS.accountNumber} (${PAYMENT_ACCOUNT_DETAILS.accountName})`,
    paymentReference: 'OPAY-TRX-83921',
    paymentStatus: 'verified',
    notes: 'Please watch out for friendly cat (Milo). Key is with security at gate.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'BK-1002',
    customerId: 'u-cust-1',
    customerName: 'Sarah Jenkins',
    customerPhone: '+234 803 123 4567',
    address: '742 Evergreen Terrace, Lekki Phase 1',
    serviceId: 'standard-clean',
    serviceName: 'Standard Routine Clean',
    bedrooms: 1,
    bathrooms: 1,
    addons: ['laundry'],
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '10:30 AM - 12:30 PM',
    totalAmount: 33000,
    status: 'assigned',
    cleanerId: 'u-clean-2',
    cleanerName: 'Emeka Nnamdi',
    paymentMethod: 'Bank Transfer (OPAY)',
    paymentAccount: `${PAYMENT_ACCOUNT_DETAILS.bankName} - ${PAYMENT_ACCOUNT_DETAILS.accountNumber} (${PAYMENT_ACCOUNT_DETAILS.accountName})`,
    paymentStatus: 'pending',
    notes: 'Standard upkeep clean.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'BK-1000',
    customerId: 'u-cust-1',
    customerName: 'Sarah Jenkins',
    customerPhone: '+234 803 123 4567',
    address: '742 Evergreen Terrace, Lekki Phase 1',
    serviceId: 'move-in-out',
    serviceName: 'Move In / Move Out',
    bedrooms: 3,
    bathrooms: 2,
    addons: ['fridge', 'oven', 'windows'],
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    timeSlot: '01:00 PM - 03:00 PM',
    totalAmount: 86000,
    status: 'completed',
    cleanerId: 'u-clean-1',
    cleanerName: 'Amina Adebayo',
    paymentMethod: 'Bank Transfer (OPAY)',
    paymentAccount: `${PAYMENT_ACCOUNT_DETAILS.bankName} - ${PAYMENT_ACCOUNT_DETAILS.accountNumber} (${PAYMENT_ACCOUNT_DETAILS.accountName})`,
    paymentReference: 'OPAY-TRX-55102',
    paymentStatus: 'verified',
    proofNote: 'Property completely spotless. Keys returned to facility manager.',
    proofTime: '5 days ago',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];


const INITIAL_AVAILABILITY: CleanerAvailability[] = [

  {
    cleanerId: 'u-clean-1',
    cleanerName: 'Amina Adebayo',
    dayOfWeek: 1,
    timeSlots: ['08:00 AM - 10:00 AM', '10:30 AM - 12:30 PM', '01:00 PM - 03:00 PM'],
    isAvailable: true,
  },
  {
    cleanerId: 'u-clean-1',
    cleanerName: 'Amina Adebayo',
    dayOfWeek: 2,
    timeSlots: ['08:00 AM - 10:00 AM', '10:30 AM - 12:30 PM'],
    isAvailable: true,
  },
  {
    cleanerId: 'u-clean-2',
    cleanerName: 'Emeka Nnamdi',
    dayOfWeek: 1,
    timeSlots: ['10:30 AM - 12:30 PM', '01:00 PM - 03:00 PM', '03:30 PM - 05:30 PM'],
    isAvailable: true,
  },
];

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  bookings: Booking[];
  cleaners: UserProfile[];
  availability: CleanerAvailability[];
  conflicts: ConflictAlert[];
  services: ServicePackage[];
  addons: ExtraAddon[];
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus, proofNote?: string) => void;
  updatePaymentStatus: (bookingId: string, paymentStatus: 'pending' | 'verified' | 'paid', reference?: string) => void;
  assignCleanerToBooking: (bookingId: string, cleanerId: string) => { success: boolean; conflictReason?: string };
  toggleCleanerSlotAvailability: (cleanerId: string, dayOfWeek: number, slot: string) => void;
  checkSlotConflict: (cleanerId: string, date: string, timeSlot: string, currentBookingId?: string) => string | null;
  isBackendConnected: boolean;
  // Auth
  isCustomerLoggedIn: boolean;
  registeredCustomers: StoredCustomer[];
  customerLogin: (email: string, password: string) => { success: boolean; error?: string };
  customerLogout: () => void;
  customerRegister: (name: string, email: string, password: string, phone: string) => { success: boolean; error?: string };
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [cleaners] = useState<UserProfile[]>(MOCK_USERS.filter((u) => u.role === 'cleaner'));
  const [availability, setAvailability] = useState<CleanerAvailability[]>(INITIAL_AVAILABILITY);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([]);

  // ─── Auth State ───────────────────────────────────────────────────────────
  const loadCustomers = (): StoredCustomer[] => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(LS_CUSTOMERS_KEY) || '[]'); } catch { return []; }
  };

  const saveCustomers = (list: StoredCustomer[]) => {
    localStorage.setItem(LS_CUSTOMERS_KEY, JSON.stringify(list));
  };

  const loadSession = (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem(LS_SESSION_KEY) || 'null'); } catch { return null; }
  };

  // Default non-customer user for cleaner/admin role switching
  const defaultStaffUser = MOCK_USERS[0];
  const [currentUser, setCurrentUserState] = useState<UserProfile>(defaultStaffUser);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState<boolean>(false);

  const [registeredCustomers, setRegisteredCustomers] = useState<StoredCustomer[]>(() => {
    const list = loadCustomers();
    if (list.length === 0) {
      const initial: StoredCustomer[] = [
        {
          id: 'u-cust-1',
          name: 'Sarah Jenkins',
          email: 'sarah.j@example.com',
          phone: '+1 (555) 234-5678',
          passwordHash: simpleHash('password123'),
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        },
      ];
      return initial;
    }
    return list;
  });

  // On mount: restore session from localStorage
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setCurrentUserState(session);
      setIsCustomerLoggedIn(true);
    }
  }, []);

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
  };

  const customerLogin = (email: string, password: string): { success: boolean; error?: string } => {
    const customers = loadCustomers();
    const found = customers.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.passwordHash === simpleHash(password)
    );
    if (!found) return { success: false, error: 'Invalid email or password.' };
    const userProfile: UserProfile = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: 'customer',
      avatar: found.avatar,
      phone: found.phone,
    };
    setCurrentUserState(userProfile);
    setIsCustomerLoggedIn(true);
    localStorage.setItem(LS_SESSION_KEY, JSON.stringify(userProfile));
    return { success: true };
  };

  const customerLogout = () => {
    setCurrentUserState(defaultStaffUser);
    setIsCustomerLoggedIn(false);
    localStorage.removeItem(LS_SESSION_KEY);
  };

  const customerRegister = (
    name: string, email: string, password: string, phone: string
  ): { success: boolean; error?: string } => {
    const customers = loadCustomers();
    if (customers.find((c) => c.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const newCustomer: StoredCustomer = {
      id: `cust-${Date.now()}`,
      name,
      email,
      passwordHash: simpleHash(password),
      phone,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&bold=true&size=150`,
      createdAt: new Date().toISOString(),
    };
    const updatedList = [...customers, newCustomer];
    saveCustomers(updatedList);
    setRegisteredCustomers(updatedList);
    const userProfile: UserProfile = {
      id: newCustomer.id,
      name: newCustomer.name,
      email: newCustomer.email,
      role: 'customer',
      avatar: newCustomer.avatar,
      phone: newCustomer.phone,
    };
    setCurrentUserState(userProfile);
    setIsCustomerLoggedIn(true);
    localStorage.setItem(LS_SESSION_KEY, JSON.stringify(userProfile));
    return { success: true };
  };
  // ─────────────────────────────────────────────────────────────────────────

  // Fetch initial data from Supabase if configured
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    const fetchSupabaseData = async () => {
      try {
        const { data: dbBookings, error } = await client.from('bookings').select('*').order('created_at', { ascending: false });
        if (!error && dbBookings && dbBookings.length > 0) {
          const mappedBookings: Booking[] = dbBookings.map((b: any) => ({
            id: b.id,
            customerId: b.customer_id,
            customerName: b.customer_name,
            customerPhone: b.customer_phone,
            address: b.address,
            serviceId: b.service_id,
            serviceName: b.service_name,
            bedrooms: b.bedrooms,
            bathrooms: b.bathrooms,
            addons: b.addons || [],
            date: b.date,
            timeSlot: b.time_slot,
            totalAmount: Number(b.total_amount),
            status: b.status as BookingStatus,
            cleanerId: b.cleaner_id || undefined,
            cleanerName: b.cleaner_name || undefined,
            notes: b.notes || undefined,
            proofNote: b.proof_note || undefined,
            proofTime: b.proof_time || undefined,
            createdAt: b.created_at,
          }));
          setBookings(mappedBookings);
        }
      } catch (err) {
        console.warn('Supabase fetch notice:', err);
      }
    };

    fetchSupabaseData();
  }, []);

  const checkSlotConflict = (cleanerId: string, date: string, timeSlot: string, currentBookingId?: string): string | null => {
    const existing = bookings.find(
      (b) => b.cleanerId === cleanerId && b.date === date && b.timeSlot === timeSlot && b.status !== 'cancelled' && b.id !== currentBookingId
    );
    if (existing) {
      return `Cleaner is already booked for ${existing.serviceName} (#${existing.id}) at this time slot on ${date}.`;
    }
    return null;
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking => {
    const newId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    let assignedCleaner: UserProfile | undefined = undefined;
    if (bookingData.cleanerId) {
      assignedCleaner = cleaners.find((c) => c.id === bookingData.cleanerId);
    } else {
      assignedCleaner = cleaners.find((c) => !checkSlotConflict(c.id, bookingData.date, bookingData.timeSlot));
    }

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      status: assignedCleaner ? 'assigned' : 'pending',
      cleanerId: assignedCleaner?.id,
      cleanerName: assignedCleaner?.name,
      paymentMethod: bookingData.paymentMethod || 'Bank Transfer (OPAY)',
      paymentAccount: `${PAYMENT_ACCOUNT_DETAILS.bankName} - ${PAYMENT_ACCOUNT_DETAILS.accountNumber} (${PAYMENT_ACCOUNT_DETAILS.accountName})`,
      paymentStatus: bookingData.paymentStatus || 'pending',
      paymentReference: bookingData.paymentReference || undefined,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Push to Supabase if configured
    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.from('bookings').insert([{
        id: newBooking.id,
        customer_id: newBooking.customerId,
        customer_name: newBooking.customerName,
        customer_phone: newBooking.customerPhone,
        address: newBooking.address,
        service_id: newBooking.serviceId,
        service_name: newBooking.serviceName,
        bedrooms: newBooking.bedrooms,
        bathrooms: newBooking.bathrooms,
        addons: newBooking.addons,
        date: newBooking.date,
        time_slot: newBooking.timeSlot,
        total_amount: newBooking.totalAmount,
        status: newBooking.status,
        cleaner_id: newBooking.cleanerId,
        cleaner_name: newBooking.cleanerName,
        notes: newBooking.notes,
        payment_method: newBooking.paymentMethod,
        payment_account: newBooking.paymentAccount,
        payment_reference: newBooking.paymentReference,
        payment_status: newBooking.paymentStatus,
      }]).then(({ error }) => {
        if (error) console.error('Error creating booking in Supabase:', error);
      });
    }

    if (!assignedCleaner) {
      setConflicts((prev) => [
        ...prev,
        {
          id: `conf-${Date.now()}`,
          bookingId: newId,
          cleanerId: '',
          reason: `No cleaner assigned for ${bookingData.date} (${bookingData.timeSlot}). Manual assignment required.`,
          severity: 'warning',
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus, proofNote?: string) => {
    const proofTime = proofNote ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status,
            proofNote: proofNote || b.proofNote,
            proofTime: proofTime || b.proofTime,
          };
        }
        return b;
      })
    );

    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.from('bookings').update({
        status,
        proof_note: proofNote,
        proof_time: proofTime,
      }).eq('id', bookingId).then(({ error }) => {
        if (error) console.error('Error updating status in Supabase:', error);
      });
    }
  };

  const updatePaymentStatus = (bookingId: string, paymentStatus: 'pending' | 'verified' | 'paid', reference?: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            paymentStatus,
            paymentReference: reference || b.paymentReference,
          };
        }
        return b;
      })
    );

    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.from('bookings').update({
        payment_status: paymentStatus,
        payment_reference: reference,
      }).eq('id', bookingId).then(({ error }) => {
        if (error) console.error('Error updating payment status in Supabase:', error);
      });
    }
  };

  const assignCleanerToBooking = (bookingId: string, cleanerId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, conflictReason: 'Booking not found' };

    const conflict = checkSlotConflict(cleanerId, booking.date, booking.timeSlot, bookingId);
    if (conflict) {
      setConflicts((prev) => [
        ...prev,
        {
          id: `conf-${Date.now()}`,
          bookingId,
          cleanerId,
          reason: conflict,
          severity: 'critical',
          createdAt: new Date().toISOString(),
        },
      ]);
      return { success: false, conflictReason: conflict };
    }

    const cleanerObj = cleaners.find((c) => c.id === cleanerId);
    const updatedStatus = booking.status === 'pending' ? 'assigned' : booking.status;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            cleanerId,
            cleanerName: cleanerObj?.name || 'Assigned Cleaner',
            status: updatedStatus,
          };
        }
        return b;
      })
    );

    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.from('bookings').update({
        cleaner_id: cleanerId,
        cleaner_name: cleanerObj?.name || 'Assigned Cleaner',
        status: updatedStatus,
      }).eq('id', bookingId).then(({ error }) => {
        if (error) console.error('Error assigning cleaner in Supabase:', error);
      });
    }

    setConflicts((prev) => prev.filter((c) => c.bookingId !== bookingId));

    return { success: true };
  };

  const toggleCleanerSlotAvailability = (cleanerId: string, dayOfWeek: number, slot: string) => {
    setAvailability((prev) => {
      const existing = prev.find((a) => a.cleanerId === cleanerId && a.dayOfWeek === dayOfWeek);
      if (existing) {
        const hasSlot = existing.timeSlots.includes(slot);
        const updatedSlots = hasSlot
          ? existing.timeSlots.filter((s) => s !== slot)
          : [...existing.timeSlots, slot];
        return prev.map((a) =>
          a.cleanerId === cleanerId && a.dayOfWeek === dayOfWeek ? { ...a, timeSlots: updatedSlots } : a
        );
      } else {
        const cleanerObj = cleaners.find((c) => c.id === cleanerId);
        return [
          ...prev,
          {
            cleanerId,
            cleanerName: cleanerObj?.name || 'Cleaner',
            dayOfWeek,
            timeSlots: [slot],
            isAvailable: true,
          },
        ];
      }
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        bookings,
        cleaners,
        availability,
        conflicts,
        services: INITIAL_SERVICES,
        addons: INITIAL_ADDONS,
        createBooking,
        updateBookingStatus,
        updatePaymentStatus,
        assignCleanerToBooking,
        toggleCleanerSlotAvailability,
        checkSlotConflict,
        isBackendConnected: isSupabaseConfigured,
        isCustomerLoggedIn,
        registeredCustomers,
        customerLogin,
        customerLogout,
        customerRegister,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
