declare const _default: (() => {
    jwtSecret: string;
    jwtExpiresIn: string;
    adminEmail: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    jwtSecret: string;
    jwtExpiresIn: string;
    adminEmail: string;
}>;
export default _default;
