const pokedex = document.getElementById('pokedex');
let pokemonList = [];

//fetching pokemon's name, image, type and id from pokeapi
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
        }));
        displayPokemon(pokemonList);
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
        <li class="card">
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
};

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
searchBar.addEventListener('keyup', search_pokemon);