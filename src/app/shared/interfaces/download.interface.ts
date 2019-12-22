export enum DownloadState {
  download,
  extract,
  extractFailed,
  transfer,
  transferFailed,
  finished
}

export interface AddNewDownloadData {
  song: string,
  artist: string,
  charter: string,
  link: string,
  isArchive: boolean,
  destination: string
}

export interface Download {
  id: number
  state: DownloadState
  url: string
  song: string
  artist: string
  charter: string
  isArchive: boolean
  fileName: string
  fileType: string
  fileSize?: string
  downloaded: number
  percent: number
}

export interface UpdateDownloadData {
  id: number
  state: DownloadState
  downloaded: number
  errorMessage?: string
}