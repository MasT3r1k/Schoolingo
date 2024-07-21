import { permType, UserRoles } from './Permissions';

export interface SidebarItem {
    item: string;
    url?: string;
    permission?: permType[];
    children?: SidebarItem[];
    modules?: string[];
}

export interface SidebarGroup {
    label: string;
    permission?: permType[];
    modules?: string[];
    items: SidebarItem[];
}
