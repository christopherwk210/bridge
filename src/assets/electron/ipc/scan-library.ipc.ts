import { IpcMainHandler, IpcMainHandlerClass, IpcMessageEvent } from '../shared/ipc-main-handler';

import { walk } from '../walk';

@IpcMainHandler({
  event: 'scan-library'
})
export class ScanLibrary implements IpcMainHandlerClass {
  async action(event: IpcMessageEvent, path) {
    const result = await this.scanLibrary(path[0]);
    event.sender.send('scan-complete', result);
  }

  async scanLibrary(libraryDirectory: string) {
    const results = await walk(libraryDirectory);
    return results;
  }
}
