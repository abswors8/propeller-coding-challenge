export const TILE_SIZE = 512; 
export const MIN_ZOOM = 0;
export const MAX_ZOOM = 3;
export const SMALL_MAP_SIZE = 200;

export function calculateZoomPosition(container, newZoom, zoom) {
    const prevZoom = zoom;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const prevGridWidth = TILE_SIZE * 2 ** prevZoom;
    const prevGridHeight = TILE_SIZE * 2 ** prevZoom;
    const newGridWidth = TILE_SIZE * 2 ** newZoom;
    const newGridHeight = TILE_SIZE * 2 ** newZoom;
    const prevGridOffsetX = Math.max(containerWidth - prevGridWidth, 0) / 2;
    const prevGridOffsetY = Math.max(containerHeight - prevGridHeight, 0) / 2;
    
    const newGridOffsetX = Math.max(containerWidth - newGridWidth, 0) / 2;
    const newGridOffsetY = Math.max(containerHeight - newGridHeight, 0) / 2;
    const centerX = container.scrollLeft - prevGridOffsetX + containerWidth / 2;
    const centerY = container.scrollTop - prevGridOffsetY + containerHeight / 2;
    
    const mapX = centerX / prevGridWidth;
    const mapY = centerY / prevGridHeight;

    const newCenterX = mapX * newGridWidth;
    const newCenterY = mapY * newGridHeight;
    
    const newScrollX = newCenterX - containerWidth / 2 + newGridOffsetX;
    const newScrollY = newCenterY - containerHeight / 2 + newGridOffsetY;

    return { newScrollX, newScrollY };
}

