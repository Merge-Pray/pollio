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

// Feste Poll-ID für die 404-Umfrage
const NOTFOUND_POLL_ID = "6876bc27e378a4d6cf2f38ba";

function NotFound() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollExists, setPollExists] = useState(false);
  const [checkingPoll, setCheckingPoll] = useState(true);
  const navigate = useNavigate();

  const formSchema = z.object({
    option: z.string().min(1, {
      message: "Please select an option.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      option: "",
    },
  });

  // Überprüfe ob die 404-Poll existiert
  useEffect(() => {
    const checkIfPollExists = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/poll/quick/${NOTFOUND_POLL_ID}`
        );

        const contentType = response.headers.get("content-type");

        if (response.ok && contentType?.includes("application/json")) {
          setPollExists(true);
        } else {
          console.log(
            "Poll doesn't exist or server returned non-JSON response"
          );
          setPollExists(false);
        }
      } catch (error) {
        console.error("Error checking poll:", error);
        setPollExists(false);
      } finally {
        setCheckingPoll(false);
      }
    };

    checkIfPollExists();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!pollExists) {
      setError("Poll is not available. Please try again later.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mache optionIndex basiert auf der Auswahl
      const optionMapping = {
        "It's definitely the developers' fault": 0,
        "The website is broken": 1,
        "I probably mistyped the URL": 2,
        "Blame it on the coffee shortage": 3,
      };

      const optionIndex =
        optionMapping[values.option as keyof typeof optionMapping];

      // Vote ohne Fingerprint - Backend behandelt 404-Poll speziell
      const voteResponse = await fetch(
        `${API_URL}/api/poll/quick/${NOTFOUND_POLL_ID}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            optionIndex: optionIndex,
            voterName: "Anonymous 404 Visitor",
            // Kein fingerprint - Backend erstellt automatisch einen
          }),
        }
      );

      if (!voteResponse.ok) {
        const errorData = await voteResponse.json();
        throw new Error(errorData.message || "Failed to submit vote");
      }

      // Direkter Redirect zu Results
      navigate(`/quickpoll/result/${NOTFOUND_POLL_ID}`);
    } catch (error) {
      console.error("Voting error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit vote. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (checkingPoll) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!pollExists) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-[80%] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
          <p className="text-gray-600 text-lg mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-red-600">
              Poll Unavailable
            </CardTitle>
            <CardDescription className="text-center">
              The 404 poll is currently not available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Take Me Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-[80%] mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
        <p className="text-gray-600 text-lg mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            But wait! Let's settle this...
          </CardTitle>
          <CardDescription className="text-center text-lg">
            Who's really to blame for this 404 error?
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="option"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Cast your vote:</FormLabel>
                    <FormDescription>
                      Help us understand what went wrong (you can vote multiple
                      times!)
                    </FormDescription>
                    <div className="space-y-3">
                      {[
                        "It's definitely the developers' fault",
                        "The website is broken",
                        "I probably mistyped the URL",
                        "Blame it on the coffee shortage",
                      ].map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            id={`option-${index}`}
                            {...field}
                            value={option}
                            checked={field.value === option}
                            onChange={() => field.onChange(option)}
                            className="w-4 h-4 text-main bg-gray-100 border-gray-300 focus:ring-main focus:ring-2"
                          />
                          <label
                            htmlFor={`option-${index}`}
                            className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading || !form.watch("option")}
                  className="w-full"
                >
                  {isLoading ? "Submitting Vote..." : "Vote & See Results"}
                </Button>

                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Take Me Home Instead
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-4 pt-4 border-t">
            <Button
              onClick={() => navigate(`/quickpoll/result/${NOTFOUND_POLL_ID}`)}
              variant="neutral"
              className="w-full text-sm"
            >
              View Current Results Without Voting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotFound;
