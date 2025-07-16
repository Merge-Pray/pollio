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
import { X, Upload, Image as ImageIcon, Calendar, Clock } from "lucide-react";

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
  isAnonymous: boolean;
  expirationDate?: string;
  expired: boolean;
  createdAt: string;
  voteTokens?: any[];
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
  const [editedIsAnonymous, setEditedIsAnonymous] = useState<boolean>(false);
  const [editedExpirationDate, setEditedExpirationDate] = useState<string>("");
  const [editedExpirationTime, setEditedExpirationTime] =
    useState<string>("23:59");

  // Share tokens state
  const [shareTokens, setShareTokens] = useState<any[]>([]);
  const [tokenCount, setTokenCount] = useState<number>(1);

  // Helper function to format date and time for display
  const formatExpirationDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} at ${timeStr}`;
  };

  // Get today's date for minimum date validation
  const today = new Date().toISOString().split("T")[0];

  // Helper functions for poll status
  const isPollActive = (poll: Poll) => {
    if (poll.expired) return false;
    if (poll.expirationDate && new Date() > new Date(poll.expirationDate))
      return false;
    return true;
  };

  const isExpiredByDate = (poll: Poll) => {
    return poll.expirationDate && new Date() > new Date(poll.expirationDate);
  };

  const isManuallyExpired = (poll: Poll) => {
    return (
      poll.expired &&
      (!poll.expirationDate || new Date() <= new Date(poll.expirationDate))
    );
  };

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
        setEditedIsAnonymous(data.poll.isAnonymous || false);

        // Handle expiration date and time
        if (data.poll.expirationDate) {
          const expirationDate = new Date(data.poll.expirationDate);
          setEditedExpirationDate(expirationDate.toISOString().split("T")[0]);
          setEditedExpirationTime(
            expirationDate.toTimeString().substring(0, 5) // HH:MM format
          );
        } else {
          setEditedExpirationDate("");
          setEditedExpirationTime("23:59");
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
    if (!poll) return;

    // Check if poll is expired before allowing edit
    if (!isPollActive(poll)) {
      alert(
        "Please reactivate the poll before editing. Use the 'Reactivate Poll' button first."
      );
      return;
    }

    if (isEditing) {
      // Reset to original values when canceling
      setEditedTitle(poll.title || "");
      setEditedQuestion(poll.question || "");
      setEditedOptions(poll.options || []);
      setEditedMultipleChoice(poll.multipleChoice || false);
      setEditedIsAnonymous(poll.isAnonymous || false);

      // Reset expiration date and time
      if (poll.expirationDate) {
        const expirationDate = new Date(poll.expirationDate);
        setEditedExpirationDate(expirationDate.toISOString().split("T")[0]);
        setEditedExpirationTime(expirationDate.toTimeString().substring(0, 5));
      } else {
        setEditedExpirationDate("");
        setEditedExpirationTime("23:59");
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

  const handleEndPoll = async () => {
    if (!poll) return;

    const confirmEnd = window.confirm(
      "Are you sure you want to end this poll? This will immediately stop all voting."
    );
    if (!confirmEnd) return;

    try {
      const response = await fetch(`${API_URL}/api/poll/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...poll,
          expired: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to end poll");
      }

      const updatedData = await response.json();
      setPoll(updatedData.poll);
      setError(null);
    } catch (error) {
      console.error("Error ending poll:", error);
      setError(error instanceof Error ? error.message : "Failed to end poll");
    }
  };

  const handleReactivatePoll = async () => {
    if (!poll) return;

    const confirmReactivate = window.confirm(
      "Are you sure you want to reactivate this poll? This will allow voting again."
    );
    if (!confirmReactivate) return;

    try {
      let updateData = {
        ...poll,
        expired: false,
      };

      // If poll was expired by date (not manually), remove the expiration date
      if (isExpiredByDate(poll)) {
        updateData.expirationDate = null;
      }

      const response = await fetch(`${API_URL}/api/poll/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reactivate poll");
      }

      const updatedData = await response.json();
      setPoll(updatedData.poll);
      setError(null);
    } catch (error) {
      console.error("Error reactivating poll:", error);
      setError(
        error instanceof Error ? error.message : "Failed to reactivate poll"
      );
    }
  };

  const handleResetPoll = async () => {
    if (!poll) return;

    const confirmReset = window.confirm(
      "⚠️ WARNING: This will reset ALL votes and make all voting links usable again.\n\n" +
        "Are you sure you want to reset this poll? This action cannot be undone.\n\n" +
        "• All votes will be deleted\n" +
        "• All voting tokens will be reactivated\n" +
        "• Voters can vote again using their original links"
    );
    if (!confirmReset) return;

    try {
      const response = await fetch(`${API_URL}/api/poll/reset/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset poll");
      }

      const updatedData = await response.json();
      setPoll(updatedData.poll);
      setShareTokens(updatedData.poll.voteTokens || []);
      setError(null);

      alert(
        "Poll has been reset successfully! All votes cleared and voting links reactivated."
      );
    } catch (error) {
      console.error("Error resetting poll:", error);
      setError(error instanceof Error ? error.message : "Failed to reset poll");
    }
  };

  const handleSaveChanges = async () => {
    if (!poll || !editedTitle.trim() || !editedQuestion.trim()) {
      setError("Title and question are required");
      return;
    }

    try {
      // Handle expiration date and time combination
      let expirationDate = null;

      if (editedExpirationDate) {
        const dateTime = `${editedExpirationDate}T${
          editedExpirationTime || "23:59"
        }:00`;
        expirationDate = new Date(dateTime).toISOString();
      }

      // Fix options filtering for different poll types
      let filteredOptions;
      if (poll.type === "text") {
        filteredOptions = editedOptions.filter(
          (option) => option.text.trim() !== ""
        );
      } else if (poll.type === "image") {
        filteredOptions = editedOptions.filter((option) => option.imageUrl);
      } else if (poll.type === "date") {
        filteredOptions = editedOptions.filter((option) => option.dateTime);
      } else {
        filteredOptions = editedOptions;
      }

      const response = await fetch(`${API_URL}/api/poll/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: editedTitle.trim(),
          question: editedQuestion.trim(),
          options: filteredOptions,
          multipleChoice: editedMultipleChoice,
          isAnonymous: editedIsAnonymous,
          expirationDate: expirationDate,
          expired: false, // Keep poll active when editing
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
                              size="icon"
                              variant="noShadow"
                              className="absolute top-2 right-2 h-6 w-6 cursor-pointer"
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

    // Display mode for image polls - Show small previews instead of carousel
    return (
      <div className="space-y-4">
        {poll?.options && poll.options.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {poll.options.map((option, index) => (
              <Card
                key={index}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-3">
                  <div className="aspect-square mb-2">
                    <img
                      src={option.imageUrl}
                      alt={option.text || `Option ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="space-y-1">
                    {option.text && (
                      <p
                        className="text-sm font-medium truncate"
                        title={option.text}
                      >
                        {option.text}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span>Option {index + 1}</span>
                      <span className="font-medium">
                        {option.voters.length} vote
                        {option.voters.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(!poll?.options || poll.options.length === 0) && (
          <div className="text-center text-gray-500 py-8">
            No images available for this poll
          </div>
        )}
      </div>
    );
  };

  const renderShareLinks = () => {
    // Sort tokens by creation date (newest first)
    const sortedTokens = [...shareTokens].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

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

        {sortedTokens.length > 0 && (
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Share Links:</Label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {sortedTokens.map((tokenData, index) => (
                <Card key={tokenData.token || index} className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
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

  const formatDateTimeForInput = (dateTime: string) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateOptionChange = (
    index: number,
    field: "dateTime" | "text",
    value: string
  ) => {
    const newOptions = [...editedOptions];
    if (field === "dateTime") {
      newOptions[index].dateTime = value;
    } else {
      newOptions[index].text = value;
    }
    setEditedOptions(newOptions);
  };

  const handleAddDateOption = () => {
    if (editedOptions.length < 10) {
      setEditedOptions([
        ...editedOptions,
        { text: "", dateTime: "", voters: [], yes: [], no: [], maybe: [] },
      ]);
    }
  };

  const handleRemoveDateOption = (index: number) => {
    if (editedOptions.length > 2) {
      setEditedOptions(editedOptions.filter((_, i) => i !== index));
    }
  };

  const renderDateOptions = () => {
    if (isEditing) {
      return (
        <div className="space-y-4">
          <div className="text-sm bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-200">
            <strong>ℹ️ Date Poll Settings:</strong>
            <ul className="mt-2 space-y-1">
              <li>
                • <strong>Availability Check:</strong> Voters choose
                Yes/No/Maybe for each date option
              </li>
              <li>
                • <strong>Single Choice:</strong> Voters pick one preferred date
              </li>
            </ul>
          </div>

          {editedOptions.map((option, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Date Option {index + 1}</Label>
                {editedOptions.length > 2 && (
                  <Button
                    onClick={() => handleRemoveDateOption(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeForInput(option.dateTime || "")}
                    onChange={(e) =>
                      handleDateOptionChange(index, "dateTime", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Description (Optional)</Label>
                  <Input
                    value={option.text}
                    onChange={(e) =>
                      handleDateOptionChange(index, "text", e.target.value)
                    }
                    placeholder="e.g., Team meeting, Lunch break"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            onClick={handleAddDateOption}
            variant="outline"
            size="sm"
            disabled={editedOptions.length >= 10}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Add Date Option
          </Button>

          {editedOptions.length >= 10 && (
            <p className="text-sm text-gray-500">
              Maximum of 10 date options reached
            </p>
          )}
        </div>
      );
    }

    // Display mode for date polls
    return (
      <div className="space-y-3">
        {poll?.multipleChoice && (
          <div className="text-sm bg-green-50 text-green-700 p-3 rounded-lg border border-green-200">
            <strong>🗓️ Availability Check Poll:</strong> Participants vote
            Yes/No/Maybe for each date option
          </div>
        )}

        {poll?.options.map((option, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">
                      {option.text || `Date Option ${index + 1}`}
                    </h4>
                    {option.dateTime && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Clock className="h-4 w-4" />
                        {formatDateTime(option.dateTime)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {poll.multipleChoice ? (
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓ Yes:</span>
                          <span className="font-medium">
                            {option.yes?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-red-600">✗ No:</span>
                          <span className="font-medium">
                            {option.no?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-600">? Maybe:</span>
                          <span className="font-medium">
                            {option.maybe?.length || 0}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600">
                        Votes: {option.voters.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Update the multiple choice label for date polls
  const getMultipleChoiceLabel = () => {
    if (poll?.type === "date") {
      return poll.multipleChoice ? "Availability Check" : "Single Choice";
    }
    return poll?.multipleChoice ? "Yes" : "No";
  };

  const getMultipleChoiceDescription = () => {
    if (poll?.type === "date") {
      return poll.multipleChoice
        ? "Voters choose Yes/No/Maybe for each date"
        : "Voters select one preferred date";
    }
    return "";
  };

  const renderPollStatus = () => {
    if (!poll) return null;

    const isActive = isPollActive(poll);

    if (isEditing) {
      return (
        <div className="space-y-3">
          <Label>Set Expiration Date:</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={editedExpirationDate}
              onChange={(e) => setEditedExpirationDate(e.target.value)}
              min={today}
              placeholder="Select date"
            />
            <Input
              type="time"
              value={editedExpirationTime}
              onChange={(e) => setEditedExpirationTime(e.target.value)}
              placeholder="Select time"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="noShadow"
              size="sm"
              onClick={() => {
                setEditedExpirationDate("");
                setEditedExpirationTime("23:59");
              }}
              className="text-xs"
            >
              Clear Expiration
            </Button>
            <span className="text-xs text-gray-500">
              Leave empty for no expiration
            </span>
          </div>
          <div className="text-xs bg-blue-50 text-blue-700 p-2 rounded">
            <strong>Current Status:</strong> Active
            {poll.expirationDate && (
              <span>
                {" "}
                until {formatExpirationDateTime(poll.expirationDate)}
              </span>
            )}
          </div>
          {editedExpirationDate && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              <strong>New expiration:</strong>{" "}
              {formatExpirationDateTime(
                `${editedExpirationDate}T${editedExpirationTime || "23:59"}:00`
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        <Label>Status:</Label>
        {isActive ? (
          <div>
            <p className="font-medium text-green-600">Active</p>
            {poll.expirationDate && (
              <p className="text-xs text-gray-500">
                Expires: {formatExpirationDateTime(poll.expirationDate)}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="font-medium text-red-600">Expired</p>
            {poll.expirationDate && (
              <p className="text-xs text-gray-500">
                {isExpiredByDate(poll) ? "Expired by date" : "Would have ended"}{" "}
                on {formatExpirationDateTime(poll.expirationDate)}
              </p>
            )}
          </div>
        )}
      </>
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

  const isActive = isPollActive(poll);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditing ? (
              <>
                <Label>Poll Title:</Label>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Poll Title"
                  className="text-xl"
                />
              </>
            ) : (
              <div className="flex items-center gap-3">
                {poll.title}
                {!isActive && (
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                    EXPIRED
                  </span>
                )}
              </div>
            )}
          </CardTitle>
          <CardDescription>
            {isEditing ? (
              <>
                <Label>Poll Question:</Label>
                <Textarea
                  value={editedQuestion}
                  onChange={(e) => setEditedQuestion(e.target.value)}
                  placeholder="Poll Question"
                  className="mt-2"
                />
              </>
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
              <Label>
                {poll?.type === "date"
                  ? "Availability Check:"
                  : "Multiple Choice:"}
              </Label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={editedMultipleChoice}
                      className="mx-1"
                      onCheckedChange={(checked) =>
                        setEditedMultipleChoice(checked as boolean)
                      }
                    />
                    <span className="text-sm">
                      {poll?.type === "date"
                        ? "Enable Yes/No/Maybe voting"
                        : "Allow multiple selections"}
                    </span>
                  </div>
                  {poll?.type === "date" && (
                    <p className="text-xs text-gray-500">
                      {editedMultipleChoice
                        ? "Voters indicate availability for each date option"
                        : "Voters select their single preferred date"}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-medium">{getMultipleChoiceLabel()}</p>
                  {poll?.type === "date" && (
                    <p className="text-xs text-gray-500">
                      {getMultipleChoiceDescription()}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label>Anonymous Voting:</Label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={editedIsAnonymous}
                    className="mx-1"
                    onCheckedChange={(checked) =>
                      setEditedIsAnonymous(checked as boolean)
                    }
                  />
                  {editedIsAnonymous && <span className="text-xs">🔒</span>}
                </div>
              ) : (
                <p className="font-medium flex items-center gap-1">
                  {poll.isAnonymous ? (
                    <>
                      <span>🔒</span>
                      <span>Yes</span>
                    </>
                  ) : (
                    "No"
                  )}
                </p>
              )}
            </div>
            <div>{renderPollStatus()}</div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Options:</Label>
            {poll.type === "text"
              ? renderTextOptions()
              : poll.type === "image"
              ? renderImageOptions()
              : renderDateOptions()}
          </div>

          {/* Share Links Section */}
          {renderShareLinks()}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleToggleEdit}
              variant="neutral"
              disabled={!isActive && !isEditing}
              title={!isActive ? "Reactivate poll first to edit" : ""}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>

            {isEditing && (
              <Button onClick={handleSaveChanges} variant="neutral">
                Save Changes
              </Button>
            )}

            {isActive ? (
              <Button onClick={handleEndPoll} variant="neutral">
                End Poll
              </Button>
            ) : (
              <Button
                onClick={handleReactivatePoll}
                variant="neutral"
                className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
              >
                Reactivate Poll
              </Button>
            )}

            <Button
              onClick={handleResetPoll}
              variant="neutral"
              className="bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300"
            >
              Reset Poll
            </Button>

            <Button onClick={handleDeletePoll} variant="neutral">
              Delete Poll
            </Button>

            <Button
              onClick={() => navigate(`/custompoll/result/${id}`)}
              variant="neutral"
            >
              View Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagePoll;
