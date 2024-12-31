import { command } from "../functions";
command(
  { pattern: "hello" },
  // @ts-ignore
  async (api, params) => {
    api.sendText("Hello World", { reply: true })
  }
);

