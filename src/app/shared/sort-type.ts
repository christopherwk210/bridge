/* Chart sorting types */

export enum SortType {
  NEWEST,
  OLDEST,
  SONG_NAME_ASC,
  SONG_NAME_DES,
  ARTIST_NAME_ASC,
  ARTIST_NAME_DES,
  ALBUM_NAME_ASC,
  ALBUM_NAME_DES,
  DIFFUCULTY_ASC,
  DIFFUCULTY_DES
}

export const sortTypeReadable = [
  'Newest First',
  'Oldest First',
  'By Song Name (Ascending)',
  'By Song Name (Descending)',
  'By Artist Name (Ascending)',
  'By Artist Name (Descending)',
  'By Album Name (Ascending)',
  'By Album Name (Descending)',
  'By Difficulty (Ascending)',
  'By Difficulty (Descending)'
];
