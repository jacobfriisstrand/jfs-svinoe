export const dynamic = "force-dynamic";

("use client");

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CoverImageWrapper } from "@/components/cover-image-wrapper";
import { LoadingSpinner } from "@/components/loading-spinner";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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

interface GuideEntry {
  content: string;
  external_link?: string;
  file_url?: string;
  id: string;
  link_label?: string;
  title: string;
}

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

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/guide-entries");
      if (!res.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setEntries(data);
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to fetch guide entries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let fileUrl: string | null = null;

      if (values.file?.[0]) {
        setUploadingFile(true);
        const file = values.file[0];
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload/guide-file", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("File upload failed");
        }

        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url;
      }

      // Prepare the data to be inserted
      const entryData = {
        title: values.title,
        content: values.content,
        file_url: fileUrl,
        external_link: values.external_link || null,
        link_label: values.link_label || null,
      };

      const res = await fetch("/api/guide-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      });

      if (!res.ok) {
        throw new Error("Failed to create entry");
      }
      const data = await res.json();

      setEntries([...entries, data as GuideEntry]);
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
    } catch (_error) {
      console.error("Full error:", _error);
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
      const res = await fetch(`/api/guide-entries/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      setEntries(entries.filter((entry) => entry.id !== id));
      toast({
        title: "Opslag slettet",
        description: "Guide opslaget er blevet slettet.",
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Something went wrong while deleting. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleUpdate(id: string, values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch(`/api/guide-entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          content: values.content,
          external_link: values.external_link || undefined,
          link_label: values.link_label || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }

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
    } catch (_error) {
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

  const groupedEntries = sortedEntries.reduce(
    (acc, entry) => {
      const firstLetter = entry.title[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(entry);
      return acc;
    },
    {} as Record<string, GuideEntry[]>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <CoverImageWrapper />
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Fra A {">"} Å</h1>
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([letter, entries]) => (
            <div key={letter}>
              <h2 className="mb-4 font-bold text-2xl">{letter}</h2>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Card key={entry.id}>
                    {editingId === entry.id ? (
                      <CardContent className="pt-6">
                        <Form {...editForm}>
                          <form
                            className="space-y-4"
                            onSubmit={editForm.handleSubmit((values) =>
                              handleUpdate(entry.id, values)
                            )}
                          >
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
                                    <Textarea
                                      className="min-h-[100px] whitespace-pre-wrap"
                                      {...field}
                                    />
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
                                    <Input
                                      placeholder="https://..."
                                      type="url"
                                      {...field}
                                    />
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
                                    <Input
                                      placeholder="Klik her for at..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex space-x-2">
                              <Button type="submit">Gem</Button>
                              <Button
                                onClick={handleCancelEdit}
                                type="button"
                                variant="outline"
                              >
                                Annuller
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    ) : (
                      <>
                        <CardHeader>
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <CardTitle>{entry.title}</CardTitle>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleEdit(entry)}
                                size="sm"
                                variant="secondary"
                              >
                                Rediger
                              </Button>
                              <Button
                                onClick={() => handleDelete(entry.id)}
                                size="sm"
                                variant="destructive"
                              >
                                Slet
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="">{entry.content}</p>
                          <div className="mt-4 space-y-2 overflow-hidden">
                            {entry.file_url && (
                              <div>
                                <a
                                  className="text-primary hover:underline"
                                  href={entry.file_url}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  {entry.file_url.split("/").pop()}
                                </a>
                              </div>
                            )}
                            {entry.external_link && (
                              <div>
                                <a
                                  className="text-primary underline hover:no-underline"
                                  href={entry.external_link}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
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
        <Card className="sticky top-4 h-fit">
          <CardHeader>
            <CardTitle>Tilføj opslag</CardTitle>
            <CardDescription>Opret et nyt guide opslag.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
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
                        <Textarea
                          className="min-h-[100px]"
                          placeholder="Indtast indhold"
                          {...field}
                        />
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
                        <Input
                          onChange={(e) => onChange(e.target.files)}
                          type="file"
                          {...field}
                        />
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
                        <Input
                          placeholder="https://..."
                          type="url"
                          {...field}
                        />
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
                <Button disabled={uploadingFile} type="submit">
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
