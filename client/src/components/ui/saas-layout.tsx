import React from 'react';
import { cn } from '@/lib/utils';

interface SaasLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function SaasLayout({ children, className }: SaasLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background-main font-inter", className)}>
      {children}
    </div>
  );
}

interface SaasHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SaasHeader({ children, className }: SaasHeaderProps) {
  return (
    <header className={cn("h-16 bg-card-bg shadow-sm border-b border-neutral/20 px-6 flex items-center justify-between", className)}>
      {children}
    </header>
  );
}

interface SaasSidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function SaasSidebar({ children, className }: SaasSidebarProps) {
  return (
    <aside className={cn("w-60 bg-card-bg border-r border-neutral/20 min-h-screen", className)}>
      {children}
    </aside>
  );
}

interface SaasMainProps {
  children: React.ReactNode;
  className?: string;
}

export function SaasMain({ children, className }: SaasMainProps) {
  return (
    <main className={cn("flex-1 p-6", className)}>
      {children}
    </main>
  );
}

interface SaasPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SaasPageHeader({ title, subtitle, action, className }: SaasPageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark">{title}</h1>
        {subtitle && <p className="text-lg text-neutral mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface SaasGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SaasGrid({ children, cols = 4, gap = 'md', className }: SaasGridProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
  };

  const gapClasses = {
    sm: "gap-4",
    md: "gap-6", 
    lg: "gap-8"
  };

  return (
    <div className={cn("grid", colClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
}