import {getQuestionById} from "@/lib/actions/question-actions";
import {notFound} from "next/dist/client/components/not-found";
import QuestionDetailedHeader from "@/app/questions/[id]/QuestionDetailedHeader";
import QuestionContent from "@/app/questions/[id]/QuestionContent";
import AnswerContent from "@/app/questions/[id]/AnswerContent";
import AnswerHeader from "@/app/questions/[id]/AnswerHeader";
import {getCurrentUser} from "@/lib/actions/auth-action";
import AnswerForm from "@/app/questions/[id]/AnswerForm";

type Params = Promise<{ id: string }>

export default async function QuestionDetailedPage({params}: {params: Params}) {
    const {id} = await params;
    const {data: question, error} = await getQuestionById(id);
    const currentUser = await getCurrentUser();
    
    if (error) {
        throw new Error(`Failed to load question: ${error.message}`);
    }
    if (!question) return notFound();
    
    return (
        <div className='w-full'>
            <QuestionDetailedHeader question={question} currentUser={currentUser!} />
            <QuestionContent question={question} />
            {question.answers.length > 0 && (
                <AnswerHeader answerCount={question.answers.length} />
            )}
            {question.answers.map(answer => (
                <AnswerContent answer={answer} key={answer.id} />
            ))}
            <AnswerForm questionId={question.id}/>
        </div>
    );
}