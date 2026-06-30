import { UserRole } from '../constants';
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}
export interface AuthenticatedUser {
    userId: string;
    email: string;
    role: UserRole;
}
