import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { API_URL } from "@/lib/config";
import useUserStore from "@/hooks/userstore";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import type { CarouselApi } from "@/components/ui/carousel";

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

interface UploadedImage {
  url: string;
  file: File;
  text?: string;
}

function Imagepoll() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    question: z.string().min(2, {
      message: "Question must be at least 2 characters.",
    }),
    images: z
      .array(
        z.object({
          url: z.string(),
          text: z.string().optional(),
        })
      )
      .min(2, "At least 2 images required")
      .max(10, "Maximum 10 images allowed"),
    multipleChoice: z.boolean().default(false),
    hasEndDate: z.boolean().default(false),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      question: "",
      images: [],
      multipleChoice: false,
      hasEndDate: false,
      endDate: "",
      endTime: "23:59",
    },
  });

  const watchedHasEndDate = form.watch("hasEndDate");

  useEffect(() => {
    const imageData = uploadedImages.map((img) => ({
      url: img.url,
      text: img.text || "",
    }));
    form.setValue("images", imageData);
  }, [uploadedImages, form]);

  useEffect(() => {
    if (
      currentImageIndex >= uploadedImages.length &&
      uploadedImages.length > 0
    ) {
      setCurrentImageIndex(uploadedImages.length - 1);
    }
  }, [uploadedImages.length, currentImageIndex]);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setCurrentImageIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    if (uploadedImages.length + files.length > 10) {
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
        return { url, file, text: "" };
      });

      const newImages = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...newImages]);
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

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    if (index === currentImageIndex && uploadedImages.length > 1) {
      if (currentImageIndex === uploadedImages.length - 1) {
        setCurrentImageIndex(currentImageIndex - 1);
      }
    }
  };

  const updateImageText = (index: number, text: string) => {
    setUploadedImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, text } : img))
    );
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser) {
      setError("You must be logged in to create a poll");
      return;
    }

    if (uploadedImages.length < 2) {
      setError("Please upload at least 2 images");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let expirationDate = null;
      if (values.hasEndDate && values.endDate) {
        const dateTime = `${values.endDate}T${values.endTime || "23:59"}:00`;
        expirationDate = new Date(dateTime).toISOString();
      }

      const options = uploadedImages.map((img) => ({
        imageUrl: img.url,
        text: img.text || "",
      }));

      const response = await fetch(`${API_URL}/api/poll/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: values.title,
          question: values.question,
          options: options,
          multipleChoice: values.multipleChoice,
          expirationDate: expirationDate,
          type: "image",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create poll");
      }

      const data = await response.json();
      console.log("Image poll created successfully:", data);

      navigate(`/user/polls/${data.poll.id}`);
    } catch (error) {
      console.error("Poll creation error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create poll"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Create Image Poll
          </CardTitle>
          <CardDescription>
            Create an engaging poll with images. Upload up to 10 images and let
            people vote!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-semibold">
                      Poll Title
                    </FormLabel>
                    <FormDescription>
                      Give your image poll a descriptive title
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="e.g., Choose the Best Logo Design"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-semibold">
                      Poll Question
                    </FormLabel>
                    <FormDescription>
                      Enter the main question for your poll
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="Which design do you prefer?"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel className="text-lg font-medium">
                  Poll Images
                </FormLabel>
                <FormDescription>
                  Upload images for your poll options (2-10 images, max 5MB
                  each)
                </FormDescription>

                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || uploadedImages.length >= 10}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Upload Images"}
                  </Button>
                  <span className="text-sm text-gray-600">
                    {uploadedImages.length}/10 images
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

                {uploadedImages.length > 0 && (
                  <div className="w-full flex-col items-center gap-4 flex">
                    <Carousel
                      className="w-full max-w-[400px]"
                      setApi={setCarouselApi}
                    >
                      <CarouselContent>
                        {uploadedImages.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="p-[10px]">
                              <Card className="shadow-none p-0 bg-main text-main-foreground">
                                <CardContent className="flex aspect-square items-center justify-center p-4 relative">
                                  <img
                                    src={image.url}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => removeImage(index)}
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
                      <FormLabel className="text-sm font-medium">
                        Description for Image {currentImageIndex + 1}
                      </FormLabel>
                      <Input
                        placeholder="Optional description..."
                        value={uploadedImages[currentImageIndex]?.text || ""}
                        onChange={(e) =>
                          updateImageText(currentImageIndex, e.target.value)
                        }
                        className="text-sm"
                      />
                      <FormDescription className="text-xs">
                        Navigate through the carousel to edit descriptions for
                        other images
                      </FormDescription>
                    </div>
                  </div>
                )}

                {uploadedImages.length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-600">No images uploaded yet</p>
                    <p className="text-sm text-gray-500">
                      Click "Upload Images" to add your poll options
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>

                <FormField
                  control={form.control}
                  name="multipleChoice"
                  render={({ field: { value, onChange } }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Multiple Choice
                        </FormLabel>
                        <FormDescription>
                          Allow voters to select multiple images
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean(value)}
                          onCheckedChange={onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasEndDate"
                  render={({ field: { value, onChange } }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Set End Date
                        </FormLabel>
                        <FormDescription>
                          Automatically close the poll at a specific date and
                          time
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean(value)}
                          onCheckedChange={onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchedHasEndDate && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              min={today}
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={
                    isLoading || !currentUser || uploadedImages.length < 2
                  }
                  className="flex-1"
                >
                  {isLoading ? "Creating Poll..." : "Create Image Poll"}
                </Button>
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => navigate("/polloverview")}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Imagepoll;
