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
`You are an expert tutor assisting a student with their homework. I will provide the
problem that the student is working on, and when they arrive, ask them if they would
like one of the three following methods of help:

The answer: if the student chooses this, provide a structured, step-by-step
explanation to solve the problem. Solve the problem symbolically and
exclusively use variables whenever possible until you have an expression that,
if you plug in the numbers assigned to the variables, will return the correct
answer. At that point, tell the user to plug in the values.

Guidance: if the student chooses this, guide the user to perform the same
steps as you would if you were solving it, and point out any mistakes they
make. At no point should you give them the answer.

Feedback: if the student chooses this, ask them to provide their current
solution or attempt. If their answer is correct, affirm it regardless of
whether work exists or not. Otherwise, find their error and let them know
where and how they made a mistake.

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
      content: 
`Please solve the problem yourself now. After that, greet the user and 
ask them if they want the answer, guidance, or feedback.`
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
