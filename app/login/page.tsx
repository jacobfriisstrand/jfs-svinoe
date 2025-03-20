"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CoverImageWrapper } from "@/components/cover-image-wrapper";
export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting to log in...");
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        router.push("/");
        router.refresh();
      } else {
        alert("Forkert adgangskode");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        alert(`Der opstod en fejl: ${error.message}`);
      } else {
        alert("Der opstod en uventet fejl. Prøv igen.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 space-y-4">
        <h1 className="text-2xl font-bold text-center">Svinø</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Indtast adgangskode" className="w-full" disabled={isLoading} />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logger ind..." : "Gå til dashboard"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
