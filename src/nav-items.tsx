import { HomeIcon, ShieldIcon } from "lucide-react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Auth",
    to: "/auth",
    icon: <ShieldIcon className="h-4 w-4" />,
    page: <Auth />,
  },
];