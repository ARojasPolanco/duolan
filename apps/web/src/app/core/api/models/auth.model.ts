import type { Country, UserRole, UserStatus } from './enums';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  status: UserStatus;
  ageConfirmedAt: string | null;
  termsAcceptedAt: string | null;
  warningCount: number;
  profileCompleted: boolean;
  country?: Country | null;
  createdAt?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  ageConfirmed: true;
  termsAccepted: true;
  captchaToken?: string;
}

export interface AuthResponse {
  status: 'success';
  token: string;
  user: AuthUser;
  recovered?: boolean;
}

export interface AuthProfileResponse {
  status: 'success';
  user: AuthUser;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type ChangePasswordResponse = AuthResponse;

export interface MessageResponse {
  status: 'success';
  message: string;
}

export type VerifyEmailResponse = MessageResponse;
export type ResendVerificationResponse = MessageResponse;
export type ForgotPasswordResponse = MessageResponse;
export type ResetPasswordResponse = MessageResponse;

export interface DeleteAccountRequest {
  password: string;
}

export interface DeleteAccountResponse {
  status: 'success';
  deletionScheduledFor: string;
}
