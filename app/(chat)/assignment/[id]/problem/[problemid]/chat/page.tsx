import { cookies } from 'next/headers';

import { Chat } from '@/components/chat-problem';
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
`Please solve the problem yourself now.`
    },
  ];

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
