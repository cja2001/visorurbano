/* ==========================================================
   VISOR URBANO SAN SALVADOR SUR
   stats.js
   ========================================================== */

import { formatLength, formatArea } from "../utils/helpers.js";

export class StatsManager {
    constructor(mapManager) {
        this.mapManager = mapManager;
    }

    /**
     * Updates the statistics panel in the sidebar.
     * @param {Array} layersConfig - The general layers config list.
     * @param {Map} layersMap - Maps layer IDs to their loaded Leaflet instances.
     */
    update(layersConfig, layersMap) {
        const totalLayersEl = document.getElementById("totalLayers");
        const totalFeaturesEl = document.getElementById("totalFeatures");
        
        if (!totalLayersEl || !totalFeaturesEl) return;

        let activeCount = 0;
        let featureCount = 0;
        let lineLengthMeters = 0;
        let polygonAreaMeters = 0;
        let statsDetails = {};

        layersConfig.forEach(config => {
            // Check if the layer checkbox is checked (active)
            const checkbox = document.getElementById(`chk-${config.id}`);
            const isActive = checkbox && checkbox.checked;
            
            if (isActive) {
                activeCount++;
                const layerInstance = layersMap.get(config.id);
                
                if (layerInstance && typeof layerInstance.toGeoJSON === "function") {
                    try {
                        const geojson = layerInstance.toGeoJSON();
                        const count = geojson.features ? geojson.features.length : 1;
                        featureCount += count;
                        
                        // Keep track of counts by category/layer
                        statsDetails[config.name] = count;

                        // Advanced geometry calculations using Turf.js if available
                        if (window.turf && geojson.features) {
                            geojson.features.forEach(feature => {
                                const geomType = feature.geometry ? feature.geometry.type : "";
                                
                                if (geomType.includes("LineString")) {
                                    // turf.length returns distance in km
                                    lineLengthMeters += turf.length(feature) * 1000;
                                } else if (geomType.includes("Polygon")) {
                                    // turf.area returns area in m²
                                    polygonAreaMeters += turf.area(feature);
                                }
                            });
                        }
                    } catch (e) {
                        console.error(`Error calculating stats for layer ${config.name}:`, e);
                    }
                }
            }
        });

        // Set main values
        totalLayersEl.textContent = activeCount;
        totalFeaturesEl.textContent = featureCount;

        // Render additional detail fields below the cards
        this.renderStatsDetails(statsDetails, lineLengthMeters, polygonAreaMeters);
    }

    /**
     * Renders detailed metrics beneath the main statistics cards.
     */
    renderStatsDetails(details, lineLength, polygonArea) {
        let detailsPanel = document.getElementById("statsDetailsPanel");
        
        if (!detailsPanel) {
            // Find stats parent section and append details panel
            const parent = document.getElementById("statsPanel").parentElement;
            detailsPanel = document.createElement("div");
            detailsPanel.id = "statsDetailsPanel";
            detailsPanel.style.marginTop = "15px";
            detailsPanel.style.borderTop = "1px solid var(--border)";
            detailsPanel.style.paddingTop = "15px";
            parent.appendChild(detailsPanel);
        }

        let html = '<h4 style="font-size: 13px; font-weight:700; color:var(--text-light); margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">Detalles Activos</h4>';
        
        if (Object.keys(details).length === 0) {
            html += '<p style="font-size: 12px; color: var(--text-light); font-style: italic;">No hay capas activas.</p>';
            detailsPanel.innerHTML = html;
            return;
        }

        html += '<ul style="list-style:none; display:flex; flex-direction:column; gap:8px;">';

        // Add feature counts per active layer
        Object.entries(details).forEach(([name, count]) => {
            html += `
                <li style="display:flex; justify-content:space-between; font-size:13px; color:var(--text);">
                    <span style="font-weight: 500;">${name}</span>
                    <span style="background:#e2e8f0; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700; color:var(--text-light);">${count}</span>
                </li>
            `;
        });

        // Show total road length if streets are active
        if (lineLength > 0) {
            html += `
                <li style="display:flex; justify-content:space-between; font-size:13px; color:var(--text); border-top: 1px dashed var(--border); padding-top:6px; margin-top:4px;">
                    <span style="font-weight: 600;"><i class="fa-solid fa-road" style="color:var(--text-light); margin-right:5px;"></i> Longitud Total</span>
                    <span style="font-weight:700; color:var(--primary);">${formatLength(lineLength)}</span>
                </li>
            `;
        }

        // Show total area of polygons active
        if (polygonArea > 0) {
            html += `
                <li style="display:flex; justify-content:space-between; font-size:13px; color:var(--text); border-top: 1px dashed var(--border); padding-top:6px; margin-top:4px;">
                    <span style="font-weight: 600;"><i class="fa-solid fa-chart-area" style="color:var(--text-light); margin-right:5px;"></i> Área Mapeada</span>
                    <span style="font-weight:700; color:var(--success);">${formatArea(polygonArea)}</span>
                </li>
            `;
        }

        html += '</ul>';
        detailsPanel.innerHTML = html;
    }
}
