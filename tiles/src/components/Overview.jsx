import { useRef, useEffect } from 'react';
import Tile from './Tile.jsx';

const TILE_SIZE = 512;
const OVERVIEW_SIZE = 200;


export default function Overview({
  zoom,
  position,
  viewportWidth,
  viewportHeight,
  gridWidth,
  gridHeight,
  onDragStart,
  onClick,
}) {
  const miniMapRef = useRef(null);

  const fullMapSize = (2 ** zoom) * TILE_SIZE;

  const viewportRect = {
    left: (position.x / fullMapSize) * OVERVIEW_SIZE,
    top: (position.y / fullMapSize) * OVERVIEW_SIZE,
    width: (viewportWidth / fullMapSize) * OVERVIEW_SIZE,
    height: (viewportHeight / fullMapSize) * OVERVIEW_SIZE,
  };

  useEffect(() => {
    if (!miniMapRef.current) return;
    miniMapRef.current.addEventListener('click', (e) => {
      if (!onClick) return;
      const rect = miniMapRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      onClick(clickX / OVERVIEW_SIZE, clickY / OVERVIEW_SIZE);
    });
  }, [onClick]);

  return (
    <div
      ref={miniMapRef}
      className="fixed bottom-4 right-4 z-50 border border-gray-400 rounded overflow-hidden shadow-md bg-[#222]"
      style={{ width: OVERVIEW_SIZE, height: OVERVIEW_SIZE }}
    >
      <Tile
        className="w-full h-full object-cover"
        zoom={0}
        x={0}
        y={0}
        tileSize={OVERVIEW_SIZE}
      />
      <div
        className="absolute border-2 border-yellow-400 bg-yellow-400/30 pointer-events-none box-border rounded"
        style={{
          left: viewportRect.left,
          top: viewportRect.top,
          width: Math.min(viewportRect.width, OVERVIEW_SIZE - 2),
          height: Math.min(viewportRect.height, OVERVIEW_SIZE - 2),
        }}
        onMouseDown={onDragStart}
      />
    </div>
  );
}
