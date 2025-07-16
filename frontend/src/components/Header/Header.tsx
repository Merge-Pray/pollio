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
  <div className="w-full px-4 lg:px-16 mt-6">
    {/* Wrapper: Flex für Mobile, Grid für Desktop */}
    <div className="flex flex-col items-center gap-4 w-full lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center">

      {/* Logo (links) */}
      <div className="flex justify-center lg:justify-start w-full shrink-0">
        <NavLink to="/">
          <img
            src={isDarkMode ? "/p-logo-w2.svg" : "/p-logo-s2.svg"}
            alt="logo"
            className="h-15 object-contain"
          />
        </NavLink>
      </div>

      {/* Navigation (zentriert) */}
      <div className="flex justify-center w-full">
        <Navigation />
      </div>

      {/* Darkmode (rechts) */}
      <div className="flex justify-center lg:justify-end items-center gap-2 w-full shrink-0">
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