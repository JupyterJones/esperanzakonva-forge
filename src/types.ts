export interface TextRunAttributes {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface TextRun {
  text: string;
  attributes: TextRunAttributes;
}

export interface BlockAttributes {
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: "left" | "center" | "right" | "justify";
  lineHeight: number;
  letterSpacing: number;
  paragraphSpacing: number;
  fontWeight?: number;
  listType?: "bullet" | "number";
  listStyle?: "disc" | "circle" | "square" | "decimal" | "★" | "✓";
}

export interface TextBlock {
  id: string;
  type: "paragraph" | "list-item";
  blockAttributes: BlockAttributes;
  content: TextRun[];
}

export interface TextShadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface GradientFill {
  type: "gradient";
  color1: string;
  color2: string;
  angle: number;
}

export interface DocumentCurve {
  enabled: boolean;
  amount: number; // degrees: positive bends up, negative bends down
}

export interface RichTextDocument {
  baseFontSize: number;
  blocks: TextBlock[];
  shadow?: TextShadow;
  fill?: GradientFill;
  curve?: DocumentCurve;
}

export interface FormattingState {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string;
  strokeWidth: number;
  strokeColor: string;
  alignment: "left" | "center" | "right" | "justify";
  lineHeight: number;
  letterSpacing: number;
  paragraphSpacing: number;
  isList: boolean;
  listStyle?: string;
  canUndo: boolean;
  canRedo: boolean;
}
