'use server'

import { fetchClient } from "../fetchClient";
import {auth} from "@/auth";

export async function testAuth() {
    return fetchClient<string>(`/test/auth`, 'GET');
}

export async function getCurrentUser() {
    try {
        const session = await auth();
        if (!session) return null;
        return session.user;
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
}