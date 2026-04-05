"use client";

import { useCallback, useEffect, useState } from "react";
import { CoverImageWrapper } from "@/components/cover-image-wrapper";
import { Separator } from "@/components/ui/separator";
import { WysiwygEditor } from "@/components/wysiwyg-editor";
export default function LeavingPage() {
  const [content, setContent] = useState("");

  const fetchContent = useCallback(async () => {
    const res = await fetch("/api/pages/leaving");
    const data = await res.json();
    setContent(data?.content || "");
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <div className="space-y-6">
      <CoverImageWrapper />
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Afrejse</h1>
        <p className="text-muted-foreground">
          Her findes information om afrejse.
        </p>
      </div>
      <Separator />
      <WysiwygEditor
        initialContent={content}
        onSave={fetchContent}
        slug="leaving"
      />
    </div>
  );
}
