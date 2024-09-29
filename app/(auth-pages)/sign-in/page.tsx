import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login({ searchParams }: Readonly<{ searchParams: Message }>) {
  return (
    <form className="flex flex-col gap-10 [&>*]:space-y-2">
      <h1 className="text-4xl font-semibold">Sommerhuset Svinø</h1>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input name="email" required />
      </div>

      <div>
        <Label htmlFor="password">Kodeord</Label>
        <Input type="password" name="password" required />
      </div>
      <SubmitButton pendingText="Signing In..." formAction={signInAction}>
        Log ind
      </SubmitButton>
      <FormMessage message={searchParams} />
    </form>
  );
}
