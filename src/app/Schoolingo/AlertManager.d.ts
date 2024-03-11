export type Alert = {
    name: string;
    text: string;
    buttons?: AlertButton[];
}

export type AlertButton = {
    text: string;
    func?: Function
}