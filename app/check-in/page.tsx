export const dynamic = "force-dynamic";

("use client");

import { useCallback, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { WysiwygEditor } from "@/components/wysiwyg-editor";

export default function CheckInPage() {
  const [content, setContent] = useState("");

  const fetchContent = useCallback(async () => {
    const res = await fetch("/api/pages/check-in");
    const data = await res.json();
    setContent(data?.content || "");
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Ankomst</h1>
        <p className="text-muted-foreground">
          Her findes information om ankomst.
        </p>
      </div>
      <Separator />
      <WysiwygEditor
        initialContent={content}
        onSave={fetchContent}
        slug="check-in"
      />
    </div>
  );
}
