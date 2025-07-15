import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Textarea } from "../../components/ui/textarea";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import { API_URL } from "@/lib/config";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import type { CarouselApi } from "@/components/ui/carousel";

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
  expirationDate?: string;
  expired: boolean;
  createdAt: string;
}

interface UploadedImage {
  url: string;
  text?: string;
  voters?: string[];
}

const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ebqndymu");
  formData.append("folder", `polls`);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dgzbudchq/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

const ManagePoll = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit states
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedQuestion, setEditedQuestion] = useState<string>("");
  const [editedOptions, setEditedOptions] = useState<PollOption[]>([]);
  const [editedMultipleChoice, setEditedMultipleChoice] =
    useState<boolean>(false);
  const [editedExpirationDate, setEditedExpirationDate] = useState<string>("");

  // Share tokens state
  const [shareTokens, setShareTokens] = useState<any[]>([]);
  const [tokenCount, setTokenCount] = useState<number>(1);

  useEffect(() => {
    const fetchPoll = async () => {
      if (!id) {
        setError("Poll ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/poll/custom/${id}`);

        if (!response.ok) {
          console.error(
            `Failed to fetch poll. Status: ${response.status}, URL: ${response.url}`
          );
          const errorData = await response.json().catch(() => {
            throw new Error("Failed to fetch poll: Invalid JSON response");
          });
          throw new Error(errorData.message || "Failed to fetch poll");
        }

        const data = await response.json();
        setPoll(data.poll);

        // Initialize edit states
        setEditedTitle(data.poll.title || "");
        setEditedQuestion(data.poll.question || "");
        setEditedOptions(data.poll.options || []);
        setEditedMultipleChoice(data.poll.multipleChoice || false);
        setEditedExpirationDate(
          data.poll.expirationDate
            ? new Date(data.poll.expirationDate).toISOString().split("T")[0]
            : ""
        );
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

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentImageIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (poll?.voteTokens) {
      setShareTokens(poll.voteTokens);
    }
  }, [poll]);

  const handleToggleEdit = () => {
    if (isEditing) {
      // Reset to original values when canceling
      if (poll) {
        setEditedTitle(poll.title || "");
        setEditedQuestion(poll.question || "");
        setEditedOptions(poll.options || []);
        setEditedMultipleChoice(poll.multipleChoice || false);
        setEditedExpirationDate(
          poll.expirationDate
            ? new Date(poll.expirationDate).toISOString().split("T")[0]
            : ""
        );
      }
    }
    setIsEditing(!isEditing);
  };

  // Text poll option handlers
  const handleAddTextOption = () => {
    setEditedOptions([...editedOptions, { text: "", voters: [] }]);
  };

  const handleRemoveTextOption = (index: number) => {
    setEditedOptions(editedOptions.filter((_, i) => i !== index));
  };

  const handleTextOptionChange = (index: number, value: string) => {
    const updatedOptions = [...editedOptions];
    updatedOptions[index] = { ...updatedOptions[index], text: value };
    setEditedOptions(updatedOptions);
  };

  // Image poll option handlers
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    if (editedOptions.length + files.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file`);
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }

        const url = await uploadToCloudinary(file);
        return { text: "", imageUrl: url, voters: [] };
      });

      const newOptions = await Promise.all(uploadPromises);
      setEditedOptions((prev) => [...prev, ...newOptions]);
    } catch (error) {
      console.error("Image upload error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload images"
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImageOption = (index: number) => {
    setEditedOptions((prev) => prev.filter((_, i) => i !== index));
    if (index === currentImageIndex && editedOptions.length > 1) {
      if (currentImageIndex === editedOptions.length - 1) {
        setCurrentImageIndex(currentImageIndex - 1);
      }
    }
  };

  const updateImageText = (index: number, text: string) => {
    setEditedOptions((prev) =>
      prev.map((option, i) => (i === index ? { ...option, text } : option))
    );
  };

  const handleSaveChanges = async () => {
    if (!poll || !editedTitle.trim() || !editedQuestion.trim()) {
      setError("Title and question are required");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/poll/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: editedTitle.trim(),
          question: editedQuestion.trim(),
          options: editedOptions.filter((option) =>
            poll.type === "text" ? option.text.trim() !== "" : option.imageUrl
          ),
          multipleChoice: editedMultipleChoice,
          expirationDate: editedExpirationDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update poll");
      }

      const updatedData = await response.json();
      setPoll(updatedData.poll);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error("Error updating poll:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update poll"
      );
    }
  };

  const handleDeletePoll = async () => {
    if (!poll) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this poll? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/poll/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete poll");
      }

      navigate("/");
    } catch (error) {
      console.error("Error deleting poll:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete poll"
      );
    }
  };

  const handleVote = async () => {
    if (!poll) return;

    try {
      const response = await fetch(
        `${API_URL}/api/poll/custom/${id}/generate-token`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate token");
      }

      const data = await response.json();
      alert(`Token generated successfully! Token: ${data.token}`);
    } catch (error) {
      console.error("Error generating token:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate token"
      );
    }
  };

  const handleGenerateShareLinks = async () => {
    if (!poll || tokenCount <= 0) return;

    try {
      const generatePromises = Array.from({ length: tokenCount }, async () => {
        const response = await fetch(
          `${API_URL}/api/poll/${id}/generatetoken`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to generate token");
        }

        return await response.json();
      });

      const newTokens = await Promise.all(generatePromises);

      // Refresh poll data to get updated tokens
      const pollResponse = await fetch(`${API_URL}/api/poll/custom/${id}`);
      if (pollResponse.ok) {
        const updatedPoll = await pollResponse.json();
        setPoll(updatedPoll.poll);
        setShareTokens(updatedPoll.poll.voteTokens || []);
      }
    } catch (error) {
      console.error("Error generating share links:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate share links"
      );
    }
  };

  const copyToClipboard = (token: string) => {
    const shareLink = `${window.location.origin}/custompoll/vote/${token}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const renderTextOptions = () => {
    if (isEditing) {
      return (
        <div className="space-y-3">
          {editedOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={option.text}
                onChange={(e) => handleTextOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              <Button
                onClick={() => handleRemoveTextOption(index)}
                variant="neutral"
                size="sm"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button onClick={handleAddTextOption} variant="neutral" size="sm">
            Add Option
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {poll?.options.map((option, index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{option.text}</span>
              <span className="text-sm text-gray-600">
                Votes: {option.voters.length}
              </span>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderImageOptions = () => {
    if (isEditing) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || editedOptions.length >= 10}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Images"}
            </Button>
            <span className="text-sm text-gray-600">
              {editedOptions.length}/10 images
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {editedOptions.length > 0 && (
            <div className="w-full flex-col items-center gap-4 flex">
              <Carousel
                className="w-full max-w-[400px]"
                setApi={setCarouselApi}
              >
                <CarouselContent>
                  {editedOptions.map((option, index) => (
                    <CarouselItem key={index}>
                      <div className="p-[10px]">
                        <Card className="shadow-none p-0 bg-main text-main-foreground">
                          <CardContent className="flex aspect-square items-center justify-center p-4 relative">
                            <img
                              src={option.imageUrl}
                              alt={`Option ${index + 1}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => removeImageOption(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>

              <div className="w-full max-w-[400px] space-y-2">
                <Label className="text-sm font-medium">
                  Description for Image {currentImageIndex + 1}
                </Label>
                <Input
                  placeholder="Optional description..."
                  value={editedOptions[currentImageIndex]?.text || ""}
                  onChange={(e) =>
                    updateImageText(currentImageIndex, e.target.value)
                  }
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {editedOptions.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600">No images uploaded yet</p>
              <p className="text-sm text-gray-500">
                Click "Upload Images" to add your poll options
              </p>
            </div>
          )}
        </div>
      );
    }

    // Display mode for image polls
    return (
      <div className="space-y-4">
        {poll?.options && poll.options.length > 0 && (
          <div className="w-full flex-col items-center gap-4 flex">
            <Carousel className="w-full max-w-[400px]">
              <CarouselContent>
                {poll.options.map((option, index) => (
                  <CarouselItem key={index}>
                    <div className="p-[10px]">
                      <Card className="shadow-none p-0 bg-main text-main-foreground">
                        <CardContent className="flex aspect-square items-center justify-center p-4 relative">
                          <img
                            src={option.imageUrl}
                            alt={option.text || `Option ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {option.text || `Option ${index + 1}`}
                              </span>
                              <span className="text-xs">
                                Votes: {option.voters.length}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}
      </div>
    );
  };

  const renderShareLinks = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Label>Generate Share Links:</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={tokenCount}
            onChange={(e) => setTokenCount(parseInt(e.target.value) || 1)}
            className="w-20"
          />
          <Button
            onClick={handleGenerateShareLinks}
            variant="neutral"
            size="sm"
          >
            Generate {tokenCount} Link{tokenCount > 1 ? "s" : ""}
          </Button>
        </div>

        {shareTokens.length > 0 && (
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Share Links:</Label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {shareTokens.map((tokenData, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          Token {index + 1}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            tokenData.used
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {tokenData.used ? "Used" : "Available"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {`${window.location.origin}/custompoll/vote/${tokenData.token}`}
                      </div>
                      {tokenData.used && tokenData.voterName && (
                        <div className="text-xs text-gray-500 mt-1">
                          Used by: {tokenData.voterName} on{" "}
                          {new Date(tokenData.usedAt).toLocaleDateString()}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Created:{" "}
                        {new Date(tokenData.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(tokenData.token)}
                      variant="neutral"
                      size="sm"
                      disabled={tokenData.used}
                    >
                      Copy Link
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
            <Button onClick={() => navigate("/")} variant="neutral">
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
            <Button onClick={() => navigate("/")} variant="neutral">
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
          <CardTitle className="text-2xl">
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Poll Title"
                className="text-xl"
              />
            ) : (
              poll.title
            )}
          </CardTitle>
          <CardDescription>
            {isEditing ? (
              <Textarea
                value={editedQuestion}
                onChange={(e) => setEditedQuestion(e.target.value)}
                placeholder="Poll Question"
                className="mt-2"
              />
            ) : (
              poll.question
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Poll Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label>Type:</Label>
              <p className="font-medium capitalize">{poll.type}</p>
            </div>
            <div>
              <Label>Created:</Label>
              <p className="font-medium">
                {new Date(poll.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label>Multiple Choice:</Label>
              {isEditing ? (
                <Checkbox
                  checked={editedMultipleChoice}
                  onCheckedChange={(checked) =>
                    setEditedMultipleChoice(checked as boolean)
                  }
                />
              ) : (
                <p className="font-medium">
                  {poll.multipleChoice ? "Yes" : "No"}
                </p>
              )}
            </div>
            <div>
              <Label>Expiration Date:</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedExpirationDate}
                  onChange={(e) => setEditedExpirationDate(e.target.value)}
                />
              ) : (
                <p className="font-medium">
                  {poll.expirationDate
                    ? new Date(poll.expirationDate).toLocaleDateString()
                    : "No expiration"}
                </p>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Options:</Label>
            {poll.type === "text" ? renderTextOptions() : renderImageOptions()}
          </div>

          {/* Share Links Section */}
          {renderShareLinks()}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleToggleEdit} variant="neutral">
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            {isEditing && (
              <Button onClick={handleSaveChanges} variant="neutral">
                Save Changes
              </Button>
            )}
            <Button onClick={handleDeletePoll} variant="neutral">
              Delete Poll
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagePoll;
