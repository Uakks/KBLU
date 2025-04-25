export interface Message {
    id: number;
    chat: string;
    sender: string;
    content: string;
    timestamp: string;
    read: boolean;
}