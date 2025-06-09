export default function ModeToggle({ mode, setMode }) {
    function getClassName(mode, currentMode) {
        return mode === currentMode
            ? 'bg-gray-400 hover:bg-lightBg'
            : 'bg-primary text-white';
    }
    return (
        <div className="fixed top-2 right-2 z-50 p-2 rounded flex space-x-2 items-center">
        <button
          onClick={() => setMode('grab')}
          disabled={mode === 'grab'}
          data-testid="grab-button"
          className={`font-bold py-1 px-3 rounded ${getClassName(mode, 'arrow')}`}
        >
          ✋ Grab
        </button>
        <button
          onClick={() => setMode('arrow')}
          disabled={mode === 'arrow'}
          data-testid="arrow-button"
          className={`font-bold py-1 px-3 rounded ${getClassName(mode, 'grab')}`}
        >
          🖱️ Arrow
        </button>
      </div>
    );
}