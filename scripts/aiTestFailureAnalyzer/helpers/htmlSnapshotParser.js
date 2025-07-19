import fs from 'fs';
import * as cheerio from 'cheerio';

export function parseValidationMessages(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);
  const messages = [];
  // Look for validation messages in elements with class 'validation-message-text'
  $('.validation-message-text').each((_, el) => {
    const messageText = $(el).clone().children('br,i').remove().end().text().trim();
    // Try to extract example format from <i> inside the message
    const example = $(el).find('i').first().text().trim() || undefined;
    if (messageText) {
      messages.push({ message: messageText, example });
    }
  });
  return messages;
}
