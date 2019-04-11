import { IpcMainHandler, IpcMainHandlerClass, IpcMessageEvent } from '../shared/ipc-main-handler';

import * as fs from 'fs';
import { settingsPath } from '../shared/paths';

@IpcMainHandler({
  event: 'save-settings'
})
export class SaveSettings implements IpcMainHandlerClass {
  action(event: IpcMessageEvent, settings: any) {
    try {
      const contents = JSON.stringify(settings, null, 2);
      fs.writeFileSync(settingsPath, contents, 'utf8');
    } catch (e) {
      console.log(e);
    }

    event.returnValue = true;
  }
}
