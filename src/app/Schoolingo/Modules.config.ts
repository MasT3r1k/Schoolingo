import { ModuleConfig, modules } from "./Modules";

export let modulesConfig: Record<modules, ModuleConfig> = {
    "traineeship": {
        name: "sidebar/traineeship/main"
    },
    "library": {
        name: "sidebar/library/main"
    },
    "canteen": {
        name: "sidebar/canteen/main"
    },
    "payments": {
        name: "sidebar/payments/main"
    },
    "fleetVehicles": {
        name: "sidebar/fleetVehicles/main"
    },
    "discord": {
        name: ""
    },
    "trips": {
        name: ""
    },
    "documents": {
        name: ""
    }
};