import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import useUserStore from "@/hooks/userstore";
import { cn } from "@/lib/utils";

import { API_URL } from "@/lib/config";
import { useNavigate } from "react-router";

export default function Navigation() {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch(`${API_URL}/api/user/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then(() => {
        setCurrentUser(null);
        navigate("/");
      })
      .catch((error) => console.error("Error logging out:", error));
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <NavigationMenu className="z-5">
      <NavigationMenuList>
        {currentUser ? (
          <>
            <NavigationMenuItem className="sm:block hidden">
              <NavigationMenuTrigger>
                {currentUser.username}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-3 p-2 ">
                  <ListItem
                    href={`/user/${currentUser.id}`}
                    title="Your Polls"
                  />

                  <ListItem href="/polloverview" title="Add Personal Poll" />
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem className="sm:block hidden">
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                onClick={handleLogout}
              >
                Logout
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        ) : (
          <NavigationMenuItem>
            <NavigationMenuLink
              className="text-sm"
              onClick={handleLoginRedirect}
            >
              Login
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "hover:bg-accent block text-main-foreground select-none space-y-1 rounded-base border-2 border-transparent p-3 leading-none no-underline outline-hidden transition-colors hover:border-border",
            className
          )}
          {...props}
        >
          <div className="text-base font-heading leading-none">{title}</div>
          <p className="font-base line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}
ListItem.displayName = "ListItem";
