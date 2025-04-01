// src/components/game-ui/FavoritesManager.tsx
import styles from '../GameMode.module.css';

interface FavoritesManagerProps {
  showFavorites: boolean;
  favoritesCount: number;
  onToggleView: (show: boolean) => void;
}

export default function FavoritesManager({
  showFavorites,
  favoritesCount,
  onToggleView
}: FavoritesManagerProps) {
  return (
    <div className={styles.favoritesManager}>
      <button
        className={`${styles.favoriteButton} ${showFavorites ? styles.active : ''}`}
        onClick={() => onToggleView(!showFavorites)}
      >
        {showFavorites ? 'Показать все вопросы' : `Показать избранное (${favoritesCount})`}
      </button>
    </div>
  );
}