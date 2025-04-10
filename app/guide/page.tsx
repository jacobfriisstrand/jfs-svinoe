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
import { CoverImageWrapper } from "@/components/cover-image-wrapper";
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
  file: z.any().optional(),
  external_link: z.string().url().optional().or(z.literal("")),
  link_label: z.string().optional(),
});

type GuideEntry = {
  id: string;
  title: string;
  content: string;
  file_url?: string;
  external_link?: string;
  link_label?: string;
};

export default function GuidePage() {
  const [entries, setEntries] = useState<GuideEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

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
      let fileUrl = null;

      if (values.file?.[0]) {
        setUploadingFile(true);
        const file = values.file[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage.from("guide-files").upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("guide-files").getPublicUrl(fileName);

        fileUrl = publicUrl;
      }

      // Prepare the data to be inserted
      const entryData = {
        title: values.title,
        content: values.content,
        file_url: fileUrl,
        external_link: values.external_link || null,
        link_label: values.link_label || null,
      };

      console.log("Inserting data:", entryData);

      const { data, error } = await supabase.from("guide_entries").insert(entryData).select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      setEntries([...entries, data[0] as GuideEntry]);
      form.reset({
        title: "",
        content: "",
        file: null,
        external_link: "",
        link_label: "",
      });
      toast({
        title: "Opslag oprettet",
        description: "Dit guide opslag er blevet oprettet.",
      });
    } catch (error) {
      console.error("Full error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const entry = entries.find((e) => e.id === id);

      if (entry?.file_url) {
        const fileName = entry.file_url.split("/").pop();
        if (fileName) {
          await supabase.storage.from("guide-files").remove([fileName]);
        }
      }

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
          external_link: values.external_link || undefined,
          link_label: values.link_label || undefined,
        })
        .eq("id", id);

      if (error) throw error;

      setEntries(
        entries.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                title: values.title,
                content: values.content,
                external_link: values.external_link || undefined,
                link_label: values.link_label || undefined,
              }
            : entry
        )
      );
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
      external_link: entry.external_link || "",
      link_label: entry.link_label || "",
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
      <CoverImageWrapper />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fra A {">"} Å</h1>
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-2">
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
                            <FormField
                              control={editForm.control}
                              name="external_link"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ekstern link (valgfrit)</FormLabel>
                                  <FormControl>
                                    <Input type="url" placeholder="https://..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editForm.control}
                              name="link_label"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Link tekst (valgfrit)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Klik her for at..." {...field} />
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
                          <p className="">{entry.content}</p>
                          <div className="mt-4 space-y-2">
                            {entry.file_url && (
                              <div>
                                <a href={entry.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  {entry.file_url.split("/").pop()}
                                </a>
                              </div>
                            )}
                            {entry.external_link && (
                              <div>
                                <a href={entry.external_link} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                                  {entry.link_label || entry.external_link}
                                </a>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Card className="h-fit sticky top-4">
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
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Fil (valgfrit)</FormLabel>
                      <FormControl>
                        <Input type="file" onChange={(e) => onChange(e.target.files)} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="external_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ekstern link (valgfrit)</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="link_label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link tekst (valgfrit)</FormLabel>
                      <FormControl>
                        <Input placeholder="Klik her for at..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={uploadingFile}>
                  {uploadingFile ? "Uploader..." : "Tilføj opslag"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
