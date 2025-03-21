import { OrbitControls } from "@three-ts/orbit-controls";
import { Color, CubeTextureLoader, Intersection, Mesh, Object3D, Object3DEventMap, PerspectiveCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from "three";

function windowRatio() {
    return window.innerWidth / window.innerHeight;
}

export default class SceneManager {
    private readonly renderer: WebGLRenderer;
    private readonly scene: Scene;
    private readonly camera: PerspectiveCamera;
    private cameraTargetPos: Vector3;
    private isCameraGliding: boolean;
    public readonly controls: OrbitControls;
    private readonly raycaster: Raycaster;
    private isEnabledRaycasting: boolean;
    #pointedObject: Intersection<Object3D<Object3DEventMap>>|null = null;

    get pointedObject() {
        return this.#pointedObject;
    }

    constructor() {
        // Setup renderer
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Setup scene
        this.scene = new Scene();
        this.scene.background = new Color(0x000000);

        // Setup skybox
        const texName = "img/starfield.png"; // convert to webp, and actually use scene-3d
        const skyTextures = new Array(6).fill(texName);

        const textureCube = new CubeTextureLoader().load(skyTextures);
        this.scene.background = textureCube;

        // Setup camera & orbitcontrols
        this.camera = new PerspectiveCamera(75, windowRatio(), .1, 3500);
        this.cameraPosition.set(10, 50, 10);
        this.camera.updateProjectionMatrix();

        this.cameraTargetPos = new Vector3(); // to glide to a position
        this.isCameraGliding = false;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        // this.controls.screenSpacePanning = false;

        // Setup raycasting
        this.raycaster = new Raycaster();
        this.isEnabledRaycasting = true;

        // Bind event listeners
        this.bindEventListeners();
    }

    private bindEventListeners() {
        window.addEventListener("resize", this.onResize.bind(this));
    }

    private onResize(event: Event) {
        this.camera.aspect = windowRatio();
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Add the given meshes to the scene
     */
    public addMeshes(meshes: ReadonlyArray<Mesh>) {
        console.log("Populating scene with meshes...");
        for (const mesh of meshes) {
            this.scene.add(mesh);
            mesh.updateMatrixWorld();
        }
        this.scene.updateMatrixWorld();
        console.log("Done.");
    }

    /**
     * Clears all meshes from the scene
     */
    public clearMeshes() {
        console.log("Clearing all meshes from scene...");
        for (const child of this.scene.children) {
            if (child instanceof Mesh) {
                child.geometry.dispose();
                child.material.dispose();
                this.scene.remove(child);
            }
        }
        this.scene.updateMatrixWorld();
        console.log("Done.");
    }

    public get cameraPosition() {
        return this.camera.position;
    }

    /**
     * Smoothly move the camera to the given position
     */
    public glideCameraToPosition(position: Vector3) {
        this.isCameraGliding = true;
        this.cameraTargetPos = position;
    }

    /**
     * Update scene objects
     */
    public update(isMouseOnUIPanel: boolean) {
        // Update camera controls
        this.controls.update();

        // Update camera matrix
        this.camera.updateMatrix();

        // Disable raycasting if mouse is on a UI panel
        this.isEnabledRaycasting = !isMouseOnUIPanel;

        // Update camera position if gliding to target
        if (this.isCameraGliding) {
            // Disable camera controls while gliding
            this.controls.enabled = false;

            if (this.cameraPosition.distanceTo(this.cameraTargetPos) > .05) {
                // Lerp camera position towards target
                this.cameraPosition.lerp(this.cameraTargetPos, .05);
            } else {
                // Snap camera to target
                this.cameraPosition.copy(this.cameraTargetPos);
                this.isCameraGliding = false;
                this.controls.enabled = true;
            }
        }
    }

    /**
     * Cast ray from camera to pointer to detect stars
     */
    public raycast(cursorPos: Vector2) {
        if (!this.isEnabledRaycasting) {
            return;
        }

        this.raycaster.setFromCamera(cursorPos, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, false);

        // If the raycast cursor hits a star system
        if (intersects.length > 0) {
            this.#pointedObject = intersects[0];
        } else {
            this.#pointedObject = null;
        }
    }

    /**
     * Render a single frame
     */
    public render() {
        this.renderer.render(this.scene, this.camera);
    }
}
