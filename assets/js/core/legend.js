/* ==========================================================
   VISOR URBANO SAN SALVADOR SUR
   legend.js
   ========================================================== */

export class LegendManager {
    constructor() {
        this.legendContainer = document.getElementById("legend");
    }

    /**
     * Updates the legend list based on currently active layers.
     * @param {Array} layersConfig - general config layer list.
     * @param {Map} layersMap - loaded leaflet layer instances.
     */
    update(layersConfig, layersMap) {
        if (!this.legendContainer) return;
        
        this.legendContainer.innerHTML = "";
        let activeCount = 0;

        layersConfig.forEach(config => {
            const checkbox = document.getElementById(`chk-${config.id}`);
            const isActive = checkbox && checkbox.checked;

            if (isActive) {
                activeCount++;
                const item = this.createLegendItem(config);
                this.legendContainer.appendChild(item);
            }
        });

        if (activeCount === 0) {
            this.legendContainer.innerHTML = `
                <p style="font-size: 12px; color: var(--text-light); font-style: italic; margin-top: 5px;">
                    No hay capas activas para mostrar en la leyenda.
                </p>
            `;
        }
    }

    /**
     * Creates DOM representation of a layer's legend symbol.
     */
    createLegendItem(config) {
        const item = document.createElement("div");
        item.className = "legend-item";
        item.style.marginBottom = "10px";

        // Specialized legend representation for Centros de Votacion with proportional circles
        if (config.id === "centros") {
            item.style.display = "flex";
            item.style.flexDirection = "column";
            item.style.gap = "4px";

            item.innerHTML = `
                <div style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 4px;">
                    ${config.name}
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; margin-left: 10px; border-left: 2px solid #e2e8f0; padding-left: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #4dd0e1; border: 1.5px solid #006064; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></span>
                        <span style="font-size: 12px; color: var(--text);">0 - 2 JRVs</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: #4dd0e1; border: 1.5px solid #006064; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></span>
                        <span style="font-size: 12px; color: var(--text);">2 - 5 JRVs</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 18px; height: 18px; border-radius: 50%; background: #4dd0e1; border: 1.5px solid #006064; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></span>
                        <span style="font-size: 12px; color: var(--text);">5 - 8 JRVs</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: #4dd0e1; border: 1.5px solid #006064; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></span>
                        <span style="font-size: 12px; color: var(--text);">8 - 11 JRVs</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 26px; height: 26px; border-radius: 50%; background: #4dd0e1; border: 1.5px solid #006064; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></span>
                        <span style="font-size: 12px; color: var(--text);">11 - 20 JRVs</span>
                    </div>
                </div>
            `;
            return item;
        }

        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.gap = "10px";

        let symbolHtml = "";

        if (config.geometry === "polygon") {
            const strokeColor = config.style?.color || "#1565C0";
            const fillColor = config.style?.fillColor || "#90CAF9";
            symbolHtml = `
                <span class="legend-symbol" style="
                    border: 2px solid ${strokeColor}; 
                    background-color: ${fillColor}; 
                    opacity: 0.8; 
                    width: 20px; 
                    height: 12px; 
                    border-radius: 2px;
                    display: inline-block;">
                </span>`;
        } else if (config.geometry === "line") {
            const strokeColor = config.style?.color || "#616161";
            const isDashed = config.style?.dashArray ? "dashed" : "solid";
            symbolHtml = `
                <span class="legend-symbol" style="
                    border-bottom: 3px ${isDashed} ${strokeColor}; 
                    width: 20px; 
                    height: 0px; 
                    display: inline-block;
                    margin-bottom: 4px;">
                </span>`;
        } else if (config.geometry === "point") {
            const markerColor = config.markerColor || "#FDD835";
            const iconName = config.icon || "location-dot";
            symbolHtml = `
                <span class="legend-symbol circle" style="
                    background-color: ${markerColor}; 
                    width: 20px; 
                    height: 20px; 
                    border-radius: 50%; 
                    display: inline-flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-size: 9px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                    <i class="fa-solid fa-${iconName}"></i>
                </span>`;
        }

        item.innerHTML = `
            ${symbolHtml}
            <span style="font-size: 13px; font-weight: 500; color: var(--text);">${config.name}</span>
        `;

        return item;
    }
}
