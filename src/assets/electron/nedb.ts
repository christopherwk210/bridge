import * as Datastore from 'nedb';
import { libraryPath } from './shared/paths';

export const libraryStore = new Datastore({
  filename: libraryPath,
  autoload: true
});
