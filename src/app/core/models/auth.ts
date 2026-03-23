export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  errors: string[] | null;
}

export interface LoginResponse {
  token: string;
  role: string;
}

export interface UserResponse {
  userId: number;
  userName: string;
  email: string;
  phoneNumber: string;
  role: string;
  accountStatus: string;
}