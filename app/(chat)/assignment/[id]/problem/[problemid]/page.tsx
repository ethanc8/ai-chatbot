import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Assignment as PreviewAssignment } from '@/components/assignment';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { getAssignmentById, getProblemById, getProblemsByAssignmentId } from '@/lib/db/queries';
import { convertToUIProblems, Problem } from '@/lib/utils';
import { Markdown } from '@/components/markdown';

// This page is mostly here for testing, at least for now

export default async function Page(props: { params: Promise<{ id: string, problemid: string }> }) {
  const params = await props.params;
  const { id, problemid } = params;
  const assignment = await getAssignmentById({ id });
  const dbproblem = await getProblemById({ id: problemid });

  if (!assignment || !dbproblem) {
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

  const problem: Problem = dbproblem.content as Problem;

  return (
    <Markdown>
{`${problem.problemDescription}

**Answer:** ${problem.answer}

**Solution:** ${problem.solutionWriteup}
` as string}
    </Markdown>
  );
}
