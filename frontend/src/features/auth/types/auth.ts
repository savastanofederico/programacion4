export type RolUsuario = 'user' | 'admin';

export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: RolUsuario;
  disabled: boolean;
  created_at: string;
}

export interface RegisterPayload {
  username: string;
  full_name: string;
  email: string;
  password: string;
}
