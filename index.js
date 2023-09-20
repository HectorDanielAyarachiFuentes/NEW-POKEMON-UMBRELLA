const pokedex = document.getElementById('pokedex');
//fetching pokemon's name, image, type and id from pokeapi
const fetchPokemon = () => {
    const promises = [];
    for (let i = 1; i <= 150; i++) {
        const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
        promises.push(fetch(url).then((res) => res.json()));
    }
    Promise.all(promises).then((results) => {
        const pokemon = results.map((result) => ({
            name: result.name,
            image: result.sprites['front_default'],
            type: result.types.map((type) => type.type.name).join(', '),
            id: result.id
        }));
        displayPokemon(pokemon);
    });
};
// Displaying the pokemon details image, name, type in card
const displayPokemon = (pokemon) => {
    console.log(pokemon);
    const pokemonHTMLString = pokemon
        .map(
            (pokeman) => `
        <li class="card" style="padding: 2%;margin: 2%;list-style-type: none;">
            <img class="card-image" src="${pokeman.image}"/>
            <h2 class="card-title"> ${pokeman.name}</h2>
            <p class="card-subtitle">Type: ${pokeman.type}</p>
        </li>
      
    `
        )
        .join('');
    pokedex.innerHTML = pokemonHTMLString;
};

fetchPokemon();

function search_pokemon() {
    let input = document.getElementById('searchbar').value
    input = input.toLowerCase();
    let x = document.getElementsByClassName('card');

    for (i = 0; i < x.length; i++) {
        if (!x[i].innerHTML.toLowerCase().includes(input)) {
            x[i].style.display = "none";
        } else {
            x[i].style.display = "block";
        }
    }
}