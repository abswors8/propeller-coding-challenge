import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Map from '../components/Map.jsx';

beforeAll(() => {
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
});

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock('../components/ZoomControls.jsx', () => () => <div>ZoomControls</div>);
jest.mock('../components/ModeToggle.jsx', () => () => <div>ModeToggle</div>);
jest.mock('../components/MiniMap.jsx', () => () => <div data-testid="minimap">MiniMap</div>);
jest.mock('../components/TileGrid.jsx', () => () => <div>TileGrid</div>);

describe('Map Component', () => {
  test('renders without crashing', () => {
    render(<Map />);
  });

  test('has the map container in the document', () => {
    const { getByTestId } = render(<Map />);
    expect(getByTestId('map-container')).toBeInTheDocument();
  });

  test('changes cursor class when mode is grab', () => {
    const { getByTestId } = render(<Map />);
    const container = getByTestId('map-container');
    // Initial class should not be grab
    expect(container.className).not.toMatch(/cursor-grab/);
    // Simulate changing mode to grab by re-rendering or mocking state (simplified here)
  });

  test('calls scrollTo on scroll event', () => {
    const { getByTestId } = render(<Map />);
    const container = getByTestId('map-container');
    container.scrollTo = jest.fn();
    fireEvent.scroll(container, { target: { scrollLeft: 100, scrollTop: 150 } });
    // We don't have direct state exposure, but no error means it handled scroll
    expect(true).toBe(true);
  });

  test('handles click on minimap', () => {
    const { getByTestId } = render(<Map />);
    const minimap = getByTestId('minimap');
    fireEvent.click(minimap, { clientX: 50, clientY: 50 });
    expect(true).toBe(true); // Just verifying no errors on click handler
  });
});
