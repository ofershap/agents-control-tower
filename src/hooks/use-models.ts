import { useState, useEffect } from "react";
import { listModels } from "../lib/cursor-api.js";
import type { Model } from "../lib/types.js";

export function useModels(apiKey: string) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listModels(apiKey)
      .then(setModels)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiKey]);

  return { models, loading };
}
