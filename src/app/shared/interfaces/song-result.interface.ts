export interface SongResult {
  name: string;
  album: string;
  artist: string;
  charter: string;
  genre: string;

  directLinks?: {
    archive?: string;
    'album.png'?: string;
    chart?: string;
    ini?: string;
    'song.mp3'?: string;
    'song.ogg'?: string;
  };
  link: string;

  effectiveLength: number;
  length: number;

  sources: {
    name: string;
    link: string;
  }[];

  noteCounts: {
    guitar?: {
      x: number;
    };
  };

  lastModified: string;
  uploadedAt: string;
  year: string;

  hasBackground: boolean;
  hasBrokenNotes: boolean;
  hasForced: boolean;
  hasLyrics: boolean;
  hasNoAudio: boolean;
  hasOpen: {
    guitar?: boolean;
  };
  hasSections: boolean;
  hasSoloSections: boolean;
  hasStarPower: boolean;
  hasStems: boolean;
  hasTap: boolean;
  hasVideo: boolean;

  /** Added metadata */
  imageLoaded: boolean;
}
