import { useState, useEffect, useRef } from 'react';
import ZoomControls from './ZoomControls.jsx';
import ModeToggle from './ModeToggle.jsx';
import MiniMap from './MiniMap.jsx';
import TileGrid from './TileGrid.jsx';
import { calculateZoomPosition, TILE_SIZE, OVERVIEW_SIZE, MIN_ZOOM, MAX_ZOOM } from '../utils/utils.js';

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

    function getCursorClass(mode, isDraggingMap) {
        return mode === 'grab' 
            ? isDraggingMap 
                ? 'cursor-grabbing overflow-hidden select-none' 
                : 'cursor-grab overflow-hidden select-none' 
                : 'overflow-scroll'
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
      
    function scrollToPositionOnMinimap(container, relativeX, relativeY, gridWidth, gridHeight, behavior = 'smooth') {
        const scrollX = relativeX * gridWidth - container.clientWidth / 2;
        const scrollY = relativeY * gridHeight - container.clientHeight / 2;
        container.scrollTo({ left: scrollX, top: scrollY, behavior: behavior });
    }

    function handleZoom(newZoom) {
        const container = scrollContainerRef.current;
        if (!container) return;
        const { newScrollX, newScrollY } = calculateZoomPosition(container, newZoom, zoom);
        setZoom(newZoom);
        requestAnimationFrame(() => {
            container.scrollTo({ left: newScrollX, top: newScrollY, behavior: 'instant' });
        });
    }
      
    const handleClick= (e) => {
        if (!miniMapRef.current || !scrollContainerRef.current) return;
        e.stopPropagation();
        const rect = miniMapRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const relativeX = Math.max(0, Math.min(clickX / OVERVIEW_SIZE, 1));
        const relativeY = Math.max(0, Math.min(clickY / OVERVIEW_SIZE, 1));
        scrollToPositionOnMinimap(scrollContainerRef.current, relativeX, relativeY, gridWidth, gridHeight);
    };
    const handleGrabDrag = (e) => {
        if (mode === 'grab') {
            isDraggingMapRef.current = true;
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            setIsDraggingMap(true);
          }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        const miniMap = miniMapRef.current;
        if (!container) return;
      
        const handleMouseMove = (e) => {
          // Dragging the viewport on the minimap
          if (isDraggingViewport && miniMap) {
            const rect = miniMap.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
      
            const relativeX = Math.max(0, Math.min(offsetX / OVERVIEW_SIZE, 1));
            const relativeY = Math.max(0, Math.min(offsetY / OVERVIEW_SIZE, 1));
      
            const newScrollLeft = relativeX * gridWidth - container.clientWidth / 2;
            const newScrollTop = relativeY * gridHeight - container.clientHeight / 2;
      
            container.scrollTo({ left: newScrollLeft, top: newScrollTop, behavior: 'auto' });
          }
      
          // Dragging the map
          if (isDraggingMap && mode === 'grab') {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
      
            container.scrollLeft -= dx;
            container.scrollTop -= dy;
      
            dragStartRef.current = { x: e.clientX, y: e.clientY };
          }
        };
      
        const handleMouseUp = () => {
          if (isDraggingViewport) setIsDraggingViewport(false);
          if (isDraggingMap) setIsDraggingMap(false);
        };
      
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      }, [isDraggingViewport, isDraggingMap, mode, gridWidth, gridHeight]);
      
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
            className={`w-screen h-screen relative ${getCursorClass(mode, isDraggingMap)} bg-black`}
            ref={scrollContainerRef}
            onMouseDown={handleGrabDrag}
            data-testid="map-container"
        >
            <ModeToggle mode={mode} setMode={setMode} />

            <TileGrid gridHeight={gridHeight}
            gridWidth={gridWidth}
            viewportHeight={viewportHeight}
            viewportWidth={viewportWidth}
            position={position}
            zoom={zoom}
            tileSize={TILE_SIZE} />

            <ZoomControls zoom={zoom} handleZoom={handleZoom}/>

            <MiniMap miniMapRef={miniMapRef}
            setIsDraggingViewport={setIsDraggingViewport}
            handleClick={handleClick}
            position={position}
            zoom={zoom}
            viewportWidth={viewportWidth}
            viewportHeight={viewportHeight}
            tileSize={TILE_SIZE}
            />
        </div>
      );
}

export default Map;