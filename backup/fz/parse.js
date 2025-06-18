import { promises as fs } from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

/**
 * Processes all html files in a folder, extracts the main element from each,
 * and saves the results to a JSON file.
 * @param {string} folderPath - Path to the folder containing txt files
 * @returns {Promise<void>}
 */
export async function processTxtFiles(folderPath) {
  try {
    // Read all files in the folder
    const files = await fs.readdir(folderPath);

    // Filter to only include html files
    const htmlFiles = files.filter(
      (file) => path.extname(file).toLowerCase() === '.html'
    );

    console.log(`Found ${htmlFiles.length} txt files to process`);

    // Process each file and collect results
    const results = [];
    const lines = [];

    for (const file of htmlFiles) {
      const filePath = path.join(folderPath, file);
      try {
        // Read the file content
        const content = await fs.readFile(filePath, 'utf8');

        // Create a new JSDOM instance
        const dom = new JSDOM(content);

        // Query the element
        const element = dom.window.document.querySelector(
          '.ringtone + b + br + br + div'
        );

        // Add the result to our array
        results.push({
          fileName: file,
          lyrics: element
            ? element.innerHTML
                .split('\n')
                .filter((line) => {
                  if (!line || line.includes('<!--') || line === '<br>') {
                    return false;
                  }

                  return true;
                })
                .map((l) => {
                  const line = l
                    .replace(/<br>/g, '')
                    .replace(/<[^>]*>?/gm, '')
                    .replace(/\[(.*?):\]/gm, '')
                    .replace(/&amp;/g, 'and');
                  lines.push(line.trim());
                  return line;
                })
            : null,
        });

        console.log(`Processed ${file}`);
      } catch (fileError) {
        console.error(`Error processing file ${file}:`, fileError.message);
      }
    }

    // Write results to JSON file
    await fs.writeFile('results.json', JSON.stringify(results, null, 2));
    await fs.writeFile('zappa.txt', lines.join('\n'));
    console.log('Results saved to results.json');
  } catch (error) {
    console.error('Error processing folder:', error.message);
    throw error;
  }
}

processTxtFiles('./lyrics');
