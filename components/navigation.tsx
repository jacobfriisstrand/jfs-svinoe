import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  return user ? (
    <nav className="fixed top-0 w-full bg-white drop-shadow-md px-5 flex items-end md:items-center justify-between gap-3 flex-col md:flex-row md:gap-10 py-4 border-b-slate-500 border md:justify-between">
      <ul className="flex justify-between w-full md:w-fit md:gap-10">
        <li>
          <Link href="/">Forside</Link>
        </li>
        <li>
          <Link href="/">Ankomst</Link>
        </li>
        <li>
          <Link href="/">Afrejse</Link>
        </li>
        <li>
          <Link href="/">Fra A - Å</Link>
        </li>
      </ul>
      <form className="w-full md:w-fit" action={signOutAction}>
        <Button className="w-full md:w-fit" type="submit" variant={"default"}>
          Log ud
        </Button>
      </form>
    </nav>
  ) : (
    ""
  );
}
