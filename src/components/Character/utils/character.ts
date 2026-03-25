import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const encryptedBlob = await decryptFile(
          "/models/character.enc?v=2",
          "MyCharacter12"
        );
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        let character: THREE.Object3D;
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;
            await renderer.compileAsync(character, camera, scene);
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;

                // Change clothing colors to match site theme
                if (mesh.material) {
                  if (mesh.name === "BODY.SHIRT") { // The shirt mesh
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#8B4513");
                    mesh.material = newMat;
                  } else if (mesh.name === "Pant") {
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#000000");
                    mesh.material = newMat;
                  }
                }

                child.castShadow = true;
                child.receiveShadow = true;
                mesh.frustumCulled = true;

                // Add facial expressions for energy and smile
                if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
                  const smileIndex = mesh.morphTargetDictionary['mouthSmile'];
                  const smileLeftIndex = mesh.morphTargetDictionary['mouthSmileLeft'];
                  const smileRightIndex = mesh.morphTargetDictionary['mouthSmileRight'];
                  const eyeWideLeftIndex = mesh.morphTargetDictionary['eyeWideLeft'];
                  const eyeWideRightIndex = mesh.morphTargetDictionary['eyeWideRight'];
                  const eyeBlinkLeftIndex = mesh.morphTargetDictionary['eyeBlinkLeft'];
                  const eyeBlinkRightIndex = mesh.morphTargetDictionary['eyeBlinkRight'];

                  if (smileIndex !== undefined) mesh.morphTargetInfluences[smileIndex] = 0.7;
                  if (smileLeftIndex !== undefined) mesh.morphTargetInfluences[smileLeftIndex] = 0.7;
                  if (smileRightIndex !== undefined) mesh.morphTargetInfluences[smileRightIndex] = 0.7;
                  
                  if (eyeWideLeftIndex !== undefined) mesh.morphTargetInfluences[eyeWideLeftIndex] = 0.5;
                  if (eyeWideRightIndex !== undefined) mesh.morphTargetInfluences[eyeWideRightIndex] = 0.5;
                  
                  // Ensure eyes aren't partially blinked (which looks sleepy)
                  if (eyeBlinkLeftIndex !== undefined) mesh.morphTargetInfluences[eyeBlinkLeftIndex] = 0;
                  if (eyeBlinkRightIndex !== undefined) mesh.morphTargetInfluences[eyeBlinkRightIndex] = 0;
                }
              }
            });
            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();
            character!.getObjectByName("footR")!.position.y = 3.36;
            character!.getObjectByName("footL")!.position.y = 3.36;

            // Monitor scale is handled by GsapScroll.ts animations

            dracoLoader.dispose();
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
