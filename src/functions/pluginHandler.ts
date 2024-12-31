const HANDLERS = process.env.HANDLERS || "!";

interface CommandInfo {
  pattern?: string | RegExp;
  dontAddCommandList?: boolean;
  fromMe?: boolean;
  type?: string;
  function?: Function;
}

const commands: CommandInfo[] = [];

/**
 * Define a command and store it in the commands array.
 * @param {CommandInfo} commandInfo - Information about the command.
 * @param {Function} func - The function to execute when the command is triggered.
 * @returns {CommandInfo} - The command information.
 */

function command(commandInfo: CommandInfo, func: Function): CommandInfo {
  commandInfo.function = func;
  if (commandInfo.pattern) {
    commandInfo.pattern = new RegExp(
      `^${commandInfo.pattern}$`,
      "is"
    );

    
  }
  commands.push(commandInfo);

  return commandInfo;
}

export { command, commands };
