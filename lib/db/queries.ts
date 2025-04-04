'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  type Message,
  message,
  vote,
  assignment,
  problem,
  type Problem
} from './schema';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  content,
  userId,
}: {
  id: string;
  title: string;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function saveAssignment({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    const existingAssignment = await db.select().from(assignment).where(eq(assignment.id, id));
    if (existingAssignment.length > 0) {
      return await db.update(assignment).set({
        title,
      }).where(eq(assignment.id, id));
    } else {
      return await db.insert(assignment).values({
        id,
        createdAt: new Date(),
        userId,
        title,
      });
    }
  } catch (error) {
    console.error('Failed to save assignment in database');
    throw error;
  }
}

export async function deleteAssignmentById({ id }: { id: string }) {
  try {
    await db.delete(problem).where(eq(problem.assignmentId, id));

    return await db.delete(assignment).where(eq(assignment.id, id));
  } catch (error) {
    console.error('Failed to delete assignment by id from database');
    throw error;
  }
}

export async function getAllAssignments() {
  try {
    return await db
      .select()
      .from(assignment)
      .orderBy(desc(assignment.createdAt));
  } catch (error) {
    console.error('Failed to get assignments by user from database');
    throw error;
  }
}

export async function getAssignmentsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(assignment)
      .where(eq(assignment.userId, id))
      .orderBy(desc(assignment.createdAt));
  } catch (error) {
    console.error('Failed to get assignments by user from database');
    throw error;
  }
}

export async function getAssignmentById({ id }: { id: string }) {
  try {
    const [selectedAssignment] = await db.select().from(assignment).where(eq(assignment.id, id));
    return selectedAssignment;
  } catch (error) {
    console.error('Failed to get assignment by id from database');
    throw error;
  }
}

export async function saveProblems({ problems }: { problems: Array<Problem> }) {
  try {
    return await db.insert(problem).values(problems);
  } catch (error) {
    console.error('Failed to save problems in database', error);
    throw error;
  }
}

export async function saveProblem({
  id,
  assignmentId,
  content,
}: {
  id: string;
  assignmentId: string;
  content: object;
}) {
  try {
    return await db.insert(problem).values({
      id,
      createdAt: new Date(),
      assignmentId,
      content,
    });
  } catch (error) {
    console.error('Failed to save problem in database');
    throw error;
  }
}

export async function getProblemsByAssignmentId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(problem)
      .where(eq(problem.assignmentId, id))
      .orderBy(asc(problem.createdAt));
  } catch (error) {
    console.error('Failed to get problems by assignment id from database', error);
    throw error;
  }
}

export async function getProblemById({ id }: { id: string }) {
  try {
    const [selectedProblem] = await db.select().from(problem).where(eq(problem.id, id));
    return selectedProblem;
  } catch (error) {
    console.error('Failed to get problem by id from database');
    throw error;
  }
}
