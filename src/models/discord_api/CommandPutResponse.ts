export default interface CommandPutResponse {
  id: string;
  application_id: string;
  version: string;
  default_permission: boolean;
  type: number;
  name: string;
  description: string;
  guild_id: string | null;
}
