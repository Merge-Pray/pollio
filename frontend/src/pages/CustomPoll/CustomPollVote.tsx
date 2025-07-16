import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { API_URL } from "@/lib/config";
import { Calendar, Clock } from "lucide-react";

interface PollOption {
  text: string;
  imageUrl?: string;
  dateTime?: string;
  voters: string[];
  yes?: string[];
  no?: string[];
  maybe?: string[];
}

interface Poll {
  id: string;
  title: string;
  question: string;
  type: string;
  options: PollOption[];
  multipleChoice: boolean;
  isAnonymous: boolean;
  expirationDate?: string;
  expired: boolean;
  createdAt: string;
}

interface DateAvailability {
  [optionIndex: string]: "yes" | "no" | "maybe" | "";
}

const CustomPollVote = () => {
  const { id: token } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [pollId, setPollId] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [dateAvailability, setDateAvailability] = useState<DateAvailability>(
    {}
  );
  const [voterName, setVoterName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenUsed, setTokenUsed] = useState(false);
  const [pollExpired, setPollExpired] = useState(false);

  useEffect(() => {
    const fetchPollByToken = async () => {
      if (!token) {
        setError("Vote token is missing");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/poll/token/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Invalid vote token");
          } else if (response.status === 400) {
            const errorData = await response.json();

            if (errorData.message.includes("expired")) {
              setPollExpired(true);
              setError("Voting has ended, poll is expired.");
              setPollId(errorData.pollId || "");

              setTimeout(() => {
                if (errorData.pollId) {
                  navigate(`/custompoll/result/${errorData.pollId}`);
                }
              }, 3000);
              return;
            } else {
              setTokenUsed(true);
              setError(errorData.message);

              setTimeout(() => {
                if (errorData.pollId) {
                  navigate(`/custompoll/result/${errorData.pollId}`);
                }
              }, 3000);
              return;
            }
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch poll");
        }

        const data = await response.json();

        if (
          data.poll.expirationDate &&
          new Date() > new Date(data.poll.expirationDate)
        ) {
          setPollExpired(true);
          setError("Voting has ended, poll is expired.");
          setPollId(data.poll.id);

          setTimeout(() => {
            navigate(`/custompoll/result/${data.poll.id}`);
          }, 3000);
          return;
        }

        setPoll(data.poll);
        setPollId(data.poll.id);

        // Initialize date availability for date polls with multipleChoice
        if (data.poll.type === "date" && data.poll.multipleChoice) {
          const initialAvailability: DateAvailability = {};
          data.poll.options.forEach((_, index) => {
            initialAvailability[index.toString()] = "";
          });
          setDateAvailability(initialAvailability);
        }
      } catch (error) {
        console.error("Error fetching poll:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch poll"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPollByToken();
  }, [token, navigate]);

  const handleSingleOptionChange = (value: string) => {
    setSelectedOptions([value]);
  };

  const handleMultipleOptionChange = (
    optionIndex: string,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, optionIndex]);
    } else {
      setSelectedOptions(
        selectedOptions.filter((option) => option !== optionIndex)
      );
    }
  };

  const handleDateAvailabilityChange = (
    optionIndex: string,
    availability: "yes" | "no" | "maybe"
  ) => {
    setDateAvailability((prev) => ({
      ...prev,
      [optionIndex]: availability,
    }));
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isDateVoteComplete = () => {
    if (poll?.type !== "date" || !poll.multipleChoice) return true;

    return poll.options.every((_, index) => {
      const availability = dateAvailability[index.toString()];
      return (
        availability === "yes" ||
        availability === "no" ||
        availability === "maybe"
      );
    });
  };

  const handleVote = async () => {
    if (!poll || !token || !voterName.trim()) return;

    // Validate different poll types
    if (poll.type === "date" && poll.multipleChoice) {
      if (!isDateVoteComplete()) {
        setError("Please answer Yes, No, or Maybe for each date option");
        return;
      }
    } else if (!selectedOptions.length) {
      setError("Please select at least one option");
      return;
    }

    setIsVoting(true);
    setError(null);

    try {
      let requestBody: any = {
        voterName: voterName.trim(),
      };

      if (poll.type === "date" && poll.multipleChoice) {
        // Send availability responses for date polls
        requestBody.dateAvailability = dateAvailability;
      } else {
        // Send selected options for other poll types
        requestBody.optionIndexes = poll.multipleChoice
          ? selectedOptions.map((opt) => parseInt(opt))
          : [parseInt(selectedOptions[0])];
      }

      const response = await fetch(`${API_URL}/api/poll/vote/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to vote");
      }

      navigate(`/custompoll/result/${pollId}`);
    } catch (error) {
      console.error("Error voting:", error);
      setError(error instanceof Error ? error.message : "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const renderTextOptions = () => {
    if (poll?.multipleChoice) {
      return (
        <div className="space-y-3">
          {poll.options.map((option, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50"
            >
              <Checkbox
                id={`option-${index}`}
                checked={selectedOptions.includes(index.toString())}
                onCheckedChange={(checked) =>
                  handleMultipleOptionChange(
                    index.toString(),
                    checked as boolean
                  )
                }
              />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer font-medium"
              >
                {option.text}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    return (
      <RadioGroup
        value={selectedOptions[0]}
        onValueChange={handleSingleOptionChange}
      >
        {poll?.options.map((option, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50"
          >
            <RadioGroupItem value={index.toString()} id={`option-${index}`} />
            <Label
              htmlFor={`option-${index}`}
              className="flex-1 cursor-pointer font-medium"
            >
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  const renderDateOptions = () => {
    if (poll?.multipleChoice) {
      // Yes/No/Maybe voting for date polls
      return (
        <div className="space-y-4">
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <strong>ℹ️ Availability Check:</strong> Please indicate your
            availability for each date and time option.
          </div>
          {poll.options.map((option, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3 mb-4">
                <Calendar className="h-5 w-5 text-gray-500 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-lg">{option.text}</h4>
                  {option.dateTime && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(option.dateTime)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    dateAvailability[index.toString()] === "yes"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    handleDateAvailabilityChange(index.toString(), "yes")
                  }
                  className={`flex-1 ${
                    dateAvailability[index.toString()] === "yes"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "hover:bg-green-50 hover:border-green-300"
                  }`}
                >
                  ✓ Yes
                </Button>
                <Button
                  type="button"
                  variant={
                    dateAvailability[index.toString()] === "no"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    handleDateAvailabilityChange(index.toString(), "no")
                  }
                  className={`flex-1 ${
                    dateAvailability[index.toString()] === "no"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "hover:bg-red-50 hover:border-red-300"
                  }`}
                >
                  ✗ No
                </Button>
                <Button
                  type="button"
                  variant={
                    dateAvailability[index.toString()] === "maybe"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    handleDateAvailabilityChange(index.toString(), "maybe")
                  }
                  className={`flex-1 ${
                    dateAvailability[index.toString()] === "maybe"
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "hover:bg-yellow-50 hover:border-yellow-300"
                  }`}
                >
                  ? Maybe
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Regular single/multiple choice for date polls (like text polls)
    if (poll?.multipleChoice) {
      return (
        <div className="space-y-3">
          {poll.options.map((option, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 border rounded-lg p-3 hover:bg-gray-50"
            >
              <Checkbox
                id={`date-option-${index}`}
                checked={selectedOptions.includes(index.toString())}
                onCheckedChange={(checked) =>
                  handleMultipleOptionChange(
                    index.toString(),
                    checked as boolean
                  )
                }
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor={`date-option-${index}`}
                  className="cursor-pointer font-medium block"
                >
                  {option.text}
                </Label>
                {option.dateTime && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4" />
                    {formatDateTime(option.dateTime)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <RadioGroup
        value={selectedOptions[0]}
        onValueChange={handleSingleOptionChange}
      >
        {poll?.options.map((option, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 border rounded-lg p-3 hover:bg-gray-50"
          >
            <RadioGroupItem
              value={index.toString()}
              id={`date-option-${index}`}
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor={`date-option-${index}`}
                className="cursor-pointer font-medium block"
              >
                {option.text}
              </Label>
              {option.dateTime && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4" />
                  {formatDateTime(option.dateTime)}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
    );
  };

  const renderImageOptions = () => {
    if (poll?.multipleChoice) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {poll.options.map((option, index) => (
            <div
              key={index}
              className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedOptions.includes(index.toString())
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() =>
                handleMultipleOptionChange(
                  index.toString(),
                  !selectedOptions.includes(index.toString())
                )
              }
            >
              <div className="flex items-center space-x-3 mb-3">
                <Checkbox
                  id={`image-option-${index}`}
                  checked={selectedOptions.includes(index.toString())}
                  onCheckedChange={(checked) =>
                    handleMultipleOptionChange(
                      index.toString(),
                      checked as boolean
                    )
                  }
                />
                <Label
                  htmlFor={`image-option-${index}`}
                  className="font-medium cursor-pointer"
                >
                  Option {index + 1}
                </Label>
              </div>
              <div className="aspect-square mb-2">
                <img
                  src={option.imageUrl}
                  alt={option.text || `Option ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              {option.text && (
                <p className="text-sm text-gray-600 mt-2">{option.text}</p>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <RadioGroup
        value={selectedOptions[0]}
        onValueChange={handleSingleOptionChange}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {poll?.options.map((option, index) => (
            <div
              key={index}
              className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedOptions[0] === index.toString()
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => handleSingleOptionChange(index.toString())}
            >
              <div className="flex items-center space-x-3 mb-3">
                <RadioGroupItem
                  value={index.toString()}
                  id={`image-option-${index}`}
                />
                <Label
                  htmlFor={`image-option-${index}`}
                  className="font-medium cursor-pointer"
                >
                  Option {index + 1}
                </Label>
              </div>
              <div className="aspect-square mb-2">
                <img
                  src={option.imageUrl}
                  alt={option.text || `Option ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              {option.text && (
                <p className="text-sm text-gray-600 mt-2">{option.text}</p>
              )}
            </div>
          ))}
        </div>
      </RadioGroup>
    );
  };

  const getVotingInstructions = () => {
    if (poll?.type === "date") {
      if (poll.multipleChoice) {
        return "Indicate your availability for each date";
      } else {
        return `Choose your preferred ${
          poll.multipleChoice ? "dates" : "date"
        }`;
      }
    } else {
      return `Choose your ${poll.multipleChoice ? "options" : "option"}`;
    }
  };

  const isVoteValid = () => {
    if (!voterName.trim()) return false;

    if (poll?.type === "date" && poll.multipleChoice) {
      return isDateVoteComplete();
    }

    return selectedOptions.length > 0;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading poll...</div>
      </div>
    );
  }

  if (pollExpired) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Voting Has Ended</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Voting has ended, poll is expired.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to results in 3 seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenUsed) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">
              Vote Already Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You have already voted using this token. Vote token has been used.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to results in 3 seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/")} variant="noShadow">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Poll Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} variant="noShadow">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {poll.type === "date" && <Calendar className="h-6 w-6" />}
            {poll.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {poll.question}
            {poll.type === "date" && poll.multipleChoice && (
              <span className="block text-sm text-blue-600 mt-1">
                Availability check: Answer for each date option
              </span>
            )}
            {poll.multipleChoice && poll.type !== "date" && (
              <span className="block text-sm text-blue-600 mt-1">
                Multiple choices allowed
              </span>
            )}
            {poll.isAnonymous && (
              <span className="block text-sm text-orange-600 mt-1">
                🔒 Anonymous poll
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voter Name Input */}
          <div className="space-y-2 border-b pb-4">
            <Label htmlFor="voterName" className="text-base font-medium">
              Your Name
            </Label>
            <Input
              id="voterName"
              placeholder="Enter your name"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              className="max-w-md"
            />
            {poll.isAnonymous && (
              <div className="text-sm bg-orange-50 text-orange-700 p-3 rounded border border-orange-200">
                <strong>ℹ️ This poll is anonymous.</strong> Public results will
                not show your name, only the poll creator can see voter names.
              </div>
            )}
          </div>

          {/* Poll Options */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">
              {getVotingInstructions()}:
            </Label>
            {poll.type === "text" && renderTextOptions()}
            {poll.type === "date" && renderDateOptions()}
            {poll.type === "image" && renderImageOptions()}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Poll Info */}
          {poll.expirationDate && (
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <strong>Poll expires:</strong>{" "}
              {new Date(poll.expirationDate).toLocaleDateString()} at{" "}
              {new Date(poll.expirationDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleVote}
              disabled={!isVoteValid() || isVoting}
              className="flex-1"
            >
              {isVoting ? "Submitting Vote..." : "Submit Vote"}
            </Button>
            <Button onClick={() => navigate("/")} variant="noShadow">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomPollVote;
