import {z} from "zod";
import {stripHtmlTags} from "@/lib/util";

const required = (name: string) => z.string().nonempty(`"${name}" is required`);

const contentField = z.union([z.string(), z.undefined()])
    .transform(value => value ?? '')
    .refine(value => stripHtmlTags(value).length > 0, 'Content is required')
    .refine(value => stripHtmlTags(value).length >= 10,'Content must be at least 10 characters long');

export const questionSchema = z.object({
    title: required('Title'),
    content: contentField,
    tags: z.array(z.string(), 'At least one tag is required')
        .min(1, 'At least one tag is required')
        .max(5, 'Maximum of 5 tags allowed')
});

export type QuestionSchema = z.input<typeof questionSchema>;