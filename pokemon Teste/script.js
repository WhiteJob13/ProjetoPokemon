// URL para buscar o índice de todos os Pokémon (limite 10000 cobre todos os atuais)
const INDEX_URL = "https://pokeapi.co/api/v2/pokemon?limit=100";
const container = document.getElementById("pokemon-container");

// --- ESTILOS INICIAIS DO CONTAINER (Para responsividade e layout) ---
// Note: Em um projeto real, esses estilos iriam para o CSS.
if (container) {
  container.style.display = "flex";
  container.style.flexWrap = "wrap";
  container.style.justifyContent = "center";
  container.style.gap = "20px"; // Espaçamento entre os cards
  container.style.padding = "20px";
}
// --------------------------------------------------------------------

// Função para buscar os detalhes de um único Pokémon
async function fetchPokemonDetails(url) {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Falha ao buscar detalhes de ${url}: ${response.status}`);
    return null; // Retorna null em caso de falha
  }
  return response.json();
}

// Função principal para buscar todos os dados e renderizar
async function buscarEExibirTodosPokemons() {
  if (!container) {
    console.error("Elemento 'pokemon-container' não encontrado!");
    return;
  }

  container.innerHTML = "<h2>Carregando Pokémons...</h2>";

  // 1. BUSCAR O ÍNDICE INICIAL (TODAS AS URLS)
  let listaDados;
  try {
    const listaResponse = await fetch(INDEX_URL);
    if (!listaResponse.ok) {
      throw new Error("Falha ao carregar o índice da API.");
    }
    listaDados = await listaResponse.json();
  } catch (error) {
    container.innerHTML = `<h2 style="color: red;">Erro ao carregar o índice: ${error.message}</h2>`;
    return;
  }

  const urlsDeDetalhes = listaDados.results.map((p) => p.url);
  console.log(
    `Iniciando busca dos detalhes de ${urlsDeDetalhes.length} Pokémons em paralelo...`
  );

  // 2. BUSCAR DETALHES EM PARALELO (USANDO PROMISE.ALL)
  const promisesDeDetalhes = urlsDeDetalhes.map(fetchPokemonDetails);

  // O Promise.all espera que todas as requisições sejam concluídas
  const todosOsDetalhes = await Promise.all(promisesDeDetalhes);

  // Filtra Pokémons nulos (em caso de falha na busca de algum detalhe)
  const pokemonsValidos = todosOsDetalhes.filter((p) => p !== null);

  // 3. EXIBIR OS DADOS
  container.innerHTML = ""; // Limpa a mensagem de carregamento
  console.log("Iniciando exibição...");

  pokemonsValidos.forEach((pokemon) => {
    // Extrai o Nome e a URL da Imagem
    const nome = pokemon.name;

    // A PokeAPI aninha as imagens no objeto 'sprites'
    const imageUrl =
      pokemon.sprites.other["official-artwork"].front_default ||
      pokemon.sprites.front_default;

    // Cria e anexa o elemento HTML (o card do Pokémon)
    criarCardPokemon(pokemon.id, nome, imageUrl);
  });

  console.log("Exibição completa!");
}

// Função auxiliar para criar o elemento HTML e exibi-lo
function criarCardPokemon(id, nome, imageUrl) {
  const card = document.createElement("div");
  // ====================================================================
  // --- ESTILOS PARA TRANSFORMAR O CARD EM UM QUADRADO BRANCO RESPONSIVO ---
  // 1. Aparência do Quadrado Branco
  card.style.backgroundColor = "white"; // Fundo branco
  card.style.border = "1px solid #ddd"; // Borda suave
  card.style.borderRadius = "15px"; // Bordas arredondadas
  card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)"; // Sombra leve

  // 2. Layout e Dimensões (Tornando-o um quadrado)
  const cardSize = "300px"; // Define a largura e altura
  card.style.width = cardSize;
  card.style.height = cardSize;
  card.style.display = "flex";
  card.style.flexDirection = "column";
  card.style.alignItems = "center";
  card.style.justifyContent = "space-around"; // Distribui o conteúdo verticalmente
  card.style.padding = "10px 0"; // Preenchimento interno
  card.style.boxSizing = "border-box"; // Garante que padding e border sejam incluídos no width/height

  // 3. Responsividade ao Toque/Hover (Efeitos de transição e escala)
  card.style.cursor = "pointer"; // Indica que é clicável
  card.style.transition = "transform 0.2s ease, box-shadow 0.2s ease"; // Transição suave para efeitos

  // Efeito de Hover (para desktop)
  card.onmouseover = () => {
    card.style.transform = "scale(1.05)"; // Aumenta levemente
    card.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)"; // Sombra mais forte
  };
  card.onmouseout = () => {
    card.style.transform = "scale(1)"; // Volta ao tamanho normal
    card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)"; // Volta à sombra original
  };

  // Efeito de 'Toque Ativo' (útil para touchscreens)
  card.onmousedown = card.ontouchstart = () => {
    card.style.transform = "scale(0.98)"; // Diminui um pouco ao ser clicado/tocado
  };
  card.onmouseup = card.ontouchend = () => {
    // Usa um pequeno timeout para garantir que o onmouseout/ontouchend redefina
    setTimeout(() => {
      card.style.transform = "scale(1.05)"; // Volta ao estado de hover/touch
    }, 50);
    // O onmouseout ou ontouchend subsequente restaurará o estado final.
  };
  // ====================================================================

  const imagem = document.createElement("img");
  imagem.src = imageUrl;
  imagem.alt = nome;
  imagem.style.width = "70%"; // Imagem preenchendo a maior parte do quadrado
  imagem.style.maxHeight = "70%"; // Garante que a imagem se ajuste
  imagem.style.objectFit = "contain"; // Garante que a imagem seja exibida inteira
  imagem.style.marginBottom = "5px";

  const titulo = document.createElement("h3");
  titulo.textContent = `  ${nome.charAt(0).toUpperCase() + nome.slice(1)}`; // Capitaliza o nome
  titulo.style.fontSize = "0.9em"; // Tamanho menor para caber
  titulo.style.margin = "0"; // Remove margens padrão do h3

  card.appendChild(imagem);
  card.appendChild(titulo);
  container.appendChild(card);
}

// Inicia o processo quando a página carrega
document.addEventListener("DOMContentLoaded", buscarEExibirTodosPokemons);
