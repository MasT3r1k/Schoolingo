import { UserPermissions } from './User';

export type MessageType = {
    label: string;
    icon?: string;
    color?: string;
    perms: UserPermissions[];
};
  
export type MessageTag = {
    label: string;
}