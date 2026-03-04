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
      <div className="min-h-screen pt-10 px-6 pb-20 bg-slate-900">
          <header className="flex flex-col items-center text-center mb-8">
              <h1 className="text-[2.2rem] font-extrabold text-slate-50 mb-2">
                  <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">
                      Blockchain Simulation{" "}
                  </span>
                  Demo
              </h1>
              <p className="text-[0.9rem] text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Each block contains a <strong className="text-sky-400">Nonce</strong>, <strong className="text-sky-400">Data</strong>, and the
                  previous block's <strong className="text-sky-400">Hash</strong>. Mining finds a Nonce that makes the block's
                  hash start with <code className="bg-slate-800 px-1 py-0.5 rounded">0000</code>. Editing any field invalidates the block and all
                  blocks after it.
              </p>
          </header>

          {/* Legend */}
          <div className="flex justify-center gap-6 mb-8 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span>Mined / Valid</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span>Tampered / Invalid</span>
              </div>
          </div>

          {/* Chain of blocks */}
          <div className="flex items-start gap-1 overflow-x-auto pb-6 px-2 [scrollbar-width:thin] [scrollbar-color:#334155_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
              {blocks.map((block, index) => (
                  <React.Fragment key={block.id}>
                      <BlockCard 
                          block={block}
                          isFirst={index === 0}
                          isBusy={busyIds.has(block.id)}
                          onEdit={handleEdit}
                          onMine={handleMine}
                      />
                      {index < blocks.length - 1 && ( 
                          <ChainLink valid={block.mined && blocks[index + 1]?.mined || false} /> 
                      )}
                  </React.Fragment>
              ))}

              {/* Add Block Button */}
              {blocks.length > 0 && (
                  <div className="flex items-center pl-4 shrink-0">
                      <button 
                          className="group flex flex-col items-center gap-2 py-4 px-6 
                                  bg-slate-800/50 hover:bg-slate-700/60 
                                  border-2 border-dashed border-slate-600 hover:border-sky-500
                                  rounded-xl text-slate-400 hover:text-sky-400
                                  text-xs font-semibold tracking-[0.3px]
                                  transition-all duration-200
                                  whitespace-nowrap
                                  hover:scale-105" 
                          onClick={handleAdd}
                      >
                          <span className="text-2xl leading-none group-hover:rotate-90 transition-transform duration-300">
                              +
                          </span> 
                          <span>Add Block</span>
                          <span className="text-[10px] text-slate-500 group-hover:text-sky-500/70">
                              append to chain
                          </span>
                      </button>
                  </div>
              )}
          </div>
      </div>
  );
}