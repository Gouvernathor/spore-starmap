import apiClient from "./apiClient";
import MouseInput from "./mouseInput";
import SceneManager from "./scene";
import GUIManager from "./gui";
import generateMeshes, { InputStarRecord } from "./starSystems";
import { Vector3 } from "three";

const mouseInput = new MouseInput();
const sceneManager = new SceneManager();
const guiManager = new GUIManager((globalThis as any).jsPanel);

// Handle uploading file to server when selected
document.addEventListener("DOMContentLoaded", function(event) {
    const fileInput = document.getElementById("file-input") as HTMLInputElement|null;
    if (!fileInput) {
        return;
    }

    // Clear file input on click
    fileInput.addEventListener("click", function() {
        fileInput.value = "";
    });

    // Upload file when selected
    fileInput.addEventListener("change", function(event) {
        if (fileInput.files?.length) {
            const [file, ..._] = fileInput.files;

            console.log("Uploading file " + file.name);

            uploadStarRecordsFile(file);
        }
    });
});

// Upload star records file to be processed by the server
function uploadStarRecordsFile(file: File) {
    guiManager.showLoadingOverlay();

    const formData = new FormData();
    formData.append("file", file);
    apiClient.post("upload-stars-db", formData)
        .then((response) => {
            renewMeshes(response.data);
            guiManager.hideLoadingOverlay();
        })
        .catch((error) => {
            console.error(error);
            guiManager.hideLoadingOverlay();
        });
}

function renewMeshes(inputStarRecords: InputStarRecord[]) {
    sceneManager.clearMeshes();
    const meshes = generateMeshes(inputStarRecords);
    sceneManager.addMeshes(meshes);
}

// Setup key input
document.addEventListener("keydown", function(event) {
    if (event.key === " ") {
        sceneManager.controls.target.set(0, 0, 0);
        sceneManager.glideCameraToPosition(new Vector3(10, 50, 10));
    }
});

// Request sample star records and set up meshes in scene manager
guiManager.showLoadingOverlay();
renewMeshes((await apiClient.get("get-example-stars")).data);
guiManager.hideLoadingOverlay();


// Start rendering loop
function render() {
    // Update the scene
    sceneManager.update(guiManager.isMouseOnUIPanel);

    // Cast ray from screen to mouse cursor position
    sceneManager.raycast(mouseInput.cursor);

    // Update the GUI
    guiManager.update(mouseInput.cursor, sceneManager.pointedObject);

    // Render a frame
    requestAnimationFrame(render);
    sceneManager.render();
}
render();
