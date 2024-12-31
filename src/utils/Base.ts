import axios, { AxiosRequestConfig } from "axios";

export class Base {
  id!: string;
  type: "message" | "status" = "message";
  messageType?: string;
  messageBody?: string;
  status?: string;
  timestamp!: string;
  message?: {
    body: string;
  };
  userName?: string;
  userId?: string;
  recipientId?: string;

  private apiUrl: string;
  private authToken: string;

  constructor(data: any) {
    this.apiUrl = process.env.API_URL || "";
    this.authToken = process.env.GRAPH_API_TOKEN || "";

    if (!this.apiUrl || !this.authToken) {
      throw new Error(
        "API URL or API Key is not defined in environment variables."
      );
    }

    this.parseMessage(data);
  }

  /**
   * Parses incoming WhatsApp messages and statuses and assigns values to class attributes.
   * @param data - The incoming WhatsApp Webhook payload.
   */
  private parseMessage(data: any): void {
    const changes = data.entry?.[0]?.changes?.[0]?.value;

    if (!changes) {
      throw new Error("Invalid data format.");
    }

    const contactInfo = changes.contacts?.[0];

    if (changes.messages) {
      const message = changes.messages[0];
      this.id = message.id;
      this.type = "message";
      this.messageType = message.type;
      this.messageBody = message.text?.body || null;
      this.message = { body: message.text?.body || "" };
      this.timestamp = message.timestamp;
      this.userName = contactInfo?.profile?.name || "";
      this.userId = contactInfo?.wa_id || "";
    } else if (changes.statuses) {
      const status = changes.statuses[0];
      this.id = status.id;
      this.type = "status";
      this.status = status.status;
      this.timestamp = status.timestamp;
      this.recipientId = status.recipient_id;
    } else {
      throw new Error("Unsupported data type.");
    }
  }

  /**
   * Sends a WhatsApp message using the WhatsApp Business Cloud API.
   * @param id - The recipient's WhatsApp ID.
   * @param message - The message content.
   * @param contextOptions - Additional context options for the message.
   */
  async sendMessage(
    id: string,
    message: Record<string, any>,
    contextOptions: Record<string, any> = {}
  ): Promise<void> {
    if (!id) {
      throw new Error("Recipient ID is required.");
    }
    if (!message) {
      throw new Error("Message content is required.");
    }

   console.log(this.type)

    const data = JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: id,
      ...message,
      ...contextOptions,
    });

    const config: AxiosRequestConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${this.apiUrl}/messages`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
      },
      data,
    };

    try {
      const response = await axios.request(config);
      console.log("Message sent successfully:", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
}
