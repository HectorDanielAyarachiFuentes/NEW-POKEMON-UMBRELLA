const pokedex = document.getElementById('pokedex');
const modalContainer = document.getElementById('modal-container');
let pokemonList = [];

//fetching pokemon's name, image, type and id from pokeapi by page
const fetchPokemon = () => {
    // Muestra un indicador de carga mientras se obtienen los datos
    pokedex.innerHTML = `<div class="loader-container"><li class="loader"></li></div>`;

    const promises = [];
    for (let i = 1; i <= 150; i++) {
        const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
        promises.push(fetch(url).then((res) => res.json()));
    }
    Promise.all(promises).then((results) => {
        pokemonList = results.map((result) => ({
            name: result.name,
            image: result.sprites['front_default'],
            type: result.types.map((type) => type.type.name).join(', '),
            id: result.id,
            height: result.height,
            weight: result.weight,
            abilities: result.abilities.map((ability) => ability.ability.name).join(', '),
            stats: result.stats,
            speciesUrl: result.species.url,
        }));
        displayPokemon(pokemonList);
        populateSuggestions(pokemonList);
    })
    .catch((error) => {
        console.error('Error al obtener los Pokémon:', error);
        pokedex.innerHTML = `<li class="card-error"><h3>Error</h3><p>No se pudieron cargar los datos. Inténtalo de nuevo más tarde.</p></li>`;
    });
};
// Displaying the pokemon details image, name, type in card
const displayPokemon = (pokemon) => {
    const searchTerm = document.getElementById('searchbar').value;
    if (pokemon.length === 0 && searchTerm) {
        pokedex.innerHTML = `<li class="card-error"><h3>Sin resultados</h3><p>No se encontró ningún Pokémon para "${searchTerm}".</p></li>`;
        return;
    }

    const pokemonHTMLString = pokemon
        .map(
            (pokeman) => `
        <li class="card" data-id="${pokeman.id}">
            <img class="card-image" src="${pokeman.image}"/>
            <h2 class="card-title">#${pokeman.id.toString().padStart(3, '0')} ${capitalize(pokeman.name)}</h2>
            <div class="card-details">
                <p class="card-subtitle"><strong>Tipo:</strong> ${pokeman.type.split(', ').map(capitalize).join(', ')}</p>
                <p class="card-subtitle"><strong>Altura:</strong> ${pokeman.height / 10} m</p>
                <p class="card-subtitle"><strong>Peso:</strong> ${pokeman.weight / 10} kg</p>
                <p class="card-subtitle"><strong>Habilidades:</strong> ${pokeman.abilities.split(', ').map(capitalize).join(', ')}</p>
            </div>
        </li>
    `
        )
        .join('');
    pokedex.innerHTML = pokemonHTMLString;

    // --- Intersection Observer para animar las tarjetas al aparecer ---
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Si la tarjeta está en la pantalla, la hacemos visible
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Dejamos de observar la tarjeta una vez que es visible
            }
        });
    }, {
        threshold: 0.1 // La animación se dispara cuando el 10% de la tarjeta es visible
    });

    cards.forEach((card, index) => {
        // Añadimos un retraso escalonado para un efecto de cascada
        card.style.transitionDelay = `${index * 50}ms`;
        observer.observe(card);
    });
};

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const populateSuggestions = (pokemon) => {
    const suggestionsDatalist = document.getElementById('pokemon-suggestions');
    suggestionsDatalist.innerHTML = pokemon.map(p => `<option value="${capitalize(p.name)}"></option>`).join('');
};

fetchPokemon();

const search_pokemon = () => {
    const input = document.getElementById('searchbar').value.toLowerCase();
    const filteredPokemon = pokemonList.filter(
        (pokemon) => pokemon.name.toLowerCase().includes(input) || pokemon.id.toString().includes(input)
    );
    displayPokemon(filteredPokemon);
}

// Añadir el event listener al input de búsqueda para separar JS del HTML
const searchBar = document.getElementById('searchbar');
let debounceTimeout;
searchBar.addEventListener('input', () => { // 'input' es mejor que 'keyup' para búsquedas
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        search_pokemon();
    }, 300); // Espera 300ms después de que el usuario deja de escribir
});

// --- Modal Logic ---

const openModal = async (id) => {
    modalContainer.innerHTML = `<div class="modal-content"><div class="loader-container"><li class="loader"></li></div></div>`;
    modalContainer.style.display = 'flex';

    const pokemon = pokemonList.find(p => p.id === id);
    
    try {
        const speciesRes = await fetch(pokemon.speciesUrl);
        const speciesData = await speciesRes.json();
        
        let descriptionEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');
        if (!descriptionEntry) { // Fallback a inglés
            descriptionEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        }
        const description = descriptionEntry ? descriptionEntry.flavor_text.replace(/[\n\f]/g, ' ') : 'Descripción no disponible.';

        const statsHTML = pokemon.stats.map(stat => `
            <div class="stat-row">
                <div class="stat-name">${capitalize(stat.stat.name.replace('-', ' '))}</div>
                <div class="stat-bar">
                    <div class="stat-bar-fill" style="width: ${Math.min(stat.base_stat, 100)}%;">${stat.base_stat}</div>
                </div>
            </div>
        `).join('');

        const modalHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div class="modal-header">
                    <h2>#${pokemon.id.toString().padStart(3, '0')} ${capitalize(pokemon.name)}</h2>
                </div>
                <div class="modal-body">
                    <img src="${pokemon.image}" alt="${pokemon.name}" class="modal-image"/>
                    <div class="modal-details">
                        <p class="modal-description">${description}</p>
                        <div class="stats-container">
                            ${statsHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
        modalContainer.innerHTML = modalHTML;

        // Añadir listeners para cerrar el modal
        modalContainer.querySelector('.modal-close').addEventListener('click', closeModal);

    } catch (error) {
        console.error('Error al obtener detalles del Pokémon:', error);
        modalContainer.innerHTML = `<div class="modal-content"><span class="modal-close">&times;</span><li class="card-error"><h3>Error</h3><p>No se pudieron cargar los detalles.</p></li></div>`;
        modalContainer.querySelector('.modal-close').addEventListener('click', closeModal);
    }
};

const closeModal = () => {
    modalContainer.style.display = 'none';
};

// Listener para abrir el modal (usando delegación de eventos)
pokedex.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) {
        const pokemonId = parseInt(card.dataset.id, 10);
        openModal(pokemonId);
    }
});

// Listener para cerrar el modal al hacer clic fuera de él
modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
        closeModal();
    }
});

// --- Theme Switcher Logic ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;

const applyTheme = (theme) => {
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(theme);
    localStorage.setItem('pokemon-theme', theme);
};

const toggleTheme = () => {
    const currentTheme = body.classList.contains('dark-theme') ? 'light-theme' : 'dark-theme';
    applyTheme(currentTheme);
};

themeToggleBtn.addEventListener('click', toggleTheme);

// On initial load, apply saved theme or default to dark
const savedTheme = localStorage.getItem('pokemon-theme') || 'dark-theme';
applyTheme(savedTheme);