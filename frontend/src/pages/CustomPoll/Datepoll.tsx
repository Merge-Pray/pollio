import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { API_URL } from "@/lib/config";
import useUserStore from "@/hooks/userstore";
import { Calendar, Clock, Plus, X } from "lucide-react";

interface DateOption {
  dateTime: string;
  label: string;
}

function Datepoll() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const navigate = useNavigate();
  const { currentUser } = useUserStore();

  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    question: z.string().min(2, {
      message: "Question must be at least 2 characters.",
    }),
    dateOptions: z
      .array(
        z.object({
          dateTime: z.string().min(1, "Date and time are required"),
          label: z.string().optional(),
        })
      )
      .min(2, "At least 2 date options required")
      .max(10, "Maximum 10 date options allowed"),
    multipleChoice: z.boolean().default(false),
    isAnonymous: z.boolean().default(false),
    hasEndDate: z.boolean().default(false),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      question: "",
      dateOptions: [],
      multipleChoice: false,
      isAnonymous: false,
      hasEndDate: false,
      endDate: "",
      endTime: "23:59",
    },
  });

  const watchedHasEndDate = form.watch("hasEndDate");

  // Initialize with 2 empty date options
  useEffect(() => {
    if (dateOptions.length === 0) {
      const initialOptions = [
        { dateTime: "", label: "" },
        { dateTime: "", label: "" },
      ];
      setDateOptions(initialOptions);
      form.setValue("dateOptions", initialOptions);
    }
  }, []);

  // Update form when dateOptions change
  useEffect(() => {
    form.setValue("dateOptions", dateOptions);
  }, [dateOptions, form]);

  const addDateOption = () => {
    if (dateOptions.length < 10) {
      const newOptions = [...dateOptions, { dateTime: "", label: "" }];
      setDateOptions(newOptions);
    }
  };

  const removeDateOption = (index: number) => {
    if (dateOptions.length > 2) {
      const newOptions = dateOptions.filter((_, i) => i !== index);
      setDateOptions(newOptions);
    }
  };

  const updateDateOption = (
    index: number,
    field: "dateTime" | "label",
    value: string
  ) => {
    const newOptions = [...dateOptions];
    newOptions[index][field] = value;
    setDateOptions(newOptions);
  };

  const formatDateTimeForInput = (dateTime: string) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDateTimeForDisplay = (dateTime: string) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser) {
      setError("You must be logged in to create a poll");
      return;
    }

    // Validate that all date options have dateTime
    const validDateOptions = values.dateOptions.filter(
      (option) => option.dateTime
    );
    if (validDateOptions.length < 2) {
      setError("Please provide at least 2 valid date and time options");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let expirationDate = null;
      if (values.hasEndDate && values.endDate) {
        const dateTime = `${values.endDate}T${values.endTime || "23:59"}:00`;
        expirationDate = new Date(dateTime).toISOString();
      }

      // Convert date options to the format expected by the backend
      const options = validDateOptions.map((option) => ({
        dateTime: new Date(option.dateTime).toISOString(),
        text: option.label || formatDateTimeForDisplay(option.dateTime),
      }));

      const response = await fetch(`${API_URL}/api/poll/date`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: values.title,
          question: values.question,
          options: options,
          multipleChoice: values.multipleChoice,
          isAnonymous: values.isAnonymous,
          expirationDate: expirationDate,
          type: "date",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create poll");
      }

      const data = await response.json();
      console.log("Date poll created successfully:", data);

      navigate(`/user/polls/${data.poll.id}`);
    } catch (error) {
      console.error("Poll creation error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create poll"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const minDateTime = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Create Date Poll
          </CardTitle>
          <CardDescription>
            Create a poll to find the best date and time for meetings, events,
            or appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-semibold">
                      Poll Title
                    </FormLabel>
                    <FormDescription>
                      Give your date poll a descriptive title
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="e.g., Team Meeting Schedule"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-semibold">
                      Poll Question
                    </FormLabel>
                    <FormDescription>
                      Enter the main question for your poll
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="When would be the best time to meet?"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <FormLabel className="text-lg font-medium">
                      Date & Time Options
                    </FormLabel>
                    <FormDescription>
                      Add possible dates and times for your event (2-10 options)
                    </FormDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={addDateOption}
                    disabled={dateOptions.length >= 10}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-4">
                  {dateOptions.map((option, index) => (
                    <Card key={index} className="p-4 bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">
                              Option {index + 1}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <FormLabel className="text-sm">
                                Date & Time
                              </FormLabel>
                              <Input
                                type="datetime-local"
                                value={option.dateTime}
                                onChange={(e) =>
                                  updateDateOption(
                                    index,
                                    "dateTime",
                                    e.target.value
                                  )
                                }
                                min={minDateTime}
                                className="w-full"
                                required
                              />
                            </div>

                            <div>
                              <FormLabel className="text-sm">
                                Label (Optional)
                              </FormLabel>
                              <Input
                                placeholder="e.g., Morning session, After lunch..."
                                value={option.label}
                                onChange={(e) =>
                                  updateDateOption(
                                    index,
                                    "label",
                                    e.target.value
                                  )
                                }
                                className="w-full"
                              />
                            </div>
                          </div>

                          {option.dateTime && (
                            <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded border">
                              <strong>Preview:</strong>{" "}
                              {formatDateTimeForDisplay(option.dateTime)}
                            </div>
                          )}
                        </div>

                        {dateOptions.length > 2 && (
                          <Button
                            type="button"
                            onClick={() => removeDateOption(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {dateOptions.length >= 10 && (
                  <p className="text-sm text-gray-500">
                    Maximum of 10 date options reached
                  </p>
                )}
              </div>

              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>

                <FormField
                  control={form.control}
                  name="multipleChoice"
                  render={({ field: { value, onChange } }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Avaiability Check
                        </FormLabel>
                        <FormDescription>
                          Enable availability voting: voters must choose "Yes",
                          "No", or "Maybe" for each date option. This is
                          mandatory for comprehensive scheduling.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean(value)}
                          onCheckedChange={onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAnonymous"
                  render={({ field: { value, onChange } }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Anonymous Voting
                        </FormLabel>
                        <FormDescription>
                          Hide voter names in public results. Only you will see
                          who voted.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean(value)}
                          onCheckedChange={onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasEndDate"
                  render={({ field: { value, onChange } }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Set Response Deadline
                        </FormLabel>
                        <FormDescription>
                          Automatically close the poll at a specific date and
                          time
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean(value)}
                          onCheckedChange={onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchedHasEndDate && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Response Deadline Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              min={today}
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Response Deadline Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading || !currentUser}
                  className="flex-1"
                >
                  {isLoading ? "Creating Poll..." : "Create Date Poll"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/polloverview")}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Datepoll;
