'use server';

import {Question} from "@/lib/types";

export async function getQuestions(tag?: string): Promise<Question[]> {
    let url = 'http://localhost:8001/questions';
    if (tag) {
        url += `?tag=${encodeURIComponent(tag)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch questions');
    }
    
    return response.json();
}

export async function getQuestionById(id: string): Promise<Question> {
    const url = `http://localhost:8001/questions/${encodeURIComponent(id)}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch question');
    }
    
    return response.json();
}