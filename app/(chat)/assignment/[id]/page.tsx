
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Assignment as PreviewAssignment } from '@/components/assignment';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { getAssignmentById, getProblemsByAssignmentId } from '@/lib/db/queries';
import { convertToUIProblems } from '@/lib/utils';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const assignment = await getAssignmentById({ id });

  if (!assignment) {
    notFound();
  }

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== assignment.userId) {
    return notFound();
  }

  const problemsFromDb = await getProblemsByAssignmentId({
    id,
  });

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  console.log(`Problems: ${JSON.stringify(convertToUIProblems(problemsFromDb))}`)

  return (
    <PreviewAssignment
      id={assignment.id}
      initialProblems={convertToUIProblems(problemsFromDb)}
    />
  );
}
