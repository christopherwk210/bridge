import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

/**
 * Recursive parallel directory walk
 * @param directory Directory to walk through
 */
export async function walk(directory: string) {
  const results = {
    name: '',
    path: directory,
    files: [],
    directories: []
  };

  let simpleResults = [];

  let files;
  try {
    files = await readdir(directory);
  } catch (e) {
    return { err: e };
  }

  let fileLength = files.length;
  if (!fileLength) return { results, simpleResults };

  for (const file of files) {
    const absoluteFilePath = path.resolve(directory, file);
    let fileStats;

    try {
      fileStats = await stat(absoluteFilePath);
    } catch (e) {
      return { err: e };
    }

    if (fileStats && fileStats.isDirectory()) {
      const subResults = await walk(absoluteFilePath);
      if (subResults.err) return { err: subResults.err };

      subResults.name = file;
      subResults.path = absoluteFilePath;
      results.directories.push(subResults.results);

      simpleResults.push({
        directory: true,
        name: file,
        path: absoluteFilePath,
        dirname: path.dirname(absoluteFilePath)
      });

      simpleResults = simpleResults.concat(subResults.simpleResults);

      if (!--fileLength) return { results, simpleResults };
    } else {
      results.files.push({
        name: file,
        path: absoluteFilePath
      });

      simpleResults.push({
        directory: false,
        name: file,
        path: absoluteFilePath,
        dirname: path.dirname(absoluteFilePath)
      });
      if (!--fileLength) return { results, simpleResults };
    }
  }
}
