export interface ITokenPayload {
  userId: string;
  storeId?: string | null;
  role: string;
}

export interface ITokenProvider {
  generateToken(payload: ITokenPayload): string;
  verifyToken(token: string): ITokenPayload;
}
