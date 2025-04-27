'use client';

import { Fragment, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode | ((props: { isFullscreen: boolean }) => React.ReactNode);
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      }
    };
    
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isFullscreen) {
        onClose();
      }
    };
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, isFullscreen]);

  const toggleFullscreen = async () => {
    if (!isFullscreen && modalRef.current) {
      await modalRef.current.requestFullscreen();
    } else if (isFullscreen) {
      await document.exitFullscreen();
    }
  };
  
  if (!mounted) return null;
  
  return isOpen ? createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'} bg-black/70 backdrop-blur-sm`}>
      <div 
        ref={modalRef}
        className={`bg-gray-900 border ${isFullscreen ? 'border-0 fixed inset-0 m-0 rounded-none w-screen h-screen max-h-none' : 'border-gray-800 rounded-xl max-h-[calc(100vh-2rem)]'} shadow-2xl relative overflow-auto ${className}`}
        style={isFullscreen ? { padding: 0 } : {}}
      >
        <div className="absolute top-3 right-3 z-10 flex space-x-2">
          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 16h12M6 8h12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={isFullscreen ? 'h-full' : ''}>
          {typeof children === 'function' ? children({ isFullscreen }) : (!isFullscreen && children)}
        </div>
      </div>
    </div>,
    document.body
  ) : null;
}; 