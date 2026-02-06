'use server';

import {Answer, Question} from "@/lib/types";
import {fetchClient} from "@/lib/fetchClient";
import {QuestionSchema} from "@/lib/schemas/questionSchema";
import {AnswerSchema} from "@/lib/schemas/answerSchema";
import {revalidatePath} from "next/dist/server/web/spec-extension/revalidate";

export async function getQuestions(tag?: string) {
    let url = '/questions';
    if (tag) {
        url += `?tag=${encodeURIComponent(tag)}`;
    }
    
    return fetchClient<Question[]>(url, 'GET');
}

export async function getQuestionById(id: string) {
    return fetchClient<Question>(`/questions/${encodeURIComponent(id)}`, 'GET');
}

export async function searchQuestions(query: string) {
    return fetchClient<Question[]>(`/search?query=${encodeURIComponent(query)}`, 'GET');
}

export async function postQuestion(question: QuestionSchema) {
    return fetchClient<Question>('/questions', 'POST', {body: question});
}

export async function updateQuestion(id: string, question: QuestionSchema) {
    return fetchClient(`/questions/${encodeURIComponent(id)}`, 'PUT', {body: question});
}

export async function deleteQuestion(id: string) {
    return fetchClient(`/questions/${encodeURIComponent(id)}`, 'DELETE');
}

export async function postAnswer(data: AnswerSchema, questionId: string) {
    const result = await fetchClient<Answer>(`/questions/${encodeURIComponent(questionId)}/answers`, 'POST', {body: data});
    revalidatePath(`/questions/${encodeURIComponent(questionId)}`);
    return result;
}

export async function editAnswer(answerId: string, questionId: string, content: AnswerSchema) {
    const result = await fetchClient(`/questions/${questionId}/answers/${answerId}`,
        'PUT', {body: content});
    revalidatePath(`/questions/${questionId}`)
    return result;
}

export async function deleteAnswer(answerId: string, questionId: string) {
    const result = await fetchClient(`/questions/${questionId}/answers/${answerId}`, 'DELETE');
    revalidatePath(`/questions/${questionId}`);
    return result;
}