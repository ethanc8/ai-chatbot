import { auth } from '@/app/(auth)/auth';
import {
  getProblemById,
  saveProblem,
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

  const problem = await getProblemById({ id });

  if (!problem) {
    return new Response('Not Found', { status: 404 });
  }

  // if (problem.userId !== session.user.id) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  return Response.json(problem, { status: 200 });
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

  const { assignmentId, content }: { assignmentId: string; content: object; } =
    await request.json();

  if (session.user?.id) {
    const problem = await saveProblem({
      id,
      assignmentId,
      content,
    });

    return Response.json(problem, { status: 200 });
  }
  return new Response('Unauthorized', { status: 401 });
}

// export async function DELETE(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const id = searchParams.get('id');

//   if (!id) {
//     return new Response('Not Found', { status: 404 });
//   }

//   const session = await auth();

//   if (!session || !session.user) {
//     return new Response('Unauthorized', { status: 401 });
//   }

//   try {
//     const problem = await getProblemById({ id });

//     if (problem.userId !== session.user.id) {
//       return new Response('Unauthorized', { status: 401 });
//     }

//     await deleteProblemById({ id });

//     return new Response('Problem deleted', { status: 200 });
//   } catch (error) {
//     return new Response('An error occurred while processing your request', {
//       status: 500,
//     });
//   }
// }

