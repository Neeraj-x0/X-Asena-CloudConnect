import { fromBuffer } from "file-type";

async function processMedia(input: string | Buffer): Promise<{
  buffer: Buffer;
  ext: string | null;
  mimeType: string | null;
  mediaType: string | null;
}> {
  let buffer: Buffer;
  let ext: string | null = null;
  let mimeType: string | null = null;
  let mediaType: string | null = null;

  if (typeof input === "string") {
    try {
      const response = await fetch(input);
      if (!response.ok) {
        throw new Error(`Failed to fetch media from URL: ${input}`);
      }
      buffer = Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching media from URL: ${error.message}`);
      } else {
        throw new Error("Error fetching media from URL: Unknown error");
      }
    }
  } else if (Buffer.isBuffer(input)) {
    buffer = input;

  } else {
    throw new Error("Invalid input type. Expected URL or Buffer.");
  }

  try {
    const fileType = await fromBuffer(buffer);
    
    if (fileType) {
      ext = fileType.ext;
      mimeType = fileType.mime;
      mediaType = fileType.mime.split("/")[0];
    } else {
      throw new Error("Could not determine file type.");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error determining file type: ${error.message}`);
    } else {
      throw new Error("Error determining file type: Unknown error");
    }
  }

  return { buffer, ext, mimeType, mediaType };
}


export default processMedia;