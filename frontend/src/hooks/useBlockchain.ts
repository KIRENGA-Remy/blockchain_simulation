import { useCallback, useEffect, useState } from "react";
import type { Block } from "../types/blockchain";
import { addBlock, fetchBlocks, mineBlock, updateBlock } from "../utils/api";

export interface UseBlockchainReturn {
    blocks: Block[];
    loading: boolean;
    error: string | null;
    busyIds: Set<number>;
    handleEdit: (id: number, none: number, data: string) => Promise<void>;
    handleAdd: () => Promise<void>
    handleMine: (id: number) => Promise<void>
}

// Component is mounted means is rendered and displayed on UI
export function UseBlockchain(): UseBlockchainReturn {

    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [busyIds, setBusyIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        //meaning of useEffect, run this inside codes after component renders

        let cancelled = false;   // Means component is not still being displayed on UI
        (async () => {
           try {
            const data = await fetchBlocks();
            if(!cancelled){
                setBlocks(data);
            }
           } catch (err) {
            if(!cancelled){
                setError((err as Error).message)
            }
           } finally {
            if(!cancelled){
                setLoading(false);
            }
           }
        })
        return () => { cancelled = true}   // This line will run when the component is not still being displaye on UI, This prevents memory leaks.
    }, [])    // Meaning of this dependency array, Run only once after first render

    const handleEdit = useCallback(async (id: number, nonce: number, data: string) : Promise<void> => {
        try {
            await updateBlock(id, nonce, data);
            const fresh = await fetchBlocks();
            setBlocks(fresh);
        } catch (err) {
            setError((err as Error).message);
        }
    }, []);

    const handleMine = useCallback(async (id: number) : Promise<void> => {
        setBusyIds(prev => new Set(prev).add(id));
        try {
            await mineBlock(id);
            const fresh = await fetchBlocks();
            setBlocks(fresh);
        } catch (err) {
            setError(( err as Error).message);
        } finally {
        setBusyIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
        })
    }
    }, []);

    const handleAdd = useCallback(async () : Promise<void> => {
        try {
            await addBlock();
            const fresh = await fetchBlocks();
            setBlocks(fresh);
        } catch (err) {
            setError((err as Error).message);
        }
    }, []);

    return { blocks, loading, error, busyIds, handleAdd, handleEdit, handleMine};

}