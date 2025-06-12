import React from 'react';
import { cn } from '@/lib/utils';

interface SaasCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'outlined';
  hoverable?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
}

export function SaasCard({ 
  variant = 'default', 
  hoverable = false,
  clickable = false,
  className, 
  children, 
  ...props 
}: SaasCardProps) {
  const baseClasses = "bg-card-bg rounded-2xl shadow-sm p-6 transition-all";
  
  const variantClasses = {
    default: "bg-card-bg border border-neutral/20",
    gradient: "bg-gradient-to-r from-primary to-blue-600 text-white border-0",
    outlined: "bg-transparent border-2 border-neutral"
  };

  const interactionClasses = {
    hoverable: hoverable ? "hover:shadow-lg" : "",
    clickable: clickable ? "hover:scale-[1.02] cursor-pointer" : "",
    combined: (hoverable && clickable) ? "hover:shadow-lg hover:scale-[1.02] cursor-pointer" : ""
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverable && "hover:shadow-lg",
        clickable && "hover:scale-[1.02] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SaasCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SaasCardHeader({ className, children, ...props }: SaasCardHeaderProps) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

interface SaasCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function SaasCardTitle({ className, children, ...props }: SaasCardTitleProps) {
  return (
    <h3 className={cn("text-xl font-semibold text-neutral-dark", className)} {...props}>
      {children}
    </h3>
  );
}

interface SaasCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SaasCardContent({ className, children, ...props }: SaasCardContentProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {children}
    </div>
  );
}