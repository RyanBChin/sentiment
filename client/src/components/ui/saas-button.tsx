import React from 'react';
import { cn } from '@/lib/utils';

interface SaasButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function SaasButton({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: SaasButtonProps) {
  const baseClasses = "font-medium rounded-lg shadow transition-all active:scale-95 focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-blue-600 focus:ring-primary",
    secondary: "bg-secondary text-white hover:bg-green-600 focus:ring-secondary",
    danger: "bg-danger text-white hover:bg-red-600 focus:ring-danger",
    warning: "bg-warning text-white hover:bg-yellow-600 focus:ring-warning"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base", 
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}