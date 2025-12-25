
        // Game State
        let currentCategory = 'syllables';
        let currentChallenge = '';
        let bombTimer = null;
        let isRoundActive = false;
        let players = [];

        // Audio Context for tick sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Syllables and Letters Data
const syllables = [
  // CV base
  'BA','BE','BI','BO','BU',
  'CA','CE','CI','CO','CU',
  'DA','DE','DI','DO','DU',
  'FA','FE','FI','FO','FU',
  'GA','GE','GI','GO','GU',
  'LA','LE','LI','LO','LU',
  'MA','ME','MI','MO','MU',
  'NA','NE','NI','NO','NU',
  'PA','PE','PI','PO','PU',
  'RA','RE','RI','RO','RU',
  'SA','SE','SI','SO','SU',
  'TA','TE','TI','TO','TU',
  'VA','VE','VI','VO','VU',
  'ZA','ZE','ZI','ZO','ZU',

  // consonant clusters iniziali
  'BL','BR','CL','CR','DR','FL','FR','GL','GR','PL','PR','SL','SM','SN','SP','ST','SW','TR','TW',

  // cluster + vocale
  'BRA','BRE','BRI','BRO','BRU',
  'CRA','CRE','CRI','CRO','CRU',
  'DRA','DRE','DRI','DRO','DRU',
  'FRA','FRE','FRI','FRO','FRU',
  'GRA','GRE','GRI','GRO','GRU',
  'PLA','PLE','PLI','PLO','PLU',
  'PRA','PRE','PRI','PRO','PRU',
  'TRA','TRE','TRI','TRO','TRU',
  'STRA','STRE','STRI','STRO','STRU',

  // sillabe con -L / -R finali
  'AL','EL','IL','OL','UL',
  'AR','ER','IR','OR','UR',

  // digrammi inglesi frequenti
  'CH','SH','TH','WH','PH','GH','CK','NG',

  // sillabe vocaliche
  'AI','AU','AY',
  'EA','EE','EI','EO',
  'IA','IE','IO',
  'OA','OO','OU','OY',
  'UE','UI',

  // sillabe chiuse
  'AND','END','ING','ENT','ANT',
  'ALL','ELL','ILL','OLL',
  'OLD','IND','EST','ERS',

  // suffissi inglesi produttivi
  'ER','ERS','EST',
  'FUL','LESS',
  'ISH','IVE','OUS','ABLE','IBLE',
  'NESS','MENT','TION','SION',
  'LY','Y',

  // prefissi utili
  'UN','RE','IN','IM','DIS','MIS','OVER','UNDER','PRE','SUB','INTER','TRANS'
];

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

        // Initialize game
            function init() {
            setupCategoryButtons();
            setupNextRoundButton();
            setupSkipButton();   
            showIdleState();
            setupSidebarToggle();
            }


        // Category button handling
        function setupCategoryButtons() {
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentCategory = btn.dataset.category;
                    stopRound();
                    showIdleState();
                });
            });
        }

        // Show idle state (no challenge visible)
        function showIdleState() {
            const challengeText = document.getElementById('challengeText');
            const btn = document.getElementById('nextRoundBtn');
            
            challengeText.textContent = 'Click Start to Begin';
            challengeText.classList.add('hidden');
            btn.disabled = false;
            btn.textContent = 'Start Round';
            currentChallenge = '';
        }

        // Generate new challenge
        function generateChallenge() {
            if (currentCategory === 'syllables') {
                currentChallenge = syllables[Math.floor(Math.random() * syllables.length)];
            } else {
                currentChallenge = letters[Math.floor(Math.random() * letters.length)];
            }
            
            // Display the challenge immediately
            const challengeText = document.getElementById('challengeText');
            challengeText.textContent = currentChallenge;
            challengeText.classList.remove('hidden');
        }

        // Next Round Button
        function setupNextRoundButton() {
            const btn = document.getElementById('nextRoundBtn');
            btn.addEventListener('click', () => {
                if (!isRoundActive) {
                    startRound();
                }
            });
        }
function setupSkipButton() {
  const skipBtn = document.getElementById('skipBtn');
  if (!skipBtn) return;

  skipBtn.addEventListener('click', () => {
    if (!isRoundActive) return;  // se non c'è un round in corso, non fa nulla

    // interrompe il timer, ferma il ticchettio, rimuove gli stati della bomba
    stopRound();

    // torna allo stato “idle” senza esplosione e senza BOOM
    showIdleState();
  });
}




        // Start round with random timer
        function startRound() {
            // Generate challenge ONLY when starting the round
            generateChallenge();
            
            isRoundActive = true;
            const btn = document.getElementById('nextRoundBtn');
            btn.disabled = true;
            btn.textContent = 'Round in Progress...';

            // Random timer between 5-20 seconds
            const duration = Math.random() * 15000 + 5000;

            const bomb = document.querySelector('.bomb');
            bomb.classList.add('ticking');

            // Start ticking sound
            startTickSound();

            // Set explosion timer
            bombTimer = setTimeout(() => {
                explode();
            }, duration);
        }

        // Tick sound generator
        let tickInterval;
        function startTickSound() {
            tickInterval = setInterval(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            }, 1000);
        }

        function stopTickSound() {
            if (tickInterval) {
                clearInterval(tickInterval);
            }
        }

        // Explosion
        function explode() {
            stopTickSound();
            
            const bomb = document.querySelector('.bomb');
            const explosion = document.querySelector('.explosion');
            const statusMsg = document.getElementById('statusMessage');
            
            bomb.classList.remove('ticking');
            bomb.classList.add('exploding');
            explosion.classList.add('active');
            
            statusMsg.textContent = 'BOOM! 💥';
            statusMsg.classList.add('show');

            // Explosion sound
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 100;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);

            setTimeout(() => {
                bomb.classList.remove('exploding');
                explosion.classList.remove('active');
                statusMsg.classList.remove('show');
                isRoundActive = false; // Reset active state
                showIdleState(); // Return to idle state, no preview
            }, 2000);
        }

        // Stop round
        function stopRound() {
            if (bombTimer) {
                clearTimeout(bombTimer);
            }
            stopTickSound();
            const bomb = document.querySelector('.bomb');
            bomb.classList.remove('ticking', 'exploding');
            isRoundActive = false;
        }

        function setupSidebarToggle() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  if (!sidebar || !toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    toggleBtn.textContent = isOpen ? '>' : '<';
  });
}


        // Reset round (removed - replaced by showIdleState)

        // Player Management
        function addPlayer() {
            const input = document.getElementById('playerNameInput');
            const name = input.value.trim();
            
            if (name) {
                players.push({
                    name: name,
                    lives: 5,
                    eliminated: false
                });
                input.value = '';
                renderPlayers();
            }
        }

        function addNumberedPlayers(from, to) {
        players = []; // oppure elimina questa riga se vuoi aggiungerli a quelli esistenti
        for (let i = from; i <= to; i++) {
            players.push({
            name: String(i),    // inizialmente solo il numero
            lives: 5,
            eliminated: false
            });
        }
        renderPlayers();
        }

        function renderPlayers() {
  sortPlayers();                          // se l'hai già aggiunto

  const list = document.getElementById('playerList');
  list.innerHTML = '';

  players.forEach((player, index) => {
    const card = document.createElement('div');
    card.className = 'player-card' + (player.eliminated ? ' eliminated' : '');

    // wrapper intestazione: nome + delete
    const headerRow = document.createElement('div');
    headerRow.className = 'player-header';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'player-name';
    nameDiv.textContent = player.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'player-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Remove player';
    deleteBtn.addEventListener('click', () => removePlayer(index));

    headerRow.appendChild(nameDiv);
    headerRow.appendChild(deleteBtn);

    const livesDiv = document.createElement('div');
    livesDiv.className = 'lives';
    for (let i = 0; i < 5; i++) {
      const life = document.createElement('div');
      life.className = 'life' + (i >= player.lives ? ' lost' : '');
      life.addEventListener('click', () => toggleLife(index, i));
      livesDiv.appendChild(life);
    }

    card.appendChild(headerRow);
    card.appendChild(livesDiv);
    list.appendChild(card);
  });
}



function toggleLife(playerIndex, lifeIndex) {
  const player = players[playerIndex];
  if (!player.eliminated) {
    if (lifeIndex < player.lives) {
      player.lives = lifeIndex;
    } else if (lifeIndex === player.lives && player.lives < 5) {
      player.lives = lifeIndex + 1;
    }

    if (player.lives === 0) {
      player.eliminated = true;
    }

    renderPlayers();      // ora ridisegna già ordinato
  }
}

        function sortPlayers() {
  players.sort((a, b) => {
    const aDead = a.lives === 0;
    const bDead = b.lives === 0;

    // I morti (0 vite) vanno in fondo
    if (aDead && !bDead) return 1;   // a dopo b
    if (!aDead && bDead) return -1;  // a prima di b

    // Tra vivi: meno vite prima
    if (!aDead && !bDead) {
      return a.lives - b.lives;
    }

    // Tra morti: mantieni l'ordine (o ordina per nome se vuoi)
    return 0;
  });
}
 function removePlayer(index) {
  players.splice(index, 1);  // toglie il giocatore dall'array
  renderPlayers();           // ridisegna la lista (già ordinata)
}


        function newGame() {
            stopRound();
            players = [];
            renderPlayers();
            showIdleState();
        }

        // Initialize on load
        init();
