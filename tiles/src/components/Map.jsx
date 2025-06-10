import { useState, useEffect, useRef } from 'react';
import ZoomControls from './ZoomControls.jsx';
import ModeToggle from './ModeToggle.jsx';
import MiniMap from './MiniMap.jsx';
import TileGrid from './TileGrid.jsx';
import { calculateZoomPosition, TILE_SIZE, SMALL_MAP_SIZE, MIN_ZOOM, MAX_ZOOM } from '../utils/utils.js';

function Map() {
    const [zoom, setZoom] = useState(0);
    const [position, setScrollPosition] = useState({ x: 0, y: 0 });
    const scrolling = useRef(null);
    const [mode, setMode] = useState('arrow');
    const [isDraggingViewport, setIsDraggingViewport] = useState(false);
    const miniMapRef = useRef(null);
    const [isDraggingMap, setIsDraggingMap] = useState(false);
    const dragStartingPoint = useRef({ x: 0, y: 0 });
    const [draggingTF, setDragTF] = useState(false);

    const viewportWidth = 1400;
    const viewportHeight = 800;
    const gridWidth = 2 ** zoom * TILE_SIZE;
    const gridHeight = 2 ** zoom * TILE_SIZE;

    function getCursorClass(mode, isDraggingMap) {
        return mode === 'grab' 
            ? isDraggingMap ? 'cursor-grabbing overflow-hidden select-none' : 'cursor-grab overflow-hidden select-none' : 'overflow-scroll'
    }
      
    function scrollToPositionOnMinimap(box, relativeX, relativeY, gridWidth, gridHeight, behavior = 'smooth') {
        const scrollX = relativeX * gridWidth - box.clientWidth / 2;
        const scrollY = relativeY * gridHeight - box.clientHeight / 2;
        box.scrollTo({ left: scrollX, top: scrollY, behavior: behavior });
    }
    // keep the map centered when zooming calcs new pos w calculateZoomPosition
    function newZoomPos(newZoom) {
        const c = scrolling.current;
        if (!c) return;
        const { newScrollX, newScrollY } = calculateZoomPosition(c, newZoom, zoom);
        setZoom(newZoom);
        requestAnimationFrame(() => {
            c.scrollTo({ left: newScrollX, top: newScrollY, behavior: 'instant' });
        });
    }
    // if you click on the small ma it goes to that oposition in the viewport
    const clickCenterMap= (e) => {
        if (!miniMapRef.current || !scrolling.current) return;
        e.stopPropagation();
        const rect = miniMapRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const relativeX = Math.max(0, Math.min(clickX / SMALL_MAP_SIZE, 1));
        const relativeY = Math.max(0, Math.min(clickY / SMALL_MAP_SIZE, 1));
        scrollToPositionOnMinimap(scrolling.current, relativeX, relativeY, gridWidth, gridHeight);
    };
    
    const handleGrabDrag = (e) => {
        if (mode === 'grab') {
            setDragTF(true);
            dragStartingPoint.current = { x: e.clientX, y: e.clientY };
            setIsDraggingMap(true);
        }
    };
    // dragging behaviours
    useEffect(() => {
        const c = scrolling.current;
        const miniMap = miniMapRef.current;
        if (!c) return;
      
        const handleMouseMove = (e) => {
          // user grabbing the yellow box on the tiny map
          if (isDraggingViewport && miniMap) {
            const rect = miniMap.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
      
            const relativeX = Math.max(0, Math.min(offsetX / SMALL_MAP_SIZE, 1));
            const relativeY = Math.max(0, Math.min(offsetY / SMALL_MAP_SIZE, 1));
      
            const newScrollLeft = relativeX * gridWidth - c.clientWidth / 2;
            const newScrollTop = relativeY * gridHeight - c.clientHeight / 2;
      
            c.scrollTo({ left: newScrollLeft, top: newScrollTop, behavior: 'auto' });
          }
      
          // user grab the map and try to move around
          if (isDraggingMap && mode === 'grab') {
            const dragX = e.clientX - dragStartingPoint.current.x;
            const dragY = e.clientY - dragStartingPoint.current.y;
      
            c.scrollLeft -= dragX;
            c.scrollTop -= dragY;
      
            dragStartingPoint.current = { x: e.clientX, y: e.clientY };
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
      // Zooming with with the mouse scrolly thing
      useEffect(() => {
        const el = scrolling.current;
        if (!el) return;
        let acc = 0;
                // letting the scroll accumulate to avoid too many zooms
        // tryign to make it feel smoother
        // when the user scrolls quickly
        // doesnt center on cursos but tried
        const wheelHandler = (e) => {
          if (mode !== 'grab') return;
          e.preventDefault();
          acc += e.deltaY;
          if (Math.abs(acc) < 100) return;
          const dir = Math.sign(acc);
          acc = 0;
          const nextZoom = Math.min(Math.max(zoom - dir, MIN_ZOOM), MAX_ZOOM);
          if (nextZoom === zoom) return;
          const rect = el.getBoundingClientRect();
          // this is the bit that doesnt work
          const offX = e.clientX - rect.left + el.scrollLeft;
          const offY = e.clientY - rect.top + el.scrollTop;
          console.log(offX, offY);
          const factor = 2 ** (nextZoom - zoom);
          setZoom(nextZoom);
          console.log(offX * factor - (e.clientX - rect.left))
          console.log(offY * factor - (e.clientY - rect.top));
          requestAnimationFrame(() => {
            el.scrollTo({
              left: offX * factor - (e.clientX - rect.left),
              top: offY * factor - (e.clientY - rect.top),
              behavior: 'instant',
            });
          });
        };
        el.addEventListener('wheel', wheelHandler, { passive: false });
        return () => el.removeEventListener('wheel', wheelHandler);
      }, [mode, zoom]);

      // Handle zooming with keyboard shortcuts
      useEffect(() => {
        function handleZoom(newZoom) {
            const c = scrolling.current;
            if (!c) return;
            const { newScrollX, newScrollY } = calculateZoomPosition(c, newZoom, zoom);
            setZoom(newZoom);
            requestAnimationFrame(() => {
                c.scrollTo({ left: newScrollX, top: newScrollY, behavior: 'instant' });
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

    // when the user scrolls the position is updated, ticking is like loading 
    useEffect(() => {
        const c = scrolling.current;
        if (!c) return;
        let ticking = false;
        const handleScroll = () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              setScrollPosition({
                x: c.scrollLeft,
                y: c.scrollTop,
              });
              ticking = false;
            });
            ticking = true;
          }
        };
    
        c.addEventListener('scroll', handleScroll);
        return () => c.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={`w-screen h-screen relative ${getCursorClass(mode, isDraggingMap)} bg-black`}
            ref={scrolling}
            onMouseDown={handleGrabDrag}
            data-testid="map-c"
        >
            <ModeToggle mode={mode} setMode={setMode} />

            <TileGrid gridHeight={gridHeight}
            gridWidth={gridWidth}
            viewportHeight={viewportHeight}
            viewportWidth={viewportWidth}
            position={position}
            zoom={zoom}
            tileSize={TILE_SIZE} />

            <ZoomControls zoom={zoom} handleZoom={newZoomPos}/>

            <MiniMap miniMapRef={miniMapRef}
            setIsDraggingViewport={setIsDraggingViewport}
            handleClick={clickCenterMap}
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