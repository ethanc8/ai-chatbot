'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';
import { PlusIcon } from './icons';
import { Input } from '@/components/ui/input';
import { useSidebar } from './ui/sidebar';

export function AssignmentHeader({
  id,
  title,
  setTitle,
  handleSave,
  isEditing,
  setIsEditing,
  addNewProblem,
}: {
  id: string;
  title: string;
  setTitle: (title: string) => void;
  handleSave: (sendNotification: boolean) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  addNewProblem?: () => void;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const isSmallScreen = useWindowSize().width < 768;

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />
      {(isSmallScreen || open) && (
        <>
        <BetterTooltip content="New Assignment">
          <Button
            variant="outline"
            className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
            onClick={() => {
              router.push('/assignment');
              router.refresh();
            }}
          >
            <PlusIcon />
            <span className="md:sr-only">New Assignment</span>
          </Button>
        </BetterTooltip>
        <BetterTooltip content="New Problem">
          <Button
            variant="outline"
            className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
            onClick={addNewProblem}
          >
            <PlusIcon />
            <span className="md:sr-only">New Problem</span>
          </Button>
        </BetterTooltip>
        </>
      )}
            {isEditing ? (
              <>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="order-1 md:order-2"
                />
                <Button onClick={() => handleSave(true)} className="order-1 md:order-2">
                  Save
                </Button>
              </>
            ) : (
              <>
                <h2 className="order-1 md:order-2 font-bold text-lg">{title}</h2>
                <Button onClick={() => setIsEditing(true)} className="order-1 md:order-2">
                  Edit Title
                </Button>
              </>
            )}
    </header>
  );
}
