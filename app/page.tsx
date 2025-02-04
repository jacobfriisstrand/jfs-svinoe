import BookingCalendar from "@/components/booking-calendar";
import { TodoList } from "@/components/todo-list";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Forside</h1>
        <p className="text-muted-foreground">Opgaver og kalender</p>
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-2">
        <BookingCalendar />
        <TodoList />
      </div>
    </div>
  );
}
