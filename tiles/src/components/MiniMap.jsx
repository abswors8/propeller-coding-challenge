import Tile from './Tile';

const OVERVIEW_SIZE = 200;

export default function MiniMap({miniMapRef, setIsDraggingViewport, handleClick, position, zoom, viewportWidth, viewportHeight, tileSize}) {
  const fullMapSize = (2 ** zoom) * tileSize;

  const viewportRect = {
    left: (position.x / fullMapSize) * OVERVIEW_SIZE,
    top: (position.y / fullMapSize) * OVERVIEW_SIZE,
    width: (viewportWidth / fullMapSize) * OVERVIEW_SIZE,
    height: (viewportHeight / fullMapSize) * OVERVIEW_SIZE,
  };

  return (
    <div
      ref={miniMapRef}
      data-testid="minimap"
      className="fixed bottom-4 right-4 z-50 border border-gray-400 rounded cursor-default overflow-hidden shadow-md bg-[#222]"
      style={{
        width: OVERVIEW_SIZE,
        height: OVERVIEW_SIZE,
      }}
      onClick={handleClick}
    >
      <Tile
        className="w-full h-full object-cover"
        zoom={0}
        x={0}
        y={0}
        tileSize={OVERVIEW_SIZE}
      />
      <div
        className="absolute border-2 border-primary bg-primary/30 box-border rounded"
        style={{
          left: viewportRect.left,
          top: viewportRect.top,
          width: Math.min(viewportRect.width, OVERVIEW_SIZE-2),
          height: Math.min(viewportRect.height, OVERVIEW_SIZE-2),
        }}
        onMouseDown={() => setIsDraggingViewport(true)}
      />
    </div>
  );
}