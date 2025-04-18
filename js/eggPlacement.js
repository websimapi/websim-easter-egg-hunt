import * as THREE from 'three';
import { gameState, globals } from './config.js';
import { showNotification } from './utils.js';
import { createEggModel, loadEggs } from './eggCreator.js';

// Initialize egg placement functionality
export function initEggPlacement() {
  const hideEggBtn = document.getElementById('hide-egg-btn');
  
  hideEggBtn.addEventListener('click', handleHideEggClick);
  globals.renderer.domElement.addEventListener('click', handleSceneClick);
}

// Handle hide egg button click
async function handleHideEggClick() {
  const hideEggBtn = document.getElementById('hide-egg-btn');
  
  if (gameState.isPlacingEgg) {
    // Cancel placing
    if (gameState.selectedEgg) {
      globals.scene.remove(gameState.selectedEgg);
      gameState.selectedEgg = null;
    }
    
    gameState.isPlacingEgg = false;
    hideEggBtn.innerHTML = 'Hide Egg';
    globals.controls.enabled = true;
    return;
  }
  
  // Start placing egg
  const eggs = await globals.room.collection('eggs').getList();
  
  if (eggs.length === 0) {
    showNotification('No eggs available to hide. Create some first!');
    return;
  }
  
  showEggSelectionUI(eggs);
}

// Show egg selection UI
function showEggSelectionUI(eggs) {
  const eggSelection = document.createElement('div');
  eggSelection.className = 'panel';
  eggSelection.style.position = 'absolute';
  eggSelection.style.top = '50%';
  eggSelection.style.left = '50%';
  eggSelection.style.transform = 'translate(-50%, -50%)';
  eggSelection.style.zIndex = '100';
  eggSelection.style.width = '300px';
  eggSelection.style.maxHeight = '400px';
  eggSelection.style.overflowY = 'auto';
  eggSelection.innerHTML = `
    <h3>Select an Egg to Hide</h3>
    <div id="egg-list"></div>
    <button id="cancel-selection" class="btn" style="background-color: #f44336; margin-top: 10px;">Cancel</button>
  `;
  
  document.body.appendChild(eggSelection);
  
  const eggList = document.getElementById('egg-list');
  
  eggs.forEach(egg => {
    const eggItem = document.createElement('div');
    eggItem.style.display = 'flex';
    eggItem.style.alignItems = 'center';
    eggItem.style.marginBottom = '10px';
    eggItem.style.cursor = 'pointer';
    eggItem.style.padding = '5px';
    eggItem.style.borderRadius = '4px';
    
    eggItem.innerHTML = `
      <img src="${egg.textureUrl}" alt="Egg" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
      <div>${egg.description}</div>
    `;
    
    eggItem.addEventListener('click', async () => {
      document.body.removeChild(eggSelection);
      selectEggToPlace(egg);
    });
    
    eggList.appendChild(eggItem);
  });
  
  document.getElementById('cancel-selection').addEventListener('click', () => {
    document.body.removeChild(eggSelection);
  });
}

// Select an egg to place in the scene
async function selectEggToPlace(egg) {
  const hideEggBtn = document.getElementById('hide-egg-btn');
  
  // Create egg model
  const eggModel = await createEggModel(egg.textureUrl);
  
  // Position at a random location initially
  const randomX = (Math.random() - 0.5) * 20;
  const randomZ = (Math.random() - 0.5) * 20;
  eggModel.position.set(randomX, 0, randomZ);
  
  globals.scene.add(eggModel);
  gameState.selectedEgg = eggModel;
  gameState.selectedEggData = egg;
  gameState.isPlacingEgg = true;
  
  hideEggBtn.innerHTML = 'Place Egg';
  globals.controls.enabled = false;
  
  showNotification('Click to place the egg on the ground.');
}

// Handle clicks on the scene
function handleSceneClick(event) {
  if (gameState.isPlacingEgg && gameState.selectedEgg) {
    placeEgg(event);
  } else {
    collectEgg(event);
  }
}

// Place an egg at the clicked location
function placeEgg(event) {
  const hideEggBtn = document.getElementById('hide-egg-btn');
  
  // Calculate click position on ground
  const rect = globals.renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), globals.camera);
  
  const intersects = raycaster.intersectObject(globals.ground);
  
  if (intersects.length > 0) {
    const point = intersects[0].point;
    gameState.selectedEgg.position.set(point.x, 0, point.z);
    
    // Hide the egg in the room state
    const hiddenEggs = globals.room.roomState.hiddenEggs || {};
    hiddenEggs[gameState.selectedEggData.id] = {
      x: point.x,
      y: 0,
      z: point.z,
      placedBy: globals.room.clientId
    };
    
    globals.room.updateRoomState({ hiddenEggs });
    
    // Name the egg for future reference
    gameState.selectedEgg.name = `egg-${gameState.selectedEggData.id}`;
    gameState.selectedEgg.userData = { 
      eggId: gameState.selectedEggData.id,
      placedBy: globals.room.clientId
    };
    
    // Reset state
    gameState.selectedEgg = null;
    gameState.selectedEggData = null;
    gameState.isPlacingEgg = false;
    hideEggBtn.innerHTML = 'Hide Egg';
    globals.controls.enabled = true;
    
    showNotification('Egg placed successfully!');
  }
}

// Collect an egg at the clicked location
function collectEgg(event) {
  // Check if clicked on an egg to collect it
  const rect = globals.renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), globals.camera);
  
  const allEggs = globals.scene.children.filter(obj => obj.name && obj.name.startsWith('egg-'));
  const intersects = raycaster.intersectObjects(allEggs);
  
  if (intersects.length > 0) {
    const clickedEgg = intersects[0].object;
    
    // Check if user is trying to collect their own egg
    if (clickedEgg.userData.placedBy === globals.room.clientId) {
      showNotification("You can't collect your own eggs!");
      return;
    }
    
    // Remove egg from scene and room state
    globals.scene.remove(clickedEgg);
    
    const hiddenEggs = {...globals.room.roomState.hiddenEggs};
    const eggId = clickedEgg.userData.eggId;
    
    if (hiddenEggs[eggId]) {
      delete hiddenEggs[eggId];
      globals.room.updateRoomState({ hiddenEggs });
      
      // Update score
      const scores = {...globals.room.roomState.scores} || {};
      scores[globals.room.clientId] = (scores[globals.room.clientId] || 0) + 1;
      globals.room.updateRoomState({ scores });
      
      showNotification('You found an egg! +1 point');
    }
  }
}