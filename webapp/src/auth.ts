import NextAuth from "next-auth"
import Keycloak from "next-auth/providers/keycloak"
import {apiConfig, authConfig} from "@/lib/config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Keycloak({
        authorization: {
            params: {
                scope: 'openid profile email offline_access'
            },
            url: `${authConfig.kcIssuer}/protocol/openid-connect/auth`
        },
        token: `${authConfig.kcIssuerInternal}/protocol/openid-connect/token`,
        userinfo: `${authConfig.kcIssuerInternal}/protocol/openid-connect/userinfo`
    })],
    callbacks: {
        async jwt({ token, account, profile }) {
            const now = Math.floor(Date.now() / 1000);
            
            if (account && account.access_token && account.refresh_token) {
                const res = await fetch(apiConfig.apiUrl + '/profiles/me', {
                    headers: {Authorization: `Bearer ${account.access_token}`}
                })
                
                if (res.ok) {
                    token.user = await res.json();
                } else {
                    console.log('Failed to fetch user profile: ', await res.text());
                }
                
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.accessTokenExpires = now + account.expires_in!;
                token.error = undefined;
                return token;
            }
            
            if (token.accessTokenExpires && now < token.accessTokenExpires) {
                return token;
            }

            try {
                const response = await fetch(`${authConfig.kcIssuer}/protocol/openid-connect/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        grant_type: 'refresh_token',
                        client_id: authConfig.kcClientId || '',
                        client_secret: authConfig.kcSecret || '',
                        refresh_token: token.refreshToken
                    })
                });
                
                const refreshedTokens = await response.json();
                
                if (!response.ok) {
                    console.log('Failed to refresh access token');
                    token.error = 'RefreshAccessTokenError';
                    return token;
                }
                
                token.accessToken = refreshedTokens.access_token;
                token.refreshToken = refreshedTokens.refresh_token ?? token.refreshToken;
                token.accessTokenExpires = now + refreshedTokens.expires_in;
                token.error = undefined;
            } catch (e) {
                console.log('Error refreshing access token:', e);
                token.error = 'RefreshAccessTokenError';
            }
            
            return token;
        },
        async session({ session, token }) {
            if (token.user) {
                session.user = token.user;
            }
            if (token.accessToken) {
                session.accessToken = token.accessToken;
            }
            if (token.accessTokenExpires) {
                session.expires = new Date(token.accessTokenExpires * 1000) as unknown as typeof session.expires;
            }
            return session;
        }
    }
})