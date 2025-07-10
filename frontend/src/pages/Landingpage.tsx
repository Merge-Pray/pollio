import { Button } from "../components/ui/button.js";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form.js";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "..//components/ui/select.js";

import { Input } from "../components/ui/input.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

function Landingpage() {
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
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      numberOfOptions: "",
      options: [],
    },
  });

  const watchedNumberOfOptions = form.watch("numberOfOptions");
  const numberOfOptionsInt = parseInt(watchedNumberOfOptions) || 0;

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="my-10 w-1/2 mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-2xl">Create a quick-poll</FormLabel>
                <FormDescription>Enter your poll a name</FormDescription>
                <FormControl>
                  <Input placeholder="..." {...field} />
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
                    <SelectTrigger className="w-[180px]">
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          )}

          <Button type="submit">Create Poll</Button>
        </form>
      </Form>
    </div>
  );
}

export default Landingpage;
