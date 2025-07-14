import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

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

const QuickpollResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOption, setExpandedOption] = useState<number | null>(null);

  useEffect(() => {
    const fetchPoll = async () => {
      if (!id) {
        setError("Poll ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.VITE_BACKENDPATH}/api/poll/quick/${id}`
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
  }, [id]);

  const getTotalVotes = () => {
    if (!poll) return 0;
    return poll.options.reduce((total, option) => total + option.voteCount, 0);
  };

  const getVotePercentage = (optionVotes: number) => {
    const total = getTotalVotes();
    return total === 0 ? 0 : Math.round((optionVotes / total) * 100);
  };

  const getWinningOption = () => {
    if (!poll || poll.options.length === 0) return null;
    return poll.options.reduce((winner, current) =>
      current.voteCount > winner.voteCount ? current : winner
    );
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
        <div className="text-lg">Loading results...</div>
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

  const winningOption = getWinningOption();
  const totalVotes = getTotalVotes();

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.question}</CardTitle>
          <CardDescription className="text-lg">
            Poll Results • {totalVotes} total votes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {poll.options
              .sort((a, b) => b.voteCount - a.voteCount)
              .map((option, index) => (
                <Card
                  key={index}
                  className={`border-2 cursor-pointer transition-all hover:shadow-[4px_4px_0px_0px_var(--border)] hover:translate-x-[-2px] hover:translate-y-[-2px] "border-border"`}
                  onClick={() =>
                    setExpandedOption(expandedOption === index ? null : index)
                  }
                >
                  <CardContent className="pt-8 pb-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-xl flex-1 pr-4">
                        {option.text}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold bg-main text-main-foreground px-3 py-2 rounded border-2 border-border">
                          {option.voteCount} votes
                        </span>
                        <span className="text-sm font-bold bg-secondary-background px-3 py-2 rounded border-2 border-border">
                          {getVotePercentage(option.voteCount)}%
                        </span>
                      </div>
                    </div>

                    <Progress
                      value={getVotePercentage(option.voteCount)}
                      className="mb-4 h-8 border-2 border-border"
                    />

                    {option.voterNames.length > 0 && (
                      <div
                        className={`transition-all overflow-hidden ${
                          expandedOption === index
                            ? "max-h-40 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="border-t-2 border-border pt-4 mt-4">
                          <div className="flex flex-wrap gap-2">
                            {option.voterNames.map((voterName, voterIndex) => (
                              <span
                                key={voterIndex}
                                className="text-sm bg-main text-main-foreground px-3 py-2 rounded border border-border font-medium"
                              >
                                {voterName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {option.voterNames.length > 0 && (
                      <Button
                        variant="noShadow"
                        size="sm"
                        className="mt-2 text-xs h-4 px-2 py-1 bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedOption(
                            expandedOption === index ? null : index
                          );
                        }}
                      >
                        {expandedOption === index
                          ? "▲ Hide voters"
                          : "▼ Show voters"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>

          {totalVotes === 0 && (
            <Card className="border-2 border-dashed border-gray-400">
              <CardContent className="pt-8 pb-8 text-center text-gray-500">
                <p className="text-xl font-bold">NO VOTES YET!</p>
                <p className="text-lg">Share this poll to get votes.</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4 pt-8 border-t-2 border-border">
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/")}
                className="flex-1 h-12 text-lg cursor-pointer"
              >
                Create New Poll
              </Button>
              <Button
                onClick={() => navigate(`/quickpoll/vote/${id}`)}
                variant="noShadow"
                className="h-12 text-lg px-6 cursor-pointer"
              >
                Vote Again
              </Button>
            </div>

            <div>
              <p className="text-lg font-bold mb-3">SHARE THIS POLL:</p>
              <div className="flex gap-3">
                <Button
                  onClick={handleShareVote}
                  variant="noShadow"
                  className="flex-1 cursor-pointer h-12 text-lg"
                  size="sm"
                >
                  VOTE LINK
                </Button>
                <Button
                  onClick={handleShareResults}
                  variant="noShadow"
                  className="flex-1 cursor-pointer h-12 text-lg"
                  size="sm"
                >
                  RESULTS LINK
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickpollResult;
