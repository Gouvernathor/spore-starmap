import { OrbitControls } from "@three-ts/orbit-controls";
import { Color, CubeTextureLoader, PerspectiveCamera, Raycaster, Scene, Vector2, WebGLRenderer } from "three";

function windowRatio() {
    return window.innerWidth / window.innerHeight;
}

export default class SceneManager {
    private renderer: WebGLRenderer;
    private scene: Scene;
    private camera: PerspectiveCamera;
    private cameraTargetPos: Vector2;
    private isCameraGliding: boolean;
    private controls: OrbitControls;
    private raycaster: Raycaster;
    private isEnabledRaycasting: boolean;

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
        this.camera.position.set(10, 50, 10);
        this.camera.updateProjectionMatrix();

        this.cameraTargetPos = new Vector2(); // to glide to a position
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
}
