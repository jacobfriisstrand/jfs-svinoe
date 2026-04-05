import BookingCalendar from "@/components/booking-calendar";
import { CoverImageWrapper } from "@/components/cover-image-wrapper";
import { TodoList } from "@/components/todo-list";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="space-y-6">
      <CoverImageWrapper />
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Forside</h1>
        <p className="text-muted-foreground">Opgaver og kalender</p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 gap-6 overflow-hidden md:grid-cols-2">
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
