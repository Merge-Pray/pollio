import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import useUserStore from "@/hooks/userstore";
import { Card, CardDescription } from "./ui/card";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { currentUser } = useUserStore();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!currentUser) {
      timeout = setTimeout(() => {
        setRedirect(true);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [currentUser]);

  if (!currentUser && !redirect) {
    return (
      <Card className="w-lg">
        <CardDescription className="text-lg p-0.5 text-center">
          <p>You have to login.</p>{" "}
          <p>You will be redirected to the login page shortly...</p>
        </CardDescription>
      </Card>
    );
  }

  if (!currentUser && redirect) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
