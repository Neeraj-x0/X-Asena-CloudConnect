import axios, { AxiosRequestConfig } from "axios";
import processMedia from "../functions/processMedia";

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
    phoneNumberId: any;

  constructor(data: any) {
    this.apiUrl = process.env.API_URL || "";
    this.authToken = process.env.GRAPH_API_TOKEN || "";
    this.phoneNumberId = process.env.PHONE_NUMBER_ID || "";

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

  /**
   * Uploads media to WhatsApp using the official WhatsApp Business API.
   * @param phoneNumberId - The phone number ID associated with your WhatsApp account.
   * @param filePath - The URL or file path to the media to upload.
   * @param mediaType - The media type (e.g., 'image/jpeg', 'video/mp4').
   */
  async uploadMedia(
    filePath: string,
    mediaType: string
  ): Promise<{ id: string }> {
    try {
      // Process the media (fetch, determine type, etc.)
      const { buffer, ext, mimeType, mediaType } = await processMedia(filePath);

      const formData = new FormData();
      if (!ext) {
        throw new Error("File extension is null or undefined.");
      }
      formData.append(
        "file",
        new Blob([buffer], { type: mimeType || "unknown" }),
        `file.${ext}` 
      );
      formData.append("type", mediaType || "file");
      formData.append("messaging_product", "whatsapp");

      const config: AxiosRequestConfig = {
        method: "post", 
        maxBodyLength: Infinity,
        url: `${this.apiUrl}/media`,
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      };

      const response = await axios.request(config);
      return response.data; // Return media upload response
    } catch (error) {
      console.error("Error uploading media:", error);
      throw error;
    }
  }

  /**
   * Deletes uploaded media from WhatsApp using the WhatsApp Business Cloud API.
   * @param mediaId - The ID of the media to delete.
   * @param phoneNumberId - Optional phone number ID for deleting media.
   */
  async deleteMedia(
    mediaId: string,
   
  ): Promise<{ success: boolean }> {
    try {
      const url = `https://graph.facebook.com/v21.0/${mediaId}`;
      const params = this.phoneNumberId ? { phone_number_id: this.phoneNumberId } : {};

      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Error deleting media:", error);
      throw error;
    }
  }
}
