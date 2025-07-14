import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { API_URL } from "@/lib/config";

interface PollOption {
  text: string;
  voterNames: string[];
  voteCount: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isPublic: boolean;
  createdAt: string;
  type: string;
}

// fingerprint!!
const generateFingerprint = (): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx!.textBaseline = "top";
  ctx!.font = "14px Arial";
  ctx!.fillText("Browser fingerprint", 2, 2);

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join("|");

  // hash dat shit
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
};

const QuickpollVote = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [voterName, setVoterName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [browserFingerprint, setBrowserFingerprint] = useState<string>("");

  useEffect(() => {
    const fingerprint = generateFingerprint();
    setBrowserFingerprint(fingerprint);
  }, []);

  useEffect(() => {
    const fetchPoll = async () => {
      if (!id) {
        setError("Poll ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        const hasUserVoted =
          localStorage.getItem(`poll_${id}_voted`) === "true";
        if (hasUserVoted) {
          navigate(`/quickpoll/result/${id}`);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/poll/quick/${id}` // Fixed: Use API_URL instead of process.env
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch poll");
        }

        const data = await response.json();
        setPoll(data.poll);
      } catch (error) {
        console.error("Error fetching poll:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch poll"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoll();
  }, [id, navigate]);

  const handleVote = async () => {
    if (!selectedOption || !poll || !id || !voterName.trim()) return;

    setIsVoting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/poll/quick/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          optionIndex: parseInt(selectedOption),
          voterName: voterName.trim(),
          fingerprint: browserFingerprint,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to vote");
      }

      localStorage.setItem(`poll_${id}_voted`, "true");

      navigate(`/quickpoll/result/${id}`);
    } catch (error) {
      console.error("Error voting:", error);
      setError(error instanceof Error ? error.message : "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleShareVote = async () => {
    const voteUrl = `${window.location.origin}/quickpoll/vote/${id}`;

    try {
      await navigator.clipboard.writeText(voteUrl);
      alert("Vote link copied to clipboard!");
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = voteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Vote link copied to clipboard!");
    }
  };

  const handleShareResults = async () => {
    const resultsUrl = `${window.location.origin}/quickpoll/result/${id}`;

    try {
      await navigator.clipboard.writeText(resultsUrl);
      alert("Results link copied to clipboard!");
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = resultsUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Results link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading poll...</div>
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
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{poll.question}</CardTitle>
          <CardDescription>
            Enter your name and select an option to vote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 border-b pb-4">
            <div>
              <Label htmlFor="voterName" className="text-sm font-medium">
                Your Name
              </Label>
              <Input
                id="voterName"
                placeholder="Enter your name"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            {poll.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50"
              >
                <RadioGroupItem
                  value={index.toString()}
                  id={`option-${index}`}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={handleVote}
                disabled={!selectedOption || !voterName.trim() || isVoting}
                className="flex-1"
              >
                {isVoting ? "Voting..." : "Vote"}
              </Button>
              <Button onClick={() => navigate("/")} variant="noShadow">
                Back to Home
              </Button>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm text-gray-600 mb-2">Share this poll:</p>
              <div className="flex gap-2">
                <Button
                  onClick={handleShareVote}
                  variant="noShadow"
                  className="flex-1 cursor-pointer"
                >
                  Share Vote Link
                </Button>
                <Button
                  onClick={handleShareResults}
                  variant="noShadow"
                  className="flex-1 cursor-pointer"
                >
                  Share Results Link
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickpollVote;
