import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";

export enum StellarTypes {
    GalacticCore = 1,
    BlackHole,
    ProtoPlanetary,
    StarG, // Yellow
    StarO, // Blue
    StarM, // Red
    BinaryOO,
    BinaryOM,
    BinaryOG,
    BinaryGG,
    BinaryGM,
    BinaryMM,
}

const MESH_STAR_RADIUS = 0.5;

const MATERIALS = {
    "whiteStar":  new MeshBasicMaterial({ color: 0xffffff }),
    "redStar":    new MeshBasicMaterial({ color: 0xd36956 }),
    "yellowStar": new MeshBasicMaterial({ color: 0xe5bd72 }),
    "blueStar":   new MeshBasicMaterial({ color: 0x64b3fc }),
    "binaryStar": new MeshBasicMaterial({ color: 0xd1d1f6 }),
    "blackHole":  new MeshBasicMaterial({ color: 0x0000ff }),
    "protoDisk":  new MeshBasicMaterial({ color: 0xff0000 }),
};
const STAR_GEOMETRY = new SphereGeometry(MESH_STAR_RADIUS, 6, 4);
const MATERIAL_PER_STELLAR = new Map([
    [StellarTypes.StarM, MATERIALS.redStar],
    [StellarTypes.BinaryMM, MATERIALS.redStar],
    [StellarTypes.StarG, MATERIALS.yellowStar],
    [StellarTypes.BinaryGG, MATERIALS.yellowStar],
    [StellarTypes.StarO, MATERIALS.blueStar],
    [StellarTypes.BinaryOO, MATERIALS.blueStar],
    [StellarTypes.BlackHole, MATERIALS.blackHole],
    [StellarTypes.ProtoPlanetary, MATERIALS.protoDisk],
    [StellarTypes.BinaryOM, MATERIALS.binaryStar],
    [StellarTypes.BinaryOG, MATERIALS.binaryStar],
    [StellarTypes.BinaryGM, MATERIALS.binaryStar],
    [StellarTypes.GalacticCore, MATERIALS.whiteStar],
]);

export default class StarSystemManager {
    #meshes: Mesh[];

    constructor(
        private starRecords: any[] = [],
        meshes = [],
    ) {
        this.#meshes = meshes;
    }

    get meshes(): ReadonlyArray<Mesh> {
        return this.#meshes;
    }

    public generateMeshes() {
        console.log("Generating star meshes...");

        this.#meshes = [];

        // Set up star system points geometry
        const stars = this.starRecords.map((record) => {
            const position = new Vector3(record.position.x, record.position.y, record.position.z);
            return {
                name: record.name,
                position,
                type: record.type,
                unk: record.unk2,
            };
        });

        this.#meshes = stars.map((star) => {
            const material = MATERIAL_PER_STELLAR.get(star.type)!;

            const mesh = new Mesh(STAR_GEOMETRY, material);
            mesh.position.set(star.position.x, star.position.z * 2, -star.position.y);
            mesh.userData = star;
            return mesh;
        });

        console.log("Done.");
    }
}
