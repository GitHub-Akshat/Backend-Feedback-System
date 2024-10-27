import { z } from "zod";

export const messageSchema = z.object({
    content: z.string().min(10, {message : "Content must be atleast of 10 characters"}).max(200,{message : "Content must be no more than 200 characters"} ),
})