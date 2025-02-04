"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, LinkIcon, Trash2, Settings2 } from "lucide-react";
import { da } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { LoadingSpinner } from "./loading-spinner";
import Link from "next/link";

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

type Booking = {
  id: string;
  family_member: string;
  start_date: string;
  end_date: string;
  week_number: string;
};

export default function BookingCalendar() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [calendarSettings, setCalendarSettings] = useState<{ id?: string; external_link?: string } | null>(null);
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

  useEffect(() => {
    fetchBookings();
    fetchCalendarSettings();
  }, []);

  async function fetchCalendarSettings() {
    try {
      const { data, error } = await supabase.from("calendar_settings").select("*").single();
      if (error) throw error;
      setCalendarSettings(data);
    } catch (error) {
      console.error("Error fetching calendar settings:", error);
    }
  }

  async function fetchBookings() {
    try {
      const { data, error } = await supabase.from("bookings").select("*").order("start_date", { ascending: true });

      if (error) throw error;

      setBookings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteBooking(id: string) {
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", id);

      if (error) throw error;

      setBookings(bookings.filter((booking) => booking.id !== id));
      toast({
        title: "Booking deleted",
        description: "The booking has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete booking.",
        variant: "destructive",
      });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const weekNumbers = getAllWeekNumbers(values.arrival, values.departure);
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          family_member: values.familyMember,
          start_date: values.arrival,
          end_date: values.departure,
          week_number: weekNumbers.join(", "),
        })
        .select();

      if (error) throw error;

      setBookings([...bookings, data[0] as Booking]);
      form.reset();
      toast({
        title: "Booking oprettet",
        description: "Din booking er blevet oprettet.",
      });
    } catch (error) {
      toast({
        title: "Fejl",
        description: "Noget gik galt. Prøv venligst igen.",
        variant: "destructive",
      });
    }
  }

  async function onSettingsSubmit(values: z.infer<typeof settingsFormSchema>) {
    try {
      const { error } = await supabase.from("calendar_settings").update({ external_link: values.external_link }).eq("id", calendarSettings?.id);

      if (error) throw error;

      setCalendarSettings({ ...calendarSettings, external_link: values.external_link });
      setDialogOpen(false);
      toast({
        title: "Link opdateret",
        description: "Det eksterne kalender link er blevet opdateret.",
      });
    } catch (error) {
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
        <div className="flex items-center gap-4 justify-start mb-4 flex-wrap">
          {calendarSettings?.external_link && (
            <Link href={calendarSettings.external_link} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <LinkIcon className="h-4 w-4" />
                Link til ekstern kalender
              </Button>
            </Link>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4" />
                Rediger link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rediger eksternt kalender link</DialogTitle>
              </DialogHeader>
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-4">
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
        <CardDescription>Se hvem der bruger sommerhuset eller lav din egen 'booking'.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="flex gap-4 flex-col md:flex-row">
              <FormField
                control={form.control}
                name="arrival"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Ankomst</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "d. MMM yyyy", { locale: da }) : <span>Vælg ankomst</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar showWeekNumber mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus locale={da} />
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
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "d. MMM yyyy", { locale: da }) : <span>Vælg afrejse</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const arrival = form.getValues("arrival");
                            return date < new Date() || (arrival && date <= arrival);
                          }}
                          initialFocus
                          locale={da}
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
          <h3 className="font-medium mb-4">Nuværende bookinger</h3>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{booking.family_member}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.start_date), "d. MMM yyyy", { locale: da })} - {format(new Date(booking.end_date), "d. MMM yyyy", { locale: da })}
                  </p>
                  <p className="text-sm text-muted-foreground">Uge {booking.week_number}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteBooking(booking.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-muted-foreground text-center py-4">Ingen bookinger endnu</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
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
