document.addEventListener('DOMContentLoaded', async () => {
  const message = document.getElementById('message');
  const TIERS = ['S','A','B','C','D'];
  const TIER_ORDER = ['D','C','B','A','S'];
  const THRESHOLDS = { D: 3, C: 4, B: 5, A: 6 };

  try {
    message.textContent = 'Načítám data…';
    const [players, matches] = await Promise.all([
      fetch('players.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
      fetch('matches.json').then(r => { if (!r.ok) return []; return r.json(); }).catch(() => [])
    ]);

    // Build lookup map for players (case-insensitive)
    const map = new Map();
    players.forEach(p => map.set((p.name || '').trim().toLowerCase(), p));

    // Ensure players referenced in matches exist (do not compute points or change tiers)
    if (Array.isArray(matches)) {
      matches.forEach(m => {
        const p1 = (m.player1 || '').trim();
        const p2 = (m.player2 || '').trim();
        [p1, p2].forEach(name => {
          if (!name) return;
          const key = name.trim().toLowerCase();
          if (!map.has(key)) {
            const newP = { name: name, tier: 'D' };
            players.push(newP);
            map.set(key, newP);
          }
        });
      });
    }

    message.textContent = '';

    // Group players into tiers and render
    const groups = TIERS.reduce((acc, t) => { acc[t] = []; return acc; }, {});
    players.forEach(p => {
      const t = (p.tier || 'C').toUpperCase();
      if (!groups[t]) groups[t] = [];
      groups[t].push(p);
    });

    TIERS.forEach(t => {
      const section = document.getElementById(`tier-${t}`);
      const container = section.querySelector('.players');
      container.innerHTML = '';

      const list = groups[t] || [];
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      list.forEach(player => {
        const card = document.createElement('article');
        card.className = 'player-card';

        // avatar: prefer explicit avatar property, otherwise use crafatar by username
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        const nameForUrl = encodeURIComponent(player.name || '');
        if (player.avatar) img.src = player.avatar;
        else img.src = `https://crafatar.com/avatars/${nameForUrl}?size=64&overlay`;
        img.alt = player.name || 'avatar';
        // Fallback to Minotar if Crafatar is unavailable
        img.addEventListener('error', () => {
          img.src = `https://minotar.net/avatar/${nameForUrl}/64.png`;
        });
        avatarDiv.appendChild(img);
        card.appendChild(avatarDiv);

        const info = document.createElement('div');
        info.className = 'info';
        const h3 = document.createElement('h3');
        h3.className = 'name';
        h3.textContent = player.name || 'Unknown';



        info.appendChild(h3);

        if (player.notes) {
          const p = document.createElement('p');
          p.className = 'notes';
          p.textContent = player.notes;
          info.appendChild(p);
        }

        card.appendChild(info);
        container.appendChild(card);
      });

      // update tier count
      const h2 = section.querySelector('h2');
      let countNode = section.querySelector('.tier-count');
      if (!countNode) { countNode = document.createElement('span'); countNode.className = 'tier-count'; h2.appendChild(countNode); }
      countNode.textContent = String((groups[t] || []).length);
    });

  } catch (err) {
    message.textContent = 'Chyba při načítání dat: ' + err.message;
    console.error(err);
  }
});
