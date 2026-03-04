import { useState, useEffect, useCallback } from "react";
import { loadConfig, saveConfig, getApiKeyFromEnv } from "../lib/config.js";
import type { AppConfig } from "../lib/types.js";

interface UseConfigResult {
  config: AppConfig | null;
  loading: boolean;
  save: (config: AppConfig) => Promise<void>;
  reset: () => void;
}

export function useConfig(): UseConfigResult {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const envKey = getApiKeyFromEnv();
      if (envKey) {
        setConfig({ apiKey: envKey, hooksInstalled: false });
        setLoading(false);
        return;
      }
      const stored = await loadConfig();
      setConfig(stored);
      setLoading(false);
    })();
  }, []);

  const save = useCallback(async (newConfig: AppConfig) => {
    await saveConfig(newConfig);
    setConfig(newConfig);
  }, []);

  const reset = useCallback(() => {
    setConfig(null);
  }, []);

  return { config, loading, save, reset };
}
