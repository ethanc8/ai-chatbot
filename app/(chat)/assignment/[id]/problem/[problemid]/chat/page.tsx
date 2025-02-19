import { cookies } from 'next/headers';

import { Chat } from '@/components/chat-problem';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { generateUUID, Problem } from '@/lib/utils';
import { generateText, Message, tool } from 'ai';
import { getProblemById } from '@/lib/db/queries';
// import { useEffect } from 'react';
import { customModel } from '@/lib/ai';
import { z } from 'zod';
import * as mathjs from 'mathjs';

export default async function Page(props: { params: Promise<{ id: string, problemid: string }> }) {
  const params = await props.params;
  const { id, problemid } = params;

  const chatid = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;

  // const selectedModelId =
  //   models.find((model) => model.id === modelIdFromCookie)?.id ||
  //   DEFAULT_MODEL_NAME;

  // We want to use LearnLM here (TODO: Is this a good idea?)
  const selectedModelId = "learnlm-1.5-pro-experimental";
  
  const dbproblem = await getProblemById({ id: problemid });
  const problem: Problem = dbproblem.content as Problem;

  let messages: Message[] = [];

  // useEffect(() => {
  messages = [
    {
      id: generateUUID(),
      role: "data",
      content: 
`You are an expert tutor assisting a student with their homework. I will provide the
problem that the student is working on.

The student is not here yet. Here is the question that the user is working on:`
      // see https://ai.google.dev/gemini-api/docs/learnlm
    },
    {
      id: generateUUID(),
      role: "user",
      content: problem.problemDescription
    },
    {
      id: generateUUID(),
      role: "data",
      content: 
`Please solve the problem yourself now. Use the calculator tool. Submit your final answer using the answer tool. Only submit one answer.`
    },
  ];

  {
    const { toolCalls, response } = await generateText({
      model: customModel(selectedModelId),
      tools: {
        calculate: tool({
          description:
            'A tool for evaluating mathematical expressions. Example expressions: ' +
            "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.",
          parameters: z.object({ expression: z.string() }),
          execute: async ({ expression }) => mathjs.evaluate(expression),
        }),
        // answer tool: the LLM will provide a structured answer
        answer: tool({
          description: 'A tool for providing the final answer.',
          parameters: z.object({
            // steps: z.array(
            //   z.object({
            //     calculation: z.string(),
            //     reasoning: z.string(),
            //   }),
            // ),
            answer: z.string(),
          }),
          // no execute function - invoking it will terminate the agent
        }),
      },
      // toolChoice: 'required',
      maxSteps: 10,
      messages,
    });

    messages.push(...(response.messages as Message[]));
    console.log(`MESSAGES: ${JSON.stringify(response.messages, null, 2)}`);
    console.log(`FINAL TOOL CALLS: ${JSON.stringify(toolCalls, null, 2)}`);
  }

  // }); // end useEffect

  return (
    <Chat
      key={chatid}
      id={chatid}
      initialMessages={messages}
      selectedModelId={selectedModelId}
      problem={problem}
    />
  );
}
