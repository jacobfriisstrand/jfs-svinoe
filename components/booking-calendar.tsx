"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { CalendarIcon, LinkIcon, Settings2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

const formSchema = z.object({
  familyMember: z.string().min(2, {
    message: "Familiemedlemmets navn skal være mindst 2 tegn.",
  }),
  arrival: z.date(),
  departure: z.date(),
});

const settingsFormSchema = z.object({
  external_link: z.string().url({ message: "Indtast venligst en gyldig URL" }),
});

interface Booking {
  end_date: string;
  family_member: string;
  id: string;
  start_date: string;
  week_number: string;
}

export default function BookingCalendar() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [calendarSettings, setCalendarSettings] = useState<{
    id?: string;
    external_link?: string;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const settingsForm = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      external_link: calendarSettings?.external_link || "",
    },
  });

  useEffect(() => {
    if (calendarSettings?.external_link) {
      settingsForm.reset({
        external_link: calendarSettings.external_link,
      });
    }
  }, [calendarSettings, settingsForm]);

  const fetchCalendarSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar-settings");
      const data = await res.json();
      setCalendarSettings(data);
    } catch (_error) {
      console.error("Error fetching calendar settings:", _error);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await res.json();
      setBookings(data);
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBookings();
    fetchCalendarSettings();
  }, [fetchBookings, fetchCalendarSettings]);

  async function deleteBooking(id: string) {
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete booking");
      }

      setBookings(bookings.filter((booking) => booking.id !== id));
      toast({
        title: "Booking slettet",
        description: "Bookingen er blevet slettet.",
      });
    } catch (_error) {
      toast({
        title: "Fejl",
        description: "Kunne ikke slette booking.",
        variant: "destructive",
      });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const weekNumbers = getAllWeekNumbers(values.arrival, values.departure);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family_member: values.familyMember,
          start_date: values.arrival,
          end_date: values.departure,
          week_number: weekNumbers.join(", "),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create booking");
      }
      const data = await res.json();

      setBookings([...bookings, data as Booking]);
      form.reset();
      toast({
        title: "Booking oprettet",
        description: "Din booking er blevet oprettet.",
      });
    } catch (_error) {
      toast({
        title: "Fejl",
        description: "Noget gik galt. Prøv venligst igen.",
        variant: "destructive",
      });
    }
  }

  async function onSettingsSubmit(values: z.infer<typeof settingsFormSchema>) {
    try {
      const res = await fetch("/api/calendar-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: calendarSettings?.id,
          external_link: values.external_link,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update settings");
      }

      setCalendarSettings({
        ...calendarSettings,
        external_link: values.external_link,
      });
      setDialogOpen(false);
      toast({
        title: "Link opdateret",
        description: "Det eksterne kalender link er blevet opdateret.",
      });
    } catch (_error) {
      toast({
        title: "Fejl",
        description: "Noget gik galt. Prøv venligst igen.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-4 flex flex-wrap items-center justify-start gap-4">
          {calendarSettings?.external_link && (
            <Link
              href={calendarSettings.external_link}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Button size="sm" variant="outline">
                <LinkIcon className="h-4 w-4" />
                Link til ekstern kalender
              </Button>
            </Link>
          )}
          <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Settings2 className="h-4 w-4" />
                Rediger link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rediger eksternt kalender link</DialogTitle>
              </DialogHeader>
              <Form {...settingsForm}>
                <form
                  className="space-y-4"
                  onSubmit={settingsForm.handleSubmit(onSettingsSubmit)}
                >
                  <FormField
                    control={settingsForm.control}
                    name="external_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Gem</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="size-6" />
          <CardTitle>Kalender</CardTitle>
        </div>
        <CardDescription>
          Se hvem der bruger sommerhuset eller lav din egen 'booking'.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="familyMember"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Familiemedlem(mer)</FormLabel>
                  <FormControl>
                    <Input placeholder="Indtast navn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-4 xl:flex-row">
              <FormField
                control={form.control}
                name="arrival"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Ankomst</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          variant={"outline"}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "d. MMM yyyy", { locale: da })
                          ) : (
                            <span>Vælg ankomst</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          disabled={(date) => date < new Date()}
                          initialFocus
                          locale={da}
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value}
                          showWeekNumber
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departure"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Afrejse</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          variant={"outline"}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "d. MMM yyyy", { locale: da })
                          ) : (
                            <span>Vælg afrejse</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          disabled={(date) => {
                            const arrival = form.getValues("arrival");
                            return (
                              date < new Date() || (arrival && date <= arrival)
                            );
                          }}
                          initialFocus
                          locale={da}
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Book ophold</Button>
          </form>
        </Form>
        <div className="mt-6">
          <h3 className="mb-4 font-medium">Nuværende bookinger</h3>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                className="flex items-center justify-between rounded-lg border p-4"
                key={booking.id}
              >
                <div>
                  <p className="font-medium">{booking.family_member}</p>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(booking.start_date), "d. MMM yyyy", {
                      locale: da,
                    })}{" "}
                    -{" "}
                    {format(new Date(booking.end_date), "d. MMM yyyy", {
                      locale: da,
                    })}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Uge {booking.week_number}
                  </p>
                </div>
                <Button
                  onClick={() => deleteBooking(booking.id)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {bookings.length === 0 && (
              <p className="py-4 text-center text-muted-foreground">
                Ingen bookinger endnu
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getWeekNumber(date: Date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function getAllWeekNumbers(startDate: Date, endDate: Date): number[] {
  const weeks: number[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const weekNumber = getWeekNumber(currentDate);
    if (!weeks.includes(weekNumber)) {
      weeks.push(weekNumber);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weeks;
}
