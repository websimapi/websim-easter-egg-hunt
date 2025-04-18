import * as THREE from 'three';
import { config, globals } from './config.js';

// Setup Three.js scene
export function setupScene() {
  // Initialize scene
  globals.scene = new THREE.Scene();
  
  // Setup camera
  globals.camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  globals.camera.position.set(0, 5, 10);
  
  // Setup renderer
  globals.renderer = new THREE.WebGLRenderer({ antialias: true });
  globals.renderer.setSize(window.innerWidth, window.innerHeight);
  globals.renderer.setClearColor(config.skyColor);
  document.getElementById('game-container').appendChild(globals.renderer.domElement);
  
  // Setup lighting
  setupLighting();
  
  // Create ground
  createGround();
  
  // Add decorative elements
  addDecorations();
}

// Setup scene lighting
function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  globals.scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  globals.scene.add(directionalLight);
}

// Create ground plane
function createGround() {
  const groundGeometry = new THREE.PlaneGeometry(config.groundSize, config.groundSize);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: config.groundColor,
    roughness: 0.8,
    metalness: 0.2
  });
  
  globals.ground = new THREE.Mesh(groundGeometry, groundMaterial);
  globals.ground.rotation.x = -Math.PI / 2;
  globals.ground.position.y = -0.5;
  globals.scene.add(globals.ground);
}

// Add decorative elements to the scene
function addDecorations() {
  // Add trees
  for(let i = 0; i < config.treeCount; i++) {
    const treeHeight = config.minTreeHeight + Math.random() * (config.maxTreeHeight - config.minTreeHeight);
    const treeGeometry = new THREE.ConeGeometry(1, treeHeight, 8);
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, treeHeight/2);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    
    const x = Math.random() * 40 - 20;
    const z = Math.random() * 40 - 20;
    
    tree.position.set(x, treeHeight/2, z);
    trunk.position.set(x, -treeHeight/4, z);
    
    globals.scene.add(tree);
    globals.scene.add(trunk);
  }
  
  // Add rocks
  for(let i = 0; i < config.rockCount; i++) {
    const rockSize = config.minRockSize + Math.random() * (config.maxRockSize - config.minRockSize);
    const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      roughness: 0.9
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    
    const x = Math.random() * 40 - 20;
    const z = Math.random() * 40 - 20;
    
    rock.position.set(x, rockSize/2 - 0.5, z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    
    globals.scene.add(rock);
  }
}