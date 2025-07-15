import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

import useUserStore from "@/hooks/userstore";
import { API_URL } from "@/lib/config";

import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";

const formSchema = z.object({
  identifier: z.string().min(1, { message: "Email or username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const Loginpage = () => {
  const navigate = useNavigate();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      setCurrentUser(data.user);
      navigate("/polloverview");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const credential = credentialResponse.credential;
    if (!credential) {
      setError("❌ Kein Google Token erhalten.");
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
    } catch (err: any) {
      setError(err.message || "Google Login fehlgeschlagen");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email or username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>

      <div className="max-w-md mt-6 text-center space-y-4">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("❌ Google Login fehlgeschlagen")}
          useOneTap
        />

        <Button
          variant="noShadow"
          onClick={() => navigate("/register")}
          className="text-xs mt-4 h-6 cursor-pointer"
        >
          Don't have an account? Register
        </Button>
      </div>
    </div>
  );
};

export default Loginpage;
