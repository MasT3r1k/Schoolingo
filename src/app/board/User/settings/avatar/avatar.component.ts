import { KeyValuePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { Cookies } from '@Schoolingo/cookies';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { createAvatar } from '@dicebear/core';
import { adventurer, avataaars, bottts, lorelei, openPeeps, pixelArt, thumbs } from '@dicebear/collection';

@Component({
  selector: 'settings-avatar',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, IconsModule, KeyValuePipe],
  templateUrl: './avatar.component.html',
  styleUrls: ['../settings.component.css', './avatar.component.css']
})
export class AvatarComponent implements OnInit {
  public l = inject(Locale);
  public u = inject(Authentication);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private cookies = inject(Cookies);
  public JSON = JSON;

  public historyLimit = 10;


  public allowedStyles = Config.ALLOWED_AVATAR_STYLES;
  public collections: any = {
    adventurer,
    avataaars,
    bottts,
    lorelei,
    'open-peeps': openPeeps,
    'pixel-art': pixelArt,
    thumbs
  };

  public currentAvatar: any;
  public previewDataUri: string = '';
  public savingValue = false;
  public errorValue = false;
  public isRotating = false;
  public isPickingColor = false;
  public activeColorPicker: string | null = null;
  public hsv = { h: 0, s: 100, v: 100 };

  @ViewChild('rotationDial') rotationDial!: ElementRef;
  @ViewChild('colorArea') colorArea!: ElementRef;

  public avatarHistory: { config: any, preview: string }[] = [];
  public randomAvatars: { config: any, preview: string }[] = [];

  get saving() { return this.savingValue; }
  set saving(v) { this.savingValue = v; }
  get error() { return this.errorValue; }
  set error(v) { this.errorValue = v; }

  public startColorPick(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.isPickingColor = true;
    this.handleColorPick(event);
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  public handleColorPick(event: MouseEvent | TouchEvent): void {
    if (!this.isPickingColor || !this.colorArea) return;

    const area = this.colorArea.nativeElement;
    const rect = area.getBoundingClientRect();
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;

    // Clamp values
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    this.hsv.s = Math.round(x * 100);
    this.hsv.v = Math.round((1 - y) * 100);
    this.updateHSV();
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  public stopColorPick(): void {
    this.isPickingColor = false;
  }

  public getHueColor(): string {
    return this.hsvToHex(this.hsv.h, 100, 100);
  }

  public styleSchemas: Record<string, any> = {
    thumbs: {
      eyes: ['variant1', 'variant2', 'variant3', 'variant4', 'variant5', 'variant6', 'variant7', 'variant8', 'variant9'],
      eyesColor: ['000000', '3c2005', '243c5a', '22c55e', 'ef4444', 'eab308', 'ffffff'],
      face: ['variant1', 'variant2', 'variant3', 'variant4', 'variant5'],
      mouth: ['variant1', 'variant2', 'variant3', 'variant4', 'variant5'],
      mouthColor: ['000000', 'ef4444', 'f472b6', 'ffffff'],
      shapeColor: ['f0d5be', 'd8b08d', 'c68642', '8d5524', 'f3cfbb'],
      backgroundColor: ['0a5b83', '1c799f', '69d2e7', 'f1f4dc', 'f88c49', 'transparent']
    }
  };

  public commonOptions = {
    rotate: [0, 45, 90, 135, 180, 225, 270, 315]
  };

  public styleDefaults: Record<string, any> = {
    thumbs: {
      eyes: 'variant1W10',
      eyesColor: '000000',
      face: 'variant1',
      faceOffsetX: 0,
      mouth: 'variant1',
      mouthColor: '000000',
      shapeColor: 'f0d5be',
      backgroundColor: 'transparent'
    }
  };

  ngOnInit(): void {
    const user = this.u.getUser();

    // Load history limit
    if (this.cookies.getCategoryPreference('functional')?.enabled) {
      const savedLimit = localStorage.getItem('avatar_history_limit');
      if (savedLimit) this.historyLimit = parseInt(savedLimit);
    }

    const defaults = { 
      type: 'thumbs', 
      radius: 50,
      seed: user.full_name || user.username
    };

    // Load draft from localStorage if enabled
    let draft = null;
    if (this.cookies.getCategoryPreference('functional')?.enabled) {
      const savedDraft = localStorage.getItem('avatar_draft');
      if (savedDraft) {
        try {
          draft = JSON.parse(savedDraft);
        } catch(e) {}
      }
    }

    this.currentAvatar = draft || { ...defaults, ...(user.avatar || {}) };
    if (this.currentAvatar.rotate === undefined) this.currentAvatar.rotate = 0;
    this.updatePreview();
    this.loadHistory();
    this.generateRandomAvatars();
  }

  public setHistoryLimit(limit: number): void {
    this.historyLimit = limit;
    if (this.cookies.getCategoryPreference('functional')?.enabled) {
      localStorage.setItem('avatar_history_limit', limit.toString());
    }
    this.loadHistory();
  }

  private saveDraft(): void {
    if (this.cookies.getCategoryPreference('functional')?.enabled) {
      localStorage.setItem('avatar_draft', JSON.stringify(this.currentAvatar));
    }
  }

  private loadHistory(): void {
    this.http.get<any>(`${Config.API_URL}/v1/user/avatar-history?limit=${this.historyLimit}`, { withCredentials: true }).subscribe({
      next: (response) => {
        const history = response.history || [];
        this.avatarHistory = history.map((item: any) => ({
          config: item.avatar,
          preview: this.getAvatarFromConfig(item.avatar)
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.avatarHistory = [];
      }
    });
  }


  public generateRandomAvatars(): void {
    this.randomAvatars = [];
    for (let i = 0; i < 5; i++) {
        const config = this.generateRandomConfig(i);
        this.randomAvatars.push({
            config,
            preview: this.getAvatarFromConfig(config)
        });
    }
  }

  private generateRandomConfig(seedSuffix: number): any {
    const type = 'thumbs';
    const schema = this.styleSchemas[type] || {};
    const config: any = { 
        type, 
        seed: Math.random().toString(36).substring(7) + seedSuffix, 
        radius: 50, 
        rotate: Math.floor(Math.random() * 361) 
    };
    
    Object.keys(schema).forEach(key => {
      const options = schema[key];
      if (Array.isArray(options)) {
        const randomIndex = Math.floor(Math.random() * options.length);
        const randomValue = options[randomIndex];
        const val = typeof randomValue === 'object' ? randomValue.value : randomValue;
        
        if (type === 'thumbs' && key === 'eyes') {
          const widths = [10, 12, 14, 16];
          const randomWidth = widths[Math.floor(Math.random() * widths.length)];
          config[key] = (val.includes('W') ? val.split('W')[0] : val) + 'W' + randomWidth;
        } else {
          config[key] = val;
        }
      }
    });

    config['faceOffsetX'] = Math.floor(Math.random() * 31) - 15; // -15 to 15
    return config;
  }

  public applyAvatar(avatar: any): void {
    this.currentAvatar = { ...avatar };
    this.updatePreview();
    this.saveDraft();
  }

  public updatePreview(): void {
    this.previewDataUri = this.getPreview(this.currentAvatar.type || 'thumbs');
  }

  public getPreview(style: string): string {
    const collection = this.collections[style];
    if (!collection) return '';

    // Create options for preview: style-specific properties plus common ones
    const props: any = {
      seed: this.currentAvatar.seed || this.u.getUser().username
    };

    // Only include properties relevant to the style if it's the current one
    if (this.currentAvatar.type === style) {
        Object.keys(this.currentAvatar).forEach(key => {
          if (key === 'type') return; // Exclude type property from DiceBear options
          const val = this.currentAvatar[key];
          
          // Core DiceBear props that are usually single values
          const coreProps = ['seed', 'flip', 'rotate', 'size', 'scale', 'radius', 'translateX', 'translateY'];
          if (coreProps.includes(key)) {
            props[key] = val;
            return;
          }

          // Collection specific props (eyes, face, mouth, colors, style-specific offsets)
          // DiceBear v9 often expects these as arrays, even for single values
          props[key] = Array.isArray(val) ? val : [val];
        });
    }

    const avatar = createAvatar(collection, props);
    return avatar.toDataUri().toString();
  }

  public getAvatarFromConfig(config: any): string {
    const collection = this.collections[config.type || 'thumbs'];
    if (!collection) return '';

    const props: any = {};
    Object.keys(config).forEach(key => {
        if (key === 'type') return;
        const val = config[key];
        
        const singleValueProps = ['radius', 'rotate', 'size', 'scale', 'flip', 'faceOffsetX', 'faceOffsetY', 'shapeOffsetX', 'shapeOffsetY', 'translateX', 'translateY', 'seed'];
        if (singleValueProps.includes(key)) {
            props[key] = val;
        } else if (typeof val === 'string') {
            props[key] = [val];
        } else {
            props[key] = val;
        }
    });

    const avatar = createAvatar(collection, props);
    return avatar.toDataUri().toString();
  }

  public selectStyle(style: string): void {
    this.currentAvatar.type = style;
    this.save();
  }

  public updateSeed(event: any): void {
    this.currentAvatar.seed = event.target.value;
    this.updatePreview();
    this.saveDraft();
  }

  public getAvailableOptions(): any {
    return this.styleSchemas[this.currentAvatar.type] || {};
  }

  public getVariantLabel(val: any): string {
    const label = val?.label !== undefined ? val.label : val;
    if (typeof label === 'string' && label.toLowerCase().startsWith('variant')) {
      const match = label.match(/\d+/);
      if (match) {
        return this.l.s('settings.avatar_settings.variant', { number: match[0] });
      }
    }
    return label;
  }

  public getOptionPreview(key: string, value: any): string {
    const collection = this.collections[this.currentAvatar.type || 'thumbs'];
    const props: any = {
      seed: 'preview',
      rotate: 0,
      radius: 0
    };

    const val = typeof value === 'object' ? value.value : value;
    
    if (this.currentAvatar.type === 'thumbs') {
      if (key === 'eyes') {
        const current = this.currentAvatar['eyes'] || this.styleDefaults['thumbs'].eyes;
        const width = current.includes('W') ? current.split('W')[1] : '12';
        props['eyes'] = [val + 'W' + width];
      } else if (key === 'eyeWidth') {
        const current = this.currentAvatar['eyes'] || this.styleDefaults['thumbs'].eyes;
        const variant = current.includes('W') ? current.split('W')[0] : 'variant1';
        props['eyes'] = [variant + 'W' + val];
      } else if (typeof val === 'string') {
        props[key] = [val];
      } else {
        props[key] = val;
      }
    } else if (typeof val === 'string') {
      props[key] = [val];
    } else {
      props[key] = val;
    }

    const avatar = createAvatar(collection, props);
    return avatar.toDataUri().toString();
  }

  public updateOption(key: string, value: any): void {
    if (this.currentAvatar.type === 'thumbs' && key === 'eyes') {
      const current = this.currentAvatar['eyes'] || this.styleDefaults['thumbs'].eyes;
      const width = current.includes('W') ? current.split('W')[1] : '12';
      this.currentAvatar['eyes'] = value + 'W' + width;
    } else if (this.currentAvatar.type === 'thumbs' && key === 'eyeWidth') {
      const current = this.currentAvatar['eyes'] || this.styleDefaults['thumbs'].eyes;
      const variant = current.includes('W') ? current.split('W')[0] : 'variant1';
      this.currentAvatar['eyes'] = variant + 'W' + value;
    } else if (value === 'null' || value === null) {
      delete this.currentAvatar[key];
    } else if (value === 'true') {
      this.currentAvatar[key] = true;
    } else if (value === 'false') {
      this.currentAvatar[key] = false;
    } else if (!isNaN(value) && value !== '' && !this.isColor(key)) {
      this.currentAvatar[key] = Number(value);
    } else {
      this.currentAvatar[key] = value;
    }
    
    // Clone to ensure change detection and stabilize [value] bindings
    this.currentAvatar = { ...this.currentAvatar };
    this.updatePreview();
    this.saveDraft();
    this.cdr.detectChanges();
  }

  public isColor(key: string): boolean {
    return key.toLowerCase().includes('color') || key === 'backgroundColor';
  }

  public isOptionActive(key: string, value: any): boolean {
    const currentValue = this.currentAvatar[key];
    const val = typeof value === 'object' ? value.value : value;

    if (this.currentAvatar.type === 'thumbs') {
      if (key === 'eyes') {
        const current = this.currentAvatar['eyes'] || this.styleDefaults['thumbs'].eyes;
        return current.startsWith(val + 'W');
      }
      if (key === 'eyeWidth') {
        const current = this.currentAvatar['eyes'] || this.styleDefaults['thumbs'].eyes;
        return current.endsWith('W' + val);
      }
    }

    if (currentValue === val) return true;
    if (currentValue === undefined || currentValue === null) {
      return this.styleDefaults[this.currentAvatar.type]?.[key] === val;
    }
    return false;
  }

  public isCustomColor(key: string, swatches: any): boolean {
    const currentValue = this.currentAvatar[key];
    if (currentValue === undefined || currentValue === null) return false;
    const swatchValues = Array.isArray(swatches) ? swatches.map(s => typeof s === 'object' ? s.value : s) : [];
    return !swatchValues.includes(currentValue);
  }

  public getCurrentEyeWidth(): number {
    const eyes = this.currentAvatar['eyes'] || this.styleDefaults['thumbs'].eyes;
    if (eyes && eyes.includes('W')) {
      return Number(eyes.split('W')[1]);
    }
    return 12;
  }

  public getCurrentFaceOffset(): number {
    return this.currentAvatar['faceOffsetX'] !== undefined ? this.currentAvatar['faceOffsetX'] : 0;
  }

  public randomize(): void {
    const user = this.u.getUser();
    const schema = this.getAvailableOptions();
    
    Object.keys(schema).forEach(key => {
      const options = schema[key];
      if (Array.isArray(options)) {
        const randomIndex = Math.floor(Math.random() * options.length);
        const randomValue = options[randomIndex];
        const val = typeof randomValue === 'object' ? randomValue.value : randomValue;
        
        if (this.currentAvatar.type === 'thumbs' && key === 'eyes') {
          // Special combined format for thumbs: variantXWY
          const widths = [10, 12, 14, 16];
          const randomWidth = widths[Math.floor(Math.random() * widths.length)];
          this.currentAvatar[key] = (val.includes('W') ? val.split('W')[0] : val) + 'W' + randomWidth;
        } else {
          this.currentAvatar[key] = val;
        }
      }
    });

    // Randomize common options too
    this.currentAvatar.rotate = Math.floor(Math.random() * 361);
    this.currentAvatar.radius = 50;
    
    // Use a random seed for more variety
    this.currentAvatar.seed = Math.random().toString(36).substring(7);
    
    this.currentAvatar = { ...this.currentAvatar };
    this.updatePreview();
    this.saveDraft();
  }

  public getColorPickerValue(key: string): string {
    const val = this.currentAvatar[key];
    if (!val || val === 'transparent') return '#000000';
    return val.startsWith('#') ? val : '#' + val;
  }

  public toggleColorPicker(key: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeColorPicker === key) {
      this.activeColorPicker = null;
    } else {
      this.activeColorPicker = key;
      let current = this.currentAvatar[key] || '000000';
      if (current === 'transparent') current = 'ffffff';
      this.hsv = this.hexToHsv(current);
    }
  }

  public updateHSV(): void {
    if (!this.activeColorPicker) return;
    const hex = this.hsvToHex(this.hsv.h, this.hsv.s, this.hsv.v);
    this.updateOption(this.activeColorPicker, hex);
    this.saveDraft();
  }

  public hexToHsv(hex: string): {h: number, s: number, v: number} {
    if (hex.startsWith('#')) hex = hex.substring(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
  }

  public hsvToHex(h: number, s: number, v: number): string {
    s /= 100;
    v /= 100;
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r = 0, g = 0, b = 0;
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
    const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
    return `${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  public triggerColorPicker(event: MouseEvent, input: HTMLInputElement): void {
    event.stopPropagation();
    // input.click(); // We no longer need the native picker
    const key = input.getAttribute('data-key');
    if (key) this.toggleColorPicker(key, event);
  }

  public startRotation(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.isRotating = true;
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  public handleRotation(event: MouseEvent | TouchEvent): void {
    if (!this.isRotating || !this.rotationDial) return;

    const dial = this.rotationDial.nativeElement;
    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angle = (angle + 270 + 360) % 360; // Offset shifted by 180 degrees (was 90)
    
    this.updateOption('rotate', Math.round(angle));
    this.saveDraft();
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  public stopRotation(): void {
    this.isRotating = false;
  }

  @HostListener('document:click')
  public closePickers(): void {
    this.activeColorPicker = null;
  }

  public save(): void {
    this.saving = true;
    this.error = false;
    this.http.post(`${Config.API_URL}/v1/user/update`, {
      method: 'UPDATE_AVATAR',
      avatar: this.currentAvatar
    }, { withCredentials: true }).subscribe({
      next: () => {
        this.saving = false;
        // Update local user data
        this.u.getUser().avatar = this.currentAvatar;
        // Clear draft after successful save
        if (this.cookies.getCategoryPreference('functional')?.enabled) {
          localStorage.removeItem('avatar_draft');
        }
        this.loadHistory();
      },
      error: () => {
        this.saving = false;
        this.error = true;
      }
    });
  }
}
