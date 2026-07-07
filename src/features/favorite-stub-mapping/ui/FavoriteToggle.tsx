import { Star } from "lucide-react";
import { useFavoriteStubMappings } from "@/features/favorite-stub-mapping/model/use-favorite-stub-mappings";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

type FavoriteToggleProps = {
  id?: string;
};

export function FavoriteToggle({ id }: FavoriteToggleProps) {
  const { isFavorite, toggleFavorite } = useFavoriteStubMappings();

  if (!id) {
    return (
      <Button type="button" variant="ghost" size="icon-sm" disabled aria-label="Favorite unavailable">
        <Star className="size-4" />
      </Button>
    );
  }

  const favorite = isFavorite(id);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      onClick={() => toggleFavorite(id)}
    >
      <Star className={cn("size-4", favorite && "fill-amber-400 text-amber-500")} />
    </Button>
  );
}
