// GET   /api/blocks  endpoint to fetch all blocks in the chain
// PUT   /api/blocks/:id  update nonce/data (recalculate hash, mark unmined)
// POST  /api/blocks   create a new block to add to the chain (with prev_hash = last block's hash)
// POST /api/blocks/:id/mine  perform proof-of-work mining for this block (find nonce that makes hash start with "0000")

import express, { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import { ApiResponse, Block, MineResponse, UpdateBlockRequest } from '../types/blockchain';
import { computeHash, isValidHash, mineBlock } from '../utils/crypto';

const router = express.Router();


// ─────────────────────────────────────────────────────────
// GET /api/blocks
// Returns all blocks ordered by id ascending.
// ─────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rows } = await pool.query<Block>('SELECT * FROM blocks ORDER BY id ASC');
        return res.json({ success: true, data: rows} as ApiResponse<Block[]>);
    } catch (err) {
        next(err);   // forward to errorHandler middleware
    }
})


// PUT  /api/blocks/:id
// Called whenever nonce or data is edited on the frontend.
// It recalculates the hash with the new values, and marks unmined if the new hash doesn't satisfy proof-of-work anymore.
// also invalidated all subsequent blocks since their prev_hash will be wrong after this edit.

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const blockId = req.params.id;
        if(isNaN(Number(blockId))){
            res.status(400).json({ success: false, error: 'Invalid block ID' } as ApiResponse<null>);
            return;
        }

        const { nonce, data } = req.body as UpdateBlockRequest;

        const { rows } = await pool.query<Block>(
            'SELECT * FROM blocks WHERE id = $1', [blockId]  // $1 placeholder — prevents SQL injection
        )

        if(rows.length === 0) {
            res.status(404).json({ success: false, error: 'Block not found.' })
            return;
        }

        const block = rows[0];

        const newHash = computeHash(Number(blockId), nonce, data, block.prev_hash);

        const mined = isValidHash(newHash);

        await pool.query(
            `UPDATE blocks SET nonce=$1, data=$2, hash=$3, mined=$4 WHERE id=$5`,
            [nonce, data, newHash, mined, blockId]);

        await pool.query(
            `UPDATE blocks SET mined=false WHERE id > $1`, [blockId]);

        const { rows: updatedRows } = await pool.query<Block>(
            'SELECT * FROM blocks WHERE id = $1', [blockId]);

        res.json({ success: true, data: updatedRows} as ApiResponse<Block[]>);

    } catch (err) {
        next(err);
    }
})


// ─────────────────────────────────────────────────────────
// POST /api/blocks/:id/mine
// Runs proof-of-work on the block: finds nonce so hash starts "0000".
// After mining, updates the NEXT block's prev_hash to this block's hash,
// which invalidates the next block (it must be re-mined).
// ─────────────────────────────────────────────────────────

router.post('/:id/mine', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const blockId = req.params.id;
        if(isNaN(Number(blockId))){
            res.status(400).json({ success: false, error: 'Invalid block ID' } as ApiResponse<null>);
            return;
        }

        const { rows } = await pool.query<Block>(
            'SELECT * FROM blocks WHERE id = $1', [blockId]
        )

        if(rows.length === 0) {
            res.status(404).json({ success: false, error: 'Block not found.' })
            return;
        }

        const block = rows[0];

        // ── Run proof-of-work ──

        const { nonce: winningNonce, hash: validHash } = mineBlock(
            Number(blockId),
            block.data,
            block.prev_hash
        );

        await pool.query(
            `UPDATE blocks SET nonce=$1, hash=$2, mined=true WHERE id=$3`,
            [winningNonce, validHash, blockId]
        );

        // Propagates to the next block, which is now invalid since its prev_hash doesn't match the new hash of this block.
        const { rows: nextRows } = await pool.query<Block>(
            `SELECT * FROM blocks WHERE id = $1`, [Number(blockId) + 1]
        );

        const invalidated: number[] = [];

        if(nextRows.length > 0){
            const nextBlock = nextRows[0];

            const nextNewHash = computeHash(
                nextBlock.id,
                nextBlock.nonce,
                nextBlock.data,
                validHash   // prev_hash is now the newly mined hash of the current block
            )

            const nextMined = isValidHash(nextNewHash);

            await pool.query(
                `UPDATE blocks SET prev_hash=$1, hash=$2, mined=$3 WHERE id=$4`,
                [validHash, nextNewHash, nextMined, nextBlock.id]
            )

            if(!nextMined) invalidated.push(nextBlock.id);

            // Mark all subsequent blocks as invalid too since their prev_hash will be wrong after this edit.

            if(Number(blockId) + 2 < nextBlock.id){
                await pool.query(
                    `UPDATE blocks SET mined=false WHERE id > $1`, [nextBlock.id]);

                const { rows: downstream } = await pool.query<{id: number}>(
                    `SELECT id FROM blocks WHERE id > $1`, [nextBlock.id]
                );
                downstream.forEach(row => invalidated.push(row.id));
            }
        }

        // Return the freshly mined block plus which blocks got invalidated
        const { rows: final } = await pool.query<Block>(
            `SELECT * FROM blocks WHERE id = $1`, [blockId]
        )
        res.json({ success: true, data: { block: final[0], invalidated},} as ApiResponse<MineResponse>);
    } catch (err) {
        next(err);
    }
})


// ─────────────────────────────────────────────────────────
// POST /api/blocks
// Appends a new empty block to the end of the chain.
// The new block's prev_hash is set to the last block's hash.
// ─────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get the last block in the chain to use its hash as prev_hash
        const { rows: lastRows } = await pool.query<Block>(
            `SELECT * FROM blocks ORDER BY id DESC LIMIT 1`
        );

        if(lastRows.length === 0) {
            res.status(500).json({ success: false, error: 'No blocks found in the chain.' });
            return;
        }

        const prev_hash = lastRows[0].hash;

        // Insert a new block with default values and the prev_hash from above
        const { rows } = await pool.query<Block>(
            `INSERT INTO blocks (nonce, data, prev_hash, hash, mined) VALUES (0, '', $1, '', false) RETURNING *`, [prev_hash]
        );
        res.status(201).json({ success: true, data: rows[0],} as ApiResponse<Block>);
    } catch (err) {
        next(err);
    }
})

export default router;