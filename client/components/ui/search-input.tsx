import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, ...props }, ref) => {
    const showClear = value && onClear;

    return (
      <div className="relative flex items-center w-full font-sans">
        <Search className="absolute left-3.5 h-4.5 w-4.5 text-text-secondary pointer-events-none" />
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn(
            "h-10 w-full pl-10 pr-9 rounded-lg border border-border-color bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 disabled:opacity-50",
            className
          )}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 text-text-secondary hover:text-text-primary p-0.5 rounded-full hover:bg-background transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
