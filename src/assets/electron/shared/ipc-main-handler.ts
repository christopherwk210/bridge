import { IpcMessageEvent } from 'electron';
export { IpcMessageEvent } from 'electron';

interface IpcMainHandlerOptions {
  /** IpcMain event to listen on */
  event: string;
}

export function IpcMainHandler(options: IpcMainHandlerOptions) {
  return (constr: any) => {
    constr.prototype._options = options;
  };
}

export interface IpcMainHandlerClass {
  /**
   * Callback function that is triggered when this IpcMainHandler's event is called by the renderer
   * @param event Ipc message event data
   */
  action(event: IpcMessageEvent, ...data: any[]): any | void;
}
