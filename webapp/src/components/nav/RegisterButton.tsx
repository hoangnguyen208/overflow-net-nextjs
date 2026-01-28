import {Button} from "@heroui/button";

export default function RegisterButton() {
    const clientId = process.env.AUTH_KEYCLOAK_ID;
    const issuer = process.env.AUTH_KEYCLOAK_ISSUER;
    const redirectUri = process.env.AUTH_URL;
    
    const registerUrl = issuer && clientId && redirectUri
        ? `${issuer}/protocol/openid-connect/registrations?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid`
        : null;
    
    return (
        <Button as={'a'} href={registerUrl!} color={'secondary'}>Register</Button>
    );
}