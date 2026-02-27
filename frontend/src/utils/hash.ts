
// Browser-side SHA-256 computation using the Web Crypto API.
// This lets the frontend show a LIVE hash preview as the user edits nonce or data fields, without needing to call the backend.

export async function computeHashClient( id: number,nonce: number, data: string, prevHash: string): Promise<string> {
// Build the same canonical string as the backend: "id|nonce|data|prev_hash"
  const input = `${id}${nonce}${data}${prevHash}`;

  // Encode the input string as UTF-8 bytes, which is what the Web Crypto API expects.
  const msgBuffer = new TextEncoder().encode(input);

  // Use the Web Crypto API to compute the SHA-256 hash of the input string.
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert the hash from an ArrayBuffer to a hex string, which is the format used by the backend.
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function isValidHash(hash: string): boolean {
  return hash.startsWith('0000');
}
