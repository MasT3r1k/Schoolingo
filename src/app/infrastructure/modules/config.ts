import { ModuleConfig, modules } from "./index";

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
    }
};