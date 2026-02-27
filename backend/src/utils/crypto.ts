// Pure functions for hashing and proof-of-work mining.

import { createHash } from 'crypto';

// "0000" is the classic Bitcoin-style difficulty used in demos.
const DIFFICULTY = 4;
const DIFFICULTY_PREFIX = '0'.repeat(DIFFICULTY); // "0000"

// Computes the SHA-256 hash of a block's canonical fields.

export function computeHash(id: number, nonce: number, data: string, prev_hash: string) : string {
    const input = `${id}|${nonce}|${data}|${prev_hash}`;
    return createHash('sha256').update(input).digest('hex');
}

//Checks whether a given hash satisfies the proof-of-work requirement.
// A valid hash must start with DIFFICULTY_PREFIX ("0000").

export function isValidHash(hash: string) : boolean {
    return hash.startsWith(DIFFICULTY_PREFIX);
}

// Performs proof-of-work mining for a single block.
// Mining = incrementing nonce from 0 upward until the resulting hashstarts with "0000".

export function mineBlock(id: number, data: string, prev_hash: string): { nonce: number, hash: string } {
    let nonce = 0;

    // Keep hashing with increasing nonce until we hit hash starting with '0000'

    while (true) {
        const hash = computeHash(id, nonce, data, prev_hash);

        if(isValidHash(hash)){
            console.log(`[MINE] Block #${id} mined at nonce=${nonce} hash=${hash.slice(0, 12)}...`);
            return {nonce, hash}
        }
        nonce++;
    }
}