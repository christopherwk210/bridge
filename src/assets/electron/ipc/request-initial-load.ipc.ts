import { IpcMainHandler, IpcMainHandlerClass, IpcMessageEvent } from '../shared/ipc-main-handler';

import * as fs from 'fs';
import { initialSettings } from '../shared/initial-settings';
import { dataPath, settingsPath, tempPath, themesPath } from '../shared/paths';

@IpcMainHandler({
  event: 'request-initial-load'
})
export class RequestInitialLoad implements IpcMainHandlerClass {
  action(event: IpcMessageEvent) {
    const responseChannel = 'request-initial-load-response';

    try {
      // Create data directories if they don't exists
      if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);
      if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
      if (!fs.existsSync(themesPath)) fs.mkdirSync(themesPath);

      // Read/create settings
      const settingsExists = fs.existsSync(settingsPath);

      const contents = settingsExists ?
        fs.readFileSync(settingsPath, 'utf8') :
        JSON.stringify(initialSettings, null, 2);

      if (!settingsExists) fs.writeFileSync(settingsPath, contents, 'utf8');

      // Send back the settings object
      event.sender.send(responseChannel, contents);
    } catch (error) {
      console.log(error);
      event.sender.send(responseChannel, '{ error: true }');
    }
  }
}
