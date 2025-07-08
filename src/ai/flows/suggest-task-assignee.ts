'use server';

/**
 * @fileOverview An AI agent that suggests task assignees based on task content.
 *
 * - suggestTaskAssignee - A function that suggests task assignees.
 * - SuggestTaskAssigneeInput - The input type for the suggestTaskAssignee function.
 * - SuggestTaskAssigneeOutput - The return type for the suggestTaskAssignee function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskAssigneeInputSchema = z.object({
  taskDescription: z.string().describe('The content of the task for which to suggest assignees.'),
  availableAssignees: z.array(z.string()).describe('The names of the available assignees for the task.'),
});
export type SuggestTaskAssigneeInput = z.infer<typeof SuggestTaskAssigneeInputSchema>;

const SuggestTaskAssigneeOutputSchema = z.object({
  suggestedAssignees: z.array(z.string()).describe('The list of suggested assignees for the task, ranked by relevance.'),
  reasoning: z.string().describe('The reasoning behind the assignee suggestions.'),
});
export type SuggestTaskAssigneeOutput = z.infer<typeof SuggestTaskAssigneeOutputSchema>;

export async function suggestTaskAssignee(input: SuggestTaskAssigneeInput): Promise<SuggestTaskAssigneeOutput> {
  return suggestTaskAssigneeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskAssigneePrompt',
  input: {schema: SuggestTaskAssigneeInputSchema},
  output: {schema: SuggestTaskAssigneeOutputSchema},
  prompt: `You are an AI assistant helping users assign tasks to the most suitable person.

  Given the following task description and list of available assignees, suggest the best assignees for the task.
  Explain the reasoning behind your suggestions. Return assignees ranked by relevance.

  Task Description: {{{taskDescription}}}
  Available Assignees: {{#each availableAssignees}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  `,
});

const suggestTaskAssigneeFlow = ai.defineFlow(
  {
    name: 'suggestTaskAssigneeFlow',
    inputSchema: SuggestTaskAssigneeInputSchema,
    outputSchema: SuggestTaskAssigneeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
