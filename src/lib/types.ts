export type UserRole = 'customer' | 'cleaner' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  rating?: number;
  completedJobsCount?: number;
}

export type BookingStatus = 'pending' | 'assigned' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  iconName: string;
  estimatedHours: number;
}

export interface ExtraAddon {
  id: string;
  name: string;
  price: number;
  iconName: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  serviceId: string;
  serviceName: string;
  bedrooms: number;
  bathrooms: number;
  addons: string[]; // Addon IDs
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "09:00 AM - 11:00 AM"
  totalAmount: number;
  status: BookingStatus;
  cleanerId?: string;
  cleanerName?: string;
  notes?: string;
  createdAt: string;
  proofNote?: string;
  proofTime?: string;
}

export interface CleanerAvailability {
  cleanerId: string;
  cleanerName: string;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  timeSlots: string[]; // e.g. ["09:00 AM - 11:00 AM", "11:30 AM - 01:30 PM", "02:00 PM - 04:00 PM"]
  isAvailable: boolean;
}

export interface ConflictAlert {
  id: string;
  bookingId: string;
  cleanerId: string;
  reason: string;
  severity: 'warning' | 'critical';
  createdAt: string;
}
