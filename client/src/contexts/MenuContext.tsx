import React, { createContext, useContext, useEffect, useState } from "react";
import type { MenuData } from "../../../shared/types";
import { apiUrl } from "../utils/api";

interface MenuContextType {
  menuData: MenuData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      // Add cache-busting parameter to force fresh data
      const timestamp = new Date().getTime();
      const response = await fetch(apiUrl(`api/menu?t=${timestamp}`), {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const result = await response.json();

      if (result.success) {
        setMenuData(result.data);
      } else {
        setError(result.error || "Failed to load menu");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Menu fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <MenuContext.Provider
      value={{ menuData, loading, error, refetch: fetchMenu }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within MenuProvider");
  }
  return context;
}
