
export enum Intensity {
  MILD = 'Mild',
  MODERATE = 'Moderate',
  SPICY = 'Spicy',
  EXTREME = 'Extreme'
}

export interface SlangItem {
  term: string;
  pronunciation?: string;
  meaning: string;
  literalTranslation?: string;
  origin?: string;
  intensity: Intensity;
  usageContext: string;
  exampleSentence: string;
}

export interface SlangCollection {
  location: string;
  cultureNote: string;
  slangs: SlangItem[];
}
