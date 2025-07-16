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
import { X, Calendar, Clock } from "lucide-react";

interface PollOption {
  text: string;
  imageUrl?: string;
  dateTime?: string;
  yes?: string[];
  no?: string[];
  maybe?: string[];
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

  const renderDatePollResults = () => {
    const isCreator = currentUser && poll && currentUser.id === poll.creatorId;

    if (poll?.multipleChoice) {
      // Availability Check Display - show best dates based on Yes votes
      const sortedOptions = poll.options
        .map((option, originalIndex) => ({
          ...option,
          originalIndex,
          yesCount: option.yes?.length || 0,
          noCount: option.no?.length || 0,
          maybeCount: option.maybe?.length || 0,
          totalResponses:
            (option.yes?.length || 0) +
            (option.no?.length || 0) +
            (option.maybe?.length || 0),
        }))
        .sort((a, b) => {
          // Sort by Yes votes first, then by total responses
          if (b.yesCount !== a.yesCount) {
            return b.yesCount - a.yesCount;
          }
          return b.totalResponses - a.totalResponses;
        });

      return (
        <div className="space-y-6">
          <div className="text-sm bg-green-50 text-green-700 p-3 rounded-lg border border-green-200">
            <strong>🗓️ Availability Check Results:</strong> Dates are ranked by
            the number of "Yes" responses.
          </div>

          {sortedOptions.map((option, index) => (
            <Card key={option.originalIndex} className="border-2 border-border">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4 mb-4">
                  <Calendar className="h-6 w-6 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-xl">
                          {option.text || `Date Option ${index + 1}`}
                        </h3>
                        {option.dateTime && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Clock className="h-4 w-4" />
                            {formatDateTime(option.dateTime)}
                          </p>
                        )}
                      </div>
                      {index === 0 && option.yesCount > 0 && (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          🏆 Best Option
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {option.yesCount}
                        </div>
                        <div className="text-sm text-green-700">✓ Yes</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {option.noCount}
                        </div>
                        <div className="text-sm text-red-700">✗ No</div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {option.maybeCount}
                        </div>
                        <div className="text-sm text-yellow-700">? Maybe</div>
                      </div>
                    </div>

                    {option.totalResponses > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Yes responses</span>
                          <span>
                            {Math.round(
                              (option.yesCount / option.totalResponses) * 100
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (option.yesCount / option.totalResponses) * 100
                          }
                          className="h-3 border border-green-300"
                        />
                      </div>
                    )}

                    {isCreator &&
                      option.totalResponses > 0 &&
                      !poll?.isAnonymous && (
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
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
                                ? "max-h-64 opacity-100 mt-4"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {option.yesCount > 0 && (
                                <div>
                                  <h4 className="font-medium text-green-700 mb-2">
                                    Yes ({option.yesCount})
                                  </h4>
                                  <div className="space-y-1">
                                    {option.yes?.map(
                                      (voterName, voterIndex) => (
                                        <span
                                          key={voterIndex}
                                          className="block text-sm bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300"
                                        >
                                          {voterName}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {option.noCount > 0 && (
                                <div>
                                  <h4 className="font-medium text-red-700 mb-2">
                                    No ({option.noCount})
                                  </h4>
                                  <div className="space-y-1">
                                    {option.no?.map((voterName, voterIndex) => (
                                      <span
                                        key={voterIndex}
                                        className="block text-sm bg-red-100 text-red-800 px-2 py-1 rounded border border-red-300"
                                      >
                                        {voterName}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {option.maybeCount > 0 && (
                                <div>
                                  <h4 className="font-medium text-yellow-700 mb-2">
                                    Maybe ({option.maybeCount})
                                  </h4>
                                  <div className="space-y-1">
                                    {option.maybe?.map(
                                      (voterName, voterIndex) => (
                                        <span
                                          key={voterIndex}
                                          className="block text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300"
                                        >
                                          {voterName}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    {poll?.isAnonymous && (
                      <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
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
    } else {
      // Single Choice Display - similar to text polls but with date formatting
      return (
        <div className="space-y-4">
          {poll?.options
            .sort((a, b) => b.voters.length - a.voters.length)
            .map((option, index) => (
              <Card
                key={index}
                className={`border-2 ${
                  isCreator && option.voters.length > 0 ? "cursor-pointer" : ""
                } transition-all hover:shadow-[4px_4px_0px_0px_var(--border)] hover:translate-x-[-2px] hover:translate-y-[-2px] border-border`}
                onClick={() =>
                  isCreator && option.voters.length > 0
                    ? setExpandedOption(expandedOption === index ? null : index)
                    : undefined
                }
              >
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-start gap-4 mb-4">
                    <Calendar className="h-6 w-6 text-gray-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4">
                          <h3 className="font-bold text-xl">
                            {option.text || `Date Option ${index + 1}`}
                          </h3>
                          {option.dateTime && (
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                              <Clock className="h-4 w-4" />
                              {formatDateTime(option.dateTime)}
                            </p>
                          )}
                        </div>
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
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs h-8 px-2 py-1"
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
                          <span>
                            Anonymous poll - only you can see voter names
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      );
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
            {poll.type === "text" && renderTextPollResults()}
            {poll.type === "image" && renderImagePollResults()}
            {poll.type === "date" && renderDatePollResults()}

            {/* Action Buttons */}
            <div className="space-y-4 pt-8 border-t-2 border-border">
              {currentUser ? (
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={handleShareResults} variant="noShadow">
                    Share Results
                  </Button>
                  <Button onClick={() => navigate("/")} variant="noShadow">
                    Back to Home
                  </Button>
                  {currentUser.id === poll.creatorId && (
                    <Button
                      onClick={() => navigate(`/user/polls/${poll.id}`)}
                      variant="noShadow"
                    >
                      Manage Poll
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={handleShareResults} variant="noShadow">
                    Share Results
                  </Button>
                  <Button onClick={() => navigate("/")} variant="noShadow">
                    Back to Home
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div
            className="fixed inset-0 pointer-events-auto"
            onClick={() => setFullscreenImage(null)}
          ></div>
          <div className="relative pointer-events-auto bg-white border-2 border-border rounded-lg shadow-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="w-full h-full object-contain"
            />
            <Button
              variant="noShadow"
              size="icon"
              className="absolute top-2 right-2 bg-white border-2 border-border hover:bg-gray-50"
              onClick={() => setFullscreenImage(null)}
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
