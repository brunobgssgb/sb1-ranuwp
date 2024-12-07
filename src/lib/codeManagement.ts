import { Code } from '../types';

export function cleanCode(code: string): string {
  return code.replace(/\D/g, '');
}

export function validateCode(code: string): boolean {
  const cleaned = cleanCode(code);
  return cleaned.length === 16;
}

export function validateCodes(newCodes: string[], existingCodes: Code[]): {
  validCodes: string[];
  duplicates: string[];
  systemDuplicates: string[];
} {
  const cleanedNewCodes = newCodes
    .map(code => cleanCode(code))
    .filter(code => validateCode(code));

  const seen = new Set<string>();
  const duplicates = new Set<string>();
  const systemDuplicates = new Set<string>();
  const validCodes = new Set<string>();

  const existingCodeSet = new Set(existingCodes.map(code => cleanCode(code.code)));

  cleanedNewCodes.forEach(code => {
    if (seen.has(code)) {
      duplicates.add(code);
    } else if (existingCodeSet.has(code)) {
      systemDuplicates.add(code);
    } else {
      seen.add(code);
      validCodes.add(code);
    }
  });

  return {
    validCodes: Array.from(validCodes),
    duplicates: Array.from(duplicates),
    systemDuplicates: Array.from(systemDuplicates)
  };
}

export async function processCodes(
  codes: string[],
  batchSize: number,
  onProgress: (progress: number) => void,
  processCode: (code: string) => Promise<void>
): Promise<void> {
  const total = codes.length;
  let processed = 0;

  for (let i = 0; i < total; i += batchSize) {
    const batch = codes.slice(i, i + batchSize);
    await Promise.all(batch.map(code => processCode(code)));
    processed += batch.length;
    onProgress((processed / total) * 100);
  }
}