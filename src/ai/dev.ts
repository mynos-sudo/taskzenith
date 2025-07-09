import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-task-assignee.ts';
import '@/ai/flows/summarize-project.ts';
import '@/ai/flows/generate-tasks-flow.ts';
