/* ==========================================================
   VISOR URBANO SAN SALVADOR SUR
   app.js
   ========================================================= */

import { MapManager } from "./core/map.js";
import { SidebarManager } from "./core/sidebar.js";
import { PopupManager } from "./core/popup.js";
import { StatsManager } from "./core/stats.js";
import { LegendManager } from "./core/legend.js";
import { SearchManager } from "./core/search.js";
import { ToolManager } from "./core/tools.js";
import { LayerLoader } from "./core/loader.js";

class VisorUrbano {
    constructor() {
        this.mapManager = new MapManager();
        this.sidebarManager = null;
        this.popupManager = null;
        this.statsManager = null;
        this.legendManager = null;
        this.searchManager = null;
        this.toolManager = null;
        this.layerLoader = null;
    }

    async initialize() {
        // 1. Initialize Map
        this.mapManager.initialize();

        // 2. Initialize Managers
        this.sidebarManager = new SidebarManager(this.mapManager);
        this.popupManager = new PopupManager(this.mapManager);
        this.statsManager = new StatsManager(this.mapManager);
        this.legendManager = new LegendManager();
        this.toolManager = new ToolManager(this.mapManager);
        this.searchManager = new SearchManager(this.mapManager, this.sidebarManager, this.popupManager);
        
        // 3. Initialize Loader
        this.layerLoader = new LayerLoader(
            this.mapManager,
            this.sidebarManager,
            this.popupManager,
            this.legendManager,
            this.statsManager
        );

        // 4. Initialize Tools & Search UI
        this.toolManager.initialize();
        this.searchManager.initialize();
        this.setupCollapsiblePanels();

        // 5. Load GeoJSON layers configured in config/layers.json
        await this.layerLoader.loadLayers();

        // Welcome logs
        console.log("=================================");
        console.log("   VISOR URBANO SAN SALVADOR SUR ");
        console.log("   Aplicación iniciada con éxito ");
        console.log("=================================");
    }

    /**
     * Set up collapsible panels behavior (Sidebar and Details Panel)
     */
    setupCollapsiblePanels() {
        const toggleSidebarBtn = document.getElementById("toggleSidebar");
        const toggleInfoPanelBtn = document.getElementById("toggleInfoPanel");
        const container = document.getElementById("container");
        const sidebar = document.getElementById("sidebar");
        const infoPanel = document.getElementById("infoPanel");

        // Collapse both panels by default on mobile devices to preserve map viewport space
        if (window.innerWidth <= 768) {
            if (sidebar && container && toggleSidebarBtn) {
                sidebar.classList.add("collapsed");
                container.classList.add("sidebar-collapsed");
                toggleSidebarBtn.querySelector("i").className = "fa-solid fa-chevron-right";
                toggleSidebarBtn.title = "Mostrar Capas";
            }
            if (infoPanel && container && toggleInfoPanelBtn) {
                infoPanel.classList.add("collapsed");
                container.classList.add("infopanel-collapsed");
                toggleInfoPanelBtn.querySelector("i").className = "fa-solid fa-chevron-left";
                toggleInfoPanelBtn.title = "Mostrar Info";
            }
        }

        if (toggleSidebarBtn && sidebar && container) {
            toggleSidebarBtn.addEventListener("click", () => {
                sidebar.classList.toggle("collapsed");
                container.classList.toggle("sidebar-collapsed");
                
                const icon = toggleSidebarBtn.querySelector("i");
                if (sidebar.classList.contains("collapsed")) {
                    icon.className = "fa-solid fa-chevron-right";
                    toggleSidebarBtn.title = "Mostrar Capas";
                } else {
                    icon.className = "fa-solid fa-chevron-left";
                    toggleSidebarBtn.title = "Ocultar Capas";
                }
                
                // Redraw map tiles and bounds after size transition finishes
                setTimeout(() => {
                    this.mapManager.getMap().invalidateSize();
                }, 305);
            });
        }

        if (toggleInfoPanelBtn && infoPanel && container) {
            toggleInfoPanelBtn.addEventListener("click", () => {
                infoPanel.classList.toggle("collapsed");
                container.classList.toggle("infopanel-collapsed");
                
                const icon = toggleInfoPanelBtn.querySelector("i");
                if (infoPanel.classList.contains("collapsed")) {
                    icon.className = "fa-solid fa-chevron-left";
                    toggleInfoPanelBtn.title = "Mostrar Info";
                } else {
                    icon.className = "fa-solid fa-chevron-right";
                    toggleInfoPanelBtn.title = "Ocultar Info";
                }
                
                // Redraw map tiles and bounds after size transition finishes
                setTimeout(() => {
                    this.mapManager.getMap().invalidateSize();
                }, 305);
            });
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const visor = new VisorUrbano();
    visor.initialize();
});