"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface CoverImageProps {
  pageId: string;
  initialImageUrl?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export function CoverImage({ pageId, initialImageUrl }: CoverImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timestamp, setTimestamp] = useState(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    async function loadPageImage() {
      try {
        const { data: publicUrl } = supabase.storage.from("images").getPublicUrl(`cover-images/${pageId}`);

        // Check if the image exists
        const response = await fetch(publicUrl.publicUrl, { method: "HEAD" });
        if (response.ok) {
          setImageUrl(publicUrl.publicUrl);
        } else {
          setImageUrl(null);
        }
      } catch (error) {
        console.error("Error loading image:", error);
        setImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadPageImage();
  }, [pageId]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Check file size before proceeding
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Filen er for stor",
          description: "Vælg venligst et billede, der er mindre end 5MB.",
          variant: "destructive",
        });
        // Reset the input
        event.target.value = "";
        return;
      }

      setIsUploading(true);
      setIsLoading(true);

      // Delete existing image if there is one
      if (imageUrl) {
        const oldImagePath = `cover-images/${pageId}`;
        await supabase.storage.from("images").remove([oldImagePath]);
      }

      // Upload new image
      const { data: uploadData, error: uploadError } = await supabase.storage.from("images").upload(`cover-images/${pageId}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrl } = supabase.storage.from("images").getPublicUrl(`cover-images/${pageId}`);
      setImageUrl(publicUrl.publicUrl + `?t=${Date.now()}`);
      setTimestamp(Date.now());

      toast({
        title: "Coverbillede opdateret",
        description: "Dit nye coverbillede er blevet uploadet.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Fejl ved upload",
        description: "Der opstod en fejl under upload af billedet. Prøv igen.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsLoading(false);
      // Reset the input after upload (success or failure)
      event.target.value = "";
    }
  };

  return (
    <div className="relative w-full h-[40vh] bg-gray-100 border-b border-gray-200">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : imageUrl ? (
        <Image fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" src={`${imageUrl}${imageUrl.includes("?") ? "&" : "?"}t=${timestamp}`} alt="Cover" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">Intet coverbillede for denne side</div>
      )}
      <div className="absolute bottom-4 right-4 z-10">
        <Button variant="secondary" className="bg-white/90 hover:bg-white shadow-sm" disabled={isUploading}>
          <label className="cursor-pointer">
            {isUploading ? "Uploader..." : "Skift coverbillede"}
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
          </label>
        </Button>
      </div>
    </div>
  );
}
