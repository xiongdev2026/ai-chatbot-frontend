export interface User {
  id: string;
  email: string;
  password?: string;
  fullName?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface PublicUser {
  id: string;
  email: string;
  fullName?: string | null;
  role: Role;
  isActive: boolean;
}

export interface LoginResponse {
  status: "success" | "fail" | "error";
  message: string;
  data: {
    user: PublicUser;
    token?: string;
  };
}
