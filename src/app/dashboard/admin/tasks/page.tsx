
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { taskLibrary as defaultTasks, Task } from "@/lib/tasks";
import { Loader2, PlusCircle, Edit, Trash2, Wand2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { generateNewTaskLibrary } from "@/app/actions";

const ITEMS_PER_PAGE = 5;

const TaskForm = ({
  task,
  onSave,
  onCancel,
}: {
  task: Partial<Task> | null;
  onSave: (task: Task) => void;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(task?.taskTitle || "");
  const [description, setDescription] = useState(task?.taskDescription || "");
  const [options, setOptions] = useState(task?.options || ["", "", "", ""]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || options.some((o) => !o)) {
      alert("Please fill all fields");
      return;
    }
    onSave({
      taskTitle: title,
      taskDescription: description,
      options,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-foreground">Task Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">Task Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">Review Options</Label>
        {options.map((option, index) => (
          <Input
            key={index}
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            required
            className="mb-2"
          />
        ))}
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
            </Button>
        </DialogClose>
        <Button type="submit">Save Task</Button>
      </DialogFooter>
    </form>
  );
};

export default function ManageTasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [aiTaskCount, setAiTaskCount] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = tasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    setIsClient(true);
    const storedTasks = localStorage.getItem("custom_task_library");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      setTasks(defaultTasks);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("custom_task_library", JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

  useEffect(() => {
    // Reset to page 1 if tasks change
    setCurrentPage(1);
  }, [tasks]);

  const handleGenerateWithAi = async () => {
    setIsLoadingAi(true);
    try {
      const newTasks = await generateNewTaskLibrary(aiTaskCount);
      setTasks(newTasks.tasks);
      toast({
        title: "AI Refresh Complete!",
        description: `The task library has been updated with ${newTasks.tasks.length} new tasks from AI.`,
      });
    } catch (error) {
      console.error("AI generation failed:", error);
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: "Could not generate new tasks. Please try again later.",
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSaveTask = (task: Task) => {
    if (editingIndex !== null) {
      const newTasks = [...tasks];
      newTasks[editingIndex] = task;
      setTasks(newTasks);
      toast({ title: "Task Updated", description: "The task has been saved." });
    } else {
      setTasks([task, ...tasks]); // Add new task to the beginning
      toast({ title: "Task Added", description: "The new task has been added to the library." });
    }
    closeForm();
  };
  
  const handleAddNew = () => {
    setEditingTask(null);
    setEditingIndex(null);
    setIsFormOpen(true);
  };

  const handleEdit = (taskToEdit: Task) => {
    const originalIndex = tasks.findIndex(t => t.taskTitle === taskToEdit.taskTitle);
    setEditingTask(taskToEdit);
    setEditingIndex(originalIndex);
    setIsFormOpen(true);
  };
  
  const handleDelete = (taskToDelete: Task) => {
    const newTasks = tasks.filter(t => t.taskTitle !== taskToDelete.taskTitle);
    setTasks(newTasks);
    toast({ title: "Task Deleted", variant: "destructive" });
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setEditingIndex(null);
  }

  if (!isClient) {
    return (
      <div className="grid gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Task Library</h1>
          <p className="text-muted-foreground">
            Add, edit, or delete tasks available to users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Task Library</h1>
            <p className="text-muted-foreground">
              Add, edit, or delete tasks available to users.
            </p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Task
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isLoadingAi}>
                  {isLoadingAi ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Refresh with AI
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Refresh with AI</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will replace the entire current task library with new
                    tasks generated by AI. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 py-2">
                    <Label htmlFor="ai-task-count">Number of Tasks to Generate</Label>
                    <Input 
                        id="ai-task-count"
                        type="number"
                        min="1"
                        value={aiTaskCount}
                        onChange={(e) => setAiTaskCount(Math.max(1, Number(e.target.value)))}
                    />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleGenerateWithAi}>
                    Yes, Refresh
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Tasks ({tasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paginatedTasks.map((task, index) => (
              <div key={index} className="border p-4 rounded-lg flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{task.taskTitle}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{task.taskDescription}</p>
                  <ul className="text-xs list-disc pl-5 mt-2 text-muted-foreground">
                    {task.options.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this task? This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                             <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(task)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              </div>
            ))}
             {tasks.length === 0 && (
                <p className="text-muted-foreground text-center py-12">No tasks created yet.</p>
            )}
          </CardContent>
           {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="bg-background">
            <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                <DialogDescription>
                    Fill in the details for the task below.
                </DialogDescription>
            </DialogHeader>
            <TaskForm 
                task={editingTask}
                onSave={handleSaveTask}
                onCancel={closeForm}
            />
          </DialogContent>
      </Dialog>
    </>
  );
}
