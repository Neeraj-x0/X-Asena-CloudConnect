import axios, { AxiosRequestConfig } from "axios";
import processMedia from "../functions/processMedia";
import { isUrl } from "../functions";

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
  button_id: any;
  description: any;

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
      this.timestamp = message.timestamp;
      this.userName = contactInfo?.profile?.name || "";
      this.userId = contactInfo?.wa_id || "";

      if (
        message.type === "interactive" &&
        message.interactive?.type === "button_reply"
      ) {
        const buttonReply = message.interactive.button_reply;
        this.messageType = "text";
        this.messageBody = buttonReply.title; // The button text
        this.message = buttonReply; // Setting body to button text
        this.button_id = buttonReply.id; // Adding button ID as a new property
      } else if (
        message.type === "interactive" &&
        message.interactive?.type === "list_reply"
      ) {
        const listReply = message.interactive.list_reply;
        this.messageType = "text";
        this.messageBody = listReply.title; // The list text
        this.message = listReply; // Setting body to list text
        this.description = listReply.description; // Adding list description as a new property
        this.button_id = listReply.id; // Adding list ID as a new property
      } else {
        this.messageType = message.type;
        this.messageBody = message.text?.body || null;
        this.message = { body: message.text?.body || "" };
      }
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
    context: Record<string, any> = {}
  ): Promise<void> {
    if (!id) {
      throw new Error("Recipient ID is required.");
    }
    if (!message) {
      throw new Error("Message content is required.");
    }
    if (context && typeof context !== "object") {
      throw new Error("Context options must be an object.");
    }
    if (context.reply === true) {
      context.message_id = this.id;
      delete context.reply;
    }
    if (context.caption) {
      delete context.caption;
    }

    const obj: Record<string, any> = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: id,
      type: Object.keys(message)[0],
      ...message,
      context: Object.keys(context || {}).length > 0 ? context : undefined,
    };

    const data = JSON.stringify(obj);

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
      if (error instanceof Error) {
        console.error("Error sending message:", error);
      } else {
        console.error("An unknown error occurred:", error);
      }
    }
  }

  /**
   * Uploads media to WhatsApp using the official WhatsApp Business API.

   * @param filePath - The URL or file path or buffer to the media to upload.
  
   */
  async uploadMedia(
    filePath: string | Buffer
  ): Promise<{ id: string; mediaType: string }> {
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

      const { data } = await axios.request(config);
      const res = { id: data.id, mediaType: mediaType || "unknown" };

      return res;
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
  async deleteMedia(mediaId: string): Promise<{ success: boolean }> {
    try {
      const url = `https://graph.facebook.com/v21.0/${mediaId}`;
      const params = this.phoneNumberId
        ? { phone_number_id: this.phoneNumberId }
        : {};

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

  /**
   * Sends a message to the user.
   * @param message - The message to send.
   */
  async sendText(
    message: string,
    contextOptions: Record<string, any> = {}
  ): Promise<void> {
    const recipientId = contextOptions.id || this.userId;
    this.sendMessage(recipientId, { text: { body: message } }, contextOptions);
  }

  /**
   * Sends media to the user.
   * @param data - The media data to send.
   * @param contextOptions - Additional context options for the message.
   */

  async sendMedia(
    data: string | Buffer,
    contextOptions: Record<string, any> = {}
  ): Promise<void> {
    try {
      const recipientId = contextOptions.id || this.userId;

      if (typeof data === "string" && !isUrl(data)) {
        return this.sendMessage(
          recipientId,
          {
            text: {
              body: data,
            },
          },
          contextOptions
        );
      }

      const { id: mediaId, mediaType } = await this.uploadMedia(data);

      // Send the media message with the appropriate media type (image, video, etc.)
      this.sendMessage(
        recipientId,
        {
          [mediaType]: {
            id: mediaId,
            caption: contextOptions.caption,
          },
        },
        contextOptions
      );
    } catch (error) {
      console.error("Error sending media:", error);
      throw error;
    }
  }

  async sendButtonText(
    data: {
      text: string;
      buttons: { id: string; title: string; type: string }[];
    },
    contextOptions: Record<string, any> = {}
  ): Promise<void> {
    const recipientId = contextOptions.id || this.userId;

    this.sendMessage(
      recipientId,
      {
        interactive: {
          type: "button",
          body: {
            text: data.text, // Set the text from the provided data
          },
          action: {
            buttons: data.buttons.map((button) => ({
              // Map the buttons to the required format
              type: button.type || "reply",
              reply: {
                id: button.id,
                title: button.title,
              },
            })),
          },
        },
      },
      contextOptions
    );
  }

  async sendButtonMedia(
    data: {
      text: string;
      media: string | Buffer;
      footer?: string;
      buttons: { id: string; title: string; type: string }[];
    },
    contextOptions: Record<string, any> = {}
  ) {
    const recipientId = contextOptions.id || this.userId;
    console.log(data);
    const { id, mediaType } = await this.uploadMedia(data.media);
    this.sendMessage(
      recipientId,
      {
        interactive: {
          type: "button",
          header: {
            type: mediaType,
            [mediaType]: {
              id: id,
            },
          },
          body: {
            text: data.text,
          },
          footer: {
            text: data.footer || "",
          },
          action: {
            buttons: data.buttons.map((button) => ({
              type: button.type || "reply",
              reply: {
                id: button.id,
                title: button.title,
              },
            })),
          },
        },
      },
      contextOptions
    );
  }

  async sendList(
    data: {
      header: string;
      body: string;
      footer: string;
      button: string;
      sections: {
        title: string;
        rows: { id: string; title: string; description: string }[];
      }[];
    },
    contextOptions: Record<string, any> = {}
  ): Promise<void> {
    const recipientId = contextOptions.id || this.userId;

    this.sendMessage(
      recipientId,
      {
        interactive: {
          type: "list",
          header: {
            type: "text",
            text: data.header, // Set the header text
          },
          body: {
            text: data.body, // Set the body text
          },
          footer: {
            text: data.footer, // Set the footer text
          },
          action: {
            button: data.button, // Set the button text
            sections: data.sections.map((section) => ({
              title: section.title,
              rows: section.rows.map((row) => ({
                id: row.id,
                title: row.title,
                description: row.description, // Map the rows in each section
              })),
            })),
          },
        },
      },
      contextOptions
    );
  }
}
