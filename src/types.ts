// ============ TYPES ============

export interface Phase {
  id: string;
  label: string;
  short: string;
  instruction: string;
  voice: string;
}

export interface Pattern {
  id: string;
  name: string;
  type: "box" | "trapezoid";
  durations: number[];
  boxDuration?: number;
}

export type EditablePattern = Omit<Pattern, "id"> & { id: string | null };

export interface Visualization {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export interface VisualizationProps {
  phase: number;
  progress: number;
  durations: number[];
}

// ============ CONSTANTS ============

export const PHASES: Phase[] = [
  { id: "in", label: "Breathe In", short: "In", instruction: "Inhale slowly...", voice: "Breathe in" },
  { id: "hold1", label: "Hold", short: "Hold", instruction: "Hold gently...", voice: "Hold" },
  { id: "out", label: "Breathe Out", short: "Out", instruction: "Exhale slowly...", voice: "Breathe out" },
  { id: "hold2", label: "Hold", short: "Hold", instruction: "Rest...", voice: "Hold" },
];

export const DEFAULT_PATTERNS: Pattern[] = [
  { id: "box4", name: "Box 4s", type: "box", durations: [4, 4, 4, 4], boxDuration: 4 },
  { id: "box8", name: "Box 8s", type: "box", durations: [8, 8, 8, 8], boxDuration: 8 },
  { id: "relaxing", name: "4-7-8 Relaxing", type: "trapezoid", durations: [4, 7, 8, 0] },
  { id: "calm", name: "Calm Wave", type: "trapezoid", durations: [6, 2, 8, 2] },
];

export const BOX_DURATIONS = [4, 5, 6, 8, 10, 12, 15];

export const VISUALIZATIONS: Visualization[] = [
  { id: "box", name: "Box Perimeter", icon: "\u25fb", desc: "Classic square with traveling marker" },
  { id: "orbit", name: "Orbiting Dot", icon: "\u25ce", desc: "Dot circles around a ring" },
  { id: "blob", name: "Breathing Blob", icon: "\u25cf", desc: "Shape expands and contracts" },
  { id: "bar", name: "Progress Bar", icon: "\u25ac", desc: "Horizontal segmented bar" },
  { id: "ladder", name: "Breath Ladder", icon: "\u2630", desc: "Vertical stacked phases" },
  { id: "trapezoid", name: "Hill / Ramp", icon: "\u25b3", desc: "Climb up, across, down" },
  { id: "flower", name: "Four Petals", icon: "\u273f", desc: "Petals pulse when active" },
  { id: "minimal", name: "Minimal Word", icon: "Aa", desc: "Just text with a pulse" },
  { id: "ring", name: "Timeline Ring", icon: "\u25d0", desc: "Circular progress sweep" },
  { id: "path", name: "Breath Path", icon: "\u223f", desc: "Dot travels along a line" },
];

export const COLORS = ["#7dd3c0", "#a8d4e6", "#c4b7d4", "#e8c4b8"];
