"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ListCheck, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./loading-spinner";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Opgavetitlen skal være mindst 2 tegn.",
  }),
  assignee: z.string().min(2, {
    message: "Ansvarlig skal være mindst 2 tegn.",
  }),
});

interface Task {
  assignee: string;
  id: string;
  order_index: number;
  status: "not_started" | "doing" | "done";
  title: string;
}

const StatusDot = ({ status }: { status: Task["status"] }) => {
  const colors = {
    not_started: "bg-gray-300", // Light gray for not started
    doing: "bg-yellow-400", // Yellow for in progress
    done: "bg-green-500", // Green for completed
  };

  return <div className={`h-2.5 w-2.5 rounded-full ${colors[status]}`} />;
};

export function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await res.json();
      setTasks(data);
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function deleteTask(taskId: string) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks(tasks.filter((task) => task.id !== taskId));
      toast({
        title: "Opgave slettet",
        description: "Opgaven er blevet slettet.",
      });
    } catch (_error) {
      toast({
        title: "Fejl",
        description: "Noget gik galt. Prøv venligst igen.",
        variant: "destructive",
      });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          assignee: values.assignee,
          status: "not_started",
          order_index: tasks.length,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create task");
      }
      const data = await res.json();

      setTasks([...tasks, data as Task]);
      form.reset();
      toast({
        title: "Opgave oprettet",
        description: "Din opgave er blevet oprettet.",
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateTaskStatus(taskId: string, status: string) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Failed to update task");
      }

      setTasks(
        tasks.map((task) =>
          task.id === taskId
            ? { ...task, status: status as Task["status"] }
            : task
        )
      );

      toast({
        title: "Opgave opdateret",
        description: "Opgavestatus er blevet opdateret.",
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    // Move done tasks to the bottom
    if (a.status === "done" && b.status !== "done") {
      return 1;
    }
    if (a.status !== "done" && b.status === "done") {
      return -1;
    }
    return a.order_index - b.order_index;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListCheck className="size-6" />
          <CardTitle>Opgaveliste</CardTitle>
        </div>
        <CardDescription>
          Administrering af opgaver for sommerhuset.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ny opgave</FormLabel>
                  <FormControl>
                    <Input placeholder="Indtast opgavetitel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ansvarlig</FormLabel>
                  <FormControl>
                    <Input placeholder="Indtast navn på ansvarlig" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={loading} type="submit">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tilføj opgave
            </Button>
          </form>
        </Form>
        <div className="mt-6 space-y-4">
          {sortedTasks.map((task) => (
            <div
              className="flex flex-col items-center justify-between gap-4 rounded-lg border bg-muted p-4 lg:flex-row"
              key={task.id}
            >
              <div className="flex flex-col gap-1">
                <span
                  className={
                    task.status === "done"
                      ? "text-muted-foreground line-through"
                      : ""
                  }
                >
                  {task.title}
                </span>
                <span className="text-muted-foreground text-sm">
                  Ansvarlig: {task.assignee}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot status={task.status} />
                <Select
                  onValueChange={(value) => updateTaskStatus(task.id, value)}
                  value={task.status}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Ikke påbegyndt</SelectItem>
                    <SelectItem value="doing">I gang</SelectItem>
                    <SelectItem value="done">Færdig</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => deleteTask(task.id)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="py-4 text-center text-muted-foreground">
              Ingen opgaver endnu
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
