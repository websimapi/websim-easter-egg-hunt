import { globals } from './config.js';

// Initialize UI components
export function initUI() {
  // Subscribe to room state changes to update the leaderboard
  globals.room.subscribeRoomState(() => {
    updateLeaderboard();
  });
}

// Update leaderboard with current scores
export function updateLeaderboard() {
  const leaderboardContent = document.getElementById('leaderboard-content');
  const scores = globals.room.roomState.scores || {};
  
  // Sort players by score
  const sortedPlayers = Object.entries(scores)
    .map(([clientId, score]) => {
      const username = globals.room.peers[clientId]?.username || 'Unknown player';
      return { clientId, username, score };
    })
    .sort((a, b) => b.score - a.score);
  
  // Update leaderboard HTML
  leaderboardContent.innerHTML = sortedPlayers.length > 0 
    ? sortedPlayers.map((player, index) => 
      `<div style="display: flex; justify-content: space-between; margin: 5px 0;">
        <div>${index + 1}. ${player.username}</div>
        <div>${player.score} egg${player.score !== 1 ? 's' : ''}</div>
      </div>`
    ).join('')
    : '<div>No eggs found yet. Start hunting!</div>';
}