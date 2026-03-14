export enum enumSidebar {
  SYSTEM,
  LOGIN,
  LDAP,
  MAIN,
  EMAIL,
  FILES,
  SCOPES,
  SUBJECTS,
  GDPR_SETTINGS,

  // Modules
  MODULE_MESSAGES,
  MODULE_EMPLOYEES,
  MODULE_ROLES,
  MODULE_DOCUMENTS,
  MODULE_TRAINEESHIP,
  MODULE_ONLINE,
  MODULE_NOTICEBOARD,
  MODULE_TESTS,
  MODULE_REWARDS
}

export const Sidebar = {
    "system.section_main": [
        {
            item: "system.system_settings",
            id: enumSidebar.SYSTEM,
            icon: "settings"
        },
        {
            item: "system.login_settings",
            id: enumSidebar.LOGIN,
            icon: "key"
        },
        {
            item: "system.ldap_settings",
            id: enumSidebar.LDAP,
            icon: "server"
        },
        {
            item: "system.school_settings",
            id: enumSidebar.MAIN,
            icon: "school"
        },
        {
            item: "system.email_settings",
            id: enumSidebar.EMAIL,
            icon: "mail"
        },
        {
            item: "system.files_settings",
            id: enumSidebar.FILES,
            icon: "files"
        },
        {
            item: "system.list_scopes",
            id: enumSidebar.SCOPES,
            icon: "list"
        },
        {
            item: "system.list_subjects",
            id: enumSidebar.SUBJECTS,
            icon: "book"
        },
        {
            item: "system.gdpr_settings",
            id: enumSidebar.GDPR_SETTINGS,
            icon: "shield-check"
        }
    ],
    "system.section_modules": [
        {
            item: "system.messages_settings",
            id: enumSidebar.MODULE_MESSAGES,
            icon: "messages"
        },
        {
            item: "system.employees_settings",
            id: enumSidebar.MODULE_EMPLOYEES,
            icon: "users"
        },
        {
            item: "system.roles_settings",
            id: enumSidebar.MODULE_ROLES,
            icon: "license"
        },
        {
            item: "system.documents_settings",
            id: enumSidebar.MODULE_DOCUMENTS,
            icon: "file-text"
        },
        {
            item: "system.traineeship_settings",
            id: enumSidebar.MODULE_TRAINEESHIP,
            icon: "briefcase"
        },
        {
            item: "system.online_settings",
            id: enumSidebar.MODULE_ONLINE,
            icon: "video"
        },
        {
            item: "system.noticeboard_settings",
            id: enumSidebar.MODULE_NOTICEBOARD,
            icon: "chalkboard"
        },
        {
            item: "system.tests_settings",
            id: enumSidebar.MODULE_TESTS,
            icon: "file-check"
        },
        {
            item: "system.rewards_settings",
            id: enumSidebar.MODULE_REWARDS,
            icon: "award"
        }
    ]
}