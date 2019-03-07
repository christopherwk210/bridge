/* Implemented chart sorting methods */

import { SongResult } from './interfaces/song-result.interface';
import { SortType } from './sort-type';

export function getSortTypeFunction(sortType: SortType) {
  const orderedSortFunctions = [
    sortByNewest,
    sortByOldest,
    sortByNameAscending,
    sortByNameDescending,
    sortByArtistNameAscending,
    sortByArtistNameDescending,
    sortByAlbumNameAscending,
    sortByAlbumNameDescending,
    sortByGuitarDifficultyAscending,
    sortByGuitarDifficultyDescending
  ];

  return orderedSortFunctions[sortType];
}

function sortByProperty(songResultA: SongResult, songResultB: SongResult, property: string, direction: 'ascending' | 'descending') {
  const propA = songResultA[property];
  const propB = songResultB[property];

  if (direction === 'ascending') {
    if (propA < propB) return -1;
    if (propA > propB) return 1;
  } else {
    if (propA > propB) return -1;
    if (propA < propB) return 1;
  }

  return 0;
}

export function sortByNewest(songResultA: SongResult, songResultB: SongResult) {
  const dateA = new Date(songResultA.uploadedAt);
  const dateB = new Date(songResultB.uploadedAt);

  if (dateA > dateB) return -1;
  if (dateA < dateB) return 1;
  return 0;
}

export function sortByOldest(songResultA: SongResult, songResultB: SongResult) {
  const dateA = new Date(songResultA.uploadedAt);
  const dateB = new Date(songResultB.uploadedAt);

  if (dateA < dateB) return -1;
  if (dateA > dateB) return 1;
  return 0;
}

export function sortByNameAscending(songResultA: SongResult, songResultB: SongResult) {
  return sortByProperty(songResultA, songResultB, 'name', 'ascending');
}

export function sortByNameDescending(songResultA: SongResult, songResultB: SongResult) {
  return sortByProperty(songResultA, songResultB, 'name', 'descending');
}

export function sortByArtistNameAscending(songResultA: SongResult, songResultB: SongResult) {
  return sortByProperty(songResultA, songResultB, 'artist', 'ascending');
}

export function sortByArtistNameDescending(songResultA: SongResult, songResultB: SongResult) {
  return sortByProperty(songResultA, songResultB, 'artist', 'descending');
}

export function sortByAlbumNameAscending(songResultA: SongResult, songResultB: SongResult) {
  return sortByProperty(songResultA, songResultB, 'album', 'ascending');
}

export function sortByAlbumNameDescending(songResultA: SongResult, songResultB: SongResult) {
  return sortByProperty(songResultA, songResultB, 'album', 'descending');
}

export function sortByGuitarDifficultyAscending(songResultA: SongResult, songResultB: SongResult) {
  return sortByProperty(songResultA, songResultB, 'diff_guitar', 'ascending');
}

export function sortByGuitarDifficultyDescending(songResultA: SongResult, songResultB: SongResult) {
  return sortByProperty(songResultA, songResultB, 'diff_guitar', 'descending');
}

