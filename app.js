// Variables globales
let players = [];
let teams = { team1: [], team2: [] };
let lanesAssigned = false;
let currentAnimationStep = 0;

// Elementos del DOM - Páginas
const pagePlayers = document.getElementById('page-players');
const pageTeams = document.getElementById('page-teams');
const pageLanes = document.getElementById('page-lanes');

// Elementos del DOM - Jugadores
const playerInput = document.getElementById('player-input');
const addPlayerBtn = document.getElementById('add-player');
const clearPlayersBtn = document.getElementById('clear-players');
const playersList = document.getElementById('players-list');
const playersCount = document.getElementById('players-count');
const startTeamsBtn = document.getElementById('start-teams');

// Elementos del DOM - Equipos
const team1Animation = document.getElementById('team1-animation');
const team2Animation = document.getElementById('team2-animation');
const team1Players = document.getElementById('team1-players');
const team2Players = document.getElementById('team2-players');
const animationStatus = document.getElementById('animation-status');
const teamsControls = document.getElementById('teams-controls');
const startLanesBtn = document.getElementById('start-lanes');

// Elementos del DOM - Líneas
const prankMessage = document.getElementById('prank-message');
const lanesContainer1 = document.getElementById('lanes-container-1');
const lanesContainer2 = document.getElementById('lanes-container-2');
const lanesStatus = document.getElementById('lanes-status');
const lanesControls = document.getElementById('lanes-controls');
const restartBtn = document.getElementById('restart');

// Elementos del modal
const oddModal = document.getElementById('odd-modal');
const oddCount = document.getElementById('odd-count');
const cancelTeamsBtn = document.getElementById('cancel-teams');
const confirmTeamsBtn = document.getElementById('confirm-teams');

// Definición de las líneas según cantidad de jugadores
const lanesConfig = {
    5: [
        { name: "Top", icon: "⚔️" },
        { name: "Jungla", icon: "🌿" },
        { name: "Midlane", icon: "🌀" },
        { name: "Support", icon: "🛡️" },
        { name: "Botlane", icon: "🏹" }
    ],
    4: [
        { name: "Top", icon: "⚔️" },
        { name: "Jungla", icon: "🌿" },
        { name: "Midlane", icon: "🌀" },
        { name: "Botlane", icon: "🏹" }
    ],
    3: [
        { name: "Top", icon: "⚔️" },
        { name: "Midlane", icon: "🌀" },
        { name: "Botlane", icon: "🏹" }
    ]
};

// URLs de imágenes de ejemplo para las líneas (puedes reemplazarlas)
const laneIcons = {
    "Top": "img/Top.png",
    "Jungla": "img/Jungla.png",
    "Midlane": "img/Mid.png",
    "Support": "img/Support.png",
    "Botlane": "img/Bot.png",
    "Flex": "https://via.placeholder.com/60/666666/ffffff?text=FLEX"
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar jugadores desde localStorage si existen
    const savedPlayers = localStorage.getItem('lolPlayers');
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
        updatePlayersList();
    }
});

addPlayerBtn.addEventListener('click', addPlayer);
clearPlayersBtn.addEventListener('click', clearPlayers);
startTeamsBtn.addEventListener('click', handleStartTeams);
startLanesBtn.addEventListener('click', startLanesAnimation);
restartBtn.addEventListener('click', restartApp);

// Eventos del modal
cancelTeamsBtn.addEventListener('click', closeModal);
confirmTeamsBtn.addEventListener('click', confirmOddTeams);

// Permitir agregar jugador con Enter
playerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPlayer();
    }
});

// Funciones principales
function addPlayer() {
    const playerName = playerInput.value.trim();
    
    if (playerName === '') {
        showMessage('Por favor, ingresa un nombre válido', 'error');
        playerInput.focus();
        return;
    }
    
    if (players.includes(playerName)) {
        showMessage('Este jugador ya está en la lista', 'error');
        playerInput.value = '';
        playerInput.focus();
        return;
    }
    
    players.push(playerName);
    updatePlayersList();
    savePlayers();
    
    playerInput.value = '';
    playerInput.focus();
    
    showMessage(`Jugador "${playerName}" agregado`, 'success');
}

function removePlayer(index) {
    const removedPlayer = players.splice(index, 1)[0];
    updatePlayersList();
    savePlayers();
    showMessage(`Jugador "${removedPlayer}" eliminado`, 'info');
}

function updatePlayersList() {
    playersList.innerHTML = '';
    playersCount.textContent = players.length;
    
    if (players.length === 0) {
        playersList.innerHTML = '<p class="empty-list">No hay jugadores agregados</p>';
        return;
    }
    
    players.forEach((player, index) => {
        const playerTag = document.createElement('div');
        playerTag.className = 'player-tag fade-in';
        playerTag.innerHTML = `
            <span>${player}</span>
            <i class="fas fa-times" data-index="${index}"></i>
        `;
        
        // Agregar event listener para eliminar jugador
        const removeIcon = playerTag.querySelector('i');
        removeIcon.addEventListener('click', () => {
            removePlayer(index);
        });
        
        playersList.appendChild(playerTag);
    });
}

function clearPlayers() {
    if (players.length === 0) {
        showMessage('No hay jugadores para limpiar', 'info');
        return;
    }
    
    if (confirm(`¿Estás seguro de que quieres eliminar a los ${players.length} jugadores?`)) {
        players = [];
        updatePlayersList();
        savePlayers();
        showMessage('Lista de jugadores limpiada', 'success');
    }
}

function handleStartTeams() {
    if (players.length < 2) {
        showMessage('Se necesitan al menos 2 jugadores para formar equipos', 'error');
        return;
    }
    
    // Verificar si hay número impar de jugadores
    if (players.length % 2 !== 0) {
        // Mostrar modal de confirmación
        showOddModal();
    } else {
        // Generar equipos directamente (número par)
        startTeamsGeneration();
    }
}

function showOddModal() {
    oddCount.textContent = players.length;
    oddModal.classList.remove('hidden');
}

function closeModal() {
    oddModal.classList.add('hidden');
    showMessage('Generación de equipos cancelada', 'info');
}

function confirmOddTeams() {
    oddModal.classList.add('hidden');
    startTeamsGeneration();
}

function startTeamsGeneration() {
    // Cambiar a página de equipos
    pagePlayers.classList.add('hidden');
    pageTeams.classList.remove('hidden');
    
    // Generar equipos aleatorios
    generateRandomTeams();
    
    // Iniciar animación de equipos
    startTeamsAnimation();
}

function generateRandomTeams() {
    // Copiar y mezclar la lista de jugadores
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Dividir en dos equipos
    const midPoint = Math.ceil(shuffledPlayers.length / 2);
    teams.team1 = shuffledPlayers.slice(0, midPoint);
    teams.team2 = shuffledPlayers.slice(midPoint);
    
    // Guardar equipos
    saveTeams();
}

function startTeamsAnimation() {
    // Resetear controles
    teamsControls.classList.add('hidden');
    
    // Activar equipo 1
    team1Animation.classList.add('active');
    team2Animation.classList.remove('active');
    
    // Limpiar contenedores
    team1Players.innerHTML = '';
    team2Players.innerHTML = '';
    
    // Iniciar animación del equipo 1
    animateTeamPlayers(teams.team1, team1Players, 0, () => {
        // Cuando termine equipo 1, activar equipo 2
        team1Animation.classList.remove('active');
        team2Animation.classList.add('active');
        animationStatus.textContent = '¡Equipo 1 completado! Preparando Equipo 2...';
        
        // Iniciar animación del equipo 2 después de un breve delay
        setTimeout(() => {
            animateTeamPlayers(teams.team2, team2Players, 1, () => {
                // Cuando terminen ambos equipos
                team2Animation.classList.remove('active');
                animationStatus.textContent = '¡Equipos creados con éxito!';
                
                // Mostrar controles para continuar
                setTimeout(() => {
                    teamsControls.classList.remove('hidden');
                }, 1000);
            });
        }, 1000);
    });
}

function animateTeamPlayers(teamPlayers, container, teamIndex, callback) {
    let currentPlayer = 0;
    
    // Actualizar estado
    const teamName = teamIndex === 0 ? '1' : '2';
    animationStatus.textContent = `Asignando jugadores al Equipo ${teamName}...`;
    
    // Función para mostrar siguiente jugador
    function showNextPlayer() {
        if (currentPlayer >= teamPlayers.length) {
            callback();
            return;
        }
        
        const player = teamPlayers[currentPlayer];
        
        // Crear elemento del jugador
        const playerElement = document.createElement('div');
        playerElement.className = 'player-card-animated';
        playerElement.style.animationDelay = '0s';
        playerElement.innerHTML = `
            <div class="player-name">${player}</div>
        `;
        
        // Agregar al contenedor
        container.appendChild(playerElement);
        
        // Actualizar estado
        animationStatus.textContent = `Equipo ${teamName}: ${currentPlayer + 1}/${teamPlayers.length} jugadores asignados`;
        
        // Incrementar contador
        currentPlayer++;
        
        // Llamar a siguiente jugador después de 3 segundos
        setTimeout(showNextPlayer, 3000);
    }
    
    // Iniciar animación
    setTimeout(showNextPlayer, 1000);
}

function startLanesAnimation() {
    // Cambiar a página de líneas
    pageTeams.classList.add('hidden');
    pageLanes.classList.remove('hidden');
    
    // Verificar si hay muy pocos jugadores
    const minTeamSize = Math.min(teams.team1.length, teams.team2.length);
    if (minTeamSize <= 2) {
        prankMessage.classList.remove('hidden');
        lanesControls.classList.remove('hidden');
        lanesStatus.textContent = 'Demasiado pocos jugadores para asignar líneas';
        return;
    } else {
        prankMessage.classList.add('hidden');
    }
    
    // Ocultar controles temporalmente
    lanesControls.classList.add('hidden');
    
    // Limpiar contenedores
    lanesContainer1.innerHTML = '';
    lanesContainer2.innerHTML = '';
    
    // Iniciar animación de líneas para equipo 1
    animateTeamLanesRandom(teams.team1, lanesContainer1, 0, () => {
        // Cuando termine equipo 1, iniciar equipo 2
        lanesStatus.textContent = '¡Líneas del Equipo 1 asignadas! Preparando Equipo 2...';
        
        setTimeout(() => {
            animateTeamLanesRandom(teams.team2, lanesContainer2, 1, () => {
                // Cuando terminen ambos equipos
                lanesStatus.textContent = 'Líneas generadas!';
                
                // Mostrar controles
                setTimeout(() => {
                    lanesControls.classList.remove('hidden');
                }, 1000);
            });
        }, 1000);
    });
}

function animateTeamLanesRandom(teamPlayers, container, teamIndex, callback) {
    let currentLane = 0;
    
    // Obtener líneas según cantidad de jugadores
    const teamSize = teamPlayers.length;
    let lanes = lanesConfig[teamSize];
    
    if (!lanes) {
        // Si hay más de 5 jugadores, usar configuración de 5 y agregar flex
        lanes = [...lanesConfig[5]];
        for (let i = 5; i < teamSize; i++) {
            lanes.push({ name: `Flex ${i - 4}`, icon: "🔄" });
        }
    }
    
    // Mezclar aleatoriamente las líneas para este equipo
    const shuffledLanes = [...lanes].sort(() => Math.random() - 0.5);
    
    // Actualizar estado
    const teamName = teamIndex === 0 ? '1' : '2';
    lanesStatus.textContent = `Asignando líneas aleatorias al Equipo ${teamName}...`;
    
    // Función para mostrar siguiente línea
    function showNextLane() {
        if (currentLane >= teamPlayers.length) {
            callback();
            return;
        }
        
        const player = teamPlayers[currentLane];
        const lane = shuffledLanes[currentLane];
        
        // Crear elemento de línea
        const laneElement = document.createElement('div');
        laneElement.className = 'lane-assignment';
        laneElement.style.animationDelay = '0s';
        
        // Determinar qué icono usar
        let iconHtml;
        if (laneIcons[lane.name]) {
            // Usar imagen si existe en laneIcons
            iconHtml = `<img src="${laneIcons[lane.name]}" alt="${lane.name}">`;
        } else if (lane.name.startsWith('Flex')) {
            // Usar icono de flex para líneas flex
            iconHtml = `<img src="${laneIcons.Flex}" alt="${lane.name}">`;
        } else {
            // Usar emoji como fallback
            iconHtml = lane.icon || "❓";
        }
        
        laneElement.innerHTML = `
            <div class="lane-icon">
                ${iconHtml}
            </div>
            <div class="lane-info">
                <div class="lane-name">${lane.name}</div>
                <div class="lane-player">${player}</div>
            </div>
        `;
        
        // Agregar al contenedor
        container.appendChild(laneElement);
        
        // Actualizar estado con información específica
        lanesStatus.textContent = `Equipo ${teamName}: ${player} → ${lane.name} (${currentLane + 1}/${teamPlayers.length})`;
        
        // Incrementar contador
        currentLane++;
        
        // Llamar a siguiente línea después de 3 segundos
        setTimeout(showNextLane, 3000);
    }
    
    // Iniciar animación
    setTimeout(showNextLane, 1000);
}

function restartApp() {
    // Volver a la página de jugadores
    pageLanes.classList.add('hidden');
    pagePlayers.classList.remove('hidden');
    
    // Resetear equipos
    teams = { team1: [], team2: [] };
    saveTeams();
    
    // Actualizar estado
    showMessage('¡Listo para una nueva partida!', 'success');
}

function savePlayers() {
    localStorage.setItem('lolPlayers', JSON.stringify(players));
}

function saveTeams() {
    localStorage.setItem('lolTeams', JSON.stringify(teams));
}

function showMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type} fade-in`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 300px;
    `;
    
    if (type === 'success') {
        messageEl.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
        messageEl.style.borderLeft = '5px solid #4CAF50';
    } else if (type === 'error') {
        messageEl.style.backgroundColor = 'rgba(244, 67, 54, 0.9)';
        messageEl.style.borderLeft = '5px solid #F44336';
    } else {
        messageEl.style.backgroundColor = 'rgba(33, 150, 243, 0.9)';
        messageEl.style.borderLeft = '5px solid #2196F3';
    }
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}