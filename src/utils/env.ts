import { z } from "zod";
const schema = z.object({ VITE_CLAUDE_API_KEY: z.string().min(1) });
export const env = schema.parse(import.meta.env);
