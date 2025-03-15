import { Vector2 } from "three";

export default class MouseInput {
    private isEnabled = true;
    public readonly cursor = new Vector2(0, 0);

    private readonly mouseDownPos = new Vector2(0, 0);
    private readonly mouseUpPos = new Vector2(0, 0);
    private mouseDownTime = 0;
    private mouseUpTime = 0;
    private lastMouseUpTime = 0;
    private clickDurMs = 0;

    private static readonly LONG_CLICK_THRESHOLD = 250;
    private static readonly STATIONARY_CLICK_TOLERANCE = 0;

    constructor() {
        this.bindEventListeners();
    }

    private bindEventListeners() {
        window.addEventListener("mousedown", this.onMouseDown.bind(this));
        window.addEventListener("mouseup", this.onMouseUp.bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    /**
     * Mouse down event listener
     */
    private onMouseDown(event: MouseEvent) {
        if (!this.isEnabled) return;
        this.mouseDownTime = Date.now();
        this.mouseDownPos.set(event.x, event.y);
    }

    /**
     * Mouse up event listener
     */
    private onMouseUp(event: MouseEvent) {
        if (!this.isEnabled) return;
        this.lastMouseUpTime = this.mouseUpTime;
        this.mouseUpTime = Date.now();
        this.mouseUpPos.set(event.x, event.y);
        this.clickDurMs = this.mouseUpTime - this.mouseDownTime;
    }

    /**
     * Mouse move event listener
     */
    private onMouseMove(event: MouseEvent) {
        if (!this.isEnabled) return;
        this.cursor.set(
            event.clientX / window.innerWidth * 2 - 1,
            -event.clientY / window.innerHeight * 2 + 1);
    }

    /**
     * Checks if the click was longer than the long click threshold
     */
    public wasLongClick() {
        return this.clickDurMs > MouseInput.LONG_CLICK_THRESHOLD;
    }

    /**
     * Checks if the mouse moved during the last click
     */
    public wasStationaryClick() {
        return this.mouseUpPos.distanceTo(this.mouseDownPos) <= MouseInput.STATIONARY_CLICK_TOLERANCE;
    }

    /**
     * Checks if the last click was the second of a double click
     */
    public wasDoubleClick() {
        return (this.mouseUpTime - this.lastMouseUpTime) < MouseInput.LONG_CLICK_THRESHOLD;
    }
}
