import { BehaviorSubject } from 'rxjs';
import { permType, UserRoles } from './Permissions';
import { modules } from './Modules';

export interface SidebarItem {
    item: string;
    url?: string;
    permission?: permType[];
    children?: SidebarItem[];
    badge?: any;
    modules?: modules[];
}

export interface SidebarGroup {
    label: string;
    permission?: permType[];
    modules?: modules[];
    items: SidebarItem[];
}
