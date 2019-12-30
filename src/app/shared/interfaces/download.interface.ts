export enum DownloadState {
  waitingForResponse,
  failedToRespond,
  download,
  downloadFailed,
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
  errorMessage?: string
  tempFolder: string
}