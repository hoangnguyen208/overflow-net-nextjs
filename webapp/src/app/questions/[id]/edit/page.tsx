import {getQuestionById} from "@/lib/actions/question-actions";
import {handleError} from "@/lib/util";
import {notFound} from "next/navigation";
import QuestionForm from "@/app/questions/ask/QuestionForm";

type Params = Promise<{id: string}>

export default async function EditQuestionPage({params}: {params: Params}) {
    const {id} = await params;
    const {data: question, error} = await getQuestionById(id);
    if (error) handleError(error);
    if (!question) return notFound();

    return <QuestionForm questionToUpdate={question} />;
}
