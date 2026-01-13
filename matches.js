document.addEventListener('DOMContentLoaded', () => {
  const message = document.getElementById('matches-message');
  const listEl = document.getElementById('matches-list');

  fetch('matches.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(matches => {
      message.textContent = '';

      if (!Array.isArray(matches) || matches.length === 0) {
        message.textContent = 'Žádné zápasy k zobrazení.';
        listEl.innerHTML = '';
        return;
      }



      // Clear list
      listEl.innerHTML = '';

      // Show only last 5 matches (most recent first)
      const recent = matches.slice(-5).reverse();

      recent.forEach(m => {
        const p1 = m.player1 || 'Unknown';
        const p2 = m.player2 || 'Unknown';
        const score = (m.result || m.score || '').toString().trim();

        // Parse score like 1-0
        const match = score.match(/^(\d+)-(\d+)$/);
        let s1 = null, s2 = null;
        if (match) {
          s1 = parseInt(match[1], 10);
          s2 = parseInt(match[2], 10);
        }

        const card = document.createElement('div');
        card.className = 'match-card';

        const info = document.createElement('div');
        info.className = 'match-info';

        function makePlayerBlock(name, isWinner) {
          const block = document.createElement('div');
          block.className = 'match-player';
          if (isWinner) block.classList.add('winner');

          const img = document.createElement('img');
          img.className = 'player-avatar';
          img.crossOrigin = 'anonymous';
          const nameForUrl = encodeURIComponent(name);
          img.src = `https://crafatar.com/avatars/${nameForUrl}?size=48&overlay`;
          img.alt = name;
          // Fallback to Minotar if Crafatar is unavailable
          img.addEventListener('error', () => {
            img.src = `https://minotar.net/avatar/${nameForUrl}/48.png`;
          });
          block.appendChild(img);

          const span = document.createElement('span');
          span.className = 'player-name';
          span.textContent = name;
          block.appendChild(span);

          return block;
        }

        const p1IsWinner = (s1 !== null && s2 !== null && s1 > s2);
        const p2IsWinner = (s1 !== null && s2 !== null && s2 > s1);

        const leftBlock = makePlayerBlock(p1, p1IsWinner);
        const rightBlock = makePlayerBlock(p2, p2IsWinner);

        const scoreEl = document.createElement('div');
        scoreEl.className = 'match-score';
        scoreEl.textContent = score || '—';

        info.appendChild(leftBlock);
        info.appendChild(scoreEl);
        info.appendChild(rightBlock);

        card.appendChild(info);
        listEl.appendChild(card);
      });
    })
    .catch(err => {
      message.textContent = 'Chyba při načítání zápasů: ' + err.message;
      console.error(err);
    });
});