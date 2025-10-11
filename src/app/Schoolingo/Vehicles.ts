import { manufacturers, yearMap } from "./Vehicles.config";

export namespace Vehicle {
    export function getVehicleInfo(vin: string) {
        if (vin.length != 17) {
            return {};
        }

        console.log(vin.slice(0, 3))

        let manufacturer: string = manufacturers[vin.slice(0, 3)];
        if (!manufacturer) {
            manufacturer = manufacturers[vin.slice(0, 2)];
        }
        if (!manufacturer) {
            manufacturer = 'Unknown';
        }

        let modelYear = yearMap[vin.charAt(9)];

        /* USA get information */
        // https://vpic.nhtsa.dot.gov/api/
        // https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVINValuesBatch/
        // Example American VIN: JT2AE09W4P0038539
        // https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/<VIN>?format=json
        // <VIN> is VIN


        return { manufacturer, modelYear };
    }
}