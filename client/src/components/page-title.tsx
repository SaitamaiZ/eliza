import { cn } from "@/lib/utils";

export default function PageTitle({
    title,
    subtitle,
    className,
}: {
    title: string;
    subtitle?: string;
    className?: string;
}) {
    return (
        <div className="space-y-0.5">
            <h2 className={cn("text-2xl font-bold tracking-tight", className)}>{title}</h2>
            {subtitle ? (
                <p className="text-muted-foreground">{subtitle}</p>
            ) : null}
        </div>
    );
}
