import {loadEnvConfig} from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

function getEnv(key: string) {
    const value = process.env[key];
    if (!value) throw new Error(`Missing env var: ${key}`);
    return value;
}

export const authConfig = {
    kcClientId: getEnv('AUTH_KEYCLOAK_ID'),
    kcIssuer: getEnv('AUTH_KEYCLOAK_ISSUER'),
    kcIssuerInternal: getEnv('AUTH_KEYCLOAK_ISSUER_INTERNAL'),
    authUrl: getEnv('AUTH_URL'),
    kcSecret: getEnv('AUTH_KEYCLOAK_SECRET'),
    authSecret: getEnv('AUTH_SECRET')
}

export const apiConfig = {
    apiUrl: getEnv('API_URL')
}

export const cloudinaryConfig = {
    cloudName: getEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
    apiKey: getEnv('NEXT_PUBLIC_CLOUDINARY_API_KEY'),
    apiSecret: getEnv('NEXT_PUBLIC_CLOUDINARY_API_SECRET')
}