import { NavLink } from "react-router";
import { Card } from "../ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import useUserStore from "@/hooks/userstore";
import { useNavigate } from "react-router";

const Header = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const checkToken = useUserStore((state) => state.checkToken);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkToken();

    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, [checkToken]);

  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
      .then(() => {
        setCurrentUser(null);
        navigate("/");
      })
      .catch((error) => console.error("Error logging out:", error));
  };

  return (
    <div className="flex flex-col justify-center items-center mt-6">
      <Card className="flex flex-row gap-4 justify-between items-center sm:py-2 sm:px-16 mb-4 w-full">
        <NavLink to="/">
          <img
            src={isDarkMode ? "/p-logo-w2.svg" : "/p-logo-s2.svg"}
            alt="logo"
            className="h-20"
          />
        </NavLink>
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <NavLink to={`/user/${currentUser.userID}`}>
                <p>
                  Willkommen <span>{`${currentUser.username}`}</span>
                </p>
              </NavLink>
              <Button onClick={handleLogout} className="text-sm cursor-pointer">
                Logout
              </Button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="text-sm cursor-pointer border-black border-2 px-1 py-0.5 rounded-2xl transition-transform transform hover:scale-105"
            >
              Login
            </NavLink>
          )}
          <Switch
            id="darkmode"
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
          />
          <Label htmlFor="darkmode" className="text-xs">
            {isDarkMode ? "light" : "dark"}
          </Label>
        </div>
      </Card>
    </div>
  );
};

export default Header;
