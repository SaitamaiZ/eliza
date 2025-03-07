import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatAgentName, getDefaultAvatar, getStatusColor } from "@/lib/utils";
import { type AgentStatus } from "@/types/index";

interface AgentAvatarProps {
  name: string;
  status?: AgentStatus;
  avatar?: string;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  className?: string;
}

export function AgentAvatar({
  name,
  status = "offline",
  avatar,
  size = "md",
  showStatus = true,
  className,
}: AgentAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  const statusSizeClasses = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <div className={cn("relative", className)}>
      <Avatar className={cn("border-2 border-white shadow-sm", sizeClasses[size])}>
        <AvatarImage src={avatar || getDefaultAvatar(name)} alt={name} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold">
          {formatAgentName(name)}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-white",
            getStatusColor(status),
            statusSizeClasses[size]
          )}
        />
      )}
    </div>
  );
}
