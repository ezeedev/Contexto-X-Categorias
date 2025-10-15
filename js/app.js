document.addEventListener("DOMContentLoaded", () => {
  const pantallas = document.querySelectorAll(".pantalla");
  const btnJugar = document.getElementById("btnJugar");
  const btnVolver = document.querySelectorAll(".volver");
  const categorias = document.querySelectorAll(".categoria");
  const tituloCategoria = document.getElementById("tituloCategoria");
  const inputPalabra = document.getElementById("inputPalabra");
  const btnProbar = document.getElementById("btnProbar");
  const listaIntentos = document.getElementById("listaIntentos");
  const puntajeDisplay = document.getElementById("puntaje");
  const contadorIntentos = document.getElementById("contadorIntentos");
  let intentos = 0;
  let puntaje = 0;
  
  let palabraSecreta = "";
  
  // Palabras por categoría
  const palabras = {
    "🎬 Películas": ["Titanic", "Matrix", "Avatar", "Inception", "Gladiator"],
    "🌍 Países": ["Argentina", "Brasil", "España", "México", "Japón"],
    "⚽ Deportes": ["Fútbol", "Tenis", "Basket", "Natación", "Boxeo"],
    "🍔 Comida": ["Pizza", "Hamburguesa", "Ensalada", "Sushi", "Taco"],
    "📜 Historia": ["Revolución", "Imperio", "Guerra", "Descubrimiento", "Colonización"],
    "💻 Tecnología": ["Computadora", "Internet", "Robot", "Smartphone", "AI"]
  };

  function mostrarPantalla(id) {
    pantallas.forEach(p => p.classList.remove("activa"));
    document.getElementById(id).classList.add("activa");
  }

  // Botón "Jugar"
  btnJugar.addEventListener("click", () => mostrarPantalla("categorias"));

  // Botones "Volver"
  btnVolver.forEach(btn => {
    btn.addEventListener("click", () => {
      document.body.style.background = "linear-gradient(135deg, #2d3436, #636e72)";
      mostrarPantalla("inicio");
      listaIntentos.innerHTML = "";
      inputPalabra.value = "";
    });
  });

  btnProbar.addEventListener("click", () => {
  const intento = inputPalabra.value.trim();
  if (!intento) return;

  intentos++;
  contadorIntentos.textContent = intentos;

  const porcentaje = similitud(intento, palabraSecreta);
  const li = document.createElement("li");

  if (porcentaje === 100) {
    li.textContent = `${intento} — Exacto 🎉`;
    li.classList.add("intento-verde");
    listaIntentos.appendChild(li);

    // Calcular puntaje (ej: 100 - 10*intentos)
    puntaje = Math.max(100 - (intentos - 1) * 10, 10);
    puntajeDisplay.textContent = puntaje;

    setTimeout(() => {
      alert(`¡Correcto! La palabra secreta era: ${palabraSecreta}\nPuntaje: ${puntaje}`);
      mostrarPantalla("categorias");
      intentos = 0;
      contadorIntentos.textContent = intentos;
      puntajeDisplay.textContent = 0;
      listaIntentos.innerHTML = "";
      inputPalabra.value = "";
    }, 100);

  } else {
    li.textContent = `${intento} — ${porcentaje}% parecido`;
    if (porcentaje >= 80) li.classList.add("intento-verde");
    else if (porcentaje >= 50) li.classList.add("intento-amarillo");
    else li.classList.add("intento-rojo");
    listaIntentos.appendChild(li);
  }

  inputPalabra.value = "";
});

  // Elegir categoría
  categorias.forEach(cat => {
    cat.addEventListener("click", () => {
      const nombre = cat.textContent;
      const color = cat.getAttribute("data-color");

      document.body.style.background = `linear-gradient(135deg, ${color}, #2d3436)`;

      const lista = palabras[nombre];
      palabraSecreta = lista[Math.floor(Math.random() * lista.length)];

      tituloCategoria.textContent = `Categoría: ${nombre}`;
      listaIntentos.innerHTML = "";
      inputPalabra.value = "";
      mostrarPantalla("juego");
    });
  });

  // Distancia de Levenshtein
  function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    return dp[m][n];
  }

  // Similitud con porcentaje
  function similitud(palabra1, palabra2) {
    const dist = levenshtein(palabra1, palabra2);
    const maxLen = Math.max(palabra1.length, palabra2.length);
    const porcentaje = Math.round(((maxLen - dist) / maxLen) * 100);
    return porcentaje;
  }

  // Botón "Probar"
btnProbar.addEventListener("click", () => {
  const intento = inputPalabra.value.trim();
  if (!intento) return;

  const porcentaje = similitud(intento, palabraSecreta);
  const li = document.createElement("li");

  // Agregar texto y color según porcentaje
  if (porcentaje === 100) {
    li.textContent = `${intento} — Exacto 🎉`;
    li.classList.add("intento-verde");
    listaIntentos.appendChild(li);
    setTimeout(() => {
      alert(`¡Correcto! La palabra secreta era: ${palabraSecreta}`);
      mostrarPantalla("categorias");
    }, 100);
  } else {
    li.textContent = `${intento} — ${porcentaje}% parecido`;
    if (porcentaje >= 80) li.classList.add("intento-verde");
    else if (porcentaje >= 50) li.classList.add("intento-amarillo");
    else li.classList.add("intento-rojo");
    listaIntentos.appendChild(li);
  }

  inputPalabra.value = "";
    });
    if (porcentaje === 100) {
  li.textContent = `${intento} — Exacto 🎉`;
  li.classList.add("intento-verde");
  listaIntentos.appendChild(li);

  puntaje = Math.max(100 - (intentos - 1) * 10, 10);
  puntajeDisplay.textContent = puntaje;

  // Guardar en historial y actualizar ranking
  historialPuntajes.push(puntaje);
  actualizarRanking();

  setTimeout(() => {
    alert(`¡Correcto! La palabra secreta era: ${palabraSecreta}\nPuntaje: ${puntaje}`);
    mostrarPantalla("categorias");
    intentos = 0;
    contadorIntentos.textContent = intentos;
    puntajeDisplay.textContent = 0;
    listaIntentos.innerHTML = "";
    inputPalabra.value = "";
  }, 100);
}

});

const rankingLista = document.getElementById("ranking");
let historialPuntajes = [];

function actualizarRanking() {
  // Ordenar descendente y tomar top 5
  const top = [...historialPuntajes].sort((a,b) => b - a).slice(0,5);
  rankingLista.innerHTML = "";
  top.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `${i+1}. ${p} pts`;
    rankingLista.appendChild(li);
  });
}