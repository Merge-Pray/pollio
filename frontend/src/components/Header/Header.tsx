import { NavLink } from "react-router";
import { Card } from "../ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

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
    <div className="flex flex-col justify-center items-center mt-6 ">
      <Card className="flex flex-col gap-0.5 justify-center items-center sm:py-2 sm:px-16 mb-4 ">
        <NavLink to="/">
          <img
            src={isDarkMode ? "/pollio_logo_w.svg" : "/pollio_logo_s.svg"}
            alt="logo"
            className="h-14"
          />
        </NavLink>
        <p className="font-light">simple.clean.fast</p>
        <Switch
          id="darkmode"
          className="absolute top-[0.5rem] right-2"
          checked={isDarkMode}
          onCheckedChange={toggleDarkMode}
        />
        <Label
          htmlFor="darkmode"
          className="text-xs absolute top-[2.5rem] right-4.5"
        >
          {isDarkMode ? "light" : "dark"}
        </Label>
      </Card>
    </div>
  );
};
export default Header;
