'use client';

import { Problem } from "@/lib/utils";
import { useState } from 'react';

export function Assignment({
  id,
  initialProblems,
}: {
  id: string;
  initialProblems: Array<Problem>;
}) {
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

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
      {isEditing ? (
        <>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <h2>{title}</h2>
          <button onClick={handleEdit}>Edit Title</button>
        </>
      )}
    </>
  );
}
