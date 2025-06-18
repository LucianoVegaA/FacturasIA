'use server';
/**
 * @fileOverview Summarizes invoice details, extracting key information like total amount due, due date, and service description.
 *
 * - summarizeInvoice - A function that summarizes the invoice details.
 * - SummarizeInvoiceInput - The input type for the summarizeInvoice function.
 * - SummarizeInvoiceOutput - The return type for the summarizeInvoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInvoiceInputSchema = z.object({
  invoiceData: z.string().describe('The invoice data in JSON format.'),
});
export type SummarizeInvoiceInput = z.infer<typeof SummarizeInvoiceInputSchema>;

const SummarizeInvoiceOutputSchema = z.object({
  summary: z.string().describe('A summary of the invoice, including total amount due, due date, and service description.'),
});
export type SummarizeInvoiceOutput = z.infer<typeof SummarizeInvoiceOutputSchema>;

export async function summarizeInvoice(input: SummarizeInvoiceInput): Promise<SummarizeInvoiceOutput> {
  return summarizeInvoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeInvoicePrompt',
  input: {schema: SummarizeInvoiceInputSchema},
  output: {schema: SummarizeInvoiceOutputSchema},
  prompt: `You are an expert accountant.  You will be given invoice data in JSON format.
Your task is to summarize the key details of the invoice, including:

*   Total amount due
*   Due date (if available)
*   A brief description of the services provided.

Invoice Data: {{{invoiceData}}}

Summary:`, // Updated prompt to remove extra context
});

const summarizeInvoiceFlow = ai.defineFlow(
  {
    name: 'summarizeInvoiceFlow',
    inputSchema: SummarizeInvoiceInputSchema,
    outputSchema: SummarizeInvoiceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
