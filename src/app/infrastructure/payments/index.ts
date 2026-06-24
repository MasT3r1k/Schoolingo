export type PaymentMethodType = 'pay' | 'add_payment';

export interface PaymentMethod {
    value: string;
    allowed_types: PaymentMethodType[];
}

export class Payments {
    private methods: PaymentMethod[] = [
        { value: 'bank', allowed_types: ['pay', 'add_payment'] },
        { value: 'cash', allowed_types: ['pay', 'add_payment'] },
        { value: 'card', allowed_types: ['pay', 'add_payment'] },
        { value: 'account', allowed_types: ['pay'] },
    ];
    public getMethods(type: PaymentMethodType): typeof this.methods {
        return this.methods.filter((method) => method.allowed_types.includes(type));
    }
}