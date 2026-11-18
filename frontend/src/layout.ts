// Which layout the card uses for its width, and how many grid columns each block spans. No DOM.

export type Layout = "narrow" | "medium" | "wide";
export type Block = "heat_pump" | "thermostat" | "plan" | "side" | "model";

export const MEDIUM_FROM = 560; // px
export const WIDE_FROM = 900; // px

export function layoutFor(width: number): Layout {
  if (width >= WIDE_FROM) return "wide";
  return width >= MEDIUM_FROM ? "medium" : "narrow";
}

export function columnsOf(layout: Layout): number {
  return layout === "wide" ? 3 : layout === "medium" ? 2 : 1;
}

const SPANS: Record<Layout, Record<Block, number>> = {
  narrow: { heat_pump: 1, thermostat: 1, plan: 1, side: 1, model: 1 },
  medium: { heat_pump: 1, thermostat: 1, plan: 2, side: 1, model: 1 },
  wide: { heat_pump: 1, thermostat: 1, plan: 3, side: 1, model: 3 },
};

export function spanFor(layout: Layout, block: Block): number {
  return SPANS[layout][block];
}

/** Home Assistant sections dashboard: full width by default, at least half a section, height follows content. */
export const GRID_OPTIONS = { columns: "full", min_columns: 6, rows: "auto" } as const;
