import { Button } from "@/components/ui/button";
import {
    ChatBubble,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { useTransition, animated, type AnimatedProps } from "@react-spring/web";
import { ArrowLeft, Info, Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Content, UUID } from "@elizaos/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { cn, getDefaultAvatar, moment } from "@/lib/utils";
import CopyButton from "./copy-button";
import ChatTtsButton from "./ui/chat/chat-tts-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import AIWriter from "react-aiwriter";
import type { IAttachment } from "@/types";
import { AudioRecorder } from "./audio-recorder";
import { Badge } from "./ui/badge";
import { useAutoScroll } from "./ui/chat/hooks/useAutoScroll";
import { AgentAvatar } from "./ui/agent-avatar";
import { AgentSpecialtyBadge } from "./ui/agent-specialty-badge";
import { NavLink } from "react-router";
import { type Agent } from "@/types/index";

type ExtraContentFields = {
    user: string;
    createdAt: number;
    isLoading?: boolean;
};

type ContentWithUser = Content & ExtraContentFields;

type AnimatedDivProps = AnimatedProps<{ style: React.CSSProperties }> & {
    children?: React.ReactNode;
};

export default function Page({ agentId }: { agentId: UUID }) {
    const { toast } = useToast();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const queryClient = useQueryClient();

    const getMessageVariant = (role: string) =>
        role !== "user" ? "received" : "sent";

    const { scrollRef, isAtBottom, scrollToBottom, disableAutoScroll } = useAutoScroll({
        smooth: true,
    });
   
    useEffect(() => {
        scrollToBottom();
    }, [queryClient.getQueryData(["messages", agentId])]);

    useEffect(() => {
        scrollToBottom();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (e.nativeEvent.isComposing) return;
            handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input) return;

        const attachments: IAttachment[] | undefined = selectedFile
            ? [
                  {
                      url: URL.createObjectURL(selectedFile),
                      contentType: selectedFile.type,
                      title: selectedFile.name,
                  },
              ]
            : undefined;

        const newMessages = [
            {
                text: input,
                user: "user",
                createdAt: Date.now(),
                attachments,
            },
            {
                text: input,
                user: "system",
                isLoading: true,
                createdAt: Date.now(),
            },
        ];

        queryClient.setQueryData(
            ["messages", agentId],
            (old: ContentWithUser[] = []) => [...old, ...newMessages]
        );

        sendMessageMutation.mutate({
            message: input,
            selectedFile: selectedFile ? selectedFile : null,
        });

        setSelectedFile(null);
        setInput("");
        formRef.current?.reset();
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const sendMessageMutation = useMutation({
        mutationKey: ["send_message", agentId],
        mutationFn: ({
            message,
            selectedFile,
        }: {
            message: string;
            selectedFile?: File | null;
        }) => apiClient.sendMessage(agentId, message, selectedFile),
        onSuccess: (newMessages: ContentWithUser[]) => {
            queryClient.setQueryData(
                ["messages", agentId],
                (old: ContentWithUser[] = []) => [
                    ...old.filter((msg) => !msg.isLoading),
                    ...newMessages.map((msg) => ({
                        ...msg,
                        createdAt: Date.now(),
                    })),
                ]
            );
        },
        onError: (e) => {
            toast({
                variant: "destructive",
                title: "Unable to send message",
                description: e.message,
            });
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file?.type.startsWith("image/")) {
            setSelectedFile(file);
        }
    };

    const messages =
        queryClient.getQueryData<ContentWithUser[]>(["messages", agentId]) ||
        [];

    const transitions = useTransition(messages, {
        keys: (message) =>
            `${message.createdAt}-${message.user}-${message.text}`,
        from: { opacity: 0, transform: "translateY(50px)" },
        enter: { opacity: 1, transform: "translateY(0px)" },
        leave: { opacity: 0, transform: "translateY(10px)" },
    });

    const CustomAnimatedDiv = animated.div as React.FC<AnimatedDivProps>;

    // Mock data for agent details
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

    // Get agent details
    const { data: agentData } = useQuery({
        queryKey: ["agent", agentId],
        queryFn: () => apiClient.getAgent(agentId),
    });

    const agentName = agentData?.character?.name || "";
    const mockData = mockAgentData[agentName] || {};
    
    const agent: Agent = {
        id: agentId,
        name: agentName,
        status: mockData.status || "offline",
        specialty: mockData.specialty,
        lastSeen: mockData.lastSeen,
        avatar: getDefaultAvatar(agentName),
    };

    return (
        <div className="flex flex-col w-full h-[calc(100dvh)]">
            {/* Chat header - WhatsApp style */}
            <div className="flex items-center gap-3 p-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10 shadow-sm">
                <NavLink to="/">
                    <Button variant="ghost" size="icon" className="mr-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </NavLink>
                
                <AgentAvatar 
                    name={agent.name} 
                    status={agent.status} 
                    avatar={agent.avatar}
                    size="lg"
                />
                
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <span className="font-bold truncate text-lg">
                            {agent.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "size-2 rounded-full",
                            agent.status === "online" ? "bg-green-500" : 
                            agent.status === "away" ? "bg-yellow-500" : "bg-gray-500"
                        )} />
                        <span className="text-sm text-muted-foreground">
                            {agent.status === "online" 
                                ? "En ligne" 
                                : agent.lastSeen 
                                    ? `Vu ${moment(agent.lastSeen).fromNow()}` 
                                    : "Hors ligne"}
                        </span>
                        {agent.specialty && (
                            <AgentSpecialtyBadge 
                                specialty={agent.specialty} 
                                className="text-xs px-2 py-0.5 ml-1"
                            />
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Info className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Informations sur l'agent</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            
            {/* Chat messages area - WhatsApp style with subtle pattern */}
            <div className="flex-1 overflow-y-auto p-4 bg-muted/10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDJhOTggOTggMCAwMTk4IDk4YzAgNTQuMTMtNDMuODcgOTgtOTggOThTMiAxNTQuMTMgMiAxMDBBOTggOTggMCAwMTEwMCAyeiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEwMCwxMDAsMTAwLDAuMDUpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvc3ZnPg==')]">
                <ChatMessageList 
                    scrollRef={scrollRef}
                    isAtBottom={isAtBottom}
                    scrollToBottom={scrollToBottom}
                    disableAutoScroll={disableAutoScroll}
                >
                    {transitions((style, message: ContentWithUser) => {
                        const variant = getMessageVariant(message?.user);
                        return (
                            <CustomAnimatedDiv
                                style={{
                                    ...style,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                    padding: "1rem",
                                }}
                            >
                                <ChatBubble
                                    variant={variant}
                                    className="flex flex-row items-start gap-2"
                                >
                                    {message?.user !== "user" ? (
                                        <AgentAvatar 
                                            name={agent.name} 
                                            status={agent.status}
                                            avatar={agent.avatar}
                                            size="sm"
                                            showStatus={false}
                                        />
                                    ) : null}
                                    <div className="flex flex-col">
                                        <ChatBubbleMessage
                                            isLoading={message?.isLoading}
                                        >
                                            {message?.user !== "user" ? (
                                                <AIWriter>
                                                    {message?.text}
                                                </AIWriter>
                                            ) : (
                                                message?.text
                                            )}
                                            {/* Attachments */}
                                            <div>
                                                {message?.attachments?.map(
                                                    (attachment: IAttachment) => (
                                                        <div
                                                            className="flex flex-col gap-1 mt-2"
                                                            key={`${attachment.url}-${attachment.title}`}
                                                        >
                                                            <img
                                                                alt="attachment"
                                                                src={attachment.url}
                                                                width="100%"
                                                                height="100%"
                                                                className="w-64 rounded-md"
                                                            />
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span />
                                                                <span />
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </ChatBubbleMessage>
                                        <div className="flex items-center gap-4 justify-between w-full mt-1">
                                            {message?.text &&
                                            !message?.isLoading ? (
                                                <div className="flex items-center gap-1">
                                                    <CopyButton
                                                        text={message?.text}
                                                    />
                                                    <ChatTtsButton
                                                        agentId={agentId}
                                                        text={message?.text}
                                                    />
                                                </div>
                                            ) : null}
                                            <div
                                                className={cn([
                                                    message?.isLoading
                                                        ? "mt-2"
                                                        : "",
                                                    "flex items-center justify-between gap-4 select-none",
                                                ])}
                                            >
                                                {message?.source ? (
                                                    <Badge variant="outline">
                                                        {message.source}
                                                    </Badge>
                                                ) : null}
                                                {message?.action ? (
                                                    <Badge variant="outline">
                                                        {message.action}
                                                    </Badge>
                                                ) : null}
                                                {message?.createdAt ? (
                                                    <ChatBubbleTimestamp
                                                        timestamp={moment(
                                                            message?.createdAt
                                                        ).format("LT")}
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </ChatBubble>
                            </CustomAnimatedDiv>
                        );
                    })}
                </ChatMessageList>
            </div>
            {/* Chat input area - WhatsApp style */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900 shadow-sm">
                <form
                    ref={formRef}
                    onSubmit={handleSendMessage}
                    className="relative rounded-full border border-zinc-700 bg-zinc-800 flex items-center shadow-sm"
                >
                    {selectedFile ? (
                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-card rounded-lg border shadow-sm">
                            <div className="relative rounded-md p-1">
                                <Button
                                    onClick={() => setSelectedFile(null)}
                                    className="absolute -right-2 -top-2 size-[22px] ring-2 ring-background"
                                    variant="outline"
                                    size="icon"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                                <img
                                    alt="Selected file"
                                    src={URL.createObjectURL(selectedFile)}
                                    height="100%"
                                    width="100%"
                                    className="aspect-square object-contain w-16 rounded-md"
                                />
                            </div>
                        </div>
                    ) : null}
                    
                    <div className="flex items-center pl-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full h-10 w-10 hover:bg-muted/50"
                                        onClick={() => {
                                            if (fileInputRef.current) {
                                                fileInputRef.current.click();
                                            }
                                        }}
                                    >
                                        <Paperclip className="size-5 text-muted-foreground" />
                                        <span className="sr-only">
                                            Joindre un fichier
                                        </span>
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Joindre un fichier</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    
                    <div className="flex-1 px-2">
                        <ChatInput
                            ref={inputRef}
                            onKeyDown={handleKeyDown}
                            value={input}
                            onChange={({ target }) => setInput(target.value)}
                            placeholder="Écrivez un message..."
                            className="min-h-12 resize-none bg-transparent border-0 p-3 shadow-none focus-visible:ring-0 text-white placeholder:text-zinc-500"
                        />
                    </div>
                    
                    <div className="pr-2">
                        {input ? (
                            <Button
                                disabled={sendMessageMutation?.isPending}
                                type="submit"
                                size="icon"
                                className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
                            >
                                {sendMessageMutation?.isPending ? (
                                    <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="size-5" />
                                )}
                            </Button>
                        ) : (
                            <AudioRecorder
                                agentId={agentId}
                                onChange={(newInput: string) => setInput(newInput)}
                            />
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
