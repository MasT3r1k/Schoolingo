import { UserRoles } from './Permissions';

export interface SidebarItem {
    item: string;
    url?: string;
    icon?: string;
    permission?: UserRoles[];
    children?: SidebarItem[];
}

export interface SidebarGroup {
    label: string;
    permission?: UserRoles[];
    items: SidebarItem[];
}
