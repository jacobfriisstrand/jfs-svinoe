import BookingCalendar from "@/components/booking-calendar";
import { CoverImageWrapper } from "@/components/cover-image-wrapper";
import { TodoList } from "@/components/todo-list";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="space-y-6">
      <CoverImageWrapper />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Forside</h1>
        <p className="text-muted-foreground">Opgaver og kalender</p>
      </div>
      <Separator />
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="w-full overflow-auto">
          <BookingCalendar />
        </div>
        <div className="w-full overflow-auto">
          <TodoList />
        </div>
      </div>
    </div>
  );
}
