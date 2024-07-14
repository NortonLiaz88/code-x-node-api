interface ChatModel {
  id: number;
  referenceId: string;
  profileId: number;
  name?: string;
  messages?: MessageModel[];
}