export const SAMPLE_VIDEO_INTRO = {
  app: "EsperanzaKonva Forge",
  author: "FlaskArchitect",
  version: 1,
  canvas: {
    width: 960,
    height: 540,
    background: "#070A12",
  },
  atmosphericFX: {
    enabled: true,
    masterOpacity: 1.0,
    blendMode: "screen",
    currentPresetId: "golden_sparkles",
    effects: {
      sparkles: { enabled: true, opacity: 0.85, color: "#ffdf00", density: 55 },
      bokeh: { enabled: true, opacity: 0.5, color: "#ffb6c1" },
      vignette: { enabled: true, opacity: 0.35 },
    },
  },
  boxes: [
    {
      x: 180,
      y: 80,
      width: 600,
      rotation: 0,
      document: {
        baseFontSize: 15,
        blocks: [
          {
            id: "badge-top",
            type: "paragraph",
            blockAttributes: {
              fontSize: 15,
              fontFamily: "Inter",
              color: "#F59E0B",
              alignment: "center",
              lineHeight: 1.2,
              letterSpacing: 6,
              paragraphSpacing: 0,
            },
            content: [
              {
                text: "✦ FLASKARCHITECT PRESENTS ✦",
                attributes: {
                  bold: true,
                  color: "#F59E0B",
                },
              },
            ],
          },
        ],
        shadow: {
          color: "rgba(245, 158, 11, 0.45)",
          blur: 12,
          offsetX: 0,
          offsetY: 0,
        },
      },
    },
    {
      x: 80,
      y: 145,
      width: 800,
      rotation: 0,
      document: {
        baseFontSize: 62,
        blocks: [
          {
            id: "hero-title",
            type: "paragraph",
            blockAttributes: {
              fontSize: 62,
              fontFamily: "Montserrat",
              color: "#FFFFFF",
              alignment: "center",
              lineHeight: 1.1,
              letterSpacing: 3,
              paragraphSpacing: 0,
            },
            content: [
              {
                text: "KINETIC ",
                attributes: {
                  bold: true,
                  color: "#FFFFFF",
                },
              },
              {
                text: "VELOCITY",
                attributes: {
                  bold: true,
                  color: "#00F0FF",
                  strokeColor: "#00F0FF",
                  strokeWidth: 1.5,
                },
              },
            ],
          },
        ],
        fill: {
          type: "gradient",
          color1: "#00F0FF",
          color2: "#FF007F",
          angle: 45,
        },
        shadow: {
          color: "rgba(0, 240, 255, 0.65)",
          blur: 26,
          offsetX: 0,
          offsetY: 0,
        },
      },
    },
    {
      x: 130,
      y: 275,
      width: 700,
      rotation: 0,
      document: {
        baseFontSize: 20,
        blocks: [
          {
            id: "hero-sub",
            type: "paragraph",
            blockAttributes: {
              fontSize: 20,
              fontFamily: "Space Grotesk",
              color: "#CBD5E1",
              alignment: "center",
              lineHeight: 1.3,
              letterSpacing: 3,
              paragraphSpacing: 0,
            },
            content: [
              {
                text: "NEXT-GENERATION IN-CANVAS MOTION SUITE",
                attributes: {
                  bold: true,
                  color: "#E2E8F0",
                },
              },
            ],
          },
        ],
        shadow: {
          color: "rgba(0, 0, 0, 0.8)",
          blur: 8,
          offsetX: 0,
          offsetY: 4,
        },
      },
    },
    {
      x: 180,
      y: 360,
      width: 600,
      rotation: 0,
      document: {
        baseFontSize: 14,
        blocks: [
          {
            id: "badge-bottom",
            type: "paragraph",
            blockAttributes: {
              fontSize: 14,
              fontFamily: "Inter",
              color: "#10B981",
              alignment: "center",
              lineHeight: 1.2,
              letterSpacing: 4,
              paragraphSpacing: 0,
            },
            content: [
              {
                text: "⚡ 60 FPS • 100% WATERMARK FREE • ULTRA HD EXPORT ⚡",
                attributes: {
                  bold: true,
                  color: "#34D399",
                },
              },
            ],
          },
        ],
        shadow: {
          color: "rgba(16, 185, 129, 0.4)",
          blur: 8,
          offsetX: 0,
          offsetY: 0,
        },
      },
    },
  ],
};

export const SAMPLE_CURVED_CINEMA = {
  app: "EsperanzaKonva Forge",
  author: "FlaskArchitect",
  version: 1,
  canvas: {
    width: 960,
    height: 540,
    background: "#080B11",
  },
  atmosphericFX: {
    enabled: true,
    masterOpacity: 1.0,
    blendMode: "screen",
    currentPresetId: "cyber_synthwave",
    effects: {
      cybergrid: { enabled: true, opacity: 0.75, color: "#ff007f" },
      suns: { enabled: true, opacity: 0.7 },
      dust: { enabled: true, opacity: 0.6, color: "#00f0ff" },
      scanlines: { enabled: true, opacity: 0.3, glitch: 0.04 },
    },
  },
  boxes: [
    {
      x: 160,
      y: 80,
      width: 640,
      rotation: 0,
      document: {
        baseFontSize: 36,
        curve: {
          enabled: true,
          amount: 115,
        },
        shadow: {
          color: "rgba(245, 158, 11, 0.55)",
          blur: 20,
          offsetX: 0,
          offsetY: 0,
        },
        fill: {
          type: "gradient",
          color1: "#FFD700",
          color2: "#FF6B35",
          angle: 90,
        },
        blocks: [
          {
            id: "curved-hero",
            type: "paragraph",
            blockAttributes: {
              fontSize: 38,
              fontFamily: "Cinzel",
              color: "#FFD700",
              alignment: "center",
              lineHeight: 1.2,
              letterSpacing: 6,
              paragraphSpacing: 0,
            },
            content: [
              {
                text: "★ CHRONICLES OF HORIZON ★",
                attributes: {
                  bold: true,
                  color: "#FFD700",
                },
              },
            ],
          },
        ],
      },
    },
    {
      x: 180,
      y: 270,
      width: 600,
      rotation: 0,
      document: {
        baseFontSize: 18,
        blocks: [
          {
            id: "cinema-sub",
            type: "paragraph",
            blockAttributes: {
              fontSize: 18,
              fontFamily: "Poppins",
              color: "#E2E8F0",
              alignment: "center",
              lineHeight: 1.4,
              letterSpacing: 4,
              paragraphSpacing: 0,
            },
            content: [
              {
                text: "A CINEMATIC MASTERPIECE IN MOTION",
                attributes: {
                  bold: true,
                  color: "#F8FAFC",
                },
              },
            ],
          },
        ],
        shadow: {
          color: "rgba(0, 0, 0, 0.8)",
          blur: 8,
          offsetX: 0,
          offsetY: 4,
        },
      },
    },
    {
      x: 230,
      y: 355,
      width: 500,
      rotation: 0,
      document: {
        baseFontSize: 14,
        blocks: [
          {
            id: "date-tag",
            type: "paragraph",
            blockAttributes: {
              fontSize: 14,
              fontFamily: "Inter",
              color: "#94A3B8",
              alignment: "center",
              lineHeight: 1.2,
              letterSpacing: 8,
              paragraphSpacing: 0,
            },
            content: [
              {
                text: "COMING SOON TO ALL SCREENS",
                attributes: {
                  color: "#94A3B8",
                },
              },
            ],
          },
        ],
      },
    },
  ],
};

export const SAMPLE_AURORA_BOX = {
  baseFontSize: 46,
  fill: {
    type: "gradient",
    color1: "#8B5CF6",
    color2: "#06B6D4",
    angle: 90,
  },
  shadow: {
    color: "rgba(6, 182, 212, 0.45)",
    blur: 18,
    offsetX: 0,
    offsetY: 4,
  },
  blocks: [
    {
      id: "aurora-title",
      type: "paragraph",
      blockAttributes: {
        fontSize: 46,
        fontFamily: "Montserrat",
        color: "#FFFFFF",
        alignment: "center",
        lineHeight: 1.2,
        letterSpacing: 2,
        paragraphSpacing: 0.4,
      },
      content: [
        {
          text: "AURORA ",
          attributes: {
            bold: true,
            color: "#FFFFFF",
          },
        },
        {
          text: "HOLOGRAPHIC",
          attributes: {
            bold: true,
            color: "#06B6D4",
          },
        },
      ],
    },
    {
      id: "aurora-sub",
      type: "paragraph",
      blockAttributes: {
        fontSize: 18,
        fontFamily: "Inter",
        color: "#E2E8F0",
        alignment: "center",
        lineHeight: 1.3,
        letterSpacing: 1,
        paragraphSpacing: 0,
      },
      content: [
        {
          text: "Direct rich typography document loaded via JSON",
          attributes: {
            italic: true,
            color: "#CBD5E1",
          },
        },
      ],
    },
  ],
};
