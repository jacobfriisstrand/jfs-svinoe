"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ListCheck, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { LoadingSpinner } from "./loading-spinner";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Opgavetitlen skal være mindst 2 tegn.",
  }),
  assignee: z.string().min(2, {
    message: "Ansvarlig skal være mindst 2 tegn.",
  }),
});

type Task = {
  id: string;
  title: string;
  status: "not_started" | "doing" | "done";
  order_index: number;
  assignee: string;
};

const StatusDot = ({ status }: { status: Task["status"] }) => {
  const colors = {
    not_started: "bg-gray-300", // Light gray for not started
    doing: "bg-yellow-400", // Yellow for in progress
    done: "bg-green-500", // Green for completed
  };

  return <div className={`w-2.5 h-2.5 rounded-full ${colors[status]}`} />;
};

export function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const { data, error } = await supabase.from("tasks").select("*").order("order_index", { ascending: true });

      if (error) throw error;

      setTasks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteTask(taskId: string) {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.filter((task) => task.id !== taskId));
      toast({
        title: "Opgave slettet",
        description: "Opgaven er blevet slettet.",
      });
    } catch (error) {
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
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: values.title,
          assignee: values.assignee,
          status: "not_started",
          order_index: tasks.length,
        })
        .select();

      if (error) throw error;

      setTasks([...tasks, data[0] as Task]);
      form.reset();
      toast({
        title: "Opgave oprettet",
        description: "Din opgave er blevet oprettet.",
      });
    } catch (error) {
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
      const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: status as Task["status"] } : task)));

      toast({
        title: "Opgave opdateret",
        description: "Opgavestatus er blevet opdateret.",
      });
    } catch (error) {
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
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;
    return a.order_index - b.order_index;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListCheck className="size-6" />
          <CardTitle>Opgaveliste</CardTitle>
        </div>
        <CardDescription>Administrering af opgaver for sommerhuset.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tilføj opgave
            </Button>
          </form>
        </Form>
        <div className="mt-6 space-y-4">
          {sortedTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted">
              <div className="flex flex-col gap-1">
                <span className={task.status === "done" ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                <span className="text-sm text-muted-foreground">Ansvarlig: {task.assignee}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot status={task.status} />
                <Select value={task.status} onValueChange={(value) => updateTaskStatus(task.id, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Ikke påbegyndt</SelectItem>
                    <SelectItem value="doing">I gang</SelectItem>
                    <SelectItem value="done">Færdig</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-muted-foreground text-center py-4">Ingen opgaver endnu</p>}
        </div>
      </CardContent>
    </Card>
  );
}
