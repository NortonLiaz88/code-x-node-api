interface MessageModel {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    tooltip?: string[];
    createdAt: Date;
}