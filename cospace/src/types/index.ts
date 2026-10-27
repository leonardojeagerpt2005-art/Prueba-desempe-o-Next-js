import {
  Role,
  SpaceType,
  BookingStatus,
  User,
  Space,
  Booking,
} from "@prisma/client";
import type { Locale, Dictionary } from "@/lib/i18n/dictionaries";
import type { TokenPayload } from "@/lib/jwt";
import type { AuthenticatedUser } from "@/lib/auth-guard";

// Re-export Prisma models & Enums
export { Role, SpaceType, BookingStatus };
export type { User, Space, Booking };

// Re-export Auth & i18n Types
export type { Locale, Dictionary, TokenPayload, AuthenticatedUser };

// User & Auth Responses
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthSuccessResponse {
  message: string;
  user: UserResponse;
}

export interface AuthMeResponse {
  user: UserResponse;
}

export interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

// Spaces & Bookings DTOs & Summaries
export interface SpaceSummary {
  id: string;
  name: string;
  type: SpaceType | string;
  imageUrl: string;
  pricePerHour: number;
  capacity?: number;
  description?: string;
  isActive?: boolean;
}

export interface BookingItem {
  id: string;
  spaceId: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus | "CONFIRMED" | "CANCELLED";
  space: SpaceSummary;
}

export interface BookingWithSpace extends Booking {
  space: Space;
}

// Form Data Interfaces
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface BookingFormData {
  date: string;
  startHour: number;
  endHour: number;
}

export interface CreateSpaceFormData {
  name: string;
  description: string;
  type: SpaceType;
  capacity: number;
  pricePerHour: number;
  imageUrl: string;
}

export interface UpdateSpaceFormData {
  name?: string;
  description?: string;
  type?: SpaceType;
  capacity?: number;
  pricePerHour?: number;
  imageUrl?: string;
  isActive?: boolean;
}

// Component Props Interfaces
export interface SpaceCardProps {
  space: Space;
}

export interface BookingFormProps {
  spaceId: string;
  pricePerHour: number;
}

export interface AdminSpacesTableProps {
  initialSpaces: Space[];
}

export interface RouteParams {
  params: Promise<{ id: string }>;
}

export interface SpaceDetailPageProps {
  params: Promise<{ id: string }>;
}

export interface MotionRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "none";
  className?: string;
}

export interface SmoothScrollProps {
  children: React.ReactNode;
}

export interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpaceCreated: (newSpace: Space) => void;
}

