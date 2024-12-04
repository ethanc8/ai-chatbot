import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { generateUUID, Problem } from '@/lib/utils';
import { Message } from 'ai';
import { getProblemById } from '@/lib/db/queries';

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

  const messages: Message[] = [
    {
      id: generateUUID(),
      role: "data",
      content: 
`You are an expert tutor assisting a student with their homework. If the student
provides a homework problem, ask the student if they want:

*   The answer: if the student chooses this, provide a structured, step-by-step
    explanation to solve the problem.
*   Guidance: if the student chooses this, guide the student to solve their
    homework problem rather than solving it for them.
*   Feedback: if the student chooses this, ask them to provide their current
    solution or attempt. Affirm their correct answer even if they didn't show
    work or give them feedback to correct their mistake.

Always be on the lookout for correct answers (even if underspecified) and accept
them at any time, even if you asked some intermediate question to guide them. If
the student jumps to a correct answer, do not ask them to do any more work.

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
      content: "Please solve the problem yourself now. Once you're done, the user will be able to chat with you."
    },
  ];

  return (
    <Chat
      key={chatid}
      id={chatid}
      initialMessages={messages}
      selectedModelId={selectedModelId}
      mustReload={true}
    />
  );
}
