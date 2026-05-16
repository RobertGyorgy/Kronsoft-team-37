import { Injectable } from '@angular/core';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
            },
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GSI_SCRIPT = 'https://accounts.google.com/gsi/client';

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private scriptPromise?: Promise<void>;
  private clientId?: string;
  private initialized = false;
  private callback?: (idToken: string) => void;

  public async attachButton(host: HTMLElement, onCredential: (idToken: string) => void): Promise<void> {
    this.callback = onCredential;
    await this.ensureReady();
    if (!this.clientId || !window.google) {
      throw new Error('Google Sign-In nu este configurat.');
    }

    if (!this.initialized) {
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response) => {
          if (response.credential && this.callback) {
            this.callback(response.credential);
          }
        },
      });
      this.initialized = true;
    }

    host.replaceChildren();
    window.google.accounts.id.renderButton(host, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: Math.min(host.offsetWidth || 320, 400),
      text: 'continue_with',
    });
  }

  private async ensureReady(): Promise<void> {
    if (!this.clientId) {
      const config = await fetch('/config.json').then((res) => res.json());
      this.clientId = config.GOOGLE_CLIENT_ID;
    }
    if (!this.clientId) {
      throw new Error('GOOGLE_CLIENT_ID lipseste din config.json / .env');
    }
    await this.loadScript();
  }

  private loadScript(): Promise<void> {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }
    if (!this.scriptPromise) {
      this.scriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${GSI_SCRIPT}"]`);
        if (existing) {
          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', () => reject(new Error('Nu s-a incarcat Google Sign-In.')), {
            once: true,
          });
          return;
        }
        const script = document.createElement('script');
        script.src = GSI_SCRIPT;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Nu s-a incarcat Google Sign-In.'));
        document.head.appendChild(script);
      });
    }
    return this.scriptPromise;
  }
}
