export enum UserRole {
  CLIENT = 'CLIENT',
  PROFESSIONAL = 'PROFESSIONAL',
  BUSINESS = 'BUSINESS',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  specifications: Record<string, string>;
  isAvailable: boolean;
  ownerId: string;
  image?: string;
}

export interface RentalRequest {
  id: string;
  equipmentId: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
} 