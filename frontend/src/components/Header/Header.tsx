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
  <div className="w-full px-4 sm:px-16 mt-6 relative">
    {/* Wrapper: Flex-Layout */}
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">

      {/* Logo (links) */}
      <div className="flex justify-center sm:justify-start w-full sm:w-auto z-10">
        <NavLink to="/">
          <img
            src={isDarkMode ? "/p-logo-w2.svg" : "/p-logo-s2.svg"}
            alt="logo"
            className="h-15 object-contain"
          />
        </NavLink>
      </div>

      {/* Navigation (zentriert absolut auf sm+) */}
      <div className="w-full flex justify-center sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-0">
        <Navigation />
      </div>

      {/* Darkmode (rechts) */}
      <div className="flex justify-center sm:justify-end items-center gap-2 w-full sm:w-auto z-10">
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