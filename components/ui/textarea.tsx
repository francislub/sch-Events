// File: components/ui/textarea.tsx
import React from 'react';
import { cn } from "@/lib/utils"; // Utility for combining classes (optional)

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        "w-full px-4 py-2 text-sm border rounded-md shadow-sm resize-none",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
        "border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
        className
      )}
      {...props}
    />
  );
};

export default Textarea;
