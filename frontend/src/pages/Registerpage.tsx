import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";

import useUserStore from "@/hooks/userstore.js";
import { API_URL } from "@/lib/config.js";
import { Button } from "../components/ui/button.js";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form.js";
import { Input } from "../components/ui/input.js";

const RegisterPage = () => {
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const formSchema = z
    .object({
      username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters long." })
        .refine((val) => !val.includes("@"), {
          message: "Username cannot contain @ symbol.",
        }),
      email: z.string().email({ message: "Invalid email format." }),
      password: z
        .string()
        .min(10, { message: "Password must be at least 10 characters long." })
        .regex(/[A-Z]/, {
          message: "Password must contain at least one uppercase letter (A-Z).",
        })
        .regex(/[a-z]/, {
          message: "Password must contain at least one lowercase letter (a-z).",
        })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, {
          message:
            'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>).',
        }),
      confirmPassword: z
        .string()
        .min(1, { message: "Please confirm your password." }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const { confirmPassword, ...submitData } = values;

      const response = await fetch(`${API_URL}/api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 400 && errorData.errors) {
          const fieldErrors: Record<string, string> = {};
          errorData.errors.forEach((error: any) => {
            const fieldName = Object.keys(error)[0];
            const errorMessage = Object.values(error)[0] as string;
            fieldErrors[fieldName] = errorMessage;
          });
          setValidationErrors(fieldErrors);

          Object.entries(fieldErrors).forEach(([field, message]) => {
            if (field in form.getValues()) {
              form.setError(field as keyof typeof values, {
                type: "server",
                message: message,
              });
            }
          });

          setError("Please fix the validation errors below.");
        } else {
          throw new Error(errorData.message || "Registration failed");
        }
      } else {
        const data = await response.json();
        setCurrentUser(data.user);
        navigate("/polloverview");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const credential = credentialResponse?.credential;
    if (!credential) {
      setError("❌ No Google token received");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCurrentUser(data.user);
      navigate("/polloverview");
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(err instanceof Error ? err.message : "Google Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Choose a username" {...field} />
                </FormControl>
                <FormMessage />
                {validationErrors.username && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.username}
                  </p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {validationErrors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Password Fields Group */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  {validationErrors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {validationErrors.password}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        {...field}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Requirements - Now below both password fields */}
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-2">Password requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>At least 10 characters long</li>
                <li>At least one uppercase letter (A-Z)</li>
                <li>At least one lowercase letter (a-z)</li>
                <li>
                  At least one special character (!@#$%^&*(),.?":{}
                  |&lt;&gt;)
                </li>
              </ul>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center space-y-4">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("❌ Google Login failed")}
          useOneTap
        />

        <Button
          variant="noShadow"
          onClick={() => navigate("/login")}
          className="text-xs mt-2 h-6 cursor-pointer"
        >
          Already have an account? Login
        </Button>
      </div>
    </div>
  );
};

export default RegisterPage;
