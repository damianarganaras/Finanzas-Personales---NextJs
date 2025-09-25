'use client';

import { useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';

export function SettingsApplier() {
  const { settingsData } = useSettings();

  useEffect(() => {
    if (!settingsData) return;
    const theme = settingsData.preferences.theme;

    const apply = (t: 'light' | 'dark') => {
      if (t === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const listener = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener?.('change', listener);
      return () => mq.removeEventListener?.('change', listener);
    } else {
      apply(theme);
    }
  }, [settingsData?.preferences.theme]);

  useEffect(() => {
    if (!settingsData) return;
    const lang = settingsData.preferences.language === 'es' ? 'es' : 'en';
    document.documentElement.lang = lang;
  }, [settingsData?.preferences.language]);

  return null;
}
