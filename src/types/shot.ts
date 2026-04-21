export interface Shot {
  id: string;
  sequence: number;
  timeCode: string;
  shotType: string;
  cameraMove: string;
  description: string;
  lighting: string;
  drama: string;
  dialogue: string;
  seedancePrompt: string;
  generatedImage?: string;
  status: 'pending' | 'generated' | 'error';
  createdAt: number;
  updatedAt: number;
}

export type DirectorStyle = 
  | 'anime' 
  | 'pixar_3d' 
  | 'watercolor' 
  | 'oil_painting' 
  | 'ink_wash'
  | 'comic'
  | 'pixel_art'
  | 'claymation'
  | 'ukiyoe'
  | 'gongbi'
  | 'paper_cut'
  | 'donghua_xianxia'
  | 'noir'
  | 'surreal'
  | 'french_illus';

export interface ShotColumn {
  key: keyof Shot;
  label: string;
  width: string;
  editable: boolean;
  highlight?: boolean;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  shotCount: number;
}
