"use client";

import { WysiwygEditor } from "@/components/wysiwyg-editor";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function CheckInPage() {
  const [content, setContent] = useState("");

  async function fetchContent() {
    const { data } = await supabase.from("pages").select("content").eq("slug", "check-in").single();
    setContent(data?.content || "");
  }

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ankomst</h1>
        <p className="text-muted-foreground">Her findes information om ankomst.</p>
      </div>
      <Separator />
      <WysiwygEditor slug="check-in" initialContent={content} onSave={fetchContent} />
    </div>
  );
}
