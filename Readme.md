# X-Asena-CloudConnect

**X-Asena** is a messaging platform built on the official WhatsApp Business API, designed to streamline communication with customers. It offers real-time, interactive messaging, including automated responses, media sharing, and secure communication.

## Features
- Real-time messaging
- Automated responses
- Media sharing (images, documents, etc.)
- Secure communication
- Easy integration with existing workflows

## Requirements
- **Node.js** (v14 or higher)
- **WhatsApp Business API Access**: Ensure you have access to the official WhatsApp API.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/X-Asena-CloudConnect.git
    ```

2. Navigate to the project directory:
    ```bash
    cd X-Asena-CloudConnect
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Set up environment variables by creating a `.env` file in the root directory:
    ```env
    PORT=3001
    WEBHOOK_VERIFY_TOKEN=verify_token
    API_URL=https://graph.facebook.com/v21.0/559240403930865
    GRAPH_API_TOKEN=your-graph-api-token
    ```

## License

This project is licensed under the MIT License.

