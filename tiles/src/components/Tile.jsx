import React, { useState, useEffect } from 'react';
import axios from 'axios';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiaW50ZXJuIiwiaWF0IjoxNzQ3OTY5OTAyfQ._nFA8un2_IMz23difs56tX4ono-oXApWk8y8YSkGkAw';
const tileUrl = (z, x, y) => `https://challenge-tiler.services.propelleraero.com/tiles/${z}/${x}/${y}?token=${TOKEN}`;

const Tile = React.memo(function Tile({ x, y, zoom, tileSize }){
  const [tileSrc, setTileSrc] = useState(null);
  const url = tileUrl(zoom, x, y);

  useEffect(() => {
    let isCancelled = false;

    setTileSrc(null);
    axios
      .get(url, { responseType: 'arraybuffer' })
      .then((response) => {
        if (isCancelled) return;
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );

        const mimeType = response.headers['content-type'] || 'image/png';
        const dataUrl = `data:${mimeType};base64,${base64}`;

        setTileSrc(dataUrl);
      })
      .catch((err) => {
        if (!isCancelled) {
          if (err.response?.status === 404) {
            console.warn(`Tile ${zoom}/${x}/${y} not found (404)`);
          } else {
            console.error('Tile load error:', err.message);
          }
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [url, zoom, x, y]);

  return tileSrc ? (
    <div
    key={`${zoom}-${x}-${y}`}
    style={{
        position: 'absolute',
        transform: `translate3d(${x * tileSize}px, ${y * tileSize}px, 0)`,
        width: tileSize,
        height: tileSize,
        willChange: 'transform',

    }}
    >
    <img
        src={tileSrc}
        alt={`tile ${zoom}/${x}/${y}`}
        style={{
        width: '100%',
        height: '100%',
        display: 'block',
        userSelect: 'none',
        }}
        draggable={false}
    />
    </div>
  ) : null;
})

export default Tile;