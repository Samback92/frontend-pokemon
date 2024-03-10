let allPokemonContainer = document.getElementById('pokemon-container');

console.log("Hej");
let currentPage = 0;
const pokemonsPerPage = 10;
let prevButton;
let nextButton;

function fetchBasePokemon() {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=500')
    .then(response => response.json())
    .then(function (allpokemon) {
        
        function showPage(page) {
            const start = page * pokemonsPerPage;
            const end = start + pokemonsPerPage;
            const pokemonsOnPage = allpokemon.results.slice(start, end);

            allPokemonContainer.innerHTML = "";
            

            Promise.all(pokemonsOnPage.map(pokemon => fetchPokemonData(pokemon)))
            .then(() => console.log('All data fetched'))
            .catch(error => console.error('Error fetching data:', error));
            
            if (!document.getElementById('prevButton')) {
                prevButton = document.createElement('button');
                prevButton.id = 'prevButton';
                prevButton.textContent = 'Föregående';
                    prevButton.addEventListener('click', () => {
                    if (currentPage > 0) {
                        currentPage--;
                        showPage(currentPage);
                        pokemonHeader(); 
                    }
                });
                document.body.append(prevButton);
            }
                
            if (!document.getElementById('nextButton')) {
                nextButton = document.createElement('button');
                nextButton.id = 'nextButton';
                nextButton.textContent = 'Nästa';
                nextButton.addEventListener('click', () => {
                    if (currentPage < Math.ceil(allpokemon.results.length / pokemonsPerPage) - 1) {
                        currentPage++;
                        showPage(currentPage);
                        pokemonHeader(); 
                    }
                });
                document.body.append(nextButton);
            }       
        }
        showPage(currentPage);
        pokemonHeader(); 
    })
}

function pokemonHeader() {
    let caughtPokemonContainer = document.getElementById('pokemon-container');
    caughtPokemonContainer.innerHTML = "";
    let indexHeader = document.createElement("h1");
    indexHeader.innerText = "Visar 10 av alla Pokémon åt gången!";
    let indexH2 = document.createElement("h2");
    indexH2.innerText = "Välj en Pokémon som du vill fånga.";
    
    let showMyPokemonBtn = document.createElement("button");
    showMyPokemonBtn.innerText = "Mina Pokemon!";

    showMyPokemonBtn.addEventListener("click", () => {
        fetchCaughtPokemons();
        prevButton.remove(); 
        nextButton.remove();
    })

    showMyPokemonBtn.classList.add("showMyPokemonBtn");
    allPokemonContainer.appendChild(indexHeader);
    allPokemonContainer.appendChild(indexH2);
    allPokemonContainer.appendChild(showMyPokemonBtn);
}

function renderPokemon(pokeData) {
    if (!pokeData) {
        console.error('Error: No data.');
        return;
    }

    let pokemonContainer = document.createElement("div");
    pokemonContainer.classList.add("pokemon-container");
    let pokeName = document.createElement('h4');
    pokeName.innerText = pokeData.name
    let pokeNumber = document.createElement('p');
    pokeNumber.innerText = `# ${pokeData.id}`
    let pokeTypes = document.createElement('ul');
    pokeTypes.innerText ="Typ: "
    let pokemonId = pokeData.id;

    let pokemonImg = document.createElement("img");
    pokemonImg.style.width = "200px";
    pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`;

    pokemonContainer.addEventListener("click", () => {
        printPokemonInfo(pokeData);
        prevButton.remove();
        nextButton.remove();
    });

    createTypes(pokeData.types, pokeTypes);

    pokemonContainer.append(pokeName, pokeNumber, pokeTypes, pokemonImg);
    allPokemonContainer.appendChild(pokemonContainer);
}

function fetchPokemonData(pokemon) {
    let url = pokemon.url;
        
    fetch(url)
    .then(response => response.json())
    .then(function (pokeData) {
        console.log(pokeData);
        renderPokemon(pokeData); 
    });
}

function createTypes(types, ul){
    types.forEach(function(type){

    let typeLi = document.createElement('li');
        typeLi.innerText = type['type']['name'];
        ul.append(typeLi)
    });
}

function printPokemonInfo(pokeData) {
    let pokemonBox = document.getElementById("pokemon-container");
    let pokemonInfoContainer = document.getElementById("pokemonInfoContainer");
    
    if (!pokemonBox) {
        console.error('Element with ID "pokemonBox" not found.');
        return;
    }

    pokemonBox.innerHTML = "";
    pokemonInfoContainer.innerHTML = "";

    let pokemonHeadline = document.createElement("h2");
    pokemonHeadline.innerText = pokeData.name;

    let pokemonId = pokeData.id;
    let pokeNumber = document.createElement('p');
    pokeNumber.innerText = "# " + pokeData.id;

    let pokemonTypeHeader = document.createElement("h2");
    pokemonTypeHeader = "Typ: "

    let pokemonType = document.createElement("ul");
    createTypes(pokeData.types, pokemonType);  

    let pokemonImg = document.createElement("img");
    pokemonImg.style.width = "200px";
    pokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`;


    let catchBtn = document.createElement('button');
    catchBtn.innerText = "Fånga!";
    catchBtn.classList.add("catchBtn");

    let showMyPokemonBtn = document.createElement("button");
    showMyPokemonBtn.innerText = "Mina Pokemon!";
    showMyPokemonBtn.classList.add("showMyPokemonBtn");

    let homeBtn = document.createElement("button");
    homeBtn.innerText = "Till startsidan";
    homeBtn.classList.add("homeBtn");

    homeBtn.addEventListener("click", () => {
        pokemonInfoContainer.innerHTML = "";
        fetchBasePokemon();
        prevButton.remove();
        nextButton.remove();
    })

    showMyPokemonBtn.addEventListener("click", () => {
        fetchCaughtPokemons();
        prevButton.remove();
        nextButton.remove();
    })

    
    catchBtn.addEventListener("click", () => {
        catchPokemon(pokeData);  
        prevButton.remove();
        nextButton.remove();
    });

    pokemonInfoContainer.append(pokemonHeadline, pokeNumber, pokemonTypeHeader, pokemonType, pokemonImg, catchBtn, showMyPokemonBtn, homeBtn);
}

function catchPokemon(pokeData) {
    
    fetch('http://localhost:8080/caught-pokemon-ids')
    .then(response => response.json())
    .then(function(caughtPokemonIds) {
            
        if (caughtPokemonIds.includes(pokeData.id)) {
            displayMessage(`Du har redan fångat en ${pokeData.name}!`);
            console.error(`Pokemon with ID ${pokeData.id} is already caught.`);
        } else {
                
        let caughtPokemon = {
            id: pokeData.id,
            name: pokeData.name,
            type: pokeData.types.map(type => type.type.name),
            caught: true
        };

                
        fetch('http://localhost:8080/pokemon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(caughtPokemon), 
        })
        .then(response => response.json())
        .then(data => {
            displayMessage(`Du fångade ${pokeData.name}!`);
            console.log('Pokemon caught and saved:', data);
        })
            .catch(error => console.error('Error catching Pokemon:', error));
        }
    })
    .catch(error => console.error('Error fetching caught Pokemon IDs:', error));
}

function fetchCaughtPokemons() {
    fetch('http://localhost:8080/pokemons') 
    .then(response => response.json())
    .then(function(caughtPokemons) {
        console.log("hämta pokemon");
        renderCaughtPokemons(caughtPokemons);
    })
    .catch(error => console.error('Error fetching pokemons:', error));
}

function renderCaughtPokemons(caughtPokemons) {
    let caughtPokemonContainer = document.getElementById('pokemon-container');
    let pokemonInfoContainer = document.getElementById("pokemonInfoContainer");

    if (!caughtPokemonContainer) {
        console.error('Element with ID "pokemon-container" not found.');
        return;
    }
    
    pokemonInfoContainer.innerHTML = "";
    caughtPokemonContainer.innerHTML = ""; 

    let pokedexHeader = document.createElement("h1");
    pokedexHeader.innerText = "Min Pokédex";

    let homeBtn = document.createElement("button");
    homeBtn.innerText = "Till startsidan";
    homeBtn.classList.add("homeBtn");

    homeBtn.addEventListener("click", () => {
        allPokemonContainer.innerHTML = "";
        fetchBasePokemon();
        prevButton.remove();
        nextButton.remove();
    })

    caughtPokemonContainer.appendChild(pokedexHeader);
    caughtPokemonContainer.appendChild(homeBtn);


    caughtPokemons.forEach(function (pokemon) {
        let caughtPokemonDiv = document.createElement("div");
        let caughtPokemonName = document.createElement('h4');
        let caughtPokemonTypes = document.createElement('ul');
        let caughtPokemonNr = document.createElement("p");
        let releasePokemonBtn = document.createElement("button");
        let caughtPokemonImg = document.createElement("img");
        
        caughtPokemonDiv.classList.add("pokemon-container");
        
        releasePokemonBtn.innerText = "Ta bort";
        releasePokemonBtn.addEventListener("click", () => {
            console.log("Tar bort " + pokemon.id);
            deletePokemon(pokemon.id);  
            prevButton.remove();
            nextButton.remove();
        });

        caughtPokemonName.innerText = pokemon.name;
        caughtPokemonNr.innerText = "# " + pokemon.id;
        caughtPokemonImg.style.width = "200px";
        caughtPokemonImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`;
        caughtPokemonTypes.innerText = `Typ: ${pokemon.type.join(', ')}`; 

        caughtPokemonDiv.append(caughtPokemonName, caughtPokemonNr, caughtPokemonTypes, releasePokemonBtn, caughtPokemonImg,);
        caughtPokemonContainer.appendChild(caughtPokemonDiv);
    });
}

function deletePokemon(pokemonId) {
    console.log(`Ta bort Pokemon med ID: ${pokemonId}`);
    fetch(`http://localhost:8080/pokemon?id=${pokemonId}`, {
    method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            console.log(`Pokemon med id ${pokemonId} togs bort!`);
            displayMessage(`Pokemon med id ${pokemonId} togs bort!`);
            fetchCaughtPokemons(); 
        } else {
            console.error('Error:', response.statusText);
        }
    })
    .catch(error => console.error('Error:', error));
}

function displayMessage(message) {

    alert(message); 
}

fetchBasePokemon();


