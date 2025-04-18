import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gameState, globals } from './config.js';
import { setupScene } from './worldBuilder.js';
import { initEggCreator, loadEggs } from './eggCreator.js';
import { initEggPlacement } from './eggPlacement.js';
import { initUI, updateLeaderboard } from './uiController.js';
import { setupResizeHandler } from './utils.js';

// Initialize the game
async function init() {
  // Initialize room and database connection
  globals.room = new WebsimSocket();
  await globals.room.initialize();
  
  // Setup 3D scene
  setupScene();
  
  // Setup orbit controls
  globals.controls = new OrbitControls(globals.camera, globals.renderer.domElement);
  globals.controls.enableDamping = true;
  globals.controls.dampingFactor = 0.05;
  globals.controls.update();
  
  // Initialize UI components
  initUI();
  initEggCreator();
  initEggPlacement();
  
  // Setup window resize handler
  setupResizeHandler();
  
  // Load eggs and update leaderboard
  loadEggs();
  updateLeaderboard();
  
  // Start animation loop
  animate();
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  globals.controls.update();
  globals.renderer.render(globals.scene, globals.camera);
}

// Start the game
init();