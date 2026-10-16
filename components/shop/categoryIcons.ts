import { Box, CircleDot, Dumbbell, Hand, Infinity as InfinityIcon, Layers, Link2, ShoppingBag, type LucideIcon } from "lucide-react";
import type { ShopCategory } from "@/lib/shop/types";

export const categoryIcon: Record<ShopCategory, LucideIcon> = {
  mats: Layers,
  props: Box,
  bands: InfinityIcon,
  balance: CircleDot,
  weights: Dumbbell,
  recovery: Hand,
  suspension: Link2,
  accessories: ShoppingBag,
};
