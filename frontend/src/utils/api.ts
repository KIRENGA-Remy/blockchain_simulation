 // All HTTP requests related to the blockchain simulation backend API are defined here. 

import type { ApiResponse, Block, MineResponse } from "../types/blockchain";

 const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function request<T>(
    path: string,
    options?: RequestInit    // standard fetch options (method, body, etc.)
): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json'}, // we always send JSON, even if body is empty (e.g. for GET requests)
        ...options  
    });

    const json: ApiResponse<T> = await response.json();

    if(!json.success){
        throw new Error(json.error || 'API request failed');
    }

    return json.data as T;
}

// Fetch all blocks from the backend ordered by id 
export async function fetchBlocks(): Promise<Block[]>{
    return await request<Block[]>('/blocks');
}

// Update a block's nonce and data (called when user edits these fields on the frontend)
export async function updateBlock(id: number, nonce: number, data: string): Promise<Block> {
    return await request<Block>(`/blocks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nonce, data })
    });
}

// Trigger the mining process for a block (called when user clicks "Mine" button on the frontend)
export async function mineBlock(id: number): Promise<MineResponse> {
    return await request<MineResponse>(`/blocks/${id}/mine`, {
        method: 'POST', // POST because mining is an action not a resource update
    })
}

// Create a new block with prev_hash = last block's hash (called when user clicks "Add Block" button on the frontend)
export async function addBlock(): Promise<Block> {
    return request<Block>('/blocks', {
        method: 'POST', // POST because we're creating a new resource
    })
}