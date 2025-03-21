import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";

export type InputStarRecord = {
    starKey?: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    flags?: number;
    name: string;
    type: StellarTypes;
    planetCount?: number;

    unk1?: number;
    unk2?: number;
    unk3?: number;
    unk4?: number;
    unk5?: number;
    unk6?: number;
    unk7?: number;
    unk8?: number;
    unk9?: number;
    unk10?: number;
}

export type StarRecord = {
    name: string;
    type: StellarTypes;
    position: Vector3;
    unk?: any;
    unk2?: any;
};
interface StarSystemMesh extends Mesh {
    userData: StarRecord;
}

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

const GALAXY_INFLATE_FACTOR = 2;

export default function generateMeshes(inputStarRecords: InputStarRecord[]): StarSystemMesh[] {
    console.log("Generating star meshes...");

    const meshes = inputStarRecords.map((record) => {
        // Set up star system points geometry
        const position = new Vector3(record.position.x, record.position.y, record.position.z);
        const material = MATERIAL_PER_STELLAR.get(record.type)!;
        const mesh = new Mesh(STAR_GEOMETRY, material);
        mesh.position.set(position.x, position.z * GALAXY_INFLATE_FACTOR, -position.y);
        mesh.userData = {
            name: record.name,
            position,
            type: record.type,
        };
        return mesh as unknown as StarSystemMesh;
    });

    console.log("Done.");
    return meshes;
}
