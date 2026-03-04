import { useState, useEffect } from "react";
import { listRepos } from "../lib/cursor-api.js";
import type { Repository } from "../lib/types.js";

export function useRepos(apiKey: string) {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRepos(apiKey)
      .then(setRepos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiKey]);

  return { repos, loading };
}
