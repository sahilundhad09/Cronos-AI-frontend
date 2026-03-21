import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            // Reset radix defaults
            "inline-flex items-center justify-start",
            // Layout: horizontal scroll on small screens, no wrap
            "w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
            // No background — let the parent provide the border-b context
            "bg-transparent p-0 gap-0",
            // Height
            "h-11",
            className
        )}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            // Base layout
            "relative inline-flex items-center justify-center gap-1.5 flex-shrink-0",
            // Sizing & spacing
            "h-10 sm:h-11 px-0 mr-4 sm:mr-6 last:mr-0",
            // Typography
            "text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
            // Colors — inactive
            "text-slate-500 bg-transparent",
            // Colors — active
            "data-[state=active]:text-white data-[state=active]:bg-transparent",
            // Hover
            "hover:text-slate-300 transition-colors duration-150",
            // Animated underline via after pseudo-element
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]",
            "after:rounded-t-full after:bg-cyan-400",
            "after:scale-x-0 data-[state=active]:after:scale-x-100",
            "after:transition-transform after:duration-200 after:ease-out",
            // No border radius on the trigger itself
            "rounded-none",
            // Focus ring
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-0",
            // Disabled
            "disabled:pointer-events-none disabled:opacity-30",
            className
        )}
        {...props}
    />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            // Always hide inactive content panels, regardless of consumer display classes
            "data-[state=inactive]:hidden",
            // Remove default mt-2 override — consumers control spacing
            "mt-0",
            // Focus ring
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-0",
            className
        )}
        {...props}
    />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }