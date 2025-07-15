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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

function Textpoll() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentUser } = useUserStore();

  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    question: z.string().min(2, {
      message: "Question must be at least 2 characters.",
    }),
    numberOfOptions: z.string().min(1, {
      message: "Please select number of options.",
    }),
    options: z
      .array(z.string().min(1, "Option cannot be empty"))
      .min(2, "At least 2 options required"),
    multipleChoice: z.boolean().default(false),
    hasEndDate: z.boolean().default(false),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      question: "",
      numberOfOptions: "2",
      options: [],
      multipleChoice: false,
      hasEndDate: false,
      endDate: "",
      endTime: "23:59",
    },
  });

  const watchedNumberOfOptions = form.watch("numberOfOptions");
  const watchedHasEndDate = form.watch("hasEndDate");
  const numberOfOptionsInt = parseInt(watchedNumberOfOptions) || 0;

  useEffect(() => {
    if (numberOfOptionsInt > 0) {
      const currentOptions = form.getValues("options");
      const newOptions = Array.from(
        { length: numberOfOptionsInt },
        (_, index) => currentOptions[index] || ""
      );
      form.setValue("options", newOptions);
    }
  }, [numberOfOptionsInt, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser) {
      setError("You must be logged in to create a poll");
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

      const response = await fetch(`${API_URL}/api/poll/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: values.title,
          question: values.question,
          options: values.options.map((text) => ({ text })),
          multipleChoice: values.multipleChoice,
          expirationDate: expirationDate,
          type: "text",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create poll");
      }

      const data = await response.json();
      console.log("Text poll created successfully:", data);

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Create Text Poll</CardTitle>
          <CardDescription>
            Create a more advanced poll with custom settings and token-based
            voting
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
                      Give your poll a descriptive title
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="e.g., Team Meeting Preferences"
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
                        placeholder="What's your preferred meeting time?"
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
                name="numberOfOptions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Options</FormLabel>
                    <FormDescription>
                      How many answer choices do you want?
                    </FormDescription>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="number of answers" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {Array.from({ length: 9 }, (_, i) => i + 2).map(
                            (num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} options
                              </SelectItem>
                            )
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {numberOfOptionsInt > 0 && (
                <div className="space-y-4">
                  <FormLabel className="text-lg font-medium">
                    Poll Options
                  </FormLabel>
                  <FormDescription>
                    Enter the available choices for voters
                  </FormDescription>
                  {Array.from({ length: numberOfOptionsInt }, (_, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`options.${index}` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder={`Option ${index + 1}...`}
                              {...field}
                              value={field.value || ""}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}

              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>

                <FormField
                  control={form.control}
                  name="multipleChoice"
                  render={({ field: { value, onChange } }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Multiple Choice
                        </FormLabel>
                        <FormDescription>
                          Allow voters to select multiple options
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
                          Set End Date
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
                          <FormLabel>End Date</FormLabel>
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
                          <FormLabel>End Time</FormLabel>
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
                  {isLoading ? "Creating Poll..." : "Create Text Poll"}
                </Button>
                <Button
                  type="button"
                  variant="neutral"
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

export default Textpoll;
