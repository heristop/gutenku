import {
  Search,
  BookMarked,
  Drama,
  Sparkles,
  Palette,
  PenLine,
  Cog,
  BookOpen,
  Target,
  Brain,
  Brush,
  Flag,
  type LucideIcon,
} from 'lucide-vue-next';

const ICON_MAP: Record<string, LucideIcon> = {
  extracting: Search,
  reading: BookMarked,
  analyzing: Drama,
  generating: Sparkles,
  creating: Palette,
  crafting: PenLine,
  processing: Cog,
  searching: Search,
  loading: BookOpen,
  found: Sparkles,
  quote: PenLine,
  selecting: Target,
  evaluating: Brain,
  weaving: Brush,
  finalizing: Flag,
};

const DEFAULT_ICON = Sparkles;

export function useIconMapping() {
  const getIcon = (text: string): LucideIcon => {
    const textLower = text.toLowerCase();
    const matchedKey = Object.keys(ICON_MAP).find((key) =>
      textLower.includes(key),
    );
    return matchedKey ? ICON_MAP[matchedKey] : DEFAULT_ICON;
  };

  return {
    getIcon,
  };
}
