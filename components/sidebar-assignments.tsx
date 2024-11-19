'use client';

import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import { MoreHorizontalIcon, PlusIcon, TrashIcon } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { Assignment } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';

type GroupedAssignments = {
  today: Assignment[];
  yesterday: Assignment[];
  lastWeek: Assignment[];
  lastMonth: Assignment[];
  older: Assignment[];
};

const AssignmentItem = ({
  assignment,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  assignment: Assignment;
  isActive: boolean;
  onDelete: (assignmentId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild isActive={isActive}>
      <Link href={`/assignment/${assignment.id}`} onClick={() => setOpenMobile(false)}>
        <span>{assignment.title}</span>
      </Link>
    </SidebarMenuButton>
    <DropdownMenu modal={true}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
          showOnHover={!isActive}
        >
          <MoreHorizontalIcon />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
          onSelect={() => onDelete(assignment.id)}
        >
          <TrashIcon />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </SidebarMenuItem>
);

export function SidebarAssignments({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const { id } = useParams();
  const pathname = usePathname();
  const {
    data: assignments,
    isLoading,
    mutate,
  } = useSWR<Array<Assignment>>(user ? '/api/assignments' : null, fetcher, {
    fallbackData: [],
  });

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    const deletePromise = fetch(`/api/assignment?id=${deleteId}`, {
      method: 'DELETE',
    });

    toast.promise(deletePromise, {
      loading: 'Deleting assignment...',
      success: () => {
        mutate((assignments) => {
          if (assignments) {
            return assignments.filter((h) => h.id !== id);
          }
        });
        return 'Assignment deleted successfully';
      },
      error: 'Failed to delete assignment',
    });

    setShowDeleteDialog(false);

    if (deleteId === id) {
      router.push('/');
    }
  };

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            <div>Login to save and revisit previous assignments!</div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
          Today
        </div>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                key={item}
                className="rounded-md h-8 flex gap-2 px-2 items-center"
              >
                <div
                  className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
                  style={
                    {
                      '--skeleton-width': `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (assignments?.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenuButton
            onClick={() => {
              setOpenMobile(false);
              router.push('/assignment');
              router.refresh();
            }}
          >
            <PlusIcon />
            <span>New Assignment</span>
          </SidebarMenuButton>
          <div className="text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            <div>
              Your conversations will appear here once you start assignmentting!
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const groupAssignmentsByDate = (assignments: Assignment[]): GroupedAssignments => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return assignments.reduce(
      (groups, assignment) => {
        const assignmentDate = new Date(assignment.createdAt);

        if (isToday(assignmentDate)) {
          groups.today.push(assignment);
        } else if (isYesterday(assignmentDate)) {
          groups.yesterday.push(assignment);
        } else if (assignmentDate > oneWeekAgo) {
          groups.lastWeek.push(assignment);
        } else if (assignmentDate > oneMonthAgo) {
          groups.lastMonth.push(assignment);
        } else {
          groups.older.push(assignment);
        }

        return groups;
      },
      {
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: [],
        older: [],
      } as GroupedAssignments,
    );
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuButton
              onClick={() => {
                setOpenMobile(false);
                router.push('/assignment');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span>New Assignment</span>
            </SidebarMenuButton>
            {assignments &&
              (() => {
                const groupedAssignments = groupAssignmentsByDate(assignments);

                return (
                  <>
                    {groupedAssignments.today.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                          Today
                        </div>
                        {groupedAssignments.today.map((assignment) => (
                          <AssignmentItem
                            key={assignment.id}
                            assignment={assignment}
                            isActive={assignment.id === id}
                            onDelete={(assignmentId) => {
                              setDeleteId(assignmentId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedAssignments.yesterday.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
                          Yesterday
                        </div>
                        {groupedAssignments.yesterday.map((assignment) => (
                          <AssignmentItem
                            key={assignment.id}
                            assignment={assignment}
                            isActive={assignment.id === id}
                            onDelete={(assignmentId) => {
                              setDeleteId(assignmentId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedAssignments.lastWeek.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
                          Last 7 days
                        </div>
                        {groupedAssignments.lastWeek.map((assignment) => (
                          <AssignmentItem
                            key={assignment.id}
                            assignment={assignment}
                            isActive={assignment.id === id}
                            onDelete={(assignmentId) => {
                              setDeleteId(assignmentId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedAssignments.lastMonth.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
                          Last 30 days
                        </div>
                        {groupedAssignments.lastMonth.map((assignment) => (
                          <AssignmentItem
                            key={assignment.id}
                            assignment={assignment}
                            isActive={assignment.id === id}
                            onDelete={(assignmentId) => {
                              setDeleteId(assignmentId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedAssignments.older.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
                          Older
                        </div>
                        {groupedAssignments.older.map((assignment) => (
                          <AssignmentItem
                            key={assignment.id}
                            assignment={assignment}
                            isActive={assignment.id === id}
                            onDelete={(assignmentId) => {
                              setDeleteId(assignmentId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              assignment and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
