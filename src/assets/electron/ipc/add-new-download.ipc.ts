import { IpcMainHandler, IpcMainHandlerClass, IpcMessageEvent } from '../shared/ipc-main-handler';

import { downloadManager } from '../download-manager';
import { tempPath } from '../shared/paths';
import { AddNewDownloadData } from '../../../app/shared/interfaces/download.interface';

@IpcMainHandler({
  event: 'add-new-download'
})
export class AddNewDownload implements IpcMainHandlerClass {
  action(event: IpcMessageEvent, data: AddNewDownloadData) {
    downloadManager.addDownload(data, tempPath);
  }
}
