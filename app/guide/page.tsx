"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/loading-spinner";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Titlen skal være mindst 2 tegn.",
  }),
  content: z.string().min(2, {
    message: "Indholdet skal være mindst 2 tegn.",
  }),
});

type GuideEntry = {
  id: string;
  title: string;
  content: string;
};

export default function GuidePage() {
  const [entries, setEntries] = useState<GuideEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { toast } = useToast();

  // Danish alphabet order mapping
  const danishAlphabetOrder: { [key: string]: number } = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    I: 9,
    J: 10,
    K: 11,
    L: 12,
    M: 13,
    N: 14,
    O: 15,
    P: 16,
    Q: 17,
    R: 18,
    S: 19,
    T: 20,
    U: 21,
    V: 22,
    W: 23,
    X: 24,
    Y: 25,
    Z: 26,
    Æ: 27,
    Ø: 28,
    Å: 29,
  };

  const getDanishAlphabetOrder = (char: string): number => {
    const upperChar = char.toUpperCase();
    return danishAlphabetOrder[upperChar] || 0;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const { data, error } = await supabase.from("guide_entries").select("*").order("title", { ascending: true });

      if (error) throw error;

      setEntries(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch guide entries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await supabase
        .from("guide_entries")
        .insert({
          title: values.title,
          content: values.content,
        })
        .select();

      if (error) throw error;

      setEntries([...entries, data[0] as GuideEntry]);
      form.reset({
        title: "",
        content: "",
      });
      toast({
        title: "Opslag oprettet",
        description: "Dit guide opslag er blevet oprettet.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from("guide_entries").delete().eq("id", id);

      if (error) throw error;

      setEntries(entries.filter((entry) => entry.id !== id));
      toast({
        title: "Opslag slettet",
        description: "Guide opslaget er blevet slettet.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while deleting. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleUpdate(id: string, values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase
        .from("guide_entries")
        .update({
          title: values.title,
          content: values.content,
        })
        .eq("id", id);

      if (error) throw error;

      setEntries(entries.map((entry) => (entry.id === id ? { ...entry, title: values.title, content: values.content } : entry)));
      setEditingId(null);
      editForm.reset();
      toast({
        title: "Opslag opdateret",
        description: "Guide opslaget er blevet opdateret.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while updating. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleEdit = (entry: GuideEntry) => {
    editForm.reset({
      title: entry.title,
      content: entry.content,
    });
    setEditingId(entry.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    editForm.reset();
  };

  const sortedEntries = [...entries].sort((a, b) => {
    const aFirstChar = a.title[0].toUpperCase();
    const bFirstChar = b.title[0].toUpperCase();

    const aOrder = getDanishAlphabetOrder(aFirstChar);
    const bOrder = getDanishAlphabetOrder(bFirstChar);

    if (aOrder === bOrder) {
      return a.title.localeCompare(b.title, "da");
    }

    return aOrder - bOrder;
  });

  const groupedEntries = sortedEntries.reduce((acc, entry) => {
    const firstLetter = entry.title[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(entry);
    return acc;
  }, {} as Record<string, GuideEntry[]>);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fra A {">"} Å</h1>
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Tilføj opslag</CardTitle>
            <CardDescription>Opret et nyt guide opslag.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titel</FormLabel>
                      <FormControl>
                        <Input placeholder="Indtast titel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indhold</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Indtast indhold" className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Tilføj opslag</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([letter, entries]) => (
            <div key={letter}>
              <h2 className="text-2xl font-bold mb-4">{letter}</h2>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Card key={entry.id}>
                    {editingId === entry.id ? (
                      <CardContent className="pt-6">
                        <Form {...editForm}>
                          <form onSubmit={editForm.handleSubmit((values) => handleUpdate(entry.id, values))} className="space-y-4">
                            <FormField
                              control={editForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Titel</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editForm.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Indhold</FormLabel>
                                  <FormControl>
                                    <Textarea className="min-h-[100px] whitespace-pre-wrap" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex space-x-2">
                              <Button type="submit">Gem</Button>
                              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                Annuller
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    ) : (
                      <>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>{entry.title}</CardTitle>
                            <div className="flex space-x-2">
                              <Button variant="secondary" size="sm" onClick={() => handleEdit(entry)}>
                                Rediger
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>
                                Slet
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="whitespace-pre-wrap">{entry.content}</p>
                        </CardContent>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
