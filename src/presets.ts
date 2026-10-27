import { RichTextDocument, DocumentCurve } from "./types";

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnailColor: string;
  canvasBackground: string;
  items: Array<{
    x: number;
    y: number;
    width: number;
    documentCurve?: DocumentCurve;
    document: RichTextDocument;
  }>;
}

export interface LookPreset {
  id: string;
  name: string;
  color: string;
  strokeColor?: string;
  strokeWidthRatio?: number;
  fixedStrokeWidth?: number;
  shadow?: {
    color: string;
    offsetXRatio?: number;
    offsetYRatio?: number;
    blurRatio?: number;
    fixedOffsetX?: number;
    fixedOffsetY?: number;
    fixedBlur?: number;
  };
  fill?: {
    type: "gradient";
    color1: string;
    color2: string;
    angle: number;
  };
}

export const LOOK_PRESETS: LookPreset[] = [
  {
    id: "molten-ember",
    name: "Molten Ember",
    color: "#FF6B35",
    strokeColor: "#1A0B05",
    strokeWidthRatio: 0.14,
    shadow: {
      color: "rgba(255, 107, 53, 0.4)",
      offsetXRatio: 0.04,
      offsetYRatio: 0.04,
      blurRatio: 0.15,
    },
  },
  {
    id: "cyber-cyan",
    name: "Cyber Cyan",
    color: "#00F0FF",
    strokeColor: "#022B3A",
    strokeWidthRatio: 0.1,
    shadow: {
      color: "#00F0FF",
      fixedOffsetX: 0,
      fixedOffsetY: 0,
      blurRatio: 0.25,
    },
  },
  {
    id: "royal-gold",
    name: "Royal Gold Foil",
    color: "#F59E0B",
    strokeColor: "#78350F",
    strokeWidthRatio: 0.08,
    shadow: {
      color: "rgba(245, 158, 11, 0.4)",
      offsetXRatio: 0.03,
      offsetYRatio: 0.05,
      blurRatio: 0.12,
    },
  },
  {
    id: "holographic-aurora",
    name: "Aurora Hologram",
    color: "#FFFFFF",
    strokeWidthRatio: 0,
    fill: {
      type: "gradient",
      color1: "#8B5CF6",
      color2: "#06B6D4",
      angle: 90,
    },
    shadow: {
      color: "rgba(6, 182, 212, 0.35)",
      fixedOffsetX: 0,
      fixedOffsetY: 4,
      fixedBlur: 14,
    },
  },
  {
    id: "solar-flame",
    name: "Solar Flame",
    color: "#FFFFFF",
    strokeWidthRatio: 0,
    fill: {
      type: "gradient",
      color1: "#FF4500",
      color2: "#FFD700",
      angle: 45,
    },
    shadow: {
      color: "rgba(255, 69, 0, 0.35)",
      fixedOffsetX: 0,
      fixedOffsetY: 6,
      fixedBlur: 16,
    },
  },
  {
    id: "neon-fuchsia",
    name: "Neon Fuchsia",
    color: "#F43F5E",
    strokeColor: "#4C0519",
    strokeWidthRatio: 0.09,
    shadow: {
      color: "#FB7185",
      fixedOffsetX: 0,
      fixedOffsetY: 0,
      blurRatio: 0.22,
    },
  },
  {
    id: "titanium-monolith",
    name: "Titanium Monolith",
    color: "#F8FAFC",
    strokeColor: "#0F172A",
    strokeWidthRatio: 0.12,
    shadow: {
      color: "rgba(15, 23, 42, 0.35)",
      offsetXRatio: 0.05,
      offsetYRatio: 0.05,
      fixedBlur: 0,
    },
  },
];

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "cyberpunk-forge",
    name: "Cyberpunk Forge 2088",
    category: "Futuristic / Sci-Fi",
    description: "Electric cyan & solar ember neon typography with cyber-arc seal",
    thumbnailColor: "#00F0FF",
    canvasBackground: "#0B0E17",
    items: [
      {
        x: 195,
        y: 60,
        width: 450,
        documentCurve: {
          enabled: true,
          amount: 140,
        },
        document: {
          baseFontSize: 18,
          curve: {
            enabled: true,
            amount: 140,
          },
          shadow: {
            color: "#00F0FF",
            blur: 14,
            offsetX: 0,
            offsetY: 0,
          },
          blocks: [
            {
              id: "top-arc",
              type: "paragraph",
              blockAttributes: {
                fontSize: 22,
                fontFamily: "Space Grotesk",
                color: "#00F0FF",
                alignment: "center",
                lineHeight: 1.2,
                letterSpacing: 4,
                paragraphSpacing: 0,
              },
              content: [
                {
                  text: "★ ESPERANZA KONVA FORGE ★",
                  attributes: { bold: true },
                },
              ],
            },
          ],
        },
      },
      {
        x: 110,
        y: 155,
        width: 620,
        document: {
          baseFontSize: 18,
          shadow: {
            color: "#FF6B35",
            offsetX: 0,
            offsetY: 0,
            blur: 24,
          },
          blocks: [
            {
              id: "main-title",
              type: "paragraph",
              blockAttributes: {
                fontSize: 66,
                fontFamily: "Bebas Neue",
                color: "#FF6B35",
                alignment: "center",
                lineHeight: 1.05,
                letterSpacing: 3,
                paragraphSpacing: 0.2,
              },
              content: [
                {
                  text: "NEO ",
                  attributes: {
                    color: "#00F0FF",
                    strokeColor: "#022B3A",
                    strokeWidth: 5,
                  },
                },
                {
                  text: "TOKYO FORGE",
                  attributes: {
                    color: "#FF6B35",
                    strokeColor: "#1A0B05",
                    strokeWidth: 5,
                  },
                },
              ],
            },
          ],
        },
      },
      {
        x: 140,
        y: 260,
        width: 560,
        document: {
          baseFontSize: 18,
          fill: {
            type: "gradient",
            color1: "#00F0FF",
            color2: "#FF6B35",
            angle: 90,
          },
          shadow: {
            color: "rgba(0, 240, 255, 0.4)",
            blur: 12,
            offsetX: 0,
            offsetY: 2,
          },
          blocks: [
            {
              id: "gradient-sub",
              type: "paragraph",
              blockAttributes: {
                fontSize: 22,
                fontFamily: "Space Grotesk",
                color: "#FFFFFF",
                alignment: "center",
                lineHeight: 1.4,
                letterSpacing: 3,
                paragraphSpacing: 0.3,
              },
              content: [
                {
                  text: "NEXT-GEN IN-CANVAS TYPOGRAPHY BY FLASKARCHITECT",
                  attributes: { bold: true },
                },
              ],
            },
          ],
        },
      },
      {
        x: 190,
        y: 365,
        width: 460,
        document: {
          baseFontSize: 18,
          blocks: [
            {
              id: "bullet-1",
              type: "list-item",
              blockAttributes: {
                fontSize: 17,
                fontFamily: "Poppins",
                color: "#E2E8F0",
                alignment: "left",
                lineHeight: 1.5,
                letterSpacing: 0,
                listType: "bullet",
                listStyle: "★",
                paragraphSpacing: 0.4,
              },
              content: [
                {
                  text: "Zero Watermarks: Fully open-source Konva.js architecture",
                  attributes: { bold: true, color: "#00F0FF" },
                },
              ],
            },
            {
              id: "bullet-2",
              type: "list-item",
              blockAttributes: {
                fontSize: 17,
                fontFamily: "Poppins",
                color: "#CBD5E1",
                alignment: "left",
                lineHeight: 1.5,
                letterSpacing: 0,
                listType: "bullet",
                listStyle: "★",
                paragraphSpacing: 0.4,
              },
              content: [
                {
                  text: "Sub-pixel radial curvature & multi-color linear gradients",
                  attributes: {},
                },
              ],
            },
            {
              id: "bullet-3",
              type: "list-item",
              blockAttributes: {
                fontSize: 17,
                fontFamily: "Poppins",
                color: "#CBD5E1",
                alignment: "left",
                lineHeight: 1.5,
                letterSpacing: 0,
                listType: "bullet",
                listStyle: "★",
                paragraphSpacing: 0.4,
              },
              content: [
                {
                  text: "Double-click live canvas editing with full undo/redo stack",
                  attributes: { bold: true, color: "#FF6B35" },
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: "maison-lumiere",
    name: "Atelier Lumière Luxury",
    category: "Luxury & Editorial",
    description: "Gold leaf royal seal with classical serif typography & double arcs",
    thumbnailColor: "#F59E0B",
    canvasBackground: "#0B0E17",
    items: [
      {
        x: 195,
        y: 75,
        width: 450,
        documentCurve: {
          enabled: true,
          amount: 180,
        },
        document: {
          baseFontSize: 18,
          curve: {
            enabled: true,
            amount: 180,
          },
          blocks: [
            {
              id: "gold-top-curve",
              type: "paragraph",
              blockAttributes: {
                fontSize: 26,
                fontFamily: "Playfair Display",
                color: "#F59E0B",
                alignment: "center",
                lineHeight: 1.2,
                letterSpacing: 4,
                paragraphSpacing: 0,
              },
              content: [
                {
                  text: "★ MAISON D'ESPERANZA • PARIS ★",
                  attributes: { bold: true },
                },
              ],
            },
          ],
        },
      },
      {
        x: 120,
        y: 200,
        width: 600,
        document: {
          baseFontSize: 18,
          shadow: {
            color: "rgba(245, 158, 11, 0.35)",
            offsetX: 0,
            offsetY: 4,
            blur: 14,
          },
          blocks: [
            {
              id: "serif-title",
              type: "paragraph",
              blockAttributes: {
                fontSize: 54,
                fontFamily: "Cinzel",
                color: "#F59E0B",
                alignment: "center",
                lineHeight: 1.1,
                letterSpacing: 3,
                paragraphSpacing: 0.3,
              },
              content: [
                {
                  text: "HAUTE TYPOGRAPHIE",
                  attributes: { bold: true },
                },
              ],
            },
            {
              id: "serif-sub",
              type: "paragraph",
              blockAttributes: {
                fontSize: 20,
                fontFamily: "Lora",
                color: "#FDE68A",
                alignment: "center",
                lineHeight: 1.3,
                letterSpacing: 1,
                paragraphSpacing: 0,
              },
              content: [
                {
                  text: "Curated Masterpieces by FlaskArchitect • Pure Visual Harmony",
                  attributes: { italic: true },
                },
              ],
            },
          ],
        },
      },
      {
        x: 210,
        y: 350,
        width: 420,
        documentCurve: {
          enabled: true,
          amount: -180,
        },
        document: {
          baseFontSize: 18,
          curve: {
            enabled: true,
            amount: -180,
          },
          blocks: [
            {
              id: "gold-bottom-curve",
              type: "paragraph",
              blockAttributes: {
                fontSize: 22,
                fontFamily: "Playfair Display",
                color: "#F59E0B",
                alignment: "center",
                lineHeight: 1.2,
                letterSpacing: 3,
                paragraphSpacing: 0,
              },
              content: [
                {
                  text: "• CRAFTED WITH DISTINCTION •",
                  attributes: { bold: true },
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: "molten-ignite",
    name: "Molten Flame Studio",
    category: "Vibrant & Bold",
    description: "Fiery gradient typography with sticker outlines & soft drop shadows",
    thumbnailColor: "#FF4500",
    canvasBackground: "#111420",
    items: [
      {
        x: 100,
        y: 110,
        width: 640,
        document: {
          baseFontSize: 18,
          shadow: {
            color: "rgba(255, 69, 0, 0.45)",
            offsetX: 0,
            offsetY: 6,
            blur: 24,
          },
          blocks: [
            {
              id: "flame-head",
              type: "paragraph",
              blockAttributes: {
                fontSize: 68,
                fontFamily: "Poppins",
                color: "#FFFFFF",
                alignment: "center",
                lineHeight: 1.1,
                letterSpacing: 2,
                paragraphSpacing: 0.2,
              },
              content: [
                {
                  text: "IGNITE ",
                  attributes: {
                    bold: true,
                    color: "#FFA62B",
                    strokeColor: "#1A0B05",
                    strokeWidth: 7,
                  },
                },
                {
                  text: "CREATIVITY",
                  attributes: {
                    bold: true,
                    color: "#FF4500",
                    strokeColor: "#1A0B05",
                    strokeWidth: 7,
                  },
                },
              ],
            },
          ],
        },
      },
      {
        x: 140,
        y: 230,
        width: 560,
        document: {
          baseFontSize: 18,
          fill: {
            type: "gradient",
            color1: "#FF6B35",
            color2: "#FFD700",
            angle: 90,
          },
          shadow: {
            color: "rgba(255, 107, 53, 0.35)",
            offsetX: 0,
            offsetY: 4,
            blur: 14,
          },
          blocks: [
            {
              id: "gradient-sub-flame",
              type: "paragraph",
              blockAttributes: {
                fontSize: 24,
                fontFamily: "Montserrat",
                color: "#FFFFFF",
                alignment: "center",
                lineHeight: 1.3,
                letterSpacing: 3,
                paragraphSpacing: 0,
              },
              content: [
                {
                  text: "WHERE WORDS BECOME VISUAL ARCHITECTURE",
                  attributes: { bold: true },
                },
              ],
            },
          ],
        },
      },
      {
        x: 200,
        y: 330,
        width: 440,
        documentCurve: {
          enabled: true,
          amount: 120,
        },
        document: {
          baseFontSize: 18,
          curve: {
            enabled: true,
            amount: 120,
          },
          blocks: [
            {
              id: "flame-badge",
              type: "paragraph",
              blockAttributes: {
                fontSize: 22,
                fontFamily: "Space Grotesk",
                color: "#FFA62B",
                alignment: "center",
                lineHeight: 1.2,
                letterSpacing: 3,
                paragraphSpacing: 0,
              },
              content: [
                {
                  text: "★ FORGED BY FLASKARCHITECT ★",
                  attributes: { bold: true },
                },
              ],
            },
          ],
        },
      },
    ],
  },
];
