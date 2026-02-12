import {getQuestionById} from "@/lib/actions/question-actions";
import {notFound} from "next/dist/client/components/not-found";
import QuestionDetailedHeader from "@/app/questions/[id]/QuestionDetailedHeader";
import QuestionContent from "@/app/questions/[id]/QuestionContent";
import AnswerContent from "@/app/questions/[id]/AnswerContent";
import AnswerHeader from "@/app/questions/[id]/AnswerHeader";
import {getCurrentUser} from "@/lib/actions/auth-action";
import AnswerForm from "@/app/questions/[id]/AnswerForm";
import {Answer} from "@/lib/types";

type Params = Promise<{ id: string }>
type SearchParams = Promise<{sort?: string}>


export default async function QuestionDetailedPage({params, searchParams}: {params: Params, searchParams: SearchParams}) {
    const {id} = await params;
    const {data: question, error} = await getQuestionById(id);
    const currentUser = await getCurrentUser();
    const {sort} = await searchParams;
    
    if (error) {
        throw new Error(`Failed to load question: ${error.message}`);
    }
    if (!question) return notFound();
    
    const sortMode = sort === 'created' ? 'created' : 'highScore';
    
    const sortHighScore = (a: Answer, b: Answer) => {
        if (a.accepted !== b.accepted) return a.accepted ? -1 : 1;
        const va = a.votes ?? 0, vb = b.votes ?? 0;
        if (va !== vb) return vb - va;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    const sortCreated = (a: Answer, b: Answer) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    
    const answers = [...question.answers].sort(sortMode === 'created' ? sortCreated : sortHighScore);
    
    return (
        <div className='w-full'>
            <QuestionDetailedHeader question={question} currentUser={currentUser!} />
            <QuestionContent question={question} currentUser={currentUser!} />
            {question.answers.length > 0 && (
                <AnswerHeader answerCount={question.answers.length} />
            )}
            {answers.map(answer => (
                <AnswerContent 
                    answer={answer} 
                    key={answer.id}
                    askerId={question.askerId}
                />
            ))}
            <AnswerForm questionId={question.id}/>
        </div>
    );
}