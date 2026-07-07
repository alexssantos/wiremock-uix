import { useCallback, useEffect, useMemo, useState } from "react";
import { readLocalStorage, writeLocalStorage } from "@/shared/lib/local-storage";

const FAVORITES_STORAGE_KEY = "wiremock-ui.favorite-stub-mapping-ids";

export function useFavoriteStubMappings() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readLocalStorage<string[]>(FAVORITES_STORAGE_KEY, []));

  useEffect(() => {
    writeLocalStorage(FAVORITES_STORAGE_KEY, favoriteIds);
  }, [favoriteIds]);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const isFavorite = useCallback((id: string) => favoriteIdSet.has(id), [favoriteIdSet]);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((current) => (
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id]
    ));
  }, []);

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
  };
}
