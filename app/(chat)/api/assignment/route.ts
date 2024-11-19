import { auth } from '@/app/(auth)/auth';
import {
  getAssignmentById,
  saveAssignment,
  deleteAssignmentById,
} from '@/lib/db/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const assignment = await getAssignmentById({ id });

  if (!assignment) {
    return new Response('Not Found', { status: 404 });
  }

  if (assignment.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json(assignment, { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { content, title }: { content: string; title: string } =
    await request.json();

  if (session.user?.id) {
    const assignment = await saveAssignment({
      id,
      title,
      userId: session.user.id,
    });

    return Response.json(assignment, { status: 200 });
  }
  return new Response('Unauthorized', { status: 401 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const assignment = await getAssignmentById({ id });

    if (assignment.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteAssignmentById({ id });

    return new Response('Assignment deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}

