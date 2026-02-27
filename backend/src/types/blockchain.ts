

export interface Block {
  id: number;           // Auto-increment primary key (Block number shown on card)
  nonce: number;        // The magic number miners change to find a valid hash
  data: string;         // Arbitrary payload stored in this block
  prev_hash: string;    // SHA-256 hash of the PREVIOUS block (empty string for genesis)
  hash: string;         // SHA-256 hash of (id + nonce + data + prev_hash)
  mined: boolean;       // true when hash starts with "0000" (proof-of-work satisfied)
  created_at: string;   // ISO timestamp — when the block was first created
}

 // Shape sent from the frontend when a field is edited.
 // Only nonce and data are editable by the user.

 export interface UpdateBlockRequest {
    nonce: number;
    data: string;
 }

// A shape sent after a successfull mine operation

export interface MineResponse {
    block: Block;
    invalidated: number[];
}

// Generic API response wrapper so every endpoint looks the same.

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}