"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "./ui/use-toast";
import { Pencil } from "lucide-react";

interface TextEditorProps {
  slug: string;
  initialContent?: string;
  onSave?: () => void;
}

export function WysiwygEditor({ slug, initialContent, onSave }: TextEditorProps) {
  const [content, setContent] = useState(initialContent || "");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent || "");
  }, [initialContent]);

  async function saveContent() {
    try {
      const { error } = await supabase.from("pages").update({ content }).eq("slug", slug);

      if (error) throw error;

      toast({
        title: "Gemt",
        description: "Indholdet er blevet gemt.",
      });

      setIsEditing(false);
      // Call onSave callback if provided
      onSave?.();
    } catch (error) {
      toast({
        title: "Fejl",
        description: "Kunne ikke gemme indholdet. Prøv venligst igen.",
        variant: "destructive",
      });
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-4 justify-between md:max-w-[50%]">
        <div className="">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Rediger
          </Button>
        </div>
        <div className="prose prose-stone dark:prose-invert max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:max-w-[50%]">
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Skriv dit indhold her..." className="min-h-[300px]" />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          Annuller
        </Button>
        <Button onClick={saveContent}>Gem</Button>
      </div>
    </div>
  );
}
