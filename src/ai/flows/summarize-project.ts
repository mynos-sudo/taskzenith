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
import { createClient } from '@/lib/supabase';

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
    const supabase = createClient();

    // Fetch project details
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw new Error(`Project with ID ${projectId} not found: ${projectError.message}`);

    // Fetch project tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('title, status, priority')
      .eq('project_id', projectId);
    
    if (tasksError) throw new Error(`Failed to fetch tasks for project ${projectId}: ${tasksError.message}`);

    // Calculate progress
    const totalTasks = tasksData.length;
    const completedTasks = tasksData.filter(t => t.status === 'done').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Call the prompt with live data
    const { output } = await prompt({
        projectName: projectData.name,
        projectDescription: projectData.description ?? undefined,
        projectStatus: projectData.status,
        projectProgress: progress,
        tasks: tasksData.map(t => ({
            title: t.title,
            status: t.status,
            priority: t.priority
        }))
    });
    
    return output!;
  }
);
