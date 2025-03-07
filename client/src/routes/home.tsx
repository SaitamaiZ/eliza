import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { NavLink } from "react-router";
import type { UUID } from "@elizaos/core";
import { getDefaultAvatar, moment } from "@/lib/utils";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { AgentSpecialtyBadge } from "@/components/ui/agent-specialty-badge";
import { type Agent } from "@/types/index";

// Mock data for agent specialties and statuses
// In a real app, this would come from the API
const mockAgentData: Record<string, Partial<Agent>> = {
    "Jeanne": {
        status: "online",
        specialty: "juriste",
        lastSeen: new Date().toISOString(),
    },
    "Jean": {
        status: "online",
        specialty: "juriste",
        lastSeen: new Date().toISOString(),
    },
    "C3PO": {
        status: "away",
        specialty: "généraliste",
        lastSeen: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
    "Dobby": {
        status: "online",
        specialty: "enseignant",
        lastSeen: new Date().toISOString(),
    },
    "Trump": {
        status: "offline",
        specialty: "sportif",
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
};

export default function Home() {
    const query = useQuery({
        queryKey: ["agents"],
        queryFn: () => apiClient.getAgents(),
        refetchInterval: 5_000
    });

    const agents = query?.data?.agents;

    // Enhance agent data with mock data
    const enhancedAgents = agents?.map((agent: { id: UUID; name: string }) => {
        const mockData = mockAgentData[agent.name] || {};
        return {
            ...agent,
            ...mockData,
            avatar: getDefaultAvatar(agent.name),
        };
    });

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 bg-[#f0f2f5] dark:bg-zinc-900">
            <div className="max-w-3xl w-full text-center mb-12">
                <div className="mb-8">
                    <div className="flex justify-center mb-6">
                        <div className="size-32 rounded-full bg-primary/10 flex items-center justify-center">
                            <img
                                alt="harmonia-logo"
                                src="/elizaos-icon.png"
                                width="100%"
                                height="100%"
                                className="size-20"
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Bienvenue sur Harmonia</h1>
                    <p className="text-xl text-muted-foreground">
                        Votre plateforme de conversation avec des agents IA spécialisés
                    </p>
                </div>
                
                <Card className="p-6 mb-8 text-center border-0 shadow-lg">
                    <CardContent className="pt-6">
                        <h2 className="text-2xl font-semibold mb-6">Commencez une conversation</h2>
                        
                        <div className="space-y-3 mt-8">
                            {enhancedAgents?.map((agent: Agent) => (
                                <NavLink
                                    key={agent.id}
                                    to={`/chat/${agent.id}`}
                                    className="w-full"
                                >
                                    <div className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors duration-200 border">
                                        <AgentAvatar 
                                            name={agent.name} 
                                            status={agent.status}
                                            avatar={agent.avatar}
                                            size="lg"
                                        />
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-bold text-lg">{agent.name}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                {agent.specialty && (
                                                    <AgentSpecialtyBadge 
                                                        specialty={agent.specialty}
                                                    />
                                                )}
                                                <span className="text-sm text-muted-foreground">
                                                    {agent.status === "online" 
                                                        ? "En ligne" 
                                                        : agent.lastSeen 
                                                            ? `Vu ${moment(agent.lastSeen).fromNow()}` 
                                                            : "Hors ligne"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-auto">
                                            <MessageCircle className="h-6 w-6 text-primary/70" />
                                        </div>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
