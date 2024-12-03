'use client';

'use client';

import { generateUUID, Problem } from "@/lib/utils";
import { useEffect, useState } from 'react';
import { AssignmentHeader } from "./assignment-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function Assignment({
  id,
  initialProblems,
}: {
  id: string;
  initialProblems: Problem[];
}) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`/api/assignment?id=${id}`);
        if (response.ok) {
          const assignmentData = await response.json();
          setProblems(assignmentData.problems || []);
          setTitle(assignmentData.title || '');
        } else {
          console.error('Failed to fetch assignment data');
        }
      } catch (error) {
        console.error('Error fetching assignment:', error);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleSave = async (sendNotification: boolean) => {
    try {
      const response = await fetch(`/api/assignment?id=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, problems, sendNotification }),
      });
      if (response.ok) {
        setIsEditing(false);
        setEditingIndex(null);
      }

      if (!response.ok) {
        console.error('Failed to save assignment data');
        return;
      }

      await Promise.all(problems.map(problem =>
        fetch(`/api/problem?id=${problem.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assignmentId: id, content: problem }),
        })
      ));

      if(sendNotification){
        // TODO: Implement send notification logic here.
        console.log('Sending notification...');
      }

      setIsEditing(false);
      setEditingIndex(null);

    } catch (error) {
      console.error('Error saving assignment or problems:', error);
    }
  };

  const addNewProblem = () => {
    const newProblem = { id: generateUUID(), problemDescription: "", answer: "", solutionWriteup: "" };
    setProblems([...problems, newProblem]);
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
