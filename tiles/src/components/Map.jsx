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
      
    // Handle scrolling to update the scroll position
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
    // quickly calculate the new scroll position based on the zoom level and the current scroll position
    // keep the map centered
    function handleZoom(newZoom) {
        const container = scrollContainerRef.current;
        if (!container) return;
        const { newScrollX, newScrollY } = calculateZoomPosition(container, newZoom, zoom);
        setZoom(newZoom);
        requestAnimationFrame(() => {
            container.scrollTo({ left: newScrollX, top: newScrollY, behavior: 'instant' });
        });
    }
    // Handle clicking on the minimap to scroll to the clicked position
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
    // Handle dragging the viewport on the minimap and dragging the map to pan around
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
      // Zooming with mouse wheel
      useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        // letting the scroll accumulate to avoid too many zooms
        // and to allow for a more natural zooming experience
        // when the user scrolls quickly
        // this is a workaround for the fact that wheel events
        // can be triggered multiple times in a single scroll action
        // this doesn't currently work for zooming centered on the cursor
        let scrollAccumulator = 0;
      
        const handleWheel = (e) => {
          if (mode !== 'grab') return;
          const prevZoom = zoom;
      
          e.preventDefault();
          scrollAccumulator += e.deltaY;
          const ZOOM_THRESHOLD = 100;
          if (Math.abs(scrollAccumulator) < ZOOM_THRESHOLD) return;
          const direction = Math.sign(scrollAccumulator);
          scrollAccumulator = 0;
          const newZoom = Math.min(Math.max(zoom - direction, MIN_ZOOM), MAX_ZOOM);
          if (newZoom === zoom) return;
          const { newScrollX, newScrollY } = calculateZoomPosition(container, newZoom, prevZoom);
          setZoom(newZoom);
          requestAnimationFrame(() => {
              container.scrollTo({ left: newScrollX, top: newScrollY, behavior: 'instant' });
          });
        };
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
      }, [mode, zoom]);
      // Handle zooming with keyboard shortcuts
      useEffect(() => {
        function handleZoom(newZoom) {
            const container = scrollContainerRef.current;
            if (!container) return;
            const { newScrollX, newScrollY } = calculateZoomPosition(container, newZoom, zoom);
            setZoom(newZoom);
            requestAnimationFrame(() => {
                container.scrollTo({ left: newScrollX, top: newScrollY, behavior: 'instant' });
            });
        }
        const handleKeyDown = (e) => {
      
          if (e.key === '+' || e.key === '=') {
            handleZoom(Math.min(zoom + 1, MAX_ZOOM));
          } else if (e.key === '-') {
            handleZoom(Math.max(zoom - 1, MIN_ZOOM));
          }
        };
      
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [zoom]);
      

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