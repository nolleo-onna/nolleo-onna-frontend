export interface User {
    userId: number;
    email: string;
    nickname: string;
    profileImageUrl?: string;
    role: "USER" | "ADMIN";
  }
  
  export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
  }