import { UserPermissions } from './User';

export enum messageTypes {
    MESSAGE,
    HOMEWORK,
    EXCUSESTUDENT,
    RATESTUDENT,
    SYSTEM
}

export type MessageType = {
    label: string;
    icon?: string;
    color?: string;
    perms: UserPermissions[];
};
  
export type MessageTag = {
    label: string;
}