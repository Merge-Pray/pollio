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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import { API_URL } from "@/lib/config";
import useUserStore from "@/hooks/userstore";
import { X } from "lucide-react";

interface PollOption {
  text: string;
  imageUrl?: string;
  voters: string[];
}

interface Poll {
  id: string;
  title: string;
  question: string;
  type: string;
  options: PollOption[];
  multipleChoice: boolean;
  isAnonymous?: boolean;
  expirationDate?: string;
  expired: boolean;
  createdAt: string;
  creatorId: string;
}

const CustomPollResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOption, setExpandedOption] = useState<number | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoll = async () => {
      if (!id) {
        setError("Poll ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/poll/custom/${id}`, {
          credentials: "include",
        });

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
    return poll.options.reduce(
      (total, option) => total + option.voters.length,
      0
    );
  };

  const getVotePercentage = (optionVotes: number) => {
    const total = getTotalVotes();
    return total === 0 ? 0 : Math.round((optionVotes / total) * 100);
  };

  const handleShareResults = async () => {
    const resultsUrl = `${window.location.origin}/custompoll/result/${id}`;

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

  const renderTextPollResults = () => {
    const isCreator = currentUser && poll && currentUser.id === poll.creatorId;

    return (
      <div className="space-y-4">
        {poll?.options
          .sort((a, b) => b.voters.length - a.voters.length)
          .map((option, index) => (
            <Card
              key={index}
              className={`border-2 ${
                isCreator && option.voters.length > 0 ? "cursor-pointer" : ""
              } transition-all hover:shadow-[4px_4px_0px_0px_var(--border)] hover:translate-x-[-2px] hover:translate-y-[-2px] "border-border"`}
              onClick={() =>
                isCreator && option.voters.length > 0
                  ? setExpandedOption(expandedOption === index ? null : index)
                  : undefined
              }
            >
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-xl flex-1 pr-4">
                    {option.text}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold bg-main text-main-foreground px-3 py-2 rounded border-2 border-border">
                      {option.voters.length} votes
                    </span>
                    <span className="text-sm font-bold bg-secondary-background px-3 py-2 rounded border-2 border-border">
                      {getVotePercentage(option.voters.length)}%
                    </span>
                  </div>
                </div>

                <Progress
                  value={getVotePercentage(option.voters.length)}
                  className="mb-4 h-8 border-2 border-border"
                />

                {isCreator && option.voters.length > 0 && (
                  <div
                    className={`transition-all overflow-hidden ${
                      expandedOption === index
                        ? "max-h-40 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="border-t-2 border-border pt-4 mt-4">
                      <div className="flex flex-wrap gap-2">
                        {option.voters.map((voterName, voterIndex) => (
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

                {isCreator && option.voters.length > 0 && (
                  <Button
                    variant="noShadow"
                    size="sm"
                    className="mt-2 text-xs h-8 px-2 py-1 bg-white"
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

                {poll?.isAnonymous && !isCreator && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Anonymous poll - voter names are hidden</span>
                  </div>
                )}

                {poll?.isAnonymous && isCreator && (
                  <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Anonymous poll - only you can see voter names</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    );
  };

  const renderImagePollResults = () => {
    const isCreator = currentUser && poll && currentUser.id === poll.creatorId;
    const sortedOptions =
      poll?.options
        .map((option, originalIndex) => ({ ...option, originalIndex }))
        .sort((a, b) => b.voters.length - a.voters.length) || [];

    return (
      <div className="space-y-6">
        {sortedOptions.map((option, index) => (
          <Card key={option.originalIndex} className="border-2 border-border">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Image */}
                <div className="w-full md:w-1/3">
                  <img
                    src={option.imageUrl}
                    alt={option.text || `Option ${index + 1}`}
                    className="w-full h-48 object-cover rounded-md border-2 border-border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setFullscreenImage(option.imageUrl || "")}
                  />
                  <p
                    className="text-center text-gray-500 mt-2"
                    style={{ fontSize: "0.5rem" }}
                  >
                    Click to enlarge
                  </p>
                </div>

                {/* Results */}
                <div className="w-full md:w-2/3 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2">
                        {option.text || `Option ${index + 1}`}
                      </h3>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-bold bg-main text-main-foreground px-3 py-2 rounded border-2 border-border">
                          {option.voters.length} votes
                        </span>
                        <span className="text-sm font-bold bg-secondary-background px-3 py-2 rounded border-2 border-border">
                          {getVotePercentage(option.voters.length)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <Progress
                    value={getVotePercentage(option.voters.length)}
                    className="h-6 border-2 border-border"
                  />

                  {isCreator &&
                    option.voters.length > 0 &&
                    !poll?.isAnonymous && (
                      <div>
                        <Button
                          variant="noShadow"
                          size="sm"
                          className="mb-3 text-xs"
                          onClick={() =>
                            setExpandedOption(
                              expandedOption === option.originalIndex
                                ? null
                                : option.originalIndex
                            )
                          }
                        >
                          {expandedOption === option.originalIndex
                            ? "▲ Hide voters"
                            : "▼ Show voters"}
                        </Button>

                        <div
                          className={`transition-all overflow-hidden ${
                            expandedOption === option.originalIndex
                              ? "max-h-32 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="flex flex-wrap gap-2">
                            {option.voters.map((voterName, voterIndex) => (
                              <span
                                key={voterIndex}
                                className="text-sm bg-main text-main-foreground px-3 py-1 rounded border border-border font-medium"
                              >
                                {voterName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {poll?.isAnonymous && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span>🔒</span>
                      <span>Anonymous poll - voter names are hidden</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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

  const totalVotes = getTotalVotes();

  return (
    <>
      <div className="max-w-5xl mx-auto mt-8 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{poll.title}</CardTitle>
            <CardDescription className="text-lg">
              {poll.question} • {totalVotes} total votes
              {poll.type && (
                <span className="ml-2 text-sm bg-main text-main-foreground px-2 py-1 rounded">
                  {poll.type.toUpperCase()}
                </span>
              )}
            </CardDescription>
            {poll.expirationDate && (
              <CardDescription className="text-sm">
                {poll.expired ? "Expired on" : "Expires on"}{" "}
                {new Date(poll.expirationDate).toLocaleDateString()}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Poll Results */}
            {poll.type === "text"
              ? renderTextPollResults()
              : renderImagePollResults()}

            {/* Action Buttons */}
            <div className="space-y-4 pt-8 border-t-2 border-border">
              {currentUser ? (
                <>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate("/polloverview")}
                      className="flex-1 h-12 text-lg cursor-pointer"
                    >
                      Create New Poll
                    </Button>
                    {currentUser.id === poll.creatorId && (
                      <Button
                        onClick={() => navigate(`/user/polls/${id}`)}
                        variant="noShadow"
                        className="h-12 text-lg px-6 cursor-pointer"
                      >
                        Manage Poll
                      </Button>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-bold mb-3">SHARE RESULTS:</p>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleShareResults}
                        variant="noShadow"
                        className="flex-1 cursor-pointer h-12 text-lg"
                        size="sm"
                      >
                        COPY RESULTS LINK
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-lg font-bold mb-3">SHARE RESULTS:</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleShareResults}
                      variant="noShadow"
                      className="flex-1 cursor-pointer h-12 text-lg"
                      size="sm"
                    >
                      COPY RESULTS LINK
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Poll Info */}
            <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
              <p>
                Created on {new Date(poll.createdAt).toLocaleDateString()} •{" "}
                {poll.multipleChoice ? "Multiple Choice" : "Single Choice"}
                {poll.isAnonymous && (
                  <span className="ml-2">• 🔒 Anonymous</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="relative pointer-events-auto">
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-h-[80vh] object-contain shadow-2xl border-2 border-white"
              onClick={() => setFullscreenImage(null)}
            />
            <Button
              onClick={() => setFullscreenImage(null)}
              variant="noShadow"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomPollResult;
