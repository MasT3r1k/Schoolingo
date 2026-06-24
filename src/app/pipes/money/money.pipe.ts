import { inject, Pipe, PipeTransform } from '@angular/core';
import { Locale } from '@Schoolingo/locale';

@Pipe({
  name: 'money',
  standalone: true
})
export class MoneyPipe implements PipeTransform {
  private locale = inject(Locale);

  transform(value: number | string | null | undefined): string {
    if (value == null || isNaN(Number(value))) {
      return '';
    }

    const numericValue = Number(value);
    const currencyCode = 'CZK';
    const locale = this.locale.getLanguage(this.locale.getSelectedLanguage().getValue())?.iso ?? 'cs';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0
    }).format(numericValue);
  }
}