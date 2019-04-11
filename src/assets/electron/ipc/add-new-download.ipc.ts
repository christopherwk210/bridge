import { IpcMainHandler, IpcMainHandlerClass, IpcMessageEvent } from '../shared/ipc-main-handler';

import { downloadManager } from '../download-manager';
import { tempPath } from '../shared/paths';

@IpcMainHandler({
  event: 'add-new-download'
})
export class AddNewDownload implements IpcMainHandlerClass {
  action(event: IpcMessageEvent, data) {
    downloadManager.addDownload(data, tempPath);
  }
}
