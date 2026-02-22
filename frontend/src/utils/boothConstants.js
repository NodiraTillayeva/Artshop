// Booth dimensions (meters) — wider to fit 4 sections
export const BOOTH_WIDTH = 5.0;
export const TABLE_HEIGHT = 0.38;
export const TABLE_WIDTH = 5.0;
export const TABLE_DEPTH = 0.9;
export const BACKDROP_HEIGHT = 2.4;
export const BACKDROP_WIDTH = 5.2;

// Item limits
export const MAX_PRINTS = 6;
export const MAX_KEYCHAINS = 8;
export const MAX_STICKERS = 10;
export const MAX_STICKER_SHEETS = 4;
export const MAX_TSHIRTS = 4;

// Print positions on LEFT half of backdrop (3 cols x 2 rows)
// z = -0.96 sits flush against backdrop panel at z = -0.98
export const PRINT_POSITIONS = [
  [-2.1, 1.65, -0.96],
  [-1.25, 1.65, -0.96],
  [-0.4, 1.65, -0.96],
  [-2.1, 0.75, -0.96],
  [-1.25, 0.75, -0.96],
  [-0.4, 0.75, -0.96],
];

// Keychain positions on LEFT side of table rack
export const KEYCHAIN_POSITIONS = [
  [-0.84, 0.28, -0.16],
  [-0.60, 0.28, -0.16],
  [-0.36, 0.28, -0.16],
  [-0.12, 0.28, -0.16],
  [0.12, 0.28, -0.16],
  [0.36, 0.28, -0.16],
  [0.60, 0.28, -0.16],
  [0.84, 0.28, -0.16],
];

// Sticker positions on RIGHT side — centered on single display stand
// 2 rows of 4, symmetrical, evenly spaced on middle shelves
export const STICKER_POSITIONS = [
  // Stand is 0.406 tall (y: 0–0.406), 0.780 wide (x: -0.39–0.39)
  // Bottom shelf — 5 stickers (lowest tier, front of stand)
  [-0.28, 0.04, 0.24],
  [-0.14, 0.04, 0.24],
  [0.00, 0.04, 0.24],
  [0.14, 0.04, 0.24],
  [0.28, 0.04, 0.24],
  // Second shelf — 5 stickers (deeper inset)
  [-0.28, 0.18, 0.07],
  [-0.14, 0.18, 0.07],
  [0.00, 0.18, 0.07],
  [0.14, 0.18, 0.07],
  [0.28, 0.18, 0.07],
];

// Sticker sheet positions — absolute world coordinates
// On the right table surface (y=0.72), in front of the sticker display stand
export const STICKER_SHEET_POSITIONS = [
  [0.55, 0.72, 0.65],
  [0.80, 0.72, 0.70],
  [1.05, 0.72, 0.65],
  [1.30, 0.72, 0.70],
];

// T-shirt positions on RIGHT half of backdrop (horizontal row)
export const TSHIRT_POSITIONS = [
  [0.5, 1.25, -0.94],
  [1.2, 1.25, -0.94],
  [1.9, 1.25, -0.94],
  [2.6, 1.25, -0.94],
];

// Section camera targets: { target: [x,y,z], distance, azimuth }
export const SECTIONS = {
  overview: { target: [0, 1.0, 0], distance: 3.2, azimuth: 0 },
  prints: { target: [-1.3, 1.2, -0.8], distance: 2.2, azimuth: -0.12 },
  keychains: { target: [-1.0, 0.65, 0.3], distance: 1.6, azimuth: -0.08 },
  stickers: { target: [0.88, 0.95, 0.4], distance: 1.6, azimuth: 0.05 },
  tshirts: { target: [1.5, 1.2, -0.8], distance: 2.2, azimuth: 0.12 },
};

export const SECTION_LIST = ['overview', 'prints', 'keychains', 'stickers', 'tshirts'];

export const SECTION_LABELS = {
  overview: 'Overview',
  prints: 'Prints',
  keychains: 'Keychains',
  stickers: 'Stickers',
  tshirts: 'T-Shirts',
};

// Colors
export const COLORS = {
  backdrop: '#1a1a2e',
  sidePanel: '#2d2d44',
  tablecloth: '#6c3483',
  tableWood: '#8B4513',
  tableLeg: '#654321',
  frameDefault: '#8b7355',
  frameHover: '#c9a96e',
  ground: '#8b7e74',
  metalPole: '#4a4a4a',
  rackWood: '#d4c5a9',
  banner: '#e8d5b7',
};
