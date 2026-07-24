/* ==========================================================
   VISOR URBANO SAN SALVADOR SUR
   legend.js  — acordeón desplegable por capa
   ========================================================== */

export class LegendManager {
    constructor() {
        this.legendContainer = document.getElementById("legend");
        // Track open/closed state per layer id
        this._openState = {};
    }

    /**
     * Updates the legend list based on currently active layers.
     * @param {Array} layersConfig - general config layer list.
     * @param {Map}   layersMap    - loaded leaflet layer instances.
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
                const item = this._createAccordionItem(config);
                this.legendContainer.appendChild(item);
            }
        });

        if (activeCount === 0) {
            this.legendContainer.innerHTML = `
                <p style="font-size:12px;color:var(--text-light);font-style:italic;margin-top:5px;">
                    No hay capas activas para mostrar en la leyenda.
                </p>
            `;
        }
    }

    /* -------------------------------------------------------
       ACORDEÓN PRINCIPAL
    ------------------------------------------------------- */
    _createAccordionItem(config) {
        // Determine if this layer has multiple symbols
        const isMultiSymbol = this._isMultiSymbol(config);

        // Default: open if it was open before (or first time = closed for multi, open for single)
        if (this._openState[config.id] === undefined) {
            this._openState[config.id] = !isMultiSymbol; // simple layers start open
        }

        const wrapper = document.createElement("div");
        wrapper.className = "legend-accordion";
        wrapper.style.cssText = `
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 6px;
            border: 1px solid var(--border, #e2e8f0);
            background: var(--panel-bg, #fff);
        `;

        // ---- HEADER ----
        const header = document.createElement("div");
        header.className = "legend-accordion-header";
        header.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            cursor: pointer;
            background: var(--panel-bg, #f8fafc);
            gap: 8px;
            user-select: none;
        `;

        // Left: mini-symbol + name + total count badge
        const totalCount = config._rawData ? config._rawData.features.length : null;
        const leftSide = document.createElement("div");
        leftSide.style.cssText = "display:flex;align-items:center;gap:8px;min-width:0;flex:1;";
        leftSide.innerHTML = `
            ${this._buildMiniSymbol(config)}
            <span style="font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">
                ${config.name}
            </span>
            ${totalCount !== null ? this._countBadge(totalCount) : ""}
        `;

        // Right: chevron (only for multi-symbol layers)
        const chevron = document.createElement("span");
        chevron.innerHTML = isMultiSymbol ? "&#8964;" : "";  // ⌄
        chevron.style.cssText = `
            font-size: 14px;
            color: var(--text-light, #94a3b8);
            transition: transform 0.25s ease;
            flex-shrink: 0;
        `;

        header.appendChild(leftSide);
        if (isMultiSymbol) header.appendChild(chevron);

        // ---- BODY ----
        const body = document.createElement("div");
        body.className = "legend-accordion-body";
        body.style.cssText = `
            padding: 0 12px;
            overflow: hidden;
            transition: max-height 0.3s ease, padding 0.3s ease;
            max-height: 0px;
        `;
        body.innerHTML = this._buildBodyHTML(config);

        // Apply initial open state
        if (isMultiSymbol && this._openState[config.id]) {
            body.style.maxHeight = "500px";
            body.style.padding = "8px 12px";
            chevron.style.transform = "rotate(180deg)";
        }

        // Toggle on click
        header.addEventListener("click", () => {
            if (!isMultiSymbol) return;
            const isOpen = body.style.maxHeight !== "0px";
            body.style.maxHeight = isOpen ? "0px" : "500px";
            body.style.padding = isOpen ? "0 12px" : "8px 12px";
            chevron.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
            this._openState[config.id] = !isOpen;
        });

        wrapper.appendChild(header);
        if (isMultiSymbol) wrapper.appendChild(body);

        return wrapper;
    }

    /* -------------------------------------------------------
       ¿Tiene múltiples símbolos que mostrar en el cuerpo?
    ------------------------------------------------------- */
    _isMultiSymbol(config) {
        if (config.categorizedIcon && config.categorizedIcon.categories) return true;
        if (config.styleType === "categorized" && config.categories) return true;
        if (config.id === "centros") return true;
        return false;
    }

    /* -------------------------------------------------------
       MINI-SÍMBOLO en el encabezado
    ------------------------------------------------------- */
    _buildMiniSymbol(config) {
        // For categorized icon: use default or first category color
        if (config.categorizedIcon) {
            const cats = config.categorizedIcon.categories;
            const firstCat = cats ? Object.values(cats)[0] : null;
            const def = config.categorizedIcon.default;
            const color = (firstCat && firstCat.markerColor) || (def && def.markerColor) || "#607D8B";
            const icon  = (firstCat && firstCat.icon) || (def && def.icon) || "circle";
            return this._pointSymbol(icon, color, 18);
        }

        if (config.geometry === "polygon") {
            const stroke = config.style?.color || "#1565C0";
            const fill   = config.style?.fillColor || "#90CAF9";
            return `<span style="display:inline-block;width:18px;height:11px;border-radius:2px;
                        border:2px solid ${stroke};background:${fill};flex-shrink:0;"></span>`;
        }

        if (config.geometry === "line") {
            const color = config.style?.color || "#616161";
            const dashed = config.style?.dashArray ? "dashed" : "solid";
            return `<span style="display:inline-block;width:18px;height:0;
                        border-bottom:3px ${dashed} ${color};flex-shrink:0;margin-bottom:2px;"></span>`;
        }

        if (config.geometry === "point") {
            return this._pointSymbol(config.icon || "circle-dot", config.markerColor || "#607D8B", 18);
        }

        return "";
    }

    /* -------------------------------------------------------
       CUERPO DEL ACORDEÓN
    ------------------------------------------------------- */
    _buildBodyHTML(config) {
        // --- CATEGORIZED ICON (puntos con categorización) ---
        if (config.categorizedIcon && config.categorizedIcon.categories) {
            const counts = this._countByCategory(
                config._rawData,
                config.categorizedIcon.field,
                Object.keys(config.categorizedIcon.categories)
            );
            let rows = "";
            Object.entries(config.categorizedIcon.categories).forEach(([label, cat]) => {
                const cnt = counts.matched[label] ?? 0;
                rows += this._iconRow(cat.icon, cat.markerColor, label, cnt);
            });
            if (config.categorizedIcon.default) {
                const d = config.categorizedIcon.default;
                rows += this._iconRow(d.icon, d.markerColor, "Otros", counts.others);
            }
            return `<div style="display:flex;flex-direction:column;gap:6px;">${rows}</div>`;
        }

        // --- CATEGORIZED STYLE (líneas / polígonos) ---
        if (config.styleType === "categorized" && config.categories) {
            const counts = this._countByCategory(
                config._rawData,
                config.categorizedField,
                Object.keys(config.categories)
            );
            let rows = "";
            Object.entries(config.categories).forEach(([label, catStyle]) => {
                const cnt = counts.matched[label] ?? 0;
                rows += this._shapeRow(config.geometry, catStyle, label, cnt);
            });
            if (config.defaultStyle) {
                rows += this._shapeRow(config.geometry, config.defaultStyle, "Otros", counts.others);
            }
            return `<div style="display:flex;flex-direction:column;gap:6px;">${rows}</div>`;
        }

        // --- CENTROS DE VOTACIÓN (círculos proporcionales) ---
        if (config.id === "centros") {
            const sizes = [10, 14, 18, 22, 26];
            const labels = ["0 - 2 JRVs","2 - 5 JRVs","5 - 8 JRVs","8 - 11 JRVs","11 - 20 JRVs"];
            const rangeKeys = ["0-2","2-5","5-8","8-11","11-20"];
            // Count centros per range using JRV field
            const rangeCounts = { "0-2": 0, "2-5": 0, "5-8": 0, "8-11": 0, "11-20": 0 };
            if (config._rawData) {
                config._rawData.features.forEach(f => {
                    let jrv = 0;
                    if (f.properties) {
                        for (const k of Object.keys(f.properties)) {
                            if (k.toLowerCase() === "jrv") { jrv = parseInt(f.properties[k], 10) || 0; break; }
                        }
                    }
                    if (jrv <= 2) rangeCounts["0-2"]++;
                    else if (jrv <= 5) rangeCounts["2-5"]++;
                    else if (jrv <= 8) rangeCounts["5-8"]++;
                    else if (jrv <= 11) rangeCounts["8-11"]++;
                    else rangeCounts["11-20"]++;
                });
            }
            let rows = "";
            sizes.forEach((s, i) => {
                const cnt = rangeCounts[rangeKeys[i]];
                rows += `
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="display:inline-block;width:${s}px;height:${s}px;border-radius:50%;
                            background:#4dd0e1;border:1.5px solid #006064;
                            box-shadow:0 1px 3px rgba(0,0,0,.1);flex-shrink:0;"></span>
                        <span style="font-size:11px;color:var(--text);flex:1;">${labels[i]}</span>
                        ${this._countBadge(cnt)}
                    </div>`;
            });
            return `<div style="display:flex;flex-direction:column;gap:6px;">${rows}</div>`;
        }

        return "";
    }

    /* -------------------------------------------------------
       CONTEO POR CATEGORÍA
       Devuelve { matched: { [label]: count }, others: count }
    ------------------------------------------------------- */
    _countByCategory(rawData, field, categoryKeys) {
        const matched = {};
        categoryKeys.forEach(k => { matched[k] = 0; });
        let others = 0;

        if (!rawData || !field) return { matched, others };

        rawData.features.forEach(f => {
            if (!f.properties) { others++; return; }
            const val = String(f.properties[field] ?? "").trim().toUpperCase();
            const matchKey = categoryKeys.find(k => k.trim().toUpperCase() === val);
            if (matchKey) {
                matched[matchKey]++;
            } else {
                others++;
            }
        });

        return { matched, others };
    }

    /* -------------------------------------------------------
       BADGE DE CONTEO
    ------------------------------------------------------- */
    _countBadge(count) {
        return `<span style="
            display:inline-flex;align-items:center;justify-content:center;
            background:var(--primary,#0B5ED7);color:#fff;
            font-size:10px;font-weight:700;line-height:1;
            min-width:20px;height:18px;padding:0 5px;
            border-radius:9px;flex-shrink:0;
            box-shadow:0 1px 3px rgba(0,0,0,.15);
        ">${count.toLocaleString()}</span>`;
    }

    /* -------------------------------------------------------
       HELPERS
    ------------------------------------------------------- */
    _pointSymbol(iconName, color, size = 20) {
        return `
            <span style="
                display:inline-flex;align-items:center;justify-content:center;
                width:${size}px;height:${size}px;border-radius:50%;
                background:${color};color:#fff;font-size:${Math.round(size * 0.48)}px;
                box-shadow:0 1px 3px rgba(0,0,0,.18);flex-shrink:0;">
                <i class="fa-solid fa-${iconName}"></i>
            </span>`;
    }

    _iconRow(iconName, color, label, count = null) {
        return `
            <div style="display:flex;align-items:center;gap:10px;">
                ${this._pointSymbol(iconName, color, 20)}
                <span style="font-size:11px;color:var(--text);flex:1;">${label}</span>
                ${count !== null ? this._countBadge(count) : ""}
            </div>`;
    }

    _shapeRow(geometry, catStyle, label, count = null) {
        let sym = "";
        if (geometry === "polygon") {
            const stroke = catStyle.color || "#1565C0";
            const fill   = catStyle.fillColor || "#90CAF9";
            sym = `<span style="display:inline-block;width:20px;height:12px;border-radius:2px;
                        border:2px solid ${stroke};background:${fill};flex-shrink:0;"></span>`;
        } else {
            const color  = catStyle.color || "#616161";
            const dashed = catStyle.dashArray ? "dashed" : "solid";
            sym = `<span style="display:inline-block;width:20px;height:0;
                        border-bottom:3px ${dashed} ${color};flex-shrink:0;margin-bottom:4px;"></span>`;
        }
        return `
            <div style="display:flex;align-items:center;gap:10px;">
                ${sym}
                <span style="font-size:11px;color:var(--text);flex:1;">${label}</span>
                ${count !== null ? this._countBadge(count) : ""}
            </div>`;
    }
}
