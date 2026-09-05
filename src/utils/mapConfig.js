/**
 * @file mapConfig.js
 * @description Centralized map basemap configurations for Leaflet interactive tracer maps.
 * Uses high-availability, free, watermark-free Esri tile services with Topographic Clean as default.
 */

export const MAP_STYLES = {
  topographic: {
    id: 'topographic',
    name: 'Topographic',
    label: 'Topo Clean',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a> &mdash; Topographic',
    maxZoom: 19,
    description: 'Clean terrain with natural elevation shading and clear labels'
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a> &mdash; Satellite',
    maxZoom: 19,
    description: 'Photorealistic high-resolution satellite imagery'
  },
  streets: {
    id: 'streets',
    name: 'Streets',
    label: 'Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a> &mdash; Street',
    maxZoom: 19,
    description: 'High-contrast road network and municipal boundaries'
  },
  canvas: {
    id: 'canvas',
    name: 'Canvas',
    label: 'Gray Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a> &mdash; Canvas',
    maxZoom: 16,
    description: 'Minimalist light gray canvas for analytics'
  }
};

export const DEFAULT_MAP_STYLE = 'topographic';
