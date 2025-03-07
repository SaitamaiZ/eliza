import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { type AgentSpecialty, type AgentStatus } from "@/types/index";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export const moment = dayjs;

export const formatAgentName = (name: string) => {
    return name.substring(0, 2);
};

export const getStatusColor = (status: AgentStatus) => {
    switch (status) {
        case "online":
            return "bg-green-500";
        case "away":
            return "bg-yellow-500";
        case "offline":
            return "bg-gray-500";
        default:
            return "bg-gray-500";
    }
};

export const getSpecialtyLabel = (specialty: AgentSpecialty) => {
    switch (specialty) {
        case "juriste":
            return "Juriste";
        case "sportif":
            return "Coach sportif";
        case "médecin":
            return "Médecin";
        case "enseignant":
            return "Enseignant";
        case "généraliste":
            return "Assistant généraliste";
        default:
            return specialty;
    }
};

export const getSpecialtyColor = (specialty: AgentSpecialty) => {
    switch (specialty) {
        case "juriste":
            return "bg-blue-100 text-blue-800";
        case "sportif":
            return "bg-green-100 text-green-800";
        case "médecin":
            return "bg-red-100 text-red-800";
        case "enseignant":
            return "bg-purple-100 text-purple-800";
        case "généraliste":
            return "bg-gray-100 text-gray-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export const getDefaultAvatar = (name: string) => {
    return `/agents/${name.toLowerCase()}.png`;
};
