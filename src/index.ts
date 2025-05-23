/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import express, { Request, Response } from "express";
import "dotenv/config";
import { readAndRequireFiles } from "./functions";
const { commands } = require("./functions/pluginHandler");
import { WaMessage } from "./utils/Message";

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT } = process.env;

// Type definitions for webhook message payload
interface Message {
  from: string;
  id: string;
  type: string;
  text?: { body: string };
}

interface WebhookEntry {
  changes: [
    {
      value: {
        metadata: { phone_number_id: string };
        messages?: Message[];
      };
    }
  ];
}

interface WebhookRequestBody {
  entry?: WebhookEntry[];
}

console.log("Starting server...");

console.log("Loading Plugins...");
readAndRequireFiles("./src/plugins").then(() => {
  console.log(`Loaded ${commands.length} plugins.`);
});

app.post(
  "/webhook",
  async (req: Request<{}, {}, WebhookRequestBody>, res: Response) => {
    console.log("Received webhook event");
    const body = req.body;
    //console.log(JSON.stringify(body, null, 2));
    const event = new WaMessage(body);
    if (event.type === "message" && event.messageType === "text") {
      const command = commands.find(
        (cmd: { pattern: { test: (arg0: string) => any } }) => {
          if (cmd.pattern) {
            console.log(`Checking command: ${cmd.pattern}`);
            if (event.button_id) {
              return cmd.pattern.test(event.button_id);
            } else {
              return cmd.pattern.test(event.messageBody as string);
            }
          }
          return false;
        }
      );
      if (command) {
        console.log(`Executing command: ${command.pattern}`);
        command.function(event, event.messageBody as string);
      }
    }

    res.sendStatus(200);
  }
);

app.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge as string);
    console.log("Webhook verified successfully!");
  } else {
    res.sendStatus(403);
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
