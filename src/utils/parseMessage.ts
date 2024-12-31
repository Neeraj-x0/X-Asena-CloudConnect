type ParsedMessage = {
  id: string;
  type: "message" | "status";
  messageType?: string;
  messageBody?: string;
  status?: string;
  timestamp: string;
  message?: {
    body: string;
  };
  userName?: string;
  userId?: string;
  recipientId?: string;
};

function parseMessage(data: any): ParsedMessage | null {
  const changes = data.entry?.[0]?.changes?.[0]?.value;

  if (!changes) {
    return null;
  }

  const contactInfo = changes.contacts?.[0];
  
  if (changes.messages) {
    const message = changes.messages[0];
    return {
      id: message.id,
      type: "message",
      messageType: message.type,
      messageBody: message || null,
      message: message[message.type].body || message[message.type],
      timestamp: message.timestamp,
      userName: contactInfo.profile?.name || "",
      userId: contactInfo.wa_id || "",
    };
  } else if (changes.statuses) {
    const status = changes.statuses[0];
    return {
      id: status.id,
      type: "status",
      status: status.status,
      timestamp: status.timestamp,
      recipientId: status.recipient_id,
    };
  }

  return null;
}

export default parseMessage;
