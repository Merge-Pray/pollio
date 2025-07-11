import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

function Landingpage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const formSchema = z.object({
    question: z.string().min(2, {
      message: "Question must be at least 2 characters.",
    }),
    numberOfOptions: z.string().min(1, {
      message: "Please select number of options.",
    }),
    options: z
      .array(z.string().min(1, "Option cannot be empty"))
      .min(2, "At least 2 options required"),
    isPublic: z.boolean().default(false),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      numberOfOptions: "",
      options: [],
      isPublic: false,
    },
  });

  const watchedNumberOfOptions = form.watch("numberOfOptions");
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
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/poll/quick", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: values.question,
          options: values.options,
          isPublic: values.isPublic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create poll");
      }

      const data = await response.json();
      console.log("Poll created successfully:", data);

      form.reset();

      navigate(`/quickpoll/vote/${data.poll.id}`);
    } catch (error) {
      console.error("Poll creation error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create poll"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="my-10 w-1/2 mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-2xl font-semibold">Create a quick-poll</FormLabel>
                <FormDescription>Enter your poll question</FormDescription>
                <FormControl>
                  <Input placeholder="What's your favorite color?" {...field} />
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
                <FormDescription>Set amount of answers</FormDescription>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="number of answers" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Options</SelectLabel>
                      {Array.from({ length: 9 }, (_, i) => i + 2).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} options
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {numberOfOptionsInt > 0 && (
            <div className="space-y-4">
              <FormDescription>Poll Options</FormDescription>
              {Array.from({ length: numberOfOptionsInt }, (_, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`options.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={`Option ${index + 1}...`}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          )}

          <FormField
            control={form.control}
            name="isPublic"
            render={({ field: { value, onChange } }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-2">
                <div className="space-y-0">
                  <FormDescription className="text-xs">
                    Make this poll visible to everyone
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={Boolean(value)}
                    onCheckedChange={onChange}
                    className="scale-75"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating Poll..." : "Create Poll"}
          </Button>
        </form>
      </Form>

      <div className="mt-4">
        <Button
          onClick={() => navigate("/publicpoll")}
          variant="neutral"
          className="w-full"
        >
          View Public Polls
        </Button>
      </div>
    </div>
  );
}

export default Landingpage;
