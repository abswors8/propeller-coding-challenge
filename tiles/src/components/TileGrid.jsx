import Tile from './Tile';

export default function TileGrid({gridWidth, gridHeight, width, height, position, zoom, tileSize}) {
    // Function to calculate visible tiles based on position and zoom level
    // A couple of extra tiles are added to reduce flickering during panning
    function getVisibleTiles(position, zoom, width, height, tileSize) {
        const numTiles = 2 ** zoom;
        const tilesPerRow = Math.ceil(width / tileSize) + 3;
        const tilesPerCol = Math.ceil(height / tileSize) + 3;
        const startX = Math.floor(position.x / tileSize);
        const startY = Math.floor(position.y / tileSize);
        const endX = startX + tilesPerRow;
        const endY = startY + tilesPerCol;
      
        const tiles = [];
        for (let x = startX; x <= endX; x++) {
          for (let y = startY; y <= endY; y++) {
            if (x >= 0 && y >= 0 && x < numTiles && y < numTiles) {
              tiles.push({ x, y, zoom });
            }
          }
        }
        return tiles;
    }
    const visibleTiles = getVisibleTiles(position, zoom, width, height, tileSize);
    const tiles = visibleTiles.map(({ x, y, zoom }) => <Tile key={`${x}-${y}-${zoom}`} zoom={zoom} x={x} y={y} tileSize={tileSize}/>);
      
    return (
        <div
            className="relative bg-dark text-primary p-4 rounded"
            style={{
              width: Math.max(gridWidth, width),
              height: Math.max(gridHeight, height),
            }}
        >
            <div
              className="absolute"
              style={{
                left: (Math.max(gridWidth, width) - gridWidth) / 2,
                top: (Math.max(gridHeight, height) - gridHeight) / 2,
                width: gridWidth,
                height: gridHeight,
              }}
            >
              {tiles}
            </div>
        </div>

    );
}