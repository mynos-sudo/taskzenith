'use server';

/**
 * @fileOverview An AI agent that generates a list of tasks from a high-level goal.
 *
 * - generateTasks - A function that generates tasks for a project.
 * - GenerateTasksInput - The input type for the generateTasks function.
 * - GenerateTasksOutput - The return type for the generateTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTasksInputSchema = z.object({
  goal: z.string().describe('The high-level goal to be broken down into tasks.'),
});
export type GenerateTasksInput = z.infer<typeof GenerateTasksInputSchema>;

const TaskSchema = z.object({
    title: z.string().describe('The title of the task.'),
    description: z.string().describe('A brief description of what the task entails.'),
    priority: z.enum(["low", "medium", "high", "critical"]).describe('The priority of the task.'),
});

const GenerateTasksOutputSchema = z.object({
  tasks: z.array(TaskSchema).describe('The list of generated tasks.'),
});
export type GenerateTasksOutput = z.infer<typeof GenerateTasksOutputSchema>;


export async function generateTasks(input: GenerateTasksInput): Promise<GenerateTasksOutput> {
  return generateTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTasksPrompt',
  input: {schema: GenerateTasksInputSchema},
  output: {schema: GenerateTasksOutputSchema},
  prompt: `You are an expert project manager AI. Your task is to break down a high-level user goal into a list of specific, actionable tasks.

  For each task, provide a clear title, a concise description, and assign a priority ('low', 'medium', 'high', 'critical').
  The tasks should be logical steps to achieve the overall goal.

  User Goal: {{{goal}}}
  `,
});

const generateTasksFlow = ai.defineFlow(
  {
    name: 'generateTasksFlow',
    inputSchema: GenerateTasksInputSchema,
    outputSchema: GenerateTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
