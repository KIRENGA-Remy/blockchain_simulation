import type React from "react";

interface ChainLinkProps {
    valid: boolean;
}

export const ChainLink: React.FC<ChainLinkProps> = ({ valid }) => {
    return (
        <div className="flex items-center py-0 px-1 mt-16 shrink-0" aria-hidden="true">
            <svg 
                className={`w-12 h-6 ${valid ? 'text-blue-500' : 'text-red-500'}`}
                viewBox="0 0 48 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <line
                    x1="0"
                    y1="12"
                    x2="40"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                />
                <polyline 
                    points="33,5 41,12 33,19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};