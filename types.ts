
export type LinkSide = 'top' | 'right' | 'bottom' | 'left';
export type ResizeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface Link {
  id: string;
  from: string; // pin id
  to: string; // pin id
  fromSide: LinkSide;
  toSide: LinkSide;
  color?: string;
}

export interface BasePin {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface ImagePin extends BasePin {
  type: 'image';
  url: string;
  file: File;
}

export interface TextPin extends BasePin {
  type: 'text';
  content: string;
  color: string;
  fontSize?: number;
}

export interface ColorPin extends BasePin {
  type: 'color';
  hex: string;
}

export interface BoardDnaPin extends BasePin {
  type: 'board-dna';
  dna: BoardDna;
}

export interface ImageSuggestionsPin extends BasePin {
  type: 'image-suggestions';
  suggestions: ImageSuggestion[];
}

export interface RemixesPin extends BasePin {
  type: 'remixes';
  remixes: Remix[];
}

export interface DoNextPin extends BasePin {
  type: 'do-next';
  doNext: string[];
}

export interface StyleGuide {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  };
  typography: {
    font_family: string;
    examples: {
      role: string;
      details: string;
    }[];
  };
  layout: {
    pattern: string;
    description: string;
  };
}

export interface StyleGuidePin extends BasePin {
  type: 'style-guide';
  styleGuide: StyleGuide;
}

export interface TagPin extends BasePin {
  type: 'tag';
  content: string;
  category: 'form' | 'material' | 'lever' | 'default';
}


export type Pin = ImagePin | TextPin | ColorPin | BoardDnaPin | ImageSuggestionsPin | RemixesPin | DoNextPin | StyleGuidePin | TagPin;


export interface BoardDna {
  palette: string[];
  forms: string[];
  textures_materials: string[];
  composition: string[];
  type_ui_tokens: string[];
  interaction_vibe: string[];
  evidence: { pin_id: string; cue: string }[];
}

export interface Remix {
  name: string;
  lever: string;
  source_pins: string[];
  instructions: string[];
  expected_effect: string;
}

export interface StyleFit {
  artifact_id: string;
  token_map: {
    [key: string]: string | number;
  };
  apply_steps: string[];
}

export interface ImageSuggestion {
  card_id: string;
  prompt: string;
  derived_from: string[];
  use_cases: string[];
}

export interface Tension {
  name:string;
  evidence_pin: string;
  nudge: string;
}

export interface FlowBoardResponse {
  skill_inference: 'novice' | 'intermediate' | 'expert';
  board_dna: BoardDna;
  remixes: Remix[];
  style_fit: StyleFit[];
  image_suggestions: ImageSuggestion[];
  tensions: Tension[];
  do_next: string[];
  style_guide: StyleGuide;
}

export interface Background {
  type: 'color' | 'image';
  value: string;
}
