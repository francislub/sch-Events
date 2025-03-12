// File: components/ui/label.tsx
import React from 'react';
import { cn } from "@/lib/utils"; // Utility for combining classes (optional)

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ children, className, ...props }) => {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;
