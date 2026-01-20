// Variables globales
let players = [];
let teams = { team1: [], team2: [] };
let lanesAssigned = false;

// Elementos del DOM
const playerInput = document.getElementById('player-input');
const addPlayerBtn = document.getElementById('add-player');
const clearPlayersBtn = document.getElementById('clear-players');
const playersList = document.getElementById('players-list');
const oddWarning = document.getElementById('odd-warning');
const generateTeamsBtn = document.getElementById('generate-teams');
const assignLanesBtn = document.getElementById('assign-lanes');
const team1List = document.getElementById('team1-list');
const team2List = document.getElementById('team2-list');
const team1LanesResult = document.getElementById('team1-lanes-result');
const team2LanesResult = document.getElementById('team2-lanes-result');
const prankMessage = document.getElementById('prank-message');
const lanesInfo = document.getElementById('lanes-info');
const team1LanesContainer = document.getElementById('team1-lanes');
const team2LanesContainer = document.getElementById('team2-lanes');

// Elementos del modal
const oddModal = document.getElementById('odd-modal');
const oddCount = document.getElementById('odd-count');
const cancelTeamsBtn = document.getElementById('cancel-teams');
const confirmTeamsBtn = document.getElementById('confirm-teams');

// Definición de las líneas según cantidad de jugadores
const lanesConfig = {
    5: ["Top", "Jungla", "Midlane", "Support", "Botlane"],
    4: ["Top", "Jungla", "Midlane", "Botlane"],
    3: ["Top", "Midlane", "Botlane"],
    2: ["Solo lane", "Solo lane"],
    1: ["Solo lane"]
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar jugadores desde localStorage si existen
    const savedPlayers = localStorage.getItem('lolPlayers');
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
        updatePlayersList();
    }
    
    // Verificar si ya hay equipos guardados
    const savedTeams = localStorage.getItem('lolTeams');
    if (savedTeams) {
        teams = JSON.parse(savedTeams);
        updateTeamsDisplay();
    }
});

addPlayerBtn.addEventListener('click', addPlayer);
clearPlayersBtn.addEventListener('click', clearPlayers);
generateTeamsBtn.addEventListener('click', handleGenerateTeams);
assignLanesBtn.addEventListener('click', assignLanes);

// Eventos del modal
cancelTeamsBtn.addEventListener('click', closeModal);
confirmTeamsBtn.addEventListener('click', confirmOddTeams);

// Permitir agregar jugador con Enter
playerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPlayer();
    }
});

// Funciones
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
    
    // Ocultar el mensaje de "prank" si está visible
    prankMessage.classList.remove('show');
    
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
        teams = { team1: [], team2: [] };
        lanesAssigned = false;
        
        updatePlayersList();
        updateTeamsDisplay();
        clearLanesDisplay();
        savePlayers();
        saveTeams();
        
        showMessage('Lista de jugadores limpiada', 'success');
    }
}

function handleGenerateTeams() {
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
        generateTeams();
    }
}

function showOddModal() {
    oddCount.textContent = players.length;
    oddModal.classList.add('show');
}

function closeModal() {
    oddModal.classList.remove('show');
    showMessage('Generación de equipos cancelada', 'info');
}

function confirmOddTeams() {
    oddModal.classList.remove('show');
    // Ahora sí generar los equipos
    generateTeams();
}

function generateTeams() {
    // Copiar y mezclar la lista de jugadores
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Dividir en dos equipos
    const midPoint = Math.ceil(shuffledPlayers.length / 2);
    teams.team1 = shuffledPlayers.slice(0, midPoint);
    teams.team2 = shuffledPlayers.slice(midPoint);
    
    // Reiniciar asignación de líneas
    lanesAssigned = false;
    
    // Actualizar la visualización
    updateTeamsDisplay();
    clearLanesDisplay();
    saveTeams();
    
    // Mostrar mensaje de confirmación
    const team1Count = teams.team1.length;
    const team2Count = teams.team2.length;
    
    if (team1Count !== team2Count) {
        showMessage(`Equipos generados: ${team1Count} vs ${team2Count} jugadores`, 'success');
    } else {
        showMessage('Equipos generados aleatoriamente (equilibrados)', 'success');
    }
    
    // Mostrar los equipos con animación
    animateTeamAssignment();
}

function updateTeamsDisplay() {
    // Limpiar listas de equipos
    team1List.innerHTML = '';
    team2List.innerHTML = '';
    
    // Mostrar equipo 1
    if (teams.team1.length === 0) {
        team1List.innerHTML = '<div class="empty-team"><p>Esperando jugadores...</p></div>';
    } else {
        teams.team1.forEach((player, index) => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card team-assignment';
            playerCard.style.animationDelay = `${index * 0.1}s`;
            playerCard.innerHTML = `
                <span class="player-name">${player}</span>
                <span class="player-role">${lanesAssigned ? 'Línea asignada' : 'Sin línea'}</span>
            `;
            team1List.appendChild(playerCard);
        });
    }
    
    // Mostrar equipo 2
    if (teams.team2.length === 0) {
        team2List.innerHTML = '<div class="empty-team"><p>Esperando jugadores...</p></div>';
    } else {
        teams.team2.forEach((player, index) => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card team-assignment';
            playerCard.style.animationDelay = `${index * 0.1}s`;
            playerCard.innerHTML = `
                <span class="player-name">${player}</span>
                <span class="player-role">${lanesAssigned ? 'Línea asignada' : 'Sin línea'}</span>
            `;
            team2List.appendChild(playerCard);
        });
    }
    
    // Mostrar las secciones de líneas como ocultas inicialmente
    team1LanesContainer.classList.add('hidden');
    team2LanesContainer.classList.add('hidden');
}

function assignLanes() {
    // Verificar que los equipos estén generados
    if (teams.team1.length === 0 && teams.team2.length === 0) {
        showMessage('Primero genera los equipos', 'error');
        return;
    }
    
    // Verificar si hay muy pocos jugadores
    const minTeamSize = Math.min(teams.team1.length, teams.team2.length);
    if (minTeamSize <= 2) {
        prankMessage.classList.add('show');
        team1LanesContainer.classList.add('hidden');
        team2LanesContainer.classList.add('hidden');
        return;
    } else {
        prankMessage.classList.remove('show');
    }
    
    // Obtener las líneas según la cantidad de jugadores por equipo
    const teamSize = Math.max(teams.team1.length, teams.team2.length);
    let lanes = lanesConfig[teamSize];
    
    if (!lanes) {
        // Si hay más de 5 jugadores por equipo, repetir algunas líneas
        lanes = [...lanesConfig[5]];
        for (let i = 5; i < teamSize; i++) {
            lanes.push(`Flex ${i - 4}`);
        }
    }
    
    // Mezclar las líneas
    const shuffledLanes = [...lanes].sort(() => Math.random() - 0.5);
    
    // Asignar líneas al equipo 1
    assignLanesToTeam(teams.team1, shuffledLanes, team1LanesResult, 'team1');
    
    // Asignar líneas al equipo 2
    assignLanesToTeam(teams.team2, shuffledLanes, team2LanesResult, 'team2');
    
    // Actualizar la información de líneas
    lanesInfo.textContent = `Líneas asignadas para equipos de ${teamSize} jugadores`;
    
    // Mostrar las secciones de líneas
    team1LanesContainer.classList.remove('hidden');
    team2LanesContainer.classList.remove('hidden');
    
    // Actualizar los roles en las tarjetas de jugador
    updatePlayerRoles();
    
    lanesAssigned = true;
    
    showMessage('Líneas asignadas aleatoriamente', 'success');
}

function assignLanesToTeam(team, lanes, container, teamId) {
    container.innerHTML = '';
    
    // Mezclar el equipo para asignación aleatoria
    const shuffledTeam = [...team].sort(() => Math.random() - 0.5);
    
    // Crear tarjetas de línea para cada jugador
    shuffledTeam.forEach((player, index) => {
        const lane = lanes[index % lanes.length];
        
        const laneCard = document.createElement('div');
        laneCard.className = 'lane-card fade-in';
        laneCard.style.animationDelay = `${index * 0.1}s`;
        laneCard.innerHTML = `
            <div class="lane-name">${lane}</div>
            <div class="lane-player">${player}</div>
        `;
        container.appendChild(laneCard);
    });
}

function updatePlayerRoles() {
    // Actualizar los roles en las tarjetas de jugadores
    const team1Players = team1List.querySelectorAll('.player-card');
    const team2Players = team2List.querySelectorAll('.player-card');
    
    team1Players.forEach(playerCard => {
        const roleSpan = playerCard.querySelector('.player-role');
        if (roleSpan) {
            roleSpan.textContent = 'Línea asignada';
            roleSpan.style.color = '#4CAF50';
        }
    });
    
    team2Players.forEach(playerCard => {
        const roleSpan = playerCard.querySelector('.player-role');
        if (roleSpan) {
            roleSpan.textContent = 'Línea asignada';
            roleSpan.style.color = '#4CAF50';
        }
    });
}

function clearLanesDisplay() {
    team1LanesResult.innerHTML = '';
    team2LanesResult.innerHTML = '';
    lanesInfo.textContent = 'Asigna las líneas después de generar los equipos';
    team1LanesContainer.classList.add('hidden');
    team2LanesContainer.classList.add('hidden');
    prankMessage.classList.remove('show');
}

function animateTeamAssignment() {
    const team1Cards = team1List.querySelectorAll('.player-card');
    const team2Cards = team2List.querySelectorAll('.player-card');
    
    team1Cards.forEach((card, index) => {
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = `teamAssignment 0.3s ease forwards ${index * 0.1}s`;
        }, 10);
    });
    
    team2Cards.forEach((card, index) => {
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = `teamAssignment 0.3s ease forwards ${index * 0.1}s`;
        }, 10);
    });
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

function savePlayers() {
    localStorage.setItem('lolPlayers', JSON.stringify(players));
}

function saveTeams() {
    localStorage.setItem('lolTeams', JSON.stringify(teams));
}