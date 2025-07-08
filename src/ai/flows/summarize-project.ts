'use server';

/**
 * @fileOverview An AI agent that summarizes a project's status.
 *
 * - summarizeProject - A function that generates a project summary.
 * - SummarizeProjectInput - The input type for the summarizeProject function.
 * - SummarizeProjectOutput - The return type for the summarizeProject function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { projects, tasks } from '@/lib/data';

const SummarizeProjectInputSchema = z.object({
  projectId: z.string().describe('The ID of the project to summarize.'),
});
export type SummarizeProjectInput = z.infer<typeof SummarizeProjectInputSchema>;

const SummarizeProjectOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the project status, progress, and recent activity.'),
  outlook: z.enum(['Positive', 'Neutral', 'Concerning']).describe('The overall outlook for the project.'),
  suggestedAction: z.string().describe('A single, actionable suggestion to improve the project\'s trajectory.'),
});
export type SummarizeProjectOutput = z.infer<typeof SummarizeProjectOutputSchema>;


export async function summarizeProject(input: SummarizeProjectInput): Promise<SummarizeProjectOutput> {
  return summarizeProjectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProjectPrompt',
  input: {
    schema: z.object({
      projectName: z.string(),
      projectDescription: z.string().optional(),
      projectStatus: z.string(),
      projectProgress: z.number(),
      tasks: z.array(z.object({
        title: z.string(),
        status: z.string(),
        priority: z.string(),
      })),
    })
  },
  output: {schema: SummarizeProjectOutputSchema},
  prompt: `You are an expert project manager AI. Your task is to provide a clear, concise, and insightful summary of a project's status based on the data provided.

  Project Name: {{{projectName}}}
  Description: {{{projectDescription}}}
  Current Status: {{{projectStatus}}}
  Progress: {{{projectProgress}}}%

  Tasks:
  {{#each tasks}}
  - {{{this.title}}} (Status: {{{this.status}}}, Priority: {{{this.priority}}})
  {{else}}
  There are no tasks for this project.
  {{/each}}

  Based on all the information above, analyze the project's health.
  - In the 'summary', describe the current state of the project. Mention the progress and what the tasks indicate about the project's momentum.
  - In 'outlook', determine if the project's outlook is Positive, Neutral, or Concerning. Base this on progress, task distribution (e.g., many tasks in 'todo' vs 'in-progress'), and the project's own status ('At Risk', 'Off Track').
  - In 'suggestedAction', provide one clear, actionable next step. For example, 'Prioritize the critical task X' or 'Break down the large task Y into smaller sub-tasks'.
  `,
});

const summarizeProjectFlow = ai.defineFlow(
  {
    name: 'summarizeProjectFlow',
    inputSchema: SummarizeProjectInputSchema,
    outputSchema: SummarizeProjectOutputSchema,
  },
  async ({ projectId }) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
        throw new Error(`Project with ID ${projectId} not found.`);
    }

    const projectTasks = tasks.filter(t => t.projectId === projectId);
    
    const { output } = await prompt({
        projectName: project.name,
        projectDescription: project.description,
        projectStatus: project.status,
        projectProgress: project.progress,
        tasks: projectTasks.map(t => ({
            title: t.title,
            status: t.status,
            priority: t.priority
        }))
    });
    
    return output!;
  }
);
