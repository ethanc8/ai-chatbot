'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useWindowSize } from 'usehooks-ts';

import { ChatHeader } from '@/components/chat-header';
import { PreviewMessage, ThinkingMessage } from '@/components/message';
import { useScrollToBottom } from '@/components/use-scroll-to-bottom';
import type { Vote } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';

import { Block, type UIBlock } from './block';
import { BlockStreamHandler } from './block-stream-handler';
import { MultimodalInput } from './multimodal-input';
import { Overview } from './overview';

import { generateUUID, Problem } from '@/lib/utils';

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  problem,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  problem: Problem;
}) {
  const { mutate } = useSWRConfig();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    data: streamingData,
    reload,
  } = useChat({
    body: { id, modelId: selectedModelId },
    initialMessages,
    onFinish: () => {
      stageFinish();
      mutate('/api/history');
    },
  });

  const { width: windowWidth = 1920, height: windowHeight = 1080 } =
    useWindowSize();

  const [block, setBlock] = useState<UIBlock>({
    documentId: 'init',
    content: '',
    title: '',
    status: 'idle',
    isVisible: false,
    boundingBox: {
      top: windowHeight / 4,
      left: windowWidth / 4,
      width: 250,
      height: 50,
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Deal with the state
  const [stage, setStage] = useState('begin');
  useEffect(() => {
    if(stage === 'begin') {
      setStage('firstAttempt');
      reload();
    }
  }, []);

  // called during useChat onFinish
//   function stageFinish() {
//     console.log(`stageFinish() called with stage == ${stage}`);
//     if(stage === 'firstAttempt') {
//       setStage('finalThoughts');
//       // Finished first attempt, show the correct answer and the solution.
//       append({
//         id: generateUUID(),
//         role: "data",
//         content: 
// `The correct answer is \${${problem.answer}\$. The solution writeup is as follows:

// ${problem.solutionWriteup}

// ---

// As a reminder, the problem is "${problem.problemDescription}" and the answer is \$${problem.answer}\$.
// If there's anything you need to think through more, do so now.
// `
//       });
//     } else if(stage === 'finalThoughts') {
//       setStage('chat');
//       append({
//         id: generateUUID(),
//         role: "data",
//         content: 
// `
// The user is now here. Ask them if they would
// like one of the three following methods of help:

// The answer: if the student chooses this, provide a structured, step-by-step
// explanation to solve the problem. Solve the problem symbolically and
// exclusively use variables whenever possible until you have an expression that,
// if you plug in the numbers assigned to the variables, will return the correct
// answer. At that point, tell the user to plug in the values.

// Guidance: if the student chooses this, guide the user to perform the same
// steps as you would if you were solving it, and point out any mistakes they
// make. At no point should you give them the answer.

// Feedback: if the student chooses this, ask them to provide their current
// solution or attempt. If their answer is correct, affirm it regardless of
// whether work exists or not. Otherwise, find their error and let them know
// where and how they made a mistake.

// Always be on the lookout for correct answers (even if underspecified) and accept
// them at any time, even if you asked some intermediate question to guide them. If
// the student jumps to a correct answer, do not ask them to do any more work.

// As a reminder, the problem is "${problem.problemDescription}" and the answer is \$${problem.answer}\$. 
// `
//       });
//     }
//   }

  // function stageFinish() {
  //   console.log(`stageFinish() called with stage == ${stage}`);
  // }

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader selectedModelId={selectedModelId} />
        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              message={message}
              block={block}
              setBlock={setBlock}
              isLoading={isLoading && messages.length - 1 === index}
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
            />
          ))}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === 'user' && (
              <ThinkingMessage />
            )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>
        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
          />
        </form>
      </div>

      <AnimatePresence>
        {block?.isVisible && (
          <Block
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            append={append}
            block={block}
            setBlock={setBlock}
            messages={messages}
            setMessages={setMessages}
            votes={votes}
          />
        )}
      </AnimatePresence>

      <BlockStreamHandler streamingData={streamingData} setBlock={setBlock} />
    </>
  );
}
