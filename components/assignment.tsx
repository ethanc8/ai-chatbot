'use client';

'use client';

import { generateUUID, Problem } from "@/lib/utils";
import { useState } from 'react';
import { AssignmentHeader } from "./assignment-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function Assignment({
  id,
  initialProblems,
}: {
  id: string;
  initialProblems: Array<Problem>;
}) {
  const [problems, setProblems] = useState<Problem[]>(initialProblems || []);
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/assignment?id=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, problems }),
      });

      if (response.ok) {
        setIsEditing(false);
        setEditingIndex(null);
        // Optionally, handle success (e.g., show a message)
      } else {
        // Optionally, handle error (e.g., show an error message)
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      // Optionally, handle error (e.g., show an error message)
    }
  };

  const addNewProblem = () => {
    setProblems([...problems, { id: generateUUID(), problemDescription: "", answer: "", solutionWriteup: "" }]);
    setEditingIndex(problems.length);
  };

  const handleProblemChange = (index: number, field: string, value: any) => {
    const updatedProblems = [...problems];
    (updatedProblems[index] as any)[field] = value;
    setProblems(updatedProblems);
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
          addNewProblem={addNewProblem}
        />
        <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 px-4">
          {problems.map((problem, index) => (
            <div key={index} className="border p-4 rounded-md">
              {editingIndex === index ? (
                <>
                  <Textarea
                    value={problem.problemDescription}
                    onChange={(e) => handleProblemChange(index, 'problemDescription', e.target.value)}
                    className="mb-2"
                    placeholder="Problem Description"
                  />
                  <Input
                    value={problem.answer}
                    onChange={(e) => handleProblemChange(index, 'answer', e.target.value)}
                    className="mb-2"
                    placeholder="Answer"
                  />
                  <Textarea
                    value={problem.solutionWriteup}
                    onChange={(e) => handleProblemChange(index, 'solutionWriteup', e.target.value)}
                    className="mb-2"
                    placeholder="Solution Writeup"
                  />
                  <Button onClick={() => setEditingIndex(null)}>Done</Button>
                </>
              ) : (
                <>
                  <p className="mb-2">{problem.problemDescription}</p>
                  <p className="mb-2"><b>Answer:</b>{problem.answer}</p>
                  <p className="mb-2"><b>Solution:</b>{problem.solutionWriteup}</p>
                  <Button onClick={() => setEditingIndex(index)}>Edit</Button>
                </>
              )}
            </div>
          ))}
          <Button onClick={addNewProblem}>New Problem</Button>
        </div>
      </div>
    </>
  );
}
