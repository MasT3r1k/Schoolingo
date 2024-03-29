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


export type FormNote = {
  note: string;
  url?: string;
  func?: Function;
};

export type FormSelect = {
  type: 'select';
  select?: FormSelectTypes;
  options: string[];
  optionAsLocale?: boolean;
  placeholder?: string;
  onSelect?: Function;
}

export type FormInputForm = {
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

export type FormError = {
  input: string;
  locale: string;
};

export type FormButton = {
    label: string;
    executed: string;
    func?: Function;
};
