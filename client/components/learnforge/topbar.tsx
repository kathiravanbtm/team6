"use client";

import * as React from "react";
import { Bell, Search, LogOut, Settings, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title?: string;
  className?: string;
}

export function Topbar({ title = "Dashboard", className }: TopbarProps) {
  const [searchValue, setSearchValue] = React.useState("");

  const userMenuItems: DropdownItem[] = [
    {
      id: "profile",
      label: "My Profile",
      icon: <User className="h-4 w-4" />,
      onClick: () => (window.location.href = "/profile"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      onClick: () => (window.location.href = "/settings"),
    },
    {
      id: "logout",
      label: "Logout",
      icon: <LogOut className="h-4 w-4" />,
      danger: true,
      onClick: () => {
        alert("Logout clicked (Mock Action)");
      },
    },
  ];

  return (
    <header
      className={cn(
        "h-16 md:h-18 border-b border-border-color/80 bg-surface flex items-center justify-between px-6 md:px-8 font-sans w-full sticky top-0 z-20",
        className
      )}
    >
      {/* View Title */}
      <div className="flex items-center">
        {/* Generous margin on mobile to prevent overlaying the toggle menu */}
        <h1 className="text-base md:text-lg font-bold text-text-primary pl-8 md:pl-0 select-none">
          {title}
        </h1>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4 md:gap-6 flex-1 max-w-md justify-end ml-4">
        {/* Search Bar - hidden on tiny screens */}
        <div className="hidden sm:block w-full max-w-xs">
          <SearchInput
            placeholder="Search materials, quizzes..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => setSearchValue("")}
            className="h-9.5 text-xs"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 border border-border-color/40 hover:border-border-color bg-background/50 hover:bg-background rounded-lg text-text-secondary hover:text-text-primary transition-all duration-150 cursor-pointer relative">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-error" />
        </button>

        {/* User Profile */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 hover:opacity-90 focus-ring rounded-full cursor-pointer">
              <Avatar
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256"
                fallback="LF"
                size="sm"
              />
            </button>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
}
