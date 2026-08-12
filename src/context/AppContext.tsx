'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  UserProfile,
  Booking,
  CleanerAvailability,
  ConflictAlert,
  ServicePackage,
  ExtraAddon,
  BookingStatus,
} from '@/lib/types';

export const INITIAL_SERVICES: ServicePackage[] = [
  {
    id: 'deep-clean',
    name: 'Deep Home Clean',
    description: 'Thorough top-to-bottom scrub including baseboards, high dusting, and detail sanitization.',
    basePrice: 120,
    iconName: 'Sparkles',
    estimatedHours: 4,
  },
  {
    id: 'standard-clean',
    name: 'Standard Routine Clean',
    description: 'Essential recurring upkeep for kitchens, bathrooms, living areas, and bed making.',
    basePrice: 75,
    iconName: 'Home',
    estimatedHours: 2.5,
  },
  {
    id: 'move-in-out',
    name: 'Move In / Move Out',
    description: 'Deep spotless reset for vacant properties. Guaranteed checklist compliance for landlords.',
    basePrice: 160,
    iconName: 'Truck',
    estimatedHours: 5,
  },
  {
    id: 'post-construction',
    name: 'Post-Renovation Clean',
    description: 'Heavy duty dust removal, adhesive scrape, and shine polish for freshly remodeled homes.',
    basePrice: 200,
    iconName: 'Wrench',
    estimatedHours: 6,
  },
];

export const INITIAL_ADDONS: ExtraAddon[] = [
  { id: 'fridge', name: 'Inside Fridge', price: 25, iconName: 'Refrigerator' },
  { id: 'oven', name: 'Inside Oven', price: 30, iconName: 'Flame' },
  { id: 'windows', name: 'Interior Windows', price: 35, iconName: 'Sun' },
  { id: 'laundry', name: 'Wash & Fold Laundry', price: 25, iconName: 'Shirt' },
  { id: 'balcony', name: 'Balcony / Patio Sweep', price: 20, iconName: 'Wind' },
];

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'u-cust-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-5678',
  },
  {
    id: 'u-clean-1',
    name: 'Elena Rostova',
    email: 'elena.cleaner@example.com',
    role: 'cleaner',
    avatar: '/elena_cleaner.png',
    phone: '+1 (555) 876-5432',
    rating: 4.9,
    completedJobsCount: 142,
  },
  {
    id: 'u-clean-2',
    name: 'Marcus Vance',
    email: 'marcus.v@example.com',
    role: 'cleaner',
    avatar: '/marcus_cleaner.png',
    phone: '+1 (555) 345-6789',
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
    customerPhone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Suite 4B',
    serviceId: 'deep-clean',
    serviceName: 'Deep Home Clean',
    bedrooms: 2,
    bathrooms: 2,
    addons: ['fridge', 'windows'],
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00 AM - 10:00 AM',
    totalAmount: 195,
    status: 'in_progress',
    cleanerId: 'u-clean-1',
    cleanerName: 'Elena Rostova',
    notes: 'Please watch out for friendly cat (Milo). Key is under the plant pot.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'BK-1002',
    customerId: 'u-cust-1',
    customerName: 'Sarah Jenkins',
    customerPhone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Suite 4B',
    serviceId: 'standard-clean',
    serviceName: 'Standard Routine Clean',
    bedrooms: 1,
    bathrooms: 1,
    addons: ['laundry'],
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '10:30 AM - 12:30 PM',
    totalAmount: 100,
    status: 'assigned',
    cleanerId: 'u-clean-2',
    cleanerName: 'Marcus Vance',
    notes: 'Standard upkeep clean.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'BK-1000',
    customerId: 'u-cust-1',
    customerName: 'Sarah Jenkins',
    customerPhone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Suite 4B',
    serviceId: 'move-in-out',
    serviceName: 'Move In / Move Out',
    bedrooms: 3,
    bathrooms: 2,
    addons: ['fridge', 'oven', 'windows'],
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    timeSlot: '01:00 PM - 03:00 PM',
    totalAmount: 265,
    status: 'completed',
    cleanerId: 'u-clean-1',
    cleanerName: 'Elena Rostova',
    proofNote: 'Property completely spotless. Keys left on counter.',
    proofTime: '5 days ago',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

const INITIAL_AVAILABILITY: CleanerAvailability[] = [
  {
    cleanerId: 'u-clean-1',
    cleanerName: 'Elena Rostova',
    dayOfWeek: 1, // Mon
    timeSlots: ['08:00 AM - 10:00 AM', '10:30 AM - 12:30 PM', '01:00 PM - 03:00 PM'],
    isAvailable: true,
  },
  {
    cleanerId: 'u-clean-1',
    cleanerName: 'Elena Rostova',
    dayOfWeek: 2, // Tue
    timeSlots: ['08:00 AM - 10:00 AM', '10:30 AM - 12:30 PM'],
    isAvailable: true,
  },
  {
    cleanerId: 'u-clean-2',
    cleanerName: 'Marcus Vance',
    dayOfWeek: 1, // Mon
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
  assignCleanerToBooking: (bookingId: string, cleanerId: string) => { success: boolean; conflictReason?: string };
  toggleCleanerSlotAvailability: (cleanerId: string, dayOfWeek: number, slot: string) => void;
  checkSlotConflict: (cleanerId: string, date: string, timeSlot: string, currentBookingId?: string) => string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]); // Default Customer
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [cleaners] = useState<UserProfile[]>(MOCK_USERS.filter((u) => u.role === 'cleaner'));
  const [availability, setAvailability] = useState<CleanerAvailability[]>(INITIAL_AVAILABILITY);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([]);

  // Function to check if assigning a cleaner creates a double-booking or unavailability conflict
  const checkSlotConflict = (cleanerId: string, date: string, timeSlot: string, currentBookingId?: string): string | null => {
    // 1. Check double booking for the cleaner at the given date and timeSlot
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
    
    // Auto-assign available cleaner if possible
    let assignedCleaner: UserProfile | undefined = undefined;
    if (bookingData.cleanerId) {
      assignedCleaner = cleaners.find((c) => c.id === bookingData.cleanerId);
    } else {
      // Find first cleaner without conflict
      assignedCleaner = cleaners.find((c) => !checkSlotConflict(c.id, bookingData.date, bookingData.timeSlot));
    }

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      status: assignedCleaner ? 'assigned' : 'pending',
      cleanerId: assignedCleaner?.id,
      cleanerName: assignedCleaner?.name,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Check if auto-assigned created any alert
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
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status,
            proofNote: proofNote || b.proofNote,
            proofTime: proofNote ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : b.proofTime,
          };
        }
        return b;
      })
    );
  };

  const assignCleanerToBooking = (bookingId: string, cleanerId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, conflictReason: 'Booking not found' };

    const conflict = checkSlotConflict(cleanerId, booking.date, booking.timeSlot, bookingId);
    if (conflict) {
      // Record conflict in state for admin visibility
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

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            cleanerId,
            cleanerName: cleanerObj?.name || 'Assigned Cleaner',
            status: b.status === 'pending' ? 'assigned' : b.status,
          };
        }
        return b;
      })
    );

    // Remove any unresolved conflicts for this booking
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
        assignCleanerToBooking,
        toggleCleanerSlotAvailability,
        checkSlotConflict,
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
