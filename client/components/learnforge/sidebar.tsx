"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  LayoutDashboard,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const mainNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Study Materials", href: "/documents", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // Logo Icon: Stylized open book combined subtly with a spark.
  const LogoIcon = () => (
    <div className="relative h-7 w-7 text-primary flex items-center justify-center shrink-0">
      <BookOpen className="h-6 w-6 stroke-[2]" />
      <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 fill-current animate-pulse text-indigo-500" />
    </div>
  );

  const NavLink = ({ item }: { item: NavItem }) => {
    // Exact match or matches parent sub-paths
    const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

    return (
      <Link
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-150 select-none relative focus-ring",
          isActive
            ? "text-primary bg-primary/10 font-semibold"
            : "text-text-secondary hover:text-text-primary hover:bg-background"
        )}
      >
        <item.icon
          className={cn(
            "h-4.5 w-4.5 stroke-[2] shrink-0",
            isActive ? "text-primary" : "text-text-secondary group-hover:text-text-primary"
          )}
        />
        <span>{item.name}</span>
        {isActive && (
          <motion.div
            layoutId="activeSideBarMarker"
            className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-10 bg-surface shadow-md cursor-pointer border-border-color"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 bg-text-primary/60 md:hidden backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Core Wrapper */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-30 w-[240px] bg-surface border-r border-border-color/80 flex flex-col py-6 px-4 transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:left-0"
        )}
      >
        {/* Top Branding Section */}
        <div className="flex flex-col flex-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-1 mb-8 focus-ring rounded"
          >
            <LogoIcon />
            <span className="font-sans font-extrabold text-lg text-text-primary tracking-tight">
              LearnForge
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {mainNavItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Optional fallback, let's keep drawer as primary, but having a neat mobile sheet is perfect) */}
    </>
  );
}
