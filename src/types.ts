export type Role = 'rider' | 'driver' | 'admin';
export type Language = 'ar' | 'fr';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
  ratingSum?: number;
  ratingCount?: number;
};

export type TripStatus = 'idle' | 'searching' | 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  isOnline: boolean;
  status: 'idle' | 'busy';
  carType?: string;
}

export interface Trip {
  id: string;
  riderId: string;
  riderPhone: string;
  riderName: string;
  riderLocationDescription: string;
  driverId?: string | null;
  driverPhone?: string | null;
  driverName?: string | null;
  status: TripStatus;
  createdAt: number;
}
