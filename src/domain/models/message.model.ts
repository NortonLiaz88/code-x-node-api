// Global (script-scope) interface, used across the codebase without an import.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface MessageModel {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tooltip?: string[];
  createdAt: Date;
}
