import type React from "react";
import type { Block } from "../types/blockchain";
import { useEffect, useRef, useState } from "react";
import { computeHashClient, isValidHash } from "../utils/hash";

interface BlockCardProps {
    block: Block;   // To return block data from the server
    isBusy: boolean;
    isFirst: boolean;
    onEdit: (id: number, nonce: number, data: string) => Promise<void>
    onMine: (id: number) => Promise<void>
}

export const BlockCard: React.FC<BlockCardProps> = ({block, isBusy, isFirst, onEdit, onMine}) => {
    const [localNonce, setLocalNonce ] = useState<number>(block.nonce);
    const [localData, setLocalData] = useState<string>(block.data);

    const [liveHash, setLiveHash] = useState<string>(block.hash);
    const [isDirty, setIsDirty] = useState<boolean>(false);

    useEffect(() =>{
        setLocalNonce(block.nonce);
        setLocalData(block.data);
        setLiveHash(block.hash);
        setIsDirty(false);
    }, [block]);

    // Compute hash on every local change
    useEffect(() => {
        const updateHash = async () => {
            try {
                const hash = await computeHashClient(block.id, localNonce, localData, block.prev_hash);
                setLiveHash(hash);
            } catch (error) {
                console.error("Hash computation failed:", error);
            }
        };
        
        updateHash();
        setIsDirty(localNonce !== block.nonce || localData !== block.data);
    }, [localNonce, localData, block.id, block.nonce, block.data, block.prev_hash]);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if(isFirstRender.current){
            isFirstRender.current = false;  // skip the first mount
            return;
        }
    }, []);

    const isLocallyValid = block.mined && !isDirty;

    const cardBg = isLocallyValid ? '#e0f2fe' : '#fee2e2';
    const cardBorder = isLocallyValid ? '#7dd3fc' : '#fca5a5';
    const hashColor = isValidHash(liveHash) ? '#16a34a' : '#b45309';
    
    const handleBlur = () => {
        if(isDirty) {
            onEdit(block.id, localNonce, localData);
        }
    };

    return (
        <div className="w-85 h-80 border border-solid rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.12)] shrink-0 flex flex-col" style={{ background: cardBg, borderColor: cardBorder}}>
            <div className="flex items-center gap-1.5 pb-3 border-b border-black/10 shrink-0">
                <span className="text-xs font-bold uppercase tracking-[1.5px] text-slate-500">Block</span>
                <span className="font-mono text-lg font-bold text-slate-800 flex-1">#{block.id}</span>
                <span className={`text-[0.65rem] font-bold py-1.5 px-2 rounded-full tracking-[0.3px] font-mono whitespace-nowrap
                    ${isLocallyValid ? 'bg-green-500/15 text-green-600 border border-green-500/30' : 'bg-red-600/12 text-red-600 border border-red-600/25'}`}> 
                    { isLocallyValid ? '✓ Mined' : '✗ Invalid' }
                </span>
            </div>
            {
                !isFirst && (
                    <div className="flex flex-col gap-1 mb-3">
                        <label className="text-xs font-bold uppercase tracking-[1px] text-slate-500">Prev</label>
                        <div className="font-mono text-xs break-all py-2 px-2.5 bg-black/6 rounded-lg leading-normal tracking-[0.5px] min-h-9 border border-solid border-black/8 transition-colors duration-200 text-slate-600" style={{color: hashColor}}>
                            { block.prev_hash ? block.prev_hash : <span className="text-slate-400 italic">No previous hash yet</span>}
                        </div>
                    </div>
                )
            }

            <div className="flex flex-col gap-1 mb-3">
                <label className="text-xs font-bold uppercase tracking-[1px] text-slate-500" htmlFor={`nonce-${block.id}`}>Nonce</label>
                <input 
                    id={`nonce-${block.id}`}
                    className="font-mono text-xs break-all py-2 px-2.5 border-[1.5px] border-solid border-black/12 rounded-lg bg-white/55 text-slate-800 outline-none transition-[border-color] duration-200 w-full"
                    type="number" 
                    value={localNonce}
                    onChange={(e) => setLocalNonce(Number(e.target.value))}
                    onBlur={handleBlur}
                    disabled={isBusy}
                    min={0}
                    />
            </div>

            <div className="flex flex-col gap-1 mb-3">
                <label className="text-xs font-bold uppercase tracking-[1px] text-slate-500" htmlFor={`data-${block.id}`}>Data</label>
                <textarea 
                    id={`data-${block.id}`}
                    className="font-mono text-xs break-all py-2 px-2.5 border-[1.5px] border-solid border-black/12 rounded-lg bg-white/55 text-slate-800 outline-none transition-[border-color] duration-200 w-full"
                    rows={3}
                    value={localData}
                    onChange={(e) => setLocalData(e.target.value)}
                    onBlur={handleBlur}
                    disabled={isBusy}
                    placeholder="Enter block data"
                />
            </div>

            <div className="flex flex-col gap-1 mb-3">
                <label className="text-xs font-bold uppercase tracking-[1px] text-slate-500">Hash</label>
                <div
                    className="font-mono text-xs break-all py-2 px-2.5 bg-black/6 rounded-lg leading-normal tracking-[0.5px] min-h-9 border border-solid border-black/8 transition-colors duration-200" style={{ color: hashColor}}
                    title={liveHash}
                >
                    <span className="hash-full">{liveHash || '-'}</span>
                </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-3.5 border-t border-solid border-t-black/8">
                <button
                className={`flex items-center gap-1.75 py-2 px-4.5 bg-[#0ea5e9] text-white border-none rounded-lg text-xs font-bold cursor-pointer tracking-[0.3px] transition-all ${isBusy ? 'bg-[#7c3aed] animate-pulse' : ''} `}
                onClick={() => onMine(block.id)}
                disabled={ isBusy || isLocallyValid}  // can't mine if already valid, or busy
                title={isLocallyValid ? 'Block is already mined' : 'Run proof-of-work mining'}
                >
                    { isBusy ? (
                        <>
                        <span className="inline-block w-3 h-3 border-2 border-solid border-white/40 border-t-white rounded-full animate-spin"/>
                        Mining... 
                        </>
                    ) : (
                        <>⛏ Mine </>
                    )}
                </button>

                {/* Show nonce found after mining */}
                {
                    block.mined && !isDirty && (
                        <span className="font-mono text-xs text-green-600 tracking-[0.3px]">
                            Nonce found: {block.nonce.toLocaleString()}
                        </span>
                    )
                }
            </div>
        </div>
    )
}