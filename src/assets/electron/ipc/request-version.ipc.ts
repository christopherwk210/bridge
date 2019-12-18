// Import package for versioning
import * as pkg from '../../../package.json';

import { IpcMainHandler, IpcMainHandlerClass, IpcMessageEvent } from '../shared/ipc-main-handler';

@IpcMainHandler({
  event: 'request-version'
})
export class RequestVersion implements IpcMainHandlerClass {
  action(event: IpcMessageEvent) {
    event.returnValue = pkg.version;
  }
}
