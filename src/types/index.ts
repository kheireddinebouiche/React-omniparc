import { FieldValue } from 'firebase/firestore';
import { VerificationStatus } from './enums';

export enum UserRole {
  CLIENT = 'CLIENT',
  PROFESSIONAL = 'PROFESSIONAL',
  BUSINESS = 'BUSINESS',
  ADMIN = 'ADMIN',
}

export interface VerificationDocument {
  id: string;
  userId: string;
  name: string;
  type: string;
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadDate: string;
  comments?: string;
}

export interface VerificationHistory {
  id: string;
  userId: string;
  action: 'UPLOAD' | 'VERIFY' | 'REJECT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
  comments: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string | FieldValue;
  lastLogin: string | FieldValue;
  deliveryAddress?: Address;
  billingAddress?: Address;
  phoneNumber?: string;
  address?: string;
  companyName?: string;
  siret?: string;
  verificationStatus: VerificationStatus;
  documents?: VerificationDocument[];
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  specifications: Record<string, string>;
  ownerId: string;
  isAvailable: boolean;
  image?: string;
  location: string;
  userId: string;
  isActive: boolean;
  isRented: boolean;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
  availabilitySchedule?: {
    [key: string]: boolean;
  };
  minimumRentalPeriod?: number;
  depositAmount?: number;
  maintenanceHistory?: {
    date: string;
    description: string;
    cost: number;
    performedBy: string;
    type: 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE';
  }[];
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
    coverage: string;
  };
}

export interface RentalRequest {
  id: string;
  equipmentId: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
  equipmentOwnerId: string;
  clientName: string;
  equipmentName: string;
  createdAt: string;
  updatedAt: string;
  message?: string;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface Rating {
  id?: string;
  userId: string;
  equipmentId: string;
  rating: number;
  comment: string;
  createdAt: Date;
} 