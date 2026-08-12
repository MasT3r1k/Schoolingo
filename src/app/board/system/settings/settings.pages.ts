import { enumSidebar } from './config';

export interface SettingsField {
    id: string;
    type: 'checkbox' | 'text' | 'number' | 'module_toggle' | 'dropdown' | 'row_select';
    label: string;
    description?: string;
    placeholder?: string;
    note?: string;
    bind?: string;
    moduleName?: string;
    options?: { label: string; value: any }[] | string;
    dropdownSettings?: { locale?: boolean };
}

export interface SettingsGroup {
    title: string;
    description?: string;
    style: 'rows' | 'grid';
    fields: SettingsField[];
}

export interface SettingsPageConfig {
    id: enumSidebar;
    title: string;
    subtitle: string;
    saveAction: string;
    saveLabel: string;
    groups: SettingsGroup[];
}

export const SettingsPages: SettingsPageConfig[] = [
    {
        id: enumSidebar.GDPR_SETTINGS,
        title: 'system.gdpr_settings',
        subtitle: 'Nastavení ochrany osobních údajů a kontaktní osoby.',
        saveAction: 'update_school',
        saveLabel: 'system.save_settings',
        groups: [
            {
                title: 'system.module_features',
                style: 'rows',
                fields: [
                    { id: 'gdpr_mod', type: 'module_toggle', label: 'Povolit GDPR modul', description: 'Aktivuje modul pro správu souhlasů a DPO.', moduleName: 'gdpr' }
                ]
            },
            {
                title: 'Kontaktní osoba (DPO)',
                style: 'grid',
                fields: [
                    { id: 'gdpr_fn', type: 'text', label: 'Jméno', bind: 'gdpr_first_name' },
                    { id: 'gdpr_ln', type: 'text', label: 'Příjmení', bind: 'gdpr_last_name' },
                    { id: 'gdpr_ph', type: 'text', label: 'Telefon', bind: 'gdpr_phone' },
                    { id: 'gdpr_em', type: 'text', label: 'Email', bind: 'gdpr_email' },
                    { id: 'gdpr_mo', type: 'text', label: 'Mobil', bind: 'gdpr_mobile' },
                    { id: 'gdpr_db', type: 'text', label: 'Datová schránka', bind: 'gdpr_databox' },
                    { id: 'gdpr_wb', type: 'text', label: 'Web', bind: 'gdpr_web' }
                ]
            }
        ]
    },
    {
        id: enumSidebar.MODULE_DOCUMENTS,
        title: 'system.documents_settings',
        subtitle: 'Nastavení modulu dokumentů a správy souborů.',
        saveAction: 'update_school',
        saveLabel: 'system.save_settings',
        groups: [
            {
                title: 'system.module_features',
                style: 'rows',
                fields: [
                    { id: 'doc_en', type: 'checkbox', label: 'Povolit modul dokumentů', description: 'Povolení/vypnutí celého modulu Dokumenty.', bind: 'documents_enabled' }
                ]
            }
        ]
    },
    {
        id: enumSidebar.MODULE_TRAINEESHIP,
        title: 'system.traineeship_settings',
        subtitle: 'Nastavení modulu praxí a studentských stáží.',
        saveAction: 'update_school',
        saveLabel: 'system.save_settings',
        groups: [
            {
                title: 'system.module_features',
                style: 'rows',
                fields: [
                    { id: 'tra_en', type: 'checkbox', label: 'Povolit modul praxí', description: 'Povolení/vypnutí celého modulu Praxe.', bind: 'traineeship_enabled' }
                ]
            }
        ]
    },
    {
        id: enumSidebar.MODULE_ONLINE,
        title: 'system.online_settings',
        subtitle: 'Nastavení modulu online výuky.',
        saveAction: 'update_school',
        saveLabel: 'system.save_settings',
        groups: [
            {
                title: 'system.module_features',
                style: 'rows',
                fields: [
                    { id: 'onl_en', type: 'checkbox', label: 'Povolit modul online výuky', description: 'Povolení/vypnutí celého modulu Online Výuka.', bind: 'online_enabled' }
                ]
            }
        ]
    },
    {
        id: enumSidebar.MODULE_NOTICEBOARD,
        title: 'system.noticeboard_settings',
        subtitle: 'Nastavení studentské, učitelské a školní nástěnky.',
        saveAction: 'update_school',
        saveLabel: 'system.save_settings',
        groups: [
            {
                title: 'system.module_features',
                style: 'rows',
                fields: [
                    { id: 'not_stu', type: 'checkbox', label: 'Studentská nástěnka', description: 'Povolení nástěnky určené pro studenty.', bind: 'noticeboard_student_enabled' },
                    { id: 'not_tea', type: 'checkbox', label: 'Učitelská nástěnka', description: 'Povolení nástěnky určené pouze pro učitele.', bind: 'noticeboard_teacher_enabled' }
                ]
            }
        ]
    },
    {
        id: enumSidebar.MODULE_TESTS,
        title: 'system.tests_settings',
        subtitle: 'Nastavení modulu pro testy a zkoušení.',
        saveAction: 'update_school',
        saveLabel: 'system.save_settings',
        groups: [
            {
                title: 'system.module_features',
                style: 'rows',
                fields: [
                    { id: 'test_en', type: 'checkbox', label: 'Povolit modul testů', description: 'Povolení/vypnutí celého modulu Testy.', bind: 'tests_enabled' }
                ]
            }
        ]
    },
    {
        id: enumSidebar.MODULE_REWARDS,
        title: 'system.rewards_settings',
        subtitle: 'Nastavení odměn, pochval a bodování žáků.',
        saveAction: 'update_school',
        saveLabel: 'system.save_settings',
        groups: [
            {
                title: 'system.module_features',
                style: 'rows',
                fields: [
                    { id: 'rew_en', type: 'checkbox', label: 'Povolit modul odměn', description: 'Povolení/vypnutí celého modulu Odměny a pochvaly.', bind: 'rewards_enabled' }
                ]
            }
        ]
    },
    {
        id: enumSidebar.MODULE_EMPLOYEES,
        title: 'system.employees_settings',
        subtitle: 'Správa nastavení pro zaměstnance a učitele.',
        saveAction: 'update_school',
        saveLabel: 'system.save_settings',
        groups: [
            {
                title: 'system.employee_vacation_settings',
                style: 'grid',
                fields: [
                    { id: 'emp_vac_def', type: 'number', label: 'system.employee_vacation_days_default', placeholder: 'např. 25', note: 'Počet dní, který bude automaticky nastaven novým zaměstnancům.', bind: 'employee_vacation_days_default' }
                ]
            },
            {
                title: 'system.module_features',
                style: 'rows',
                fields: [
                    { id: 'emp_vac_req', type: 'checkbox', label: 'system.employee_vacation_requests_enabled', description: 'Povolit žádosti o dovolenou pro zaměstnance.', bind: 'employee_vacation_requests_enabled' },
                    { id: 'emp_att', type: 'checkbox', label: 'system.employee_attendance_enabled', description: 'Povolit sledování docházky zaměstnanců.', bind: 'employee_attendance_enabled' },
                    { id: 'emp_sal', type: 'checkbox', label: 'system.employee_salaries_enabled', description: 'Povolit modul platů pro zaměstnance.', bind: 'employee_salaries_enabled' }
                ]
            }
        ]
    },
    {
        id: enumSidebar.MODULE_LIBRARY,
        title: 'system.library_settings',
        subtitle: 'Nastavení školní knihovny a výpůjček.',
        saveAction: 'update_school',
        saveLabel: 'system.save_settings',
        groups: [
            {
                title: 'system.module_features',
                style: 'rows',
                fields: [
                    { id: 'lib_en', type: 'checkbox', label: 'Povolit modul knihovny', description: 'Povolení/vypnutí celého modulu Knihovna.', bind: 'library_enabled' }
                ]
            },
            {
                title: 'Poplatky a platby',
                style: 'grid',
                fields: [
                    { 
                        id: 'lib_fee_period', type: 'row_select', label: 'Zúčtovací období', bind: 'library_fee_period', 
                        options: [
                            { label: 'Měsíční', value: 'monthly' },
                            { label: 'Pololetní', value: 'half_yearly' },
                            { label: 'Roční', value: 'yearly' }
                        ],
                        dropdownSettings: { locale: false }
                    },
                    { id: 'lib_fee_amount', type: 'number', label: 'Částka za období (Kč)', bind: 'library_fee_amount' },
                    { id: 'lib_late_fee', type: 'number', label: 'Zpozdné za den (Kč)', bind: 'library_late_fee_per_day' },
                    { id: 'lib_damage_fee', type: 'number', label: 'Pokuta za poškození (Kč)', bind: 'library_damage_fee' }
                ]
            }
        ]
    }
];
