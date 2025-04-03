import { auth } from '@/app/(auth)/auth';
import { getAllAssignments } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  // biome-ignore lint: Forbidden non-null assertion.
  const chats = await getAllAssignments();
  return Response.json(chats);
}
