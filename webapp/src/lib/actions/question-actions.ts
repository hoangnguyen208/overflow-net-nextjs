'use server';

import {Answer, FetchResponse, Profile, Question} from "@/lib/types";
import {fetchClient} from "@/lib/fetchClient";
import {QuestionSchema} from "@/lib/schemas/questionSchema";
import {AnswerSchema} from "@/lib/schemas/answerSchema";
import {revalidatePath} from "next/dist/server/web/spec-extension/revalidate";

export async function getQuestions(tag?: string): Promise<FetchResponse<Question[]>> {
    let questionUrl = '/questions';
    if (tag) questionUrl += `?tag=${encodeURIComponent(tag)}`;
    const {data: questions, error: questionsError} = await fetchClient<Question[]>(questionUrl, 'GET');
    if (!questions || questionsError) {
        return {
            data: null,
            error: {message: 'Failed to load questions', status: 500}
        }
    }
    
    const userIds = Array.from(new Set(questions.map(x => x.askerId)));
    if (!userIds.length) {
        return {data: []};
    }
    
    const ids = Array.from(userIds).sort();
    const profilesUrl = '/profiles/batch?' + new URLSearchParams({ids: ids.join(',')});
    const {data: profiles, error: profilesError} = await fetchClient<Profile[]>(profilesUrl, 'GET', {cache: 'force-cache', next: {revalidate: 300}});
    
    if (profilesError) {
        return {data: null, error: {message: 'Failed to load profiles', status: 500}};
    }
    const profileMap = new Map(profiles?.map(p => [p.userId, p]));
    const enriched = questions.map(q => ({
        ...q, 
        author: profileMap.get(q.askerId)
    }));
    
    return {data: enriched};
}

export async function getQuestionById(id: string): Promise<FetchResponse<Question>> {
    const {data: question, error: questionError} = await fetchClient<Question>(`/questions/${encodeURIComponent(id)}`, 'GET');
    if (!question || questionError) {
        return {
            data: null,
            error: {message: 'Failed to load question', status: 500}
        }
    }
    
    const userIds = new Set<string>();
    if (question.askerId) userIds.add(question.askerId);
    for (const answer of question.answers ?? []) {
        userIds.add(answer.userId);
    }
    if (userIds.size === 0) return {data: null, error: {message: 'Problem getting userIds', status: 500}};
    const ids = Array.from(userIds).sort();
    const profilesUrl = '/profiles/batch?' + new URLSearchParams({ids: ids.join(',')});
    const {data: profiles, error: profilesError} = await fetchClient<Profile[]>(profilesUrl, 'GET', {cache: 'force-cache', next: {revalidate: 300}});

    if (profilesError) {
        return {data: null, error: {message: 'Failed to load profiles', status: 500}};
    }
    const profileMap = new Map(profiles?.map(p => [p.userId, p]));
    const enriched: Question = {
        ...question, 
        author: profileMap.get(question.askerId),
        answers: (question.answers ?? []).map(a => ({...a, author: profileMap.get(a.userId)}))
    }

    return {data: enriched};
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