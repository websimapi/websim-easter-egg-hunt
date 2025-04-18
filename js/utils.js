import { config } from './config.js';

// Utility functions
export function showNotification(message, duration = config.notificationDuration) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.opacity = 1;
  
  setTimeout(() => {
    notification.style.opacity = 0;
  }, duration);
}

// Handle window resize
export function setupResizeHandler() {
  const { camera, renderer } = window.globals;
  
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}