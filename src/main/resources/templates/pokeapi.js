console.log("Hej");
import { 
    createPokedexButton, createPokemonButton,
    getPokemonFromPokedex, deletePokemonFromPokedex
} from './restapi.js';

window.onload = function() {
    const appDiv = document.getElementById('app');
    const pokemonListDiv = document.createElement('div');
    pokemonListDiv.id = 'pokemonList';
    appDiv.appendChild(pokemonListDiv);

    const pokedexDiv = document.createElement('div');
    pokedexDiv.id = 'pokedex';
    appDiv.appendChild(pokedexDiv);
}

class App {
    constructor() {
        this.apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0';
        this.userData = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.isPokedexVisible = false;
    }

    async fetchData() {
        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();
            const pokemonData = data.results;
            const pokemonPromises = pokemonData.map(async (pokemon) => {
                try {
                    const pokemonResponse = await fetch(pokemon.url);
                    const pokemonInfo = await pokemonResponse.json();

                    const pokemonIndex = pokemon.url.split('/')[pokemon.url.split('/').length - 2];
                    pokemon.image = `https://unpkg.com/pokeapi-sprites@2.0.2/sprites/pokemon/other/dream-world/${pokemonIndex}.svg`;

                    pokemon.height = pokemonInfo.height;
                    pokemon.weight = pokemonInfo.weight;
                    return pokemon;
                } catch (error) {
                    console.error('Error fetching pokemon details:', error);
                }
            });

            this.userData = await Promise.all(pokemonPromises);

            document.getElementById('loading').style.display = 'none';
            this.displayData();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    displayData() {
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = '';

        let pokemonListDiv = document.getElementById('pokemonList');
        if (!pokemonListDiv) {
            pokemonListDiv = document.createElement('div');
            pokemonListDiv.id = 'pokemonList';
            appDiv.appendChild(pokemonListDiv);
        }
        

        // Skapa Pokedex-knappen
        const pokedexButton = createPokedexButton(this);

        // Skapa en div för knapparna
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'button-container';

        // Lägg till knapparna till div
        buttonDiv.appendChild(pokedexButton);
        pokedexButton.id = "pokedexBtn";

        // Lägg till div till appDiv
        appDiv.appendChild(buttonDiv);

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = this.currentPage * this.itemsPerPage;
        const currentPageData = this.userData.slice(startIndex, endIndex);

        currentPageData.forEach(pokemon => {
            const pokemonDiv = document.createElement('div');
            const pokemonName = document.createElement('p');
            const pokemonImage = document.createElement('img');
            pokemonImage.style.width= "100px";
            pokemonName.textContent = pokemon.name;
            pokemonImage.src = pokemon.image;
            pokemonImage.onclick = () => this.showPokemonDetails(pokemon);
            pokemonDiv.append(pokemonName, pokemonImage);
            appDiv.appendChild(pokemonDiv);
            pokemonListDiv.appendChild(pokemonDiv);
        });   
    }

    async displayPokedex() {
        let pokedexDiv = document.getElementById('pokedex');
        if (!pokedexDiv) {
            const appDiv = document.getElementById('app');
            pokedexDiv = document.createElement('div');
            pokedexDiv.id = 'pokedex';
            appDiv.appendChild(pokedexDiv);
        }
        pokedexDiv.innerHTML = '';
    
        const pokedexPokemonList = await getPokemonFromPokedex();
        pokedexPokemonList.forEach(pokemon => {
            const pokedexPokemonName = document.createElement('p');
            pokedexPokemonName.textContent = pokemon.name;
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Ta bort';
            removeButton.onclick = () => deletePokemonFromPokedex(pokemon.id, this);
            pokedexDiv.appendChild(pokedexPokemonName);
            pokedexDiv.appendChild(removeButton);
        });
    }
    
    showPokemonDetails(pokemon) {
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = '';
    
        const pokemonName = document.createElement('h1');
        const pokemonImage = document.createElement('img');
        const pokemonHeight = document.createElement('p');
        const pokemonWeight = document.createElement('p');
        const backButton = document.createElement('button');
    
        pokemonName.textContent = pokemon.name;
        pokemonImage.src = pokemon.image;
        pokemonHeight.textContent = "Höjd: " + pokemon.height;
        pokemonWeight.textContent = "Vikt: " + pokemon.weight;
    
        const pokemonButton = createPokemonButton(pokemon);
    
        backButton.textContent = 'Tillbaka';
        backButton.onclick = () => {
            this.togglePaginationButtons('block'); 
            this.displayData();
        };
    
        appDiv.append(pokemonName, pokemonButton, pokemonImage, pokemonHeight, pokemonWeight, backButton);
    
        this.togglePaginationButtons('none'); 
    }

    togglePaginationButtons(displayValue) {
        document.getElementById('prev').style.display = displayValue;
        document.getElementById('next').style.display = displayValue;
    }

    nextPage() {
        this.currentPage++;
        this.displayData();
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayData();
        }
    }
}

const myApp = new App();
myApp.fetchData();
document.getElementById('next').addEventListener('click', () => myApp.nextPage());
document.getElementById('prev').addEventListener('click', () => myApp.prevPage());
