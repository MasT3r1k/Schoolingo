export type FormNote = {
  note: string;
  url?: string;
  func?: Function;
};

export type FormInput = {
  type: string;
  name: string;
  placeholder?: string;
  label?: string;
  check?: Function;
  required?: boolean;
  notes?: FormNote[];
};

export type FormError = {
  input: string;
  locale: string;
};

export type FormButton = {
    label: string;
    executed: string;
    func?: Function;
};
