import { useState, useEffect, useCallback } from 'react';

// modes: 'system', 'light', 'dark'
function getStoredMode() {
  return localStorage.getItem('damo_theme') || 'system';
}

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode) {
  const isDark = mode === 'dark' || (mode === 'system' && getSystemDark());
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

export function useTheme() {
  const [mode, setMode] = useState(getStoredMode);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (getStoredMode() === 'system') applyTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setThemeMode = useCallback((newMode) => {
    localStorage.setItem('damo_theme', newMode);
    setMode(newMode);
    applyTheme(newMode);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && getSystemDark());

  return { mode, isDark, setThemeMode };
}
