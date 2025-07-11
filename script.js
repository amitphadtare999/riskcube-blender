import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { gsap } from "gsap";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { degToRad } from 'three/src/math/MathUtils.js';
import { mx_gradient_float } from 'three/src/nodes/materialx/lib/mx_noise.js';
const fontLoader = new FontLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(38, 35, 35); // x, y, z coordinates
camera.lookAt(15, 15, 15);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,    // Left-click rotates
  MIDDLE: THREE.MOUSE.DOLLY,   // Middle-click zooms
  RIGHT: null                  // Right-click disabled
};
controls.enableDamping = true; 
controls.dampingFactor = 0.05;
controls.screenSpacePanning = true;
controls.maxPolarAngle = degToRad(50);
controls.maxAzimuthAngle=degToRad(50)
controls.minDistance = 25; 
controls.maxDistance = 40; 
// Lighting
const dirLight = new THREE.DirectionalLight(0xfffff, 1.5);
dirLight.position.set(0,1, 2);
dirLight.color.setHSL(0.58, 0.5, 0.8); // HSV blue hue
scene.add(dirLight);

// Neutral ambient light
const ambLight = new THREE.AmbientLight(0xb8d1e6, 0.34);
scene.add(ambLight);
// const ambientLight = new THREE.AmbientLight(0xc5e9ef);
// scene.add(ambientLight);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(1, 1, 1);
// scene.add(directionalLight);
const light1 = new THREE.HemisphereLight(0xffffff, 0x70b4f7, 1);
light1.position.set(0, 2, 0);
scene.add(light1);
const light2 = new THREE.DirectionalLight(0xffffff, 1.2);
light2.position.set(3, 10, -5);
light2.castShadow = true;
scene.add(light2);
// Hover system
let risk_mesh= null
// 1. Load a matcap texture


// Apply to pieces

// 3. Apply to all puzzle pieces 
const defaultMaterial = new THREE.ShaderMaterial({
    uniforms: {
    topColor: { value: new THREE.Color(0xffffff) },
    bottomColor: { value: new THREE.Color(0xadd8e6) },
    offset: { value: 1.0 },
    exponent: { value: 1.0 }
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    
    void main() {
      float h = normalize(vWorldPosition).y;
      h = clamp((h + offset) * exponent, 0.0, 1.0);
      gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
    }
  `})
const hoverMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x068bde, // Blue
    metalness: 0,
  roughness: 0,
  emissive: 0x33bbe8, // Light blue emission
  emissiveIntensity: 0.1
});

// Load model
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
const puzzlePieces = [];
const originalPositions = {};
const textPositions={};
var pass=null
// Raycaster setup for interactions
const mouse = new THREE.Vector2();
class ColorAnimator {
  static animate(mesh, targetColor, duration = 0.2, ease = "power2.out") {
    const startColor = mesh.material.color.clone();
    const endColor = new THREE.Color(targetColor);
    return gsap.to({ progress: 0 }, {
      progress: 1,
      duration,
      ease,
      onUpdate: function() {
        mesh.material.color.r = startColor.r + (endColor.r - startColor.r) * this.progress();
        mesh.material.color.g = startColor.g + (endColor.g - startColor.g) * this.progress();
        mesh.material.color.b = startColor.b + (endColor.b - startColor.b) * this.progress();
        mesh.material.needsUpdate = true;
      }
    });
  }
}
const cubeData = {
  1: {
    title: "ALM",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 3.2430810928344727, y: 0.0025000572204589844, z: 1.7860271453857 },
  },
  2: {
    title: "  Capital\n\nAssessment",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 7.7, y: 0.0087, z: 6.844 },
  },
  3: {
    title: " Credit\n\n Rating\n\nEngine",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: -Math.PI/2 },
    position: { x: 4.522192859649658, y: 0.0087, z: -3.8546226024627686 },
  },
  4: {
    title: "Derivator",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 3.122192859649658, y: 0, z: -3.1 },
  },
  5: {
    title: "emp1",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 3.2, y: 0, z:1.85 },
  },
  6: {
    title: "emp2",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: -Math.PI/2 },
    position: { x: 3.6, y: 0, z: -3.67 },
  },
  7: {
    title: "emp3",
    font: 1,
    size: 10,
    rotation: { x: Math.PI, y: 0, z: 0 },
    position: { x: 7.8, y: -1.0, z: 6.8 },
  },
  8: {
    title: "emp4",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: -Math.PI/2 },
    position: { x: 3.7, y: 0, z: -3.75 },
  },
  9: {
    title: "ICAAP",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: -Math.PI/2 },
    position: { x: 3.562, y: 0.0087, z: 1.25 },
  },
  10: {
    title: "IFRS9",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: -Math.PI/2 },
    position: { x: 3.5, y: 0.0087, z: -3.8 },
  },
  11: {
    title: "Provisioning\n   System",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 2.9219, y: 0.0087, z: -3.5 },
  },
  12: {
    title: "Risk Studio",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 2.9022, y: 0.0087, z: -3.1 },
  },
  13: {
    title: "  RiskCube\nData Model",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: -Math.PI/2 },
    position: { x: 3.652, y: 0.0087, z:6.3 },
  },
  14: {
    title: " Stress\n\nTesting",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: -Math.PI/2 },
    position: { x: 3.722, y: 0.0087, z: 1.2 },
  },
  15: {
    title: "      User\n\n\nManagement",
    font: 1,
    size: 10,
    rotation: { x: 0, y: 0, z: Math.PI },
    position: { x: 9.7022, y: 0.0087, z: 7 },
  },
};
var result={}
function getPosition(i){
    return coordinates[i]
}
let i=1
// Load the 3D model
function loadModel() {
    loader.load(
        './v6.glb',
        (gltf) => {
            const model = gltf.scene;
            console.log(model.position)
            scene.add(model);
            // Set scene background color (RGB values 0-1)
            scene.background = new THREE.Color(0xffffff); // Pure white
            model.position.set(0, 7, 0); 
            model.rotation.set(0.2, 12.8, -0.05); 
            model.scale.set(1.1, 1.1, 1.1);
            model.traverse((child) => {
            if (child.isMesh) {
                if (child.parent.name==="puzzles_vers1" && child.name!=="risk_management") {
                    puzzlePieces.push(child);
                    child.material = child.material.clone(); 
                    // child.children.forEach(text => {           
                    //     child.remove(text);           
                    //     textPositions[text.uuid]=text.position
                    //     child.add(text)
                    //     text.material = text.material.clone(); 
                    //     pass=text
                    // // ensure unique material for text
                    //     }); 
                    // console.log(pass)
                    fontLoader.load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r146/examples/fonts/helvetiker_regular.typeface.json', 
                        (font) => {
                            add3DTextToPiece(child,font)
                        })                     
                    originalPositions[child.uuid] = child.position.y;              
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
                if (child.name==="risk_management"){
                    risk_mesh=child;
                    child.material=hoverMaterial;
                    risk_mesh.material=child.material.clone();                        
                }
            }
            });
            centerModel(model); 
            console.log('Model loaded successfully');
        },
        undefined,
        (error) => {
            console.error('Error loading model:', error);
        }        
    );
}
puzzlePieces.forEach(piece=>{
    piece.material=defaultMaterial.copy();
}
    
)
console.log(textPositions)
// 4. Function to create 3D text
function add3DTextToPiece(piece,font) {
    result=cubeData[i]
    console.log(piece)
    const texts=["ALM","Capital\n\nAssessment","Credit\n\nRating\n\nEngine","Derivator","emp1","emp2","emp3","emp4","ICAAP","IFRS9","Provisioning\nSystem","Risk Studio",
    "  RiskCube\nData Model","Stress\n\nTesting","      User\n\n\nManagement"]
    var textGeo = new TextGeometry(result.title, {
        font: font,
        size: 0.28,          // Relative to piece size
        height: 0.01,  
        depth: 0.05,     // Extrusion depth
        curveSegments: 4,
        bevelEnabled: false
    });
    // Center the text
    textGeo.computeBoundingBox();
    var center = new THREE.Vector3();
    textGeo.boundingBox.getCenter(center);
    var textMat = hoverMaterial
    textMat=textMat.clone()
    textGeo.rotateX(result.rotation.x)
    textGeo.rotateY(result.rotation.y)
    textGeo.rotateZ(result.rotation.z)
    var textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.x=result.position.x
    textMesh.position.y=result.position.y
    textMesh.position.z=result.position.z
    result={}
    i+=1
    // textGeo.rotateZ(-Math.PI/2)
    // textGeo.translate(piece.position.x-8.32690844690471,0,0);
    // textMesh.position.copy(textPositions[UUID])
    // textMesh.position.x=0.25192859649658
    // textMesh.position.y=0.008749961853027344
    // textMesh.position.z= -6
    textMesh.lookAt(
        textMesh.position.clone().add(new THREE.Vector3(0,1, 0))
    );
    piece.add(textMesh);
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );  
    renderer.render( scene, camera );
  // Make text always face camera
    textMesh.userData.isText = true;
    return textMesh;
}
// 5. Update in your animation loop to face camera
const raycaster = new THREE.Raycaster();
// Center the model in the scene
function centerModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);
}
let hoveredPiece = null;
let check_hovered = null;
function resetAllPieces(intersects) {
    if(intersects.length>0) {
        if(intersects[0].object.parent.name==="puzzles_vers1"){
            check_hovered = intersects[0].object;
        }else{
            check_hovered = intersects[0].object.parent;
        }
    }
    if(hoveredPiece===check_hovered){ check_hovered=null;
        return;
    }
    if (hoveredPiece) {   
        const originalY = originalPositions[hoveredPiece.uuid];
        gsap.to(hoveredPiece.position, {
            y: originalY,
            duration: 0.2,
            ease: "power1.out",
            delay: 0.1
            });           
        const tl = gsap.timeline();     
      // Position reset    
      // Color reset
        tl.add(ColorAnimator.animate(hoveredPiece, defaultMaterial.color), 0);
        hoveredPiece.children.forEach(text => {
            tl.add(ColorAnimator.animate(text, hoverMaterial.color), 0);
        });
        hoveredPiece=null;  
    }
}
function handleHover(intersects) {
    const tl = gsap.timeline();
    if (intersects.length > 0 ) {
        if(intersects[0].object.parent.name==="puzzles_vers1"){
            hoveredPiece = intersects[0].object;
        }else{
            hoveredPiece = intersects[0].object.parent;
        }
        console.log("Hovered piece:", hoveredPiece.name);       
        gsap.to(hoveredPiece.position, {
            y: originalPositions[hoveredPiece.uuid] + 1,
            duration: 0.2,
            ease: "power1.out",
            delay:0.1
        });
        if(hoveredPiece!== risk_mesh){
            tl.add(ColorAnimator.animate(risk_mesh, defaultMaterial.color), 0);
        }                       
        tl.add(ColorAnimator.animate(hoveredPiece, hoverMaterial.color), 0);
        hoveredPiece.children.forEach(text => {
            tl.add(ColorAnimator.animate(text, defaultMaterial.color), 0);
        });
        hoveredPiece.userData.isHovered = true;
    }
    if(hoveredPiece!== risk_mesh && hoveredPiece!==null){
        tl.add(ColorAnimator.animate(risk_mesh, defaultMaterial.color), 0);
        risk_mesh.children.forEach(text => {
            tl.add(ColorAnimator.animate(text, hoverMaterial.color), 0);
        });
    }else{
        tl.add(ColorAnimator.animate(risk_mesh, hoverMaterial.color), 0);
        risk_mesh.children.forEach(text => {
            tl.add(ColorAnimator.animate(text, defaultMaterial.color), 0);
        });
    }
}
// Mouse move event handler
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(puzzlePieces);
    resetAllPieces(intersects);
    handleHover(intersects);
}
// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
// Animation loop
function animate() {
    requestAnimationFrame(animate); 
    controls.update();
    renderer.render(scene, camera);
}
// Initialize everything
function init() {
    loadModel();
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    animate();
}
init();