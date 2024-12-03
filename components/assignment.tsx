'use client';

'use client';

import { Problem } from "@/lib/utils";
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
    setProblems([...problems, { title: 'New Problem', content: '', steps: [] }]);
    setEditingIndex(problems.length);
  };

  const handleProblemChange = (index: number, field: string, value: any) => {
    const updatedProblems = [...problems];
    (updatedProblems[index] as any)[field] = value;
    setProblems(updatedProblems);
  };

  const handleStepsChange = (index: number, value: string) => {
    const updatedProblems = [...problems];
    updatedProblems[index].steps = value.split('\n').filter(step => step.trim() !== '');
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
                  <Input
                    value={problem.title}
                    onChange={(e) => handleProblemChange(index, 'title', e.target.value)}
                    className="font-bold text-lg mb-2"
                  />
                  <Textarea
                    value={problem.content}
                    onChange={(e) => handleProblemChange(index, 'content', e.target.value)}
                    className="mb-2"
                    placeholder="Problem Content"
                  />
                  <Textarea
                    value={problem.steps.join('\n')}
                    onChange={(e) => handleStepsChange(index, e.target.value)}
                    className="mb-2"
                    placeholder="Steps (one per line)"
                  />
                  <Button onClick={() => setEditingIndex(null)}>Done</Button>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-lg mb-2">{problem.title}</h3>
                  <p className="mb-2">{problem.content}</p>
                  {problem.steps.length > 0 && (
                    <ul className="list-disc list-inside mb-2">
                      {problem.steps.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ul>
                  )}
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
