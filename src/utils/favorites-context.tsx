// src/utils/favorites-context.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoritesContextType {
  favorites: Record<string, number[]>;
  isFavorite: (testId: string, questionId: number) => boolean;
  toggleFavorite: (testId: string, questionId: number) => void;
  getFavoritesByTest: (testId: string) => number[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Record<string, number[]>>({});

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (e) {
      console.error('Error loading favorites from localStorage', e);
    }
  }, []);

  // Save favorites when they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (testId: string, questionId: number) => {
    return favorites[testId]?.includes(questionId) || false;
  };

  const toggleFavorite = (testId: string, questionId: number) => {
    setFavorites(prev => {
      const testFavorites = prev[testId] || [];

      if (testFavorites.includes(questionId)) {
        // Remove from favorites
        return {
          ...prev,
          [testId]: testFavorites.filter(id => id !== questionId)
        };
      } else {
        // Add to favorites
        return {
          ...prev,
          [testId]: [...testFavorites, questionId]
        };
      }
    });
  };

  const getFavoritesByTest = (testId: string) => {
    return favorites[testId] || [];
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, getFavoritesByTest }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}