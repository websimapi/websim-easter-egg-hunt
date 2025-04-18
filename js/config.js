// Central configuration for the game
export const config = {
  groundSize: 50,
  treeCount: 15,
  rockCount: 20,
  maxTreeHeight: 5,
  minTreeHeight: 2,
  maxRockSize: 1.0,
  minRockSize: 0.3,
  skyColor: 0x87ceeb, // Sky blue
  groundColor: 0x8bc34a,
  notificationDuration: 3000
};

// Shared game state
export const gameState = {
  eggs: [],
  currentEgg: null,
  selectedEgg: null,
  isPlacingEgg: false,
  scores: {}
};

// Global references to shared resources
export const globals = {
  room: null, // WebsimSocket instance
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  ground: null
};