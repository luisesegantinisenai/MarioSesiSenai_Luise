document.addEventListener('DOMContentLoaded', () => {
    const mario = document.querySelector('.mario');
    const pipe = document.querySelector('.pipe');
    const gameBoard = document.getElementById('.game-board');
    const hudPlayerName = document.getElementById('hud-palyer-name');
    const scoreDisplay = document.getElementById('score-display');
    const jumpTip = document.getElementById('jump-tip');
    const startModal = document.getElementById('start-modal');
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');
});

    const startModal = document.getElementById('start-modal');
    const startform.= document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');
    const btnViewRanking = document.getElementById('btn-view-ranking');

    const gameoverModal = document.getElementById('gameover-modal');
    const finalScoreValue = document.getElementById('final-score-value');
    const saveStatusMsg = document.getElementById('ranking-body');
    const btnRestart = document.getElementById('btn-restart');
    const btnChangePlayer = document.getElementById('btn-change-player');

    let currentPlayer = '';
    let score = 0;
    let isPlaying = false;
    let gameLoop = null;
    let scoreLoop = null;

    const savedName = localStorage.getItem('mario_jump_player');
    if (savedName && playerInput) {
        playerInput.value = savedName;
    }

    function startGame(){
        clearInterval(gameLoop);
        clearInterval(scoreLoop);

        resetElements();

        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = '0';
        hudPlayerName.textContent = currentPlayer || 'Jogador';

        gameBoard.classList,add('running');

        scoreLoop = setInterval(() => {
            if(isPlaying){
                score += 1;
                scoreDisplay.textContent = score;
            }
        }, 100);

        gameLoop = setInterval(checkCollision, 10);

    }
    function resetElements(){
        pipe.style.animation = '';
        pipe.style.left = '';

        mario.src = '../assets/mario.gif';
        mario.style.animation = '';
        mario.style.bottom = '0px';
        mario.style.width = '';
        mario.style.marginLeft = '';
        mario.classList.remove('jump');
        if (jumpTip){
        jumpTip.style.opacity = '1;'
        }
    }
    function jump(){
        if (!isPlaying) return;
        if (mario.classList.contains('jump')) return;
        
        mario.classList.add('jump');

        if(jumpTip){
            jumpTip.style.opacity = '0';
        }

        setTimeout(() => {
            mario.classList.remove('jump');
        }, 500);
    }
    function checkCollision(){
        if (!isPlaying) return;

        const pipePosition = pipe.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

        if(pipePosition <= 120 && pipePosition > 0 && marioPosition < 80){
            triggerGameOver(pipePosition, marioPosition);
        }
    }
    function triggerGameOver(pipePosition, marioPosition){
        isPlaying = false;
        clearInterval(gameLoop);
        clearInterval(scoreLoop);

        gameBoard.classList.remove('running');

        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;

        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`;
        mario.scr = '../assets/game-over.png';
        mario.style.width = '75px';
        mario.style.marginLeft = '50px';

        finalScoreValue.textContent = score;
        saveStatusMsg.textContent = 'Salvando pontuação no banco...';
        saveStatusMsg.style.color = '#ffcc00';

        gameoverModal.classList.add('active');

        saveScore(currentPlayer, score);
    }

    function saveScore(playerName, finalScore){
        fetch('salvar_ranking.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'aplication/json'
            },
            body: JSON.stringify({
                nome: playerName,
                pontos:finalScore
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success'){
                saveStatusMsg.textContent = 'pontuação registrada no banco!';
                saveStatusMsg.style.color = '#10b981';
                if(data.ranking){
                    renderRanking(data.ranking, playerName, finalScore);
                }
            } else{
                saveStatusMsg.textContent = (data.message || 'Erro ao registrar.');
                saveStatusMsg.style.color = '#ef4444';
            }
        })
        .catch(err => {
            console.error('Erro na requisição', err);
            saveStatusMsg.textContent = 'Erro ao conectar ao servidor.';
            saveStatusMsg.style.color = '#ef4444';
        });
    }
    function fetchRanking(){
        fetch('obter_ranking.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.ranking){
                renderRanking(data.ranking);
            }
        })
        .catch(err => console.error('Erro ao buscar o ranking', err));
    }
    function renderRanking(list, highligthName = null, highlightScore = null){
        if(!rankingBody) return;
        rankingBody.innerHTML = '';
        if(!list || list.length === 0){
            rankingBody.innerHTML = `<tr><td colspand= "3" class= "loading-cell">Nenhuma pontuação gravada ainda.</td></tr>`;
            return;
        }

        let highligthtted = false;

        list.forEach((item, index) =>{
            const tr = document.createElement('tr');

            if(!highligthtted && highligthName && item.nome === highligthName && parseInt(item.pontos, 10)  === highlightScore){
                    tr.classList.add('highligth-current');
                    highligthtted = true;
                }

                let medal = `${index + 1}º`;
                if (index === 0) medal = '🥇 1º';
                else if (index === 1) medal = '🥈 2º';
                else if (index === 2) medal = '🥉 3º';

                tr.innerHTML = `
                    <td class="ranking-pos">${medal}</td>
                    <td><strong>${escapeHtml(item.nome)}</strong></td>
                    <td>${parseInt(item.pontos, 10)} pts</td>
                `;

                rankingBody.appendChild(tr);
        })
    }

    function escapeHtml(str){
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&alt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    startForm.addEventListener('submit', (e) =>{
        e.preventDefault(); 

        const nameValue = playerInput.value.trim();
        if(!nameValue) {
            playerInput.focus();
            return;
        }

        currentPlayer = nameValue;
        localStorage.setItem('mario_jump_player', currentPlayer);

        startModal.classList.remove('active');
        startGame();
    });

    