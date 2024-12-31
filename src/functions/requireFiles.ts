import fs from "fs/promises";
import path from "path";

const readAndRequireFiles = async (directory: string): Promise<any[]> => {
  try {
    const files = await fs.readdir(directory);
    return Promise.all(
      files
        .filter((file) => path.extname(file).toLowerCase() === ".js")  // Use .js after compiling
        .map((file) => require(path.resolve(directory, file)))  // Use absolute path
    );
  } catch (error) {
    console.error("Error reading and requiring files:", error);
    throw error;
  }
};


export default readAndRequireFiles;