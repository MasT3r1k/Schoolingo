import { UserPermissions } from './User';

export interface MessageType {
    label: string;
    icon?: string;
    color?: string;
    perms: UserPermissions[];
};
  
export interface MessageTag {
    label: string;
}

export type MessageOptions = 'asPrincipal' | 'requireConfirmation' | 'copyToClassTeacher' | 'copyToParents';