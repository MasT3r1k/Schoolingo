interface selectCompanyAPI {
    status: 'success' | 'updated';
    traineeship: number;
    companyId: number;
    instructor: string | null;
}

interface companyInfoAPI {
    companyId: number;
    name: string;
    addressOffice: number;
    addressTrainee: number;
    ico: string;
    web: string;
    rp_firstName: string;
    rp_lastName: string;
    phone: string;
    email: string;
    status: 'request' | 'approved' | 'deleted';
    rating: string;
    contact: string;
    activity: string;
    description: string;
    equipment: string;
    created: Date;
    requested: Date;
    scopes: { scopeId: number, status: number }[];

    cityName: string;
    code2: string;
    street: string;
    houseNumber: string;
    postcode: string;

}