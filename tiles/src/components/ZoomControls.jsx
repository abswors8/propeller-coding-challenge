import { MIN_ZOOM, MAX_ZOOM } from "../utils/utils";

export default function ZoomControls({ zoom, handleZoom }) {
    function getClassName (zoom,direction){
        return ((zoom <= MIN_ZOOM) && (direction==='-')) || ((zoom >= MAX_ZOOM) && (direction==='+'))
            ? 'font-bold py-1 px-3 rounded bg-gray-400 hover:bg-gray-400'
            : 'font-bold py-1 px-3 rounded bg-primary text-white hover:bg-[#e09f2d]';
    }
    return (
        <div className="fixed bottom-2 left-2 z-50 p-2 rounded flex space-x-2 items-center">
            <button
              onClick={() => handleZoom(Math.max(zoom - 1, MIN_ZOOM))}
              disabled={zoom <= MIN_ZOOM}
              data-testid="zoom-out-btn"
              className={`${getClassName(zoom, '-')}`}
            >
              -
            </button>
            <button
              onClick={() => handleZoom(Math.min(zoom + 1, MAX_ZOOM))}
              disabled={zoom >= MAX_ZOOM}
              data-testid="zoom-in-btn"
              className={`${getClassName(zoom, '+')}`}
            >
              +
            </button>
          </div>
    );
}