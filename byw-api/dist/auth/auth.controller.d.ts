import { AuthenticatedUser } from './interfaces/jwt-payload.interface';
export declare class AuthController {
    getProfile(request: {
        user: AuthenticatedUser;
    }): AuthenticatedUser;
    getAdminCheck(): {
        ok: boolean;
    };
}
