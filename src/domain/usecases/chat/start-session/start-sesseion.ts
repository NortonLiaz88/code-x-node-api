export interface StartSession {
    startSession(profileId: number, referenceId?: string): Promise<ChatModel>;
}