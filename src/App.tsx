import React, { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';
import { track } from '@vercel/analytics';

interface PlacedSquare {
  id: string;
  size: number;
  x: number;
  y: number;
  locked: boolean;
}

interface SquareCount {
  size: number;
  total: number;
  remaining: number;
}

const GRID_SIZE = 45;
const CELL_SIZE = 14; // pixels per grid cell
const BOARD_SIZE = GRID_SIZE * CELL_SIZE;

// Color mapping for each square size
const SQUARE_COLORS: { [key: number]: string } = {
  1: '#000000',
  2: '#015436',
  3: '#F18402', 
  4: '#042E7D',
  5: '#900035',
  6: '#037CBB',
  7: '#F4C104',
  8: '#614530',
  9: '#C4CAC4'
};



function App() {
  // Track page view on component mount
  useEffect(() => {
    track('app_loaded');
  }, []);

  // Calculate initial counts for all square sizes
  const getInitialCounts = () => {
    return Array.from({ length: 9 }, (_, i) => {
      const size = i + 1;
      const total = size;
      return {
        size,
        total,
        remaining: total,
      };
    });
  };

  // Initialize with empty board
  const [squareCounts, setSquareCounts] = useState<SquareCount[]>(getInitialCounts());
  const [placedSquares, setPlacedSquares] = useState<PlacedSquare[]>([]);
  const [draggedSquare, setDraggedSquare] = useState<{ size: number; id: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverBoard, setDragOverBoard] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number; size: number; valid: boolean } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, size: number, existingSquareId?: string) => {
    if (existingSquareId) {
      // Dragging an existing placed square
      setDraggedSquare({ size, id: existingSquareId });
    } else {
      // Dragging from toolbar
      const id = `square-${size}-${Date.now()}-${Math.random()}`;
      setDraggedSquare({ size, id });
    }
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', size.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverBoard(true);

    if (!draggedSquare || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate grid position with offset to center the square under the mouse
    const halfSquareSize = (draggedSquare.size * CELL_SIZE) / 2;
    const rawGridX = (x - halfSquareSize) / CELL_SIZE;
    const rawGridY = (y - halfSquareSize) / CELL_SIZE;
    
    // Snap to grid and ensure bounds
    const gridX = Math.max(0, Math.min(Math.round(rawGridX), GRID_SIZE - draggedSquare.size));
    const gridY = Math.max(0, Math.min(Math.round(rawGridY), GRID_SIZE - draggedSquare.size));

    // Check if placement would be valid
    const wouldFitInBounds = gridX >= 0 && gridY >= 0 && gridX + draggedSquare.size <= GRID_SIZE && gridY + draggedSquare.size <= GRID_SIZE;
    
    const wouldOverlap = placedSquares.some(square => {
      return !(
        gridX >= square.x + square.size ||
        gridX + draggedSquare.size <= square.x ||
        gridY >= square.y + square.size ||
        gridY + draggedSquare.size <= square.y
      );
    });

    const isValid = wouldFitInBounds && !wouldOverlap;

    setPreviewPosition({
      x: gridX,
      y: gridY,
      size: draggedSquare.size,
      valid: isValid
    });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set dragOverBoard to false if we're leaving the board itself, not a child element
    if (e.currentTarget === e.target) {
      setDragOverBoard(false);
      setPreviewPosition(null);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverBoard(false);
    setPreviewPosition(null);
    setDraggedSquare(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverBoard(false);
    setPreviewPosition(null);
    
    if (!draggedSquare || !boardRef.current) {
      console.log('No dragged square or board ref');
      setIsDragging(false);
      setDraggedSquare(null);
      return;
    }

    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Use the same calculation as in handleDragOver
    const halfSquareSize = (draggedSquare.size * CELL_SIZE) / 2;
    const rawGridX = (x - halfSquareSize) / CELL_SIZE;
    const rawGridY = (y - halfSquareSize) / CELL_SIZE;
    
    // Snap to grid and ensure bounds
    const gridX = Math.max(0, Math.min(Math.round(rawGridX), GRID_SIZE - draggedSquare.size));
    const gridY = Math.max(0, Math.min(Math.round(rawGridY), GRID_SIZE - draggedSquare.size));

    // Check if square fits within bounds
    if (gridX < 0 || gridY < 0 || gridX + draggedSquare.size > GRID_SIZE || gridY + draggedSquare.size > GRID_SIZE) {
      console.log('Square does not fit within bounds');
      setIsDragging(false);
      setDraggedSquare(null);
      return;
    }

    // Check if this is an existing square being repositioned
    const existingSquare = placedSquares.find(s => s.id === draggedSquare.id);
    const isRepositioning = !!existingSquare;

    // Check for overlaps with existing squares (excluding the one being moved)
    const wouldOverlap = placedSquares.some(square => {
      if (isRepositioning && square.id === draggedSquare.id) return false; // Ignore the square being moved
      return !(
        gridX >= square.x + square.size ||
        gridX + draggedSquare.size <= square.x ||
        gridY >= square.y + square.size ||
        gridY + draggedSquare.size <= square.y
      );
    });

    if (wouldOverlap) {
      console.log('Square would overlap with existing square');
      setIsDragging(false);
      setDraggedSquare(null);
      return;
    }

    if (isRepositioning) {
      // Update existing square position
      console.log('Repositioning square:', draggedSquare.id);
      setPlacedSquares(prev =>
        prev.map(square =>
          square.id === draggedSquare.id
            ? { ...square, x: gridX, y: gridY }
            : square
        )
      );

      // Track square repositioning event
      track('square_repositioned', {
        size: draggedSquare.size,
        new_position: `${gridX},${gridY}`,
        total_squares: placedSquares.length
      });
    } else {
      // Place new square from toolbar
      const newSquare: PlacedSquare = {
        id: draggedSquare.id,
        size: draggedSquare.size,
        x: gridX,
        y: gridY,
        locked: false,
      };

      console.log('Placing new square:', newSquare);
      setPlacedSquares(prev => [...prev, newSquare]);
      setSquareCounts(prev =>
        prev.map(count =>
          count.size === draggedSquare.size
            ? { ...count, remaining: count.remaining - 1 }
            : count
        )
      );

      // Track square placement event
      track('square_placed', {
        size: draggedSquare.size,
        position: `${gridX},${gridY}`,
        total_squares: placedSquares.length + 1
      });
    }

    setIsDragging(false);
    setDraggedSquare(null);
  }, [draggedSquare, placedSquares]);

  const handleRightClick = (e: React.MouseEvent, squareId: string) => {
    e.preventDefault();
    
    const squareToRemove = placedSquares.find(s => s.id === squareId);
    if (!squareToRemove || squareToRemove.locked) return;

    // Track square removal event
    track('square_removed', {
      size: squareToRemove.size,
      total_squares: placedSquares.length - 1
    });

    setPlacedSquares(prev => prev.filter(s => s.id !== squareId));
    setSquareCounts(prev =>
      prev.map(count =>
        count.size === squareToRemove.size
          ? { ...count, remaining: count.remaining + 1 }
          : count
      )
    );
  };

  const handleSquareDoubleClick = (e: React.MouseEvent, squareId: string) => {
    e.preventDefault();
    
    setPlacedSquares(prev =>
      prev.map(square =>
        square.id === squareId
          ? { ...square, locked: !square.locked }
          : square
      )
    );
  };

  const handleReset = () => {
    // Track board reset event
    track('board_reset', {
      squares_placed: placedSquares.length
    });
    
    // Reset to empty board
    setPlacedSquares([]);
    setSquareCounts(getInitialCounts());
    setDraggedSquare(null);
    setIsDragging(false);
    setDragOverBoard(false);
    setPreviewPosition(null);
  };



  return (
    <div className="app">
      <div className="rules-section">
        <h2>Partridge Tiling Puzzle Solver</h2>
        <p className="puzzle-attribution">
          Inspired by the <a href="https://www.janestreet.com/puzzles/some-ones-somewhere-index/" target="_blank" rel="noopener noreferrer">Jane Street June 2025 Puzzle</a>
        </p>
        
        <div className="rules-grid">
          <div className="rule-item">
            <span className="rule-icon">🎯</span>
            <span>Drag squares from inventory to board</span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">🖱️</span>
            <span>Right-click to remove squares</span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">🔒</span>
            <span>Double-click to lock/unlock squares</span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">🟢</span>
            <span>Green = valid placement</span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">🔴</span>
            <span>Red = invalid placement</span>
          </div>
        </div>
      </div>
      
      <div className="game-container">
        <div className="game-main">
          <div className="board-section">
            <div className="board-controls">
              <button className="control-button reset-button" onClick={handleReset} title="Clear Board">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
                </svg>
                Clear Board
              </button>
            </div>
            
            <div className="board-container">
              <div
                ref={boardRef}
                className={`board ${dragOverBoard ? 'drag-over' : ''}`}
                style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragLeave={handleDragLeave}
              >
                {/* Grid lines */}
                <svg className="grid-lines" width={BOARD_SIZE} height={BOARD_SIZE}>
                  {Array.from({ length: GRID_SIZE + 1 }, (_, i) => (
                    <g key={i}>
                      <line
                        x1={i * CELL_SIZE}
                        y1={0}
                        x2={i * CELL_SIZE}
                        y2={BOARD_SIZE}
                        stroke="var(--grid-lines)"
                        strokeWidth={0.5}
                      />
                      <line
                        x1={0}
                        y1={i * CELL_SIZE}
                        x2={BOARD_SIZE}
                        y2={i * CELL_SIZE}
                        stroke="var(--grid-lines)"
                        strokeWidth={0.5}
                      />
                    </g>
                  ))}
                </svg>

                {/* Placed squares */}
                {placedSquares.map(square => (
                  <div
                    key={square.id}
                    className={`placed-square ${square.locked ? 'locked' : ''}`}
                    style={{
                      left: square.x * CELL_SIZE,
                      top: square.y * CELL_SIZE,
                      width: square.size * CELL_SIZE,
                      height: square.size * CELL_SIZE,
                      backgroundColor: square.locked 
                        ? `${SQUARE_COLORS[square.size]}CC` // Add transparency for locked
                        : SQUARE_COLORS[square.size],
                      opacity: square.locked ? 0.8 : 1,
                    }}
                    draggable={!square.locked}
                    onDragStart={(e) => !square.locked && handleDragStart(e, square.size, square.id)}
                    onDragEnd={handleDragEnd}
                    onContextMenu={(e) => handleRightClick(e, square.id)}
                    onDoubleClick={(e) => handleSquareDoubleClick(e, square.id)}
                  >
                    {square.size}
                  </div>
                ))}

                {/* Preview square */}
                {previewPosition && (
                  <div
                    className={`preview-square ${previewPosition.valid ? 'valid' : 'invalid'}`}
                    style={{
                      left: previewPosition.x * CELL_SIZE,
                      top: previewPosition.y * CELL_SIZE,
                      width: previewPosition.size * CELL_SIZE,
                      height: previewPosition.size * CELL_SIZE,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="toolbar-section">
            <div className="toolbar">
              {squareCounts.map(({ size, remaining }) => {
                // Scale squares to fit within container while maintaining proportions
                const minSize = 16; // Minimum size for smallest squares to be grabbable
                const maxSize = 46; // Max size for display in toolbar (50px container - padding)
                const scaledSize = size * 5; // Scale factor
                const displaySize = Math.max(minSize, Math.min(scaledSize, maxSize));
                
                return (
                  <div key={size} className="toolbar-square-container">
                    <div className="toolbar-square-area">
                      <div
                        className={`toolbar-square ${isDragging && draggedSquare?.size === size ? 'dragging' : ''} ${remaining === 0 ? 'exhausted' : ''}`}
                        style={{
                          width: displaySize,
                          height: displaySize,
                          backgroundColor: remaining > 0 ? SQUARE_COLORS[size] : '#cccccc',
                          opacity: remaining > 0 ? 1 : 0.5,
                        }}
                        draggable={remaining > 0}
                        onDragStart={(e) => remaining > 0 && handleDragStart(e, size)}
                        onDragEnd={handleDragEnd}
                      >
                        {remaining === 0 ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="check-icon">
                            <path 
                              d="M20 6L9 17L4 12" 
                              stroke="#10b981" 
                              strokeWidth="3" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          size
                        )}
                      </div>
                    </div>
                    <div className="remaining-info">
                      <div className="remaining-count">{remaining}</div>
                      <div className="remaining-label">left</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 