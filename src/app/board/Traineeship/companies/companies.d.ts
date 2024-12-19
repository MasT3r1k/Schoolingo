interface selectCompanyAPI {
    status: 'success' | 'updated';
    traineeship: number;
    company: number;
    instructor: number | null;
}

interface companyInfoAPI {
    companyId: number;
    name: string;
    addressOffice: number;
    addressTrainee: number;
    CIN: string;
    web: string;
    responsiblePerson: number;
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