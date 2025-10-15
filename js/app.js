document.addEventListener("DOMContentLoaded", () => {
  const pantallas = document.querySelectorAll(".pantalla");
  const btnJugar = document.getElementById("btnJugar");
  const btnVolver = document.querySelectorAll(".volver");
  const categorias = document.querySelectorAll(".categoria");
  const tituloCategoria = document.getElementById("tituloCategoria");
  const inputPalabra = document.getElementById("inputPalabra");
  const btnIntentar = document.getElementById("btnIntentar");
  const listaIntentos = document.getElementById("listaIntentos");
  const contadorIntentos = document.getElementById("contadorIntentos");
  const puntajeDisplay = document.getElementById("puntaje");
  const rankingLista = document.getElementById("ranking");
  const nombreJugadorInput = document.getElementById("nombreJugador");

  let palabraSecreta = "";
  let intentos = 0;
  let puntaje = 0;
  let jugadorActual = "";
  let historialPuntajes = JSON.parse(localStorage.getItem("ranking")) || [];

  // 🧮 Distancia de Levenshtein
  function distanciaLevenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
        else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function similitudPorcentaje(a, b) {
    const dist = distanciaLevenshtein(a.toLowerCase(), b.toLowerCase());
    const maxLen = Math.max(a.length, b.length);
    return Math.round((1 - dist / maxLen) * 100);
  }

  function mostrarPantalla(id) {
    pantallas.forEach(p => p.classList.remove("activa"));
    document.getElementById(id).classList.add("activa");
  }

  function actualizarRanking() {
    rankingLista.innerHTML = "";
    const top = [...historialPuntajes].sort((a,b) => b.puntaje - a.puntaje).slice(0,5);
    top.forEach((entry, i) => {
      const li = document.createElement("li");
      li.textContent = `${i+1}. ${entry.nombre} — ${entry.puntaje} pts`;
      rankingLista.appendChild(li);
    });
    localStorage.setItem("ranking", JSON.stringify(historialPuntajes));
  }

  btnJugar.addEventListener("click", () => {
    const nombre = nombreJugadorInput.value.trim();
    if (!nombre) return alert("Por favor, ingresá tu nombre.");
    jugadorActual = nombre;
    mostrarPantalla("categorias");
    actualizarRanking();
  });

  btnVolver.forEach(btn => {
    btn.addEventListener("click", () => {
      mostrarPantalla("inicio");
    });
  });

  categorias.forEach(cat => {
    cat.addEventListener("click", () => {
      const nombre = cat.textContent;
      const color = cat.dataset.color;
      tituloCategoria.textContent = `Categoría: ${nombre}`;
      document.body.style.background = color;
      palabraSecreta = obtenerPalabraSecreta(nombre);
      intentos = 0;
      puntaje = 0;
      listaIntentos.innerHTML = "";
      contadorIntentos.textContent = "0";
      puntajeDisplay.textContent = "0";
      mostrarPantalla("juego");
    });
  });

  function obtenerPalabraSecreta(categoria) {
    const palabras = {
      "🎬 Películas": ["Titanic", "Avatar", "Matrix"],
      "🌍 Países": ["Argentina", "Japón", "Canadá"],
      "⚽ Deportes": ["Fútbol", "Tenis", "Básquet"],
      "🍔 Comida": ["Pizza", "Hamburguesa", "Sushi"],
      "📜 Historia": ["Egipto", "Roma", "Napoleón"],
      "💻 Tecnología": ["Internet", "Computadora", "Robot"]
    };
    const lista = palabras[categoria] || ["Test"];
    return lista[Math.floor(Math.random() * lista.length)];
  }

  btnIntentar.addEventListener("click", () => {
    const intento = inputPalabra.value.trim();
    if (!intento) return;

    intentos++;
    contadorIntentos.textContent = intentos;

    const porcentaje = similitudPorcentaje(intento, palabraSecreta);
    const li = document.createElement("li");
    li.textContent = `${intento} — ${porcentaje}%`;

    if (porcentaje === 100) {
      li.textContent = `${intento} — ¡Exacto! 🎉`;
      li.classList.add("intento-verde");
      listaIntentos.appendChild(li);

      puntaje = Math.max(100 - (intentos - 1) * 10, 10);
      puntajeDisplay.textContent = puntaje;

      historialPuntajes.push({ nombre: jugadorActual, puntaje });
      actualizarRanking();

      setTimeout(() => {
        alert(`🎉 ¡Correcto ${jugadorActual}! La palabra era "${palabraSecreta}"\nPuntaje: ${puntaje}`);
        mostrarPantalla("categorias");
      }, 200);

    } else if (porcentaje >= 70) {
      li.classList.add("intento-amarillo");
    } else {
      li.classList.add("intento-rojo");
    }

    listaIntentos.appendChild(li);
    inputPalabra.value = "";
  });
});
