// Global (script-scope) interface, used across the codebase without an import.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ChatModel {
  id: number;
  referenceId: string;
  profileId: number;
  name?: string;
  messages?: MessageModel[];
}
