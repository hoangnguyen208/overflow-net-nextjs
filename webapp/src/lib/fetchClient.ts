import {notFound} from "next/dist/client/components/not-found";

export async function fetchClient<T>(
    url: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    options: Omit<RequestInit, 'body'> & {body?: unknown} = {}
): Promise<{data: T | null, error?: {message: string, status: number}}> {
    const {body, ...rest} = options;
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
        throw new Error('API_URL is not defined');
    }
    
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(rest.headers || {})
    };

    const response = await fetch(`${apiUrl}${url}`, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
        ...rest
    });

    const contentType = response.headers.get('Content-Type');
    const isJson = contentType?.includes('application/json') ||
        contentType?.includes('application/problem+json');
    const parsed = isJson ? await response.json() : await response.text();

    function getFallbackMessage(status: number) {
        switch (status) {
            case 400: return 'Bad Request';
            case 401: return 'Unauthorized';
            case 403: return 'Forbidden';
            default: return 'An error occurred';
        }
    }

    if (!response.ok) {
        console.log(response.status);
        if (response.status === 404) return notFound();
        if (response.status === 500) {
            throw new Error('Internal Server Error');
        }
        
        let message = '';
        
        if (typeof parsed === 'string') {
            message = parsed;
        } else if (parsed?.message) {
            message = parsed?.message;
        }
        
        if (!message) {
            message = getFallbackMessage(response.status);
        }
        
        return {data: null, error: {message, status: response.status}};
    }
    
    return {data: parsed as T};
}