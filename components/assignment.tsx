'use client';

'use client';

import { Problem } from "@/lib/utils";
import { useState } from 'react';
import { AssignmentHeader } from "./assignment-header";

export function Assignment({
  id,
  initialProblems,
}: {
  id: string;
  initialProblems: Array<Problem>;
}) {
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/assignment?id=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content: '' }), // Assuming content is not needed for title update
      });

      if (response.ok) {
        setIsEditing(false);
        // Optionally, handle success (e.g., show a message)
      } else {
        // Optionally, handle error (e.g., show an error message)
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      // Optionally, handle error (e.g., show an error message)
    }
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <AssignmentHeader
          id={id}
          title={title}
          setTitle={setTitle}
          handleSave={handleSave}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
        <div
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >
        </div>
      </div>
    </>
  );
}
