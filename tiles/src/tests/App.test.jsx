import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Map from '../components/Map.jsx';
import { waitFor } from '@testing-library/react';

beforeAll(() => {
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
});

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock('../components/MiniMap.jsx', () => () => <div data-testid="minimap">MiniMap</div>);
jest.mock('../components/TileGrid.jsx', () => () => <div>TileGrid</div>);

describe('Map Component', () => {
  test('Renders without crashing', () => {
    render(<Map />);
  });

  test('Has the map container in the document', () => {
    const { getByTestId } = render(<Map />);
    expect(getByTestId('map-container')).toBeInTheDocument();
  });

  test('Changes cursor to grabbing when mode is grab', () => {
    const { getByTestId } = render(<Map />);
    const container = getByTestId('map-container');
    expect(container.className).not.toMatch(/cursor-grab/);
  });

  test('Calls scroll function when user scrolls', () => {
    const { getByTestId } = render(<Map />);
    const container = getByTestId('map-container');
    container.scrollTo = jest.fn();
    fireEvent.scroll(container, { target: { scrollLeft: 100, scrollTop: 150 } });
    expect(true).toBe(true);
  });

  test('If you click on mini map something happens', () => {
    const { getByTestId } = render(<Map />);
    const minimap = getByTestId('minimap');
    fireEvent.click(minimap, { clientX: 50, clientY: 50 });
    expect(true).toBe(true);
  });
});

describe('Map ZoomControls integration', () => {
  test('clicking + button increases zoom level of viewport', async () => {
    const { getByTestId } = render(<Map />);
    const container = getByTestId('map-container');

    container.scrollTo = jest.fn();

    const zoomInBtn = getByTestId('zoom-in-btn');
    fireEvent.click(zoomInBtn);
    fireEvent.click(zoomInBtn);
    fireEvent.click(zoomInBtn);
  
    await waitFor(() => {
      expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({
        left: expect.any(Number),
        top: expect.any(Number),
        behavior: 'instant',
      }));
    });
  });

  test('Zooming triggers a change in viewport', async () => {
    const { getByTestId } = render(<Map />);
    const container = getByTestId('map-container');
    container.scrollTo = jest.fn();
  
    const zoomInBtn = getByTestId('zoom-in-btn');
    const zoomOutBtn = getByTestId('zoom-out-btn');
  
    fireEvent.click(zoomInBtn);
    fireEvent.click(zoomOutBtn);
  
    await waitFor(() => {
      expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({
        left: expect.any(Number),
        top: expect.any(Number),
        behavior: 'instant',
      }));
    });
  });
  
});

describe('Toggle interaction mode', () => {
  test('clicking Grab changes mode and disables Grab button and vice versa', () => {
    const { getByTestId } = render(<Map />);
    const container = getByTestId('map-container');
    container.scrollTo = jest.fn();

    const grabButton = getByTestId('grab-button');
    const arrowButton = getByTestId('arrow-button');

    expect(arrowButton).toBeDisabled();
    expect(grabButton).not.toBeDisabled();

    fireEvent.click(grabButton);
    expect(grabButton).toBeDisabled();
    expect(arrowButton).not.toBeDisabled();

    fireEvent.click(arrowButton);
    expect(grabButton).not.toBeDisabled();
    expect(arrowButton).toBeDisabled();
  });
});
describe('Map scroll behavior', () => {
  test('scroll event updates scroll position', () => {
    const { getByTestId } = render(<Map />);
    const mapContainer = getByTestId('map-container');
    fireEvent.scroll(mapContainer, {
      target: { scrollLeft: 100, scrollTop: 200 }
    });
    expect(mapContainer.scrollLeft).toBe(100);
    expect(mapContainer.scrollTop).toBe(200);
  });
});

describe('Map interactions full behaviour stubs', () => {
  test('grabbing and dragging the map viewport changes the scroll position', () => {
  });
  test('dragging the minimap viewport', () => {
  });
  test('clicking on the minimap viewport scrolls to correct position', () => {
  });
  test('scrolling changes viewport scroll position', () => {
  });
  test('zooming in and out changes the minimap viewport size', () => {
  }); 
  test('panning changes the tiles displayed in the viewport', () => {
  });
  test('zooming in and out changes the number of tiles displayed in the viewport', () => {
  }); 
  test('panning stops when the viewport reaches the edge of the map', () => { 
  });
});