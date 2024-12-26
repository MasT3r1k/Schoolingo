import { UserPermissions } from './User';

export enum messageTypes {
    MESSAGE,
    HOMEWORK,
    EXCUSESTUDENT,
    RATESTUDENT,
    SYSTEM
}

export interface MessageType {
    label: string;
    icon?: string;
    color?: string;
    perms: UserPermissions[];
};
  
export interface MessageTag {
    label: string;
}