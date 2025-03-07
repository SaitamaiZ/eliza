import { useQuery } from "@tanstack/react-query";
import info from "@/lib/info.json";
import {
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { CustomSidebar } from "@/components/ui/custom-sidebar";
import { apiClient } from "@/lib/api";
import { NavLink, useLocation } from "react-router";
import type { UUID } from "@elizaos/core";
import { Cog, Search } from "lucide-react";
import ConnectionStatus from "./connection-status";
import { AgentAvatar } from "./ui/agent-avatar";
import { AgentSpecialtyBadge } from "./ui/agent-specialty-badge";
import { Input } from "./ui/input";
import { useState } from "react";
import { cn, moment } from "@/lib/utils";
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

export function AppSidebar() {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    
    const query = useQuery({
        queryKey: ["agents"],
        queryFn: () => apiClient.getAgents(),
        refetchInterval: 5_000,
    });

    const agents = query?.data?.agents;

    // Filter agents based on search query
    const filteredAgents = agents?.filter((agent: { name: string }) => 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Enhance agent data with mock data
    const enhancedAgents = filteredAgents?.map((agent: { id: UUID; name: string }) => {
        const mockData = mockAgentData[agent.name] || {};
        return {
            ...agent,
            ...mockData,
        };
    });

    return (
        <CustomSidebar className="h-full">
            <NavLink to="/" className="block">
                <div className="p-4 border-b border-zinc-800 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center justify-center size-8 rounded-full bg-zinc-800">
                        <img
                            alt="harmonia-logo"
                            src="/elizaos-icon.png"
                            width="100%"
                            height="100%"
                            className="size-5"
                        />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                        <span className="font-bold text-base text-white">
                            Harmonia
                        </span>
                        <span className="text-[10px] text-zinc-400">
                            v{info?.version}
                        </span>
                    </div>
                </div>
            </NavLink>
            
            <div className="px-4 py-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        type="text"
                        placeholder="Rechercher un agent..."
                        className="pl-9 h-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 py-3">
                <div className="mb-2 px-2">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Agents</h3>
                </div>
                {query?.isPending ? (
                    <div className="space-y-2 px-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-md">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse"></div>
                                    <div className="h-3 w-16 bg-zinc-800 rounded mt-1 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {enhancedAgents?.map((agent: Agent) => (
                            <NavLink
                                key={agent.id}
                                to={`/chat/${agent.id}`}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 p-2 rounded-md transition-colors",
                                    isActive 
                                        ? "bg-zinc-800 text-white" 
                                        : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                                )}
                            >
                                <AgentAvatar 
                                    name={agent.name} 
                                    status={agent.status}
                                    avatar={agent.avatar}
                                    size="sm"
                                />
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center">
                                        <span className="font-medium truncate text-sm">
                                            {agent.name}
                                        </span>
                                    </div>
                                    {agent.specialty && (
                                        <div className="flex items-center mt-0.5">
                                            <span className="text-[9px] text-zinc-400 font-medium">
                                                {agent.specialty}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-auto border-t border-zinc-800 p-3">
                <div className="flex items-center justify-between">
                    <button className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm rounded-md py-1.5 px-2 hover:bg-zinc-800 transition-colors">
                        <Cog className="h-4 w-4" /> 
                        <span>Paramètres</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <span className="text-xs text-zinc-400">Connected</span>
                    </div>
                </div>
            </div>
        </CustomSidebar>
    );
}
