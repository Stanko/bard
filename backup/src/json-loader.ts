import { createReadStream } from 'fs';
import { Transform } from 'stream';

interface JsonParser extends Transform {
  _buffer: string;
}

// Create a streaming JSON parser
const createJsonParser = (): Transform => {
  const parser = new Transform({
    readableObjectMode: true,
    transform(
      chunk: Buffer,
      encoding: string,
      callback: (error?: Error | null) => void
    ) {
      (parser as JsonParser)._buffer += chunk.toString();
      callback();
    },
    flush(callback: (error?: Error | null) => void) {
      try {
        const result = JSON.parse((parser as JsonParser)._buffer);
        this.push(result);
        callback();
      } catch (err) {
        callback(err as Error);
      }
    },
  }) as JsonParser;

  parser._buffer = '';
  return parser;
};

// Load a single JSON file using streams
const loadJsonFile = async <T>(filePath: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const jsonParser = createJsonParser();
    const stream = createReadStream(filePath);

    const chunks: T[] = [];
    jsonParser.on('data', (chunk: T) => chunks.push(chunk));
    jsonParser.on('end', () => resolve(chunks[0]));
    jsonParser.on('error', reject);

    stream.pipe(jsonParser);
  });
};

// Load multiple JSON files in parallel
const loadJsonFiles = async <T>(
  filePathsArray: string[]
): Promise<(T | null)[]> => {
  try {
    const loadPromises = filePathsArray.map((filePath) =>
      loadJsonFile<T>(filePath).catch((err) => {
        console.error(`Error loading ${filePath}:`, err);
        return null; // Return null for failed loads but don't break the entire process
      })
    );

    return await Promise.all(loadPromises);
  } catch (err) {
    console.error('Error loading files:', err);
    throw err;
  }
};

export { loadJsonFile, loadJsonFiles };
