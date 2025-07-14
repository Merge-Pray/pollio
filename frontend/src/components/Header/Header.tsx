import { NavLink } from "react-router";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import Navigation from "../Navigation";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
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
  }, []);

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

  return (
    <div className="flex flex-col justify-center items-center mt-6">
      <div className="flex flex-row gap-4 justify-between items-center sm:py-2 sm:px-16 mb-4 w-full">
        <div className="flex items-center">
          <NavLink to="/">
            <img
              src={isDarkMode ? "/p-logo-w2.svg" : "/p-logo-s2.svg"}
              alt="logo"
              className="h-20"
            />
          </NavLink>
        </div>
        <div className="flex items-center justify-center flex-grow">
          <Navigation />
        </div>
        <div className="flex items-center gap-4">
          <Switch
            id="darkmode"
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
          />
          <Label htmlFor="darkmode" className="text-xs">
            {isDarkMode ? "light" : "dark"}
          </Label>
        </div>
      </div>
    </div>
  );
};

export default Header;
