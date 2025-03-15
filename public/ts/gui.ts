import { Intersection, Object3D, Object3DEventMap, Vector2 } from "three";
import { StarRecord, StellarTypes } from "./starSystems";

const SUBTITLE_BY_STELLAR_TYPE = new Map([
    [StellarTypes.GalacticCore, "Supermassive black hole"],
    [StellarTypes.BlackHole, "Black hole"],
    [StellarTypes.ProtoPlanetary, "Proto-planetary disk"],
    [StellarTypes.StarG, "Yellow star system"],
    [StellarTypes.StarO, "Blue star system"],
    [StellarTypes.StarM, "Red star system"],
    [StellarTypes.BinaryOO, "Blue-blue binary system"],
    [StellarTypes.BinaryOM, "Blue-red binary system"],
    [StellarTypes.BinaryOG, "Blue-yellow binary system"],
    [StellarTypes.BinaryGG, "Yellow-yellow binary system"],
    [StellarTypes.BinaryGM, "Yellow-red binary system"],
    [StellarTypes.BinaryMM, "Red-red binary system"],
]);

export default class GuiManager {
    public static readonly DISABLE_LOADING_SCREEN = false;
    public static readonly JSPANEL_CONFIG = {
        position: "left-top",
        snap: true,
        contentSize: "auto auto",
        theme: "black",
        headerControls: {
            close: "enable",
            maximize: "remove",
            normalize: "remove",
            minimize: "remove",
            smallify: "remove",
        },
        css: {
            content: "panel-content",
        }
    };

    private panels = new Set<string>();

    private isLoading = false;
    private lastSpinnerUpdate = 0;
    private lastLoadingStart = 0;

    private pointedObject: Intersection<Object3D<Object3DEventMap>> | null = null;
    private tooltip = document.getElementById("tooltip")!;

    private propsPanel = document.getElementById("properties-panel")!;

    private isMouseOnUIPanel = false;

    constructor(
        // dependency injection
        private readonly jsPanel: any,
    ) {
        // start hidden
        this.propsPanel.style.visibility = "hidden";

        jsPanel.globalCallbacks = function(panel: Element) {
            // Set panel element classes
            jsPanel.setClass(panel, "panel");
            jsPanel.setClass(panel, "blurbg");

            // Set mouse event callbacks
            panel.addEventListener("mouseenter", this.onPanelMouseEnter.bind(this));
            panel.addEventListener("mouseout", this.onPanelMouseOut.bind(this));
        };

        this.createFileUploadPanel();

        // Add event listener for the fullscreen button
        document.getElementById("fullscreen-btn")!.addEventListener("click", function(event) {
            // TODO: support moz and webkit fullscreen requests
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        });

        this.bindEventListeners();
    }

    private bindEventListeners() {
        window.addEventListener("click", this.onWindowClick.bind(this));
        window.addEventListener("focus", this.onWindowFocus.bind(this));
        // window.addEventListener("mousemove", this.onWindowMouseMove.bind(this));
    }

    /**
     * Mouse click event handler
     */
    private onWindowClick(event: MouseEvent) {
        if (this.pointedObject != null) {
            const starRecord = this.pointedObject.object.userData;
            this.createStarPropsPanel(starRecord as StarRecord,
                event.x - window.innerWidth/2,
                event.y - window.innerHeight/2);
        }
    }

    private onPanelMouseEnter(event: MouseEvent) {
        this.isMouseOnUIPanel = true;
    }

    private onPanelMouseOut(event: MouseEvent) {
        if (event.relatedTarget instanceof Element && event.relatedTarget.closest(".panel")) {
            // The mouse is entering a child element of the panel, do nothing
            return;
        }
        this.isMouseOnUIPanel = false;
    }

    private onWindowFocus(event: FocusEvent) {
        this.checkMouseOverUIPanel(event.clientX, event.clientY);
    }

    private checkMouseOverUIPanel(x: number, y: number) {
        try {
            const elementUnderMouse = document.elementFromPoint(x, y);

            for (const panel of document.getElementsByClassName("panel")) {
                if (panel.contains(elementUnderMouse)) {
                    this.isMouseOnUIPanel = true;
                    return;
                }
            }
            this.isMouseOnUIPanel = false;
        } catch (e) {}
    }

    private showLoadingOverlay() {
        this.isLoading = true;
        this.lastLoadingStart = Date.now();

        const loadingOverlay = document.getElementById("loading-overlay")!;
        const spinner = document.getElementById("spinner")!;

        spinner.innerHTML = "Loading";
        loadingOverlay.style.display = "flex";
        loadingOverlay.style.opacity = "1.0";
    }

    private hideLoadingOverlay() {
        const now = Date.now();
        const loadingDurMs = now - this.lastLoadingStart;

        // Always load for at least one second to smoothen the transition
        const dummyLoadTimeoutMs = loadingDurMs > 1000 ? 0 : 1000 - loadingDurMs;

        setTimeout(() => {
            this.isLoading = false;
            document.getElementById("spinner")!.innerHTML = "Ready!";

            const loadingOverlay = document.getElementById("loading-overlay")!;
            setTimeout(() => {
                loadingOverlay.style.opacity = "0.0";
            }, 250);
            setTimeout(() => {
                loadingOverlay.style.display = "none";
            }, 1250);
        }, dummyLoadTimeoutMs);
    }

    private createFileUploadPanel() {
        this.jsPanel.create({
            config: GuiManager.JSPANEL_CONFIG,
            snap: true,
            headerTitle: "StarMap",
            callback: function(panel: Element) {
                const fileUploadForm = document.getElementById("file-form")!;
                this.content.append(fileUploadForm);
            }
        });
    }

    private createStarPropsPanel(starRecord: StarRecord, xpos: number, ypos: number) {
        // Check if the panel is already open
        if (this.panels.has(starRecord.name)) {
            return;
        }

        const guiManager = this;
        this.jsPanel.create({
            config: GuiManager.JSPANEL_CONFIG,

            position: {
                offsetX: xpos,
                offsetY: ypos,
            },

            headerTitle: "Star Record",
            data: starRecord,

            onClosed: function() {
                guiManager.isMouseOnUIPanel = false;
                guiManager.panels.delete(starRecord.name);
            },

            callback: function(panel: any) {
                console.log(starRecord);
                guiManager.isMouseOnUIPanel = true;

                // Bind event listeners
                this.addEventListener("mouseenter", guiManager.onPanelMouseEnter.bind(guiManager));
                this.addEventListener("mouseout", guiManager.onPanelMouseOut.bind(guiManager));

                // Add panel content
                const subtitle = SUBTITLE_BY_STELLAR_TYPE.get(starRecord.type)
                    || (console.error("Unrecognized stellar type", starRecord.type) ?? "Unknown stellar type");

                // Append star name and type to panel
                const titleElement = this.content.appendChild(document.createElement("h1"));
                titleElement.append(starRecord.name);
                titleElement.style.fontWeight = "bold";

                const subtitleElement = this.content.appendChild(document.createElement("p"));
                subtitleElement.append(subtitle);

                this.content.appendChild(document.createElement("hr"));

                // Append star position to panel
                const posGrid = this.content.appendChild(document.createElement("div"));
                posGrid.classList.add("panel-grid");
                for (const axis of "xyz") {
                    const labelElement = posGrid.appendChild(document.createElement("p"));
                    labelElement.append(axis.toUpperCase() + " Position");

                    const posElement = posGrid.appendChild(document.createElement("p"));
                    posElement.append((starRecord.position as any)[axis].toFixed(3));
                }
            }
        });

        this.panels.add(starRecord.name);
    }

    private update(cursorPos: Vector2, pointedObject: Intersection<Object3D<Object3DEventMap>>|null) {
        if (GuiManager.DISABLE_LOADING_SCREEN) {
            this.isLoading = false;
            document.getElementById("loading-overlay")!.style.display = "none";
        }

        // Update reference to object currently pointed by the cursor
        this.pointedObject = pointedObject;

        // Update spinner text if loading
        if (this.isLoading) {
            const now = Date.now();
            const timeSinceSpinnerUpdateMs = now - this.lastSpinnerUpdate;

            if (timeSinceSpinnerUpdateMs > 500) {
                this.lastSpinnerUpdate = now;
                const spinner = document.getElementById("spinner")!;
                if (spinner.innerHTML.endsWith("...")) {
                    spinner.innerHTML = "Loading";
                } else {
                    spinner.innerHTML += ".";
                }
            }
        }

        // Check if the mouse is pointing at an object
        if (this.pointedObject != null && !this.isMouseOnUIPanel) {
            // Show tooltip with star name on mouseover
            const starName = (this.pointedObject.object.userData as StarRecord).name;
            this.tooltip.style.visibility = "visible";

            // Set tooltip position to upper-right of the star
            this.tooltip.style.left = (cursorPos.x+1) / 2 * window.innerWidth + 5 + "px";
            this.tooltip.style.top = (-cursorPos.y+1) / 2 * window.innerHeight - 30 + "px";
            this.tooltip.innerHTML = starName;

            // Set the cursor icon
            document.body.style.cursor = "help";
        } else {
            // Hide tooltip and reset cursor
            this.tooltip.style.visibility = "hidden";
            document.body.style.cursor = "auto";
        }
    }
}
