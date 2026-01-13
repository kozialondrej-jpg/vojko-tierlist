const fs = require('fs');
const path = require('path');

async function run() {
  const root = path.resolve(__dirname, '..');
  const playersPath = path.join(root, 'players.json');
  const matchesPath = path.join(root, 'matches.json');

  if (!fs.existsSync(playersPath)) {
    console.error('players.json not found at', playersPath);
    process.exit(1);
  }
  if (!fs.existsSync(matchesPath)) {
    console.error('matches.json not found at', matchesPath);
    process.exit(1);
  }

  const playersRaw = fs.readFileSync(playersPath, 'utf8');
  const matchesRaw = fs.readFileSync(matchesPath, 'utf8');

  let players; let matches;
  try {
    players = JSON.parse(playersRaw);
  } catch (err) {
    console.error('Failed to parse players.json:', err.message);
    process.exit(1);
  }
  try {
    matches = JSON.parse(matchesRaw);
  } catch (err) {
    console.error('Failed to parse matches.json:', err.message);
    process.exit(1);
  }

  // Build lookup map (case-insensitive)
  const map = new Map();
  players.forEach(p => {
    const key = (p.name || '').trim().toLowerCase();
    if (!key) return;
    map.set(key, p);
  });

  const summary = {};
  let created = 0;

  matches.forEach(m => {
    const p1 = (m.player1 || '').trim();
    const p2 = (m.player2 || '').trim();
    const scoreStr = (m.result || m.score || '').toString().trim();
    const match = scoreStr.match(/^(\d+)-(\d+)$/);
    if (!p1 || !p2 || !match) return; // ignore invalid
    const s1 = parseInt(match[1], 10);
    const s2 = parseInt(match[2], 10);
    if (s1 === s2) return; // tie -> no winner
    const winner = s1 > s2 ? p1 : p2;
    const key = winner.toLowerCase();
    let player = map.get(key);
    if (!player) {
      // create new player with default tier D
      player = { name: winner, tier: 'D', wins: 0 };
      players.push(player);
      map.set(key, player);
      created++;
    }
    player.wins = Number(player.wins || 0) + 1;
    summary[winner] = (summary[winner] || 0) + 1;
  });

  // Backup players.json
  const bakPath = path.join(root, `players.json.bak`);
  fs.writeFileSync(bakPath, playersRaw, 'utf8');

  // Write updated players.json
  fs.writeFileSync(playersPath, JSON.stringify(players, null, 2) + '\n', 'utf8');

  console.log('Applied wins from matches.json');
  console.log('Created new players:', created);
  console.log('Summary (wins added per player):');
  Object.keys(summary).forEach(k => console.log(` - ${k}: +${summary[k]}`));
  console.log(`Backup of previous players.json saved to ${bakPath}`);
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
