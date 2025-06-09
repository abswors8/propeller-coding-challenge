import { useState, useEffect, useRef } from 'react';
import Tile from './Tile.jsx'; 
import Overview from './Overview.jsx';

const TILE_SIZE = 512;
const MIN_ZOOM = 0;
const MAX_ZOOM = 3;
const OVERVIEW_SIZE = 200;


function Map() {
    const [zoom, setZoom] = useState(0);
    const [position, setScrollPosition] = useState({ x: 0, y: 0 });
    const scrollContainerRef = useRef(null);
    const [mode, setMode] = useState('arrow');
    const [isDraggingViewport, setIsDraggingViewport] = useState(false);
    const miniMapRef = useRef(null);
    const [isDraggingMap, setIsDraggingMap] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const isDraggingMapRef = useRef(false);


    const viewportWidth = 1400;
    const viewportHeight = 800;
    const numTiles = 2 ** zoom;
    const gridWidth = numTiles * TILE_SIZE;
    const gridHeight = numTiles * TILE_SIZE;
    const tilesPerRow = Math.ceil(viewportWidth / TILE_SIZE) + 3; 
    const tilesPerCol = Math.ceil(viewportHeight / TILE_SIZE) + 3;
    const startX = Math.floor(position.x / TILE_SIZE);
    const startY = Math.floor(position.y / TILE_SIZE); 
    const endX = startX + tilesPerRow;
    const endY =startY + tilesPerCol;

    const tiles = [];
  
    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
          if (x >= 0 && y >= 0 && x < 2 ** zoom && y < 2 ** zoom) {
            tiles.push(
                <Tile zoom={zoom} x={x} y={y} tileSize={TILE_SIZE} />
            );
          }
        }
    }
    // Handle scroll position updates
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
    
        let ticking = false;
    
        const handleScroll = () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              setScrollPosition({
                x: container.scrollLeft,
                y: container.scrollTop,
              });
              ticking = false;
            });
            ticking = true;
          }
        };
    
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);
    // Handle viewport dragging
    useEffect(() => {
        const handleMouseMove = (e) => {
          if (!isDraggingViewport || !miniMapRef.current) return;
      
          const rect = miniMapRef.current.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;
      
          // Calculate scroll based on mini map click position
          const relativeX = Math.max(0, Math.min(offsetX / OVERVIEW_SIZE, 1));
          const relativeY = Math.max(0, Math.min(offsetY / OVERVIEW_SIZE, 1));
      
          const newScrollLeft = relativeX * gridWidth - scrollContainerRef.current.clientWidth / 2;
          const newScrollTop = relativeY * gridHeight - scrollContainerRef.current.clientHeight / 2;
      
          scrollContainerRef.current.scrollTo({
            left: newScrollLeft,
            top: newScrollTop,
            behavior: 'auto'
          });
        };
      
        const stopDragging = () => setIsDraggingViewport(false);
      
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', stopDragging);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', stopDragging);
        };
    }, [isDraggingViewport, gridWidth, gridHeight]);
      
    const handleZoom = (newZoom) => {
        const container = scrollContainerRef.current;
        if (!container) return;
      
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
      
        setZoom(newZoom);
      
        requestAnimationFrame(() => {
          const newCenterX = mapX * newGridWidth;
          const newCenterY = mapY * newGridHeight;
      
          const newScrollX = newCenterX - containerWidth / 2 + newGridOffsetX;
          const newScrollY = newCenterY - containerHeight / 2 + newGridOffsetY;
      
          container.scrollTo({
            left: newScrollX,
            top: newScrollY,
            behavior: 'instant',
          });
        });
    };
    
    const handleClick= (e) => {
        e.stopPropagation();
        const rect = miniMapRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const relativeX = Math.max(0, Math.min(clickX / OVERVIEW_SIZE, 1));
        const relativeY = Math.max(0, Math.min(clickY / OVERVIEW_SIZE, 1));

        const scrollX = relativeX * gridWidth - scrollContainerRef.current.clientWidth / 2;
        const scrollY = relativeY * gridHeight - scrollContainerRef.current.clientHeight / 2;

        scrollContainerRef.current.scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: 'smooth',
        });
    };
    const fullMapSize = (2 ** zoom) * TILE_SIZE;

    const viewportRect = {
      left: (position.x / fullMapSize) * OVERVIEW_SIZE,
      top: (position.y / fullMapSize) * OVERVIEW_SIZE,
      width: (viewportWidth / fullMapSize) * OVERVIEW_SIZE,
      height: (viewportHeight / fullMapSize) * OVERVIEW_SIZE,
    };
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
      
        const handleMouseMove = (e) => {
          if (!isDraggingMap || mode !== 'grab') return;
      
          const dx = e.clientX - dragStartRef.current.x;
          const dy = e.clientY - dragStartRef.current.y;
      
          container.scrollLeft -= dx;
          container.scrollTop -= dy;
      
          dragStartRef.current = { x: e.clientX, y: e.clientY };
        };
      
        const handleMouseUp = () => {
          if (isDraggingMap) setIsDraggingMap(false);
        };
      
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      }, [isDraggingMap, mode]);
      
      

      useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
      
        let scrollAccumulator = 0;
      
        const handleWheel = (e) => {
          if (mode !== 'grab') return;
      
          e.preventDefault();
          scrollAccumulator += e.deltaY;
          const ZOOM_THRESHOLD = 100;
          if (Math.abs(scrollAccumulator) < ZOOM_THRESHOLD) return;
          const direction = Math.sign(scrollAccumulator);
          scrollAccumulator = 0;
          const newZoom = Math.min(Math.max(zoom - direction, MIN_ZOOM), MAX_ZOOM);
          if (newZoom === zoom) return;

          const rect = container.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;
          const mapX = container.scrollLeft + offsetX;
          const mapY = container.scrollTop + offsetY;
          const ratioX = mapX / (TILE_SIZE * 2 ** zoom);
          const ratioY = mapY / (TILE_SIZE * 2 ** zoom);
      
          const newGridWidth = TILE_SIZE * 2 ** newZoom;
          const newGridHeight = TILE_SIZE * 2 ** newZoom;
          const newScrollLeft = ratioX * newGridWidth - offsetX;
          const newScrollTop = ratioY * newGridHeight - offsetY;
    
          setZoom(newZoom);
          requestAnimationFrame(() => {
            container.scrollTo({
              left: newScrollLeft,
              top: newScrollTop,
              behavior: 'auto'
            });
          });
        };
      
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
      }, [mode, zoom]);
      

    return (
        <div
            className={`w-screen h-screen relative ${
                mode === 'grab'
                    ? isDraggingMap
                        ? 'cursor-grabbing overflow-hidden select-none'
                        : 'cursor-grab overflow-hidden select-none'
                        : 'overflow-scroll'
            } bg-black`}
            ref={scrollContainerRef}
            onMouseDown={(e) => {
                if (mode === 'grab') {
                    console.log('mousedown')
                  isDraggingMapRef.current = true;
                  dragStartRef.current = { x: e.clientX, y: e.clientY };
                  setIsDraggingMap(true);  // just to trigger cursor change
                }
            }}
              
        >

          {/* Mode toggle */}
          <div className="fixed top-2 right-2 z-50 p-2 rounded flex space-x-2 items-center">
            <button
              onClick={() => setMode('grab')}
              disabled={mode === 'grab'}
              className={`font-bold py-1 px-3 rounded ${
                mode === 'arrow'
                  ? 'bg-gray-400 hover:bg-lightBg'
                  : 'bg-primary text-white'
              }`}
            >
              ✋ Grab
            </button>
            <button
              onClick={() => setMode('arrow')}
              disabled={mode === 'arrow'}
              className={`font-bold py-1 px-3 rounded ${
                mode === 'grab'
                  ? 'bg-gray-400 hover:bg-lightBg'
                  : 'bg-primary text-white'
              }`}
            >
              🖱️ Arrow
            </button>
          </div>
      
          {/* Centered tile grid */}
          <div
            className="relative bg-dark text-primary p-4 rounded"
            style={{
              width: Math.max(gridWidth, viewportWidth),
              height: Math.max(gridHeight, viewportHeight),
            }}
          >
            <div
              className="absolute"
              style={{
                left: (Math.max(gridWidth, viewportWidth) - gridWidth) / 2,
                top: (Math.max(gridHeight, viewportHeight) - gridHeight) / 2,
                width: gridWidth,
                height: gridHeight,
              }}
            >
              {tiles}
            </div>
          </div>
      
          {/* Zoom controls */}
          <div className="fixed bottom-2 left-2 z-50 p-2 rounded flex space-x-2 items-center">
            <button
              onClick={() => handleZoom(Math.max(zoom - 1, MIN_ZOOM))}
              disabled={zoom <= MIN_ZOOM}
              className={`font-bold py-1 px-3 rounded ${
                zoom <= MIN_ZOOM
                  ? 'bg-gray-400 hover:bg-gray-400'
                  : 'bg-primary text-white hover:bg-[#e09f2d]'
              }`}
            >
              -
            </button>
            <button
              onClick={() => handleZoom(Math.min(zoom + 1, MAX_ZOOM))}
              disabled={zoom >= MAX_ZOOM}
              className={`font-bold py-1 px-3 rounded ${
                zoom >= MAX_ZOOM
                  ? 'bg-gray-400 hover:bg-gray-400'
                  : 'bg-primary text-white hover:bg-[#e09f2d]'
              }`}
            >
              +
            </button>
          </div>
      
          {/* Overview minimap */}
          <div
            ref={miniMapRef}
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
      
            {/* Viewport indicator */}
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
        </div>
      );
        
}

export default Map;