import * as React from "react";
import { cn } from "@/lib/utils";

// Composant Sidebar personnalisé avec design moderne
const CustomSidebar = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "flex h-full w-full flex-col bg-zinc-900 text-sidebar-foreground border-r border-zinc-800",
                className
            )}
            data-custom-sidebar="true"
            {...props}
        >
            <div className="flex flex-col h-full overflow-hidden">
                {children}
            </div>
        </div>
    );
});
CustomSidebar.displayName = "CustomSidebar";

export { CustomSidebar };
