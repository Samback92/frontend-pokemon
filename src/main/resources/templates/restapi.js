export function createPokemonButton(pokemon) {
    const pokemonButton = document.createElement('button');
    pokemonButton.textContent = 'Spara i Pokedex';
    pokemonButton.onclick = () => {
        if (pokemonButton.textContent === 'Spara i Pokedex') {
            fetch('http://localhost:3000/pokemon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pokemon),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Pokemon saved successfully:', data);
                pokemon.id = data.id;
                pokemonButton.textContent = 'Ta bort från Pokedex';
            })
            .catch((error) => console.error('Error:', error));
        } else {
            deletePokemonFromPokedex(pokemon.id);
            pokemonButton.textContent = 'Spara i Pokedex';
        }
    };
    return pokemonButton;
}

export function createPokedexButton(context) {
    const pokedexButton = document.createElement('button');
    pokedexButton.textContent = 'Visa Pokedex';
    pokedexButton.onclick = () => {
        if (pokedexButton.textContent === 'Visa Pokedex') {
            pokedexButton.textContent = 'Dölj Pokedex';
            context.displayPokedex();
        } else {
            pokedexButton.textContent = 'Visa Pokedex';
            document.getElementById('pokedex').innerHTML = '';
        }
    };
    return pokedexButton;
}


export async function getPokemonFromPokedex() {
    const response = await fetch('http://localhost:3000/pokemon');
    const pokemonList = await response.json();
    console.log(pokemonList);
    return pokemonList;
}

export function deletePokemonFromPokedex(pokemonId, context) {
    fetch(`http://localhost:3000/pokemon/${pokemonId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Pokemon deleted successfully:', data);
        context.displayPokedex();
    })
    .catch((error) => console.error('Error:', error));
}
