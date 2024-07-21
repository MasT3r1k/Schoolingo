type InputType = 
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';

type FormSelectTypes = 'row' | 'column' | 'search';


export interface FormNote {
  note: string;
  url?: string;
  func?: Function;
};

export interface FormSelect {
  type: 'select';
  select?: FormSelectTypes;
  options: string[];
  optionAsLocale?: boolean;
  placeholder?: string;
  onSelect?: Function;
}

export interface FormInputForm {
  type: InputType;
  placeholder?: string;
  check?: Function;
  required?: boolean;
  readonly?: boolean;
};

export type FormInput = (FormSelect | FormInputForm) & {
  name: string;
  label: string;
  notes?: FormNote[];
  value?: Function | string; // Support dynamic and static value
}; 

export interface FormError {
  input: string;
  locale: string;
};

export interface FormButton {
    label: string;
    executed: string;
    func?: Function;
};
