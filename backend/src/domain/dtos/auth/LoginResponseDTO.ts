export interface AuthenticatedUserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  storeId: string | null;
}

export class LoginResponseDTO {
  token!: string;
  user!: AuthenticatedUserPayload;
}
