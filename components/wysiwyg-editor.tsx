"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Pencil,
  Redo,
  Undo,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useToast } from "./ui/use-toast";

interface TextEditorProps {
  initialContent?: string;
  onSave?: () => void;
  slug: string;
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 border-b p-1">
      <Toggle
        aria-label="Fed"
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        pressed={editor.isActive("bold")}
        size="sm"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Kursiv"
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        pressed={editor.isActive("italic")}
        size="sm"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Overskrift 1"
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        pressed={editor.isActive("heading", { level: 1 })}
        size="sm"
      >
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Overskrift 2"
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        pressed={editor.isActive("heading", { level: 2 })}
        size="sm"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Punktliste"
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        pressed={editor.isActive("bulletList")}
        size="sm"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Nummereret liste"
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        pressed={editor.isActive("orderedList")}
        size="sm"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Button
        aria-label="Fortryd"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        aria-label="Gentag"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function WysiwygEditor({
  slug,
  initialContent,
  onSave,
}: TextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || "",
    editable: isEditing,
    editorProps: {
      attributes: {
        class:
          "prose prose-stone dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent !== undefined) {
      editor.commands.setContent(initialContent || "");
    }
  }, [editor, initialContent]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [editor, isEditing]);

  async function saveContent() {
    if (!editor) {
      return;
    }
    const content = editor.getHTML();

    try {
      const res = await fetch(`/api/pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      toast({
        title: "Gemt",
        description: "Indholdet er blevet gemt.",
      });

      setIsEditing(false);
      onSave?.();
    } catch (_error) {
      toast({
        title: "Fejl",
        description: "Kunne ikke gemme indholdet. Prøv venligst igen.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4 md:max-w-[50%]">
      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(false)} variant="outline">
              Annuller
            </Button>
            <Button onClick={saveContent}>Gem</Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            variant="outline"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Rediger
          </Button>
        )}
      </div>
      <div className="rounded-md border">
        {isEditing && <EditorToolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
