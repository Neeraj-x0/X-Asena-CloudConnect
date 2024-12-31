import { Base } from "./Base";

export class WaMessage extends Base {
  constructor(data: any) {
    super(data);
  }
  
  /**
   * Sends a message to the user.
   * @param message - The message to send.
   */
  async sendText(id: string, message: string): Promise<void> {
    this.sendMessage(id, { text: { body: message } });
  }
}


