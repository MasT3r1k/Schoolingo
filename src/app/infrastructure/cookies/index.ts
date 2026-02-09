export interface CookiePreference {
  category: string;
  enabled: boolean;
  required: boolean;
}

export interface CookieInfo {
  name: string;
  category: string;
  purpose: string;
  duration: string;
  provider: string;
}

export class Cookies {
      // Cookie categories
  public cookieCategories = [
    {
      id: 'essential',
      name: 'Nezbytné cookies',
      icon: 'lock',
      color: '#22c55e',
      description: 'Tyto cookies jsou nezbytné pro fungování webu. Bez nich by stránka nemohla správně fungovat.',
      required: true,
      examples: [
        'Přihlášení a autentizace',
        'Bezpečnostní tokeny',
        'Předvolby jazyka'
      ]
    },
    {
      id: 'functional',
      name: 'Funkční cookies',
      icon: 'adjustments',
      color: '#6366f1',
      description: 'Umožňují zapamatovat si vaše preference a poskytují vylepšené funkce.',
      required: false,
      examples: [
        'Nastavení zobrazení',
        'Historie procházení',
        'Personalizované funkce'
      ]
    },
    {
      id: 'analytics',
      name: 'Analytické cookies',
      icon: 'chart-pie',
      color: '#8b5cf6',
      description: 'Pomáhají nám pochopit, jak uživatelé používají naše stránky, abychom je mohli zlepšovat.',
      required: false,
      examples: [
        'Počet návštěv stránek',
        'Doba strávená na webu',
        'Výkon stránek'
      ]
    }
  ];

  // Detailed cookie information
  public cookiesList: CookieInfo[] = [
    // Essential
    { name: 'session_id', category: 'essential', purpose: 'Identifikace přihlášeného uživatele', duration: 'Session', provider: 'Schoolingo' },
    { name: 'csrf_token', category: 'essential', purpose: 'Ochrana proti CSRF útokům', duration: 'Session', provider: 'Schoolingo' },
    { name: 'auth_token', category: 'essential', purpose: 'Dlouhodobé přihlášení', duration: '30 dní', provider: 'Schoolingo' },
    { name: 'locale', category: 'essential', purpose: 'Ukládání preferovaného jazyka', duration: '1 rok', provider: 'Schoolingo' },
    
    // Functional
    { name: 'theme', category: 'functional', purpose: 'Uložení preferovaného vzhledu', duration: '1 rok', provider: 'Schoolingo' },
    { name: 'sidebar_state', category: 'functional', purpose: 'Stav postranního panelu', duration: '1 rok', provider: 'Schoolingo' },
    { name: 'recent_items', category: 'functional', purpose: 'Nedávno navštívené položky', duration: '30 dní', provider: 'Schoolingo' },
    
    // Analytics
    { name: '_ga', category: 'analytics', purpose: 'Google Analytics - rozlišení uživatelů', duration: '2 roky', provider: 'Google' },
    { name: '_gid', category: 'analytics', purpose: 'Google Analytics - rozlišení uživatelů', duration: '24 hodin', provider: 'Google' },
    { name: '_gat', category: 'analytics', purpose: 'Google Analytics - omezení rychlosti požadavků', duration: '1 minuta', provider: 'Google' },
    
    // Marketing
    { name: '_fbp', category: 'marketing', purpose: 'Facebook Pixel - sledování konverzí', duration: '3 měsíce', provider: 'Facebook' },
    { name: 'fr', category: 'marketing', purpose: 'Facebook - reklamní účely', duration: '3 měsíce', provider: 'Facebook' }
  ];
}