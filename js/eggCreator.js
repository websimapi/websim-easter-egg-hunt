import * as THREE from 'three';
import { gameState, globals } from './config.js';
import { showNotification } from './utils.js';

// Initialize egg creator UI
export function initEggCreator() {
  const createEggBtn = document.getElementById('create-egg-btn');
  const eggCreator = document.getElementById('egg-creator');
  const eggPrompt = document.getElementById('egg-prompt');
  const generateTextureBtn = document.getElementById('generate-texture-btn');
  const saveEggBtn = document.getElementById('save-egg-btn');
  const cancelEggBtn = document.getElementById('cancel-egg-btn');
  const eggPreview = document.getElementById('egg-preview');
  
  createEggBtn.addEventListener('click', () => {
    eggCreator.style.display = 'block';
  });
  
  cancelEggBtn.addEventListener('click', () => {
    eggCreator.style.display = 'none';
    eggPreview.innerHTML = '<span>Your egg texture will appear here</span>';
    eggPrompt.value = '';
    saveEggBtn.style.display = 'none';
  });
  
  generateTextureBtn.addEventListener('click', async () => {
    if (!eggPrompt.value.trim()) {
      showNotification('Please enter a description for your egg texture.');
      return;
    }
    
    try {
      generateTextureBtn.disabled = true;
      generateTextureBtn.innerHTML = '<span class="loading"></span> Generating...';
      
      // Append instruction for repeatable texture
      const fullPrompt = `${eggPrompt.value.trim()} - This image is to be a repeatable texture for an Easter egg.`;
      
      // Call LLM to generate image
      const result = await websim.imageGen({
        prompt: fullPrompt,
        aspect_ratio: "1:1"
      });
      
      // Display the generated texture
      eggPreview.innerHTML = `<img src="${result.url}" class="egg-image" alt="Generated Egg Texture">`;
      
      // Store the texture URL
      gameState.currentEgg = { textureUrl: result.url };
      
      // Show save button
      saveEggBtn.style.display = 'inline-block';
    } catch (error) {
      console.error('Error generating texture:', error);
      showNotification('Failed to generate texture. Please try again.');
    } finally {
      generateTextureBtn.disabled = false;
      generateTextureBtn.innerHTML = 'Generate Texture';
    }
  });
  
  saveEggBtn.addEventListener('click', async () => {
    if (!gameState.currentEgg) return;
    
    try {
      saveEggBtn.disabled = true;
      saveEggBtn.innerHTML = '<span class="loading"></span> Saving...';
      
      // Store egg in database
      const egg = await globals.room.collection('eggs').create({
        textureUrl: gameState.currentEgg.textureUrl,
        description: eggPrompt.value.trim()
      });
      
      // Close the egg creator
      eggCreator.style.display = 'none';
      eggPreview.innerHTML = '<span>Your egg texture will appear here</span>';
      eggPrompt.value = '';
      saveEggBtn.style.display = 'none';
      
      showNotification('Egg created successfully!');
      
      // Refresh eggs list
      loadEggs();
    } catch (error) {
      console.error('Error saving egg:', error);
      showNotification('Failed to save egg. Please try again.');
    } finally {
      saveEggBtn.disabled = false;
      saveEggBtn.innerHTML = 'Save Egg';
    }
  });
}

// Create an egg 3D model with the provided texture
export async function createEggModel(textureUrl) {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  
  // Create texture loader
  const textureLoader = new THREE.TextureLoader();
  
  // Load the texture
  const texture = await new Promise((resolve) => {
    textureLoader.load(textureUrl, (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      resolve(tex);
    });
  });
  
  const material = new THREE.MeshStandardMaterial({ 
    map: texture,
    roughness: 0.3,
    metalness: 0.2
  });
  
  const egg = new THREE.Mesh(geometry, material);
  
  // Make egg more egg-shaped
  egg.scale.y = 1.4;
  
  return egg;
}

// Load eggs from database into the scene
export async function loadEggs() {
  const eggs = await globals.room.collection('eggs').getList();
  const hiddenEggs = globals.room.roomState.hiddenEggs || {};
  
  // Add hidden eggs to the scene
  Object.keys(hiddenEggs).forEach(async (eggId) => {
    const hiddenEgg = hiddenEggs[eggId];
    const egg = eggs.find(e => e.id === eggId);
    
    if (egg && !globals.scene.getObjectByName(`egg-${eggId}`)) {
      const eggModel = await createEggModel(egg.textureUrl);
      eggModel.position.set(hiddenEgg.x, hiddenEgg.y, hiddenEgg.z);
      eggModel.name = `egg-${eggId}`;
      eggModel.userData = { eggId: eggId, placedBy: hiddenEgg.placedBy };
      globals.scene.add(eggModel);
    }
  });
  
  // Show hide egg button if there are eggs to hide
  document.getElementById('hide-egg-btn').style.display = eggs.length > 0 ? 'block' : 'none';
}