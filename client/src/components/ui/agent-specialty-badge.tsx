import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AgentSpecialtyBadgeProps {
  specialty: string;
  className?: string;
}

export function AgentSpecialtyBadge({ specialty, className }: AgentSpecialtyBadgeProps) {
  const specialtyColors: Record<string, string> = {
    juriste: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30",
    généraliste: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800/30",
    enseignant: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30",
    sportif: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800/30",
  };

  const color = specialtyColors[specialty.toLowerCase()] || "bg-primary/10 text-primary border-primary/20";

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border rounded-full px-2 py-0.5 text-xs", 
        color,
        className
      )}
    >
      {specialty}
    </Badge>
  );
}
