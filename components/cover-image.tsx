"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface CoverImageProps {
  initialImageUrl?: string;
  pageId: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export function CoverImage({ pageId, initialImageUrl }: CoverImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialImageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timestamp, setTimestamp] = useState(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    async function loadPageImage() {
      try {
        const res = await fetch(
          `/api/upload/cover-image?pageId=${encodeURIComponent(pageId)}`
        );
        const data = await res.json();

        if (data.url) {
          setImageUrl(data.url);
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

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

      const formData = new FormData();
      formData.append("file", file);
      formData.append("pageId", pageId);

      const res = await fetch("/api/upload/cover-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setImageUrl(`${data.url}?t=${Date.now()}`);
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }
    if (imageUrl) {
      return (
        <Image
          alt="Cover"
          className="h-full w-full object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={`${imageUrl}${imageUrl.includes("?") ? "&" : "?"}t=${timestamp}`}
        />
      );
    }
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-400">
        Intet coverbillede for denne side
      </div>
    );
  };

  return (
    <div className="relative h-[40vh] w-full border-gray-200 border-b bg-gray-100">
      {renderContent()}
      <div className="absolute right-4 bottom-4 z-10">
        <Button
          className="bg-white/90 shadow-sm hover:bg-white"
          disabled={isUploading}
          variant="secondary"
        >
          <label className="cursor-pointer">
            {isUploading ? "Uploader..." : "Skift coverbillede"}
            <input
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={handleImageUpload}
              type="file"
            />
          </label>
        </Button>
      </div>
    </div>
  );
}
