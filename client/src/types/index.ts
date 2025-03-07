// Update the IAttachment interface
export interface IAttachment {
    url: string;
    contentType?: string; // Make contentType optional
    title: string;
}

// Agent status types
export type AgentStatus = 'online' | 'offline' | 'away';

// Agent profession/specialty
export type AgentSpecialty = 'juriste' | 'sportif' | 'médecin' | 'enseignant' | 'généraliste' | string;

// Extended agent interface
export interface Agent {
    id: string;
    name: string;
    status?: AgentStatus;
    specialty?: AgentSpecialty;
    lastSeen?: string;
    avatar?: string;
}
