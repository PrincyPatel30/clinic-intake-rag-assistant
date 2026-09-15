/**
 * De-identification Module (HIPAA Safe Harbor Tokens)
 * Replaces names, phone numbers, emails, dates of birth, MRNs with structured tokens.
 */

export interface DeidentifyResult {
  scrubbedText: string;
  tokenMap: Record<string, string>;
}

export function deidentifyText(rawText: string): DeidentifyResult {
  const tokenMap: Record<string, string> = {};
  let text = rawText;
  let nameCounter = 1;
  let phoneCounter = 1;
  let emailCounter = 1;
  let dateCounter = 1;
  let mrnCounter = 1;

  // 1. Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  text = text.replace(emailRegex, (match) => {
    const token = `[EMAIL_${emailCounter++}]`;
    tokenMap[token] = match;
    return token;
  });

  // 2. Phone numbers (e.g., (555) 123-4567, 555-123-4567, +1 555 123 4567)
  const phoneRegex = /(?:\+?1\s*[-.]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  text = text.replace(phoneRegex, (match) => {
    const token = `[PHONE_${phoneCounter++}]`;
    tokenMap[token] = match;
    return token;
  });

  // 3. Dates (MM/DD/YYYY, YYYY-MM-DD, Month DD, YYYY)
  const dateRegex = /\b(?:\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\b/gi;
  text = text.replace(dateRegex, (match) => {
    const token = `[DATE_${dateCounter++}]`;
    tokenMap[token] = match;
    return token;
  });

  // 4. Medical Record Number (MRN / Patient ID)
  const mrnRegex = /\b(?:MRN|ID|Patient\s*#?)[:\s]*([A-Z0-9]{6,12})\b/gi;
  text = text.replace(mrnRegex, (match, idGroup) => {
    const token = `[MRN_${mrnCounter++}]`;
    tokenMap[token] = idGroup;
    return `MRN: ${token}`;
  });

  // 5. Common self-identification patterns: "My name is John Doe", "I am Jane Smith"
  const nameIntroRegex = /\b(?:my\s+name\s+is|i\s+am|this\s+is)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g;
  text = text.replace(nameIntroRegex, (match, capturedName) => {
    const token = `[NAME_${nameCounter++}]`;
    tokenMap[token] = capturedName;
    return match.replace(capturedName, token);
  });

  return { scrubbedText: text, tokenMap };
}

export function rehydrateText(text: string, tokenMap: Record<string, string>): string {
  let restored = text;
  for (const [token, originalVal] of Object.entries(tokenMap)) {
    restored = restored.replaceAll(token, originalVal);
  }
  return restored;
}
