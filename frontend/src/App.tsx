import React from "react";
import {useBlockchain } from "./hooks/useBlockchain";
import './styles/global.css'
import { BlockCard } from "./components/BlockCard";
import { ChainLink } from "./components/ChainLink";

export default function App() {

  const { 
    blocks,
    loading,
    error,
    busyIds,
    handleEdit,
    handleMine,
    handleAdd } = useBlockchain();

    if(loading){
      return (
        <div className="min-h-screen pt-10 px-6 pb-20">
          <p className="text-center py-12 px-5 text-slate-500 max-w-130 my-0 mx-auto leading-relaxed flex items-center justify-center gap-2">Loading blockchain from database
            <span className="inline-block w-4 h-4 border-2 border-slate-600 border-t-sky-500 rounded-full animate-spin align-middle"></span>
          </p>
        </div>
      )
    }

    if(error){
      return (
        <div className="min-h-screen pt-10 px-6 pb-20">
          <p className="text-center py-12 px-5 max-w-130 my-0 mx-auto leading-relaxed text-red-500">⚠ {error}</p>
        </div>
      )
    }
  return (
    <div className="min-h-screen pt-10 px-6 pb-20">
      <header className="flex flex-col justify-center items-center text-center">
        <h1 className="text-[2.2rem] font-extrabold text-slate-50 mb-2">
          <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">Blockchain Simulation{" "}</span>
          Demo
        </h1>
        <p className="text-[0.9rem] text-white max-w-130 my-0 mx-auto leading-relaxed">
          Each block contains a <strong>Nonce</strong>, <strong>Data</strong>, and the
          previous block's <strong>Hash</strong>. Mining finds a Nonce that makes the block's
          hash start with <code>0000</code>. Editing any field invalidates the block&nbsp;and all
          blocks after it.
        </p>
      </header>

      <div className="flex justify-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-300" />
          <span>Mined / Valid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <span>Tampered / Invalid</span>
        </div>
      </div>

      {/* Chain of blocks */}
      <div className="flex items-start gap-0 overflow-x-auto pt-4 px-2 pb-6 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
        { blocks.map((block, index) => (
          <React.Fragment key={block.id}>
            <BlockCard 
              block={block}
              isFirst={index === 0}
              isBusy={busyIds.has(block.id)}
              onEdit={handleEdit}
              onMine={handleMine}
            />
            { index < blocks.length - 1 && ( 
              <ChainLink valid={block.mined && blocks[index + 1].mined} /> 
            )}
           
          </React.Fragment>
        ))}

        {
          blocks.length > 0 && (
            <div className="flex items-center pl-3 mt-16 shrink-0">
              <button className="flex flex-col items-center gap-1.5 py-3.5 px-4.5 bg-transparent border-2 border-dashed border-slate-600 rounded-xl text-slate-500 text-xs font-semibold cursor-pointer tracking-[0.3px] transition-[border-color,color,background] duration-200 whitespace-nowrap" onClick={handleAdd}>
                <span className="text-[1.4rem] leading-none">+</span> 
                Add block
              </button>
            </div>
          )}
      </div>
    </div>
  )
}