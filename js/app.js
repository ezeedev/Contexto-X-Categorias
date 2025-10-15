document.addEventListener("DOMContentLoaded", () => {
  // elementos
  const btnComenzar = document.getElementById("btnComenzar");
  const nombreInput = document.getElementById("nombreJugador");
  const estadoCarga = document.getElementById("estadoCarga");
  const categoriasContainer = document.getElementById("categorias-container");
  const inicioPantalla = document.getElementById("inicio");
  const categoriasPantalla = document.getElementById("categorias");
  const juegoPantalla = document.getElementById("juego");
  const rankingPantalla = document.getElementById("ranking");
  const btnVolverInicio = document.getElementById("btnVolverInicio");
  const btnSalir = document.getElementById("btnSalir");
  const btnProbar = document.getElementById("btnProbar");
  const categoriasObj = {}; // final structure: { "Cat": [ "palabra1", "palabra2", ... ] }
  const listaIntentos = document.getElementById("lista-intentos");
  const categoriaTitulo = document.getElementById("categoriaSeleccionada");
  const jugadorNombreEl = document.getElementById("jugadorNombre");
  const contadorEl = document.getElementById("contador");
  const progresoEl = document.getElementById("progreso");
  const puntajeEl = document.getElementById("puntaje");
  const inputPalabra = document.getElementById("input-palabra");
  const listaRanking = document.getElementById("lista-ranking");
  const correctSound = new Audio("/sounds/correct.wav");
  const wrongSound = new Audio("/sounds/wrong.wav");
  const timeOutSound = new Audio("/sounds/timeout.wav");


  let categoriasCargadas = false;
  let categoriasSource = null;
  let nombreJugador = "";
  let categoriaActual = "";
  let palabraSecreta = "";
  let tiempo = 60;
  let intervalo = null;
  let puntaje = 0;

  // Helper: cambia pantalla
  function mostrarPantalla(id) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
    document.getElementById(id).classList.add("activa");
  }

  // Cargar categorias.json (ruta relativa a index.html)
  function cargarCategorias() {
    fetch("/js/categorias.json")
      .then(r => {
        if (!r.ok) throw new Error("status " + r.status);
        return r.json();
      })
      .then(data => {
        console.log("categorias.json cargado:", data);
        estadoCarga.textContent = "Categorías cargadas ✅";
        categoriasSource = data;
        normalizarCategorias(data);
        categoriasCargadas = true;
        btnComenzar.disabled = false;
      })
      .catch(err => {
        console.error("Error al cargar categorias.json:", err);
        estadoCarga.textContent = "No se pudo cargar categorias.json. Usando categorías de prueba.";
        // fallback: categorias mínimas para probar
        const fallback = {
          "Animales": ["perro","gato","elefante","leon"],
          "Comida": ["pizza","sushi","taco","empanada"]
        };
        normalizarCategorias(fallback);
        categoriasCargadas = true;
        btnComenzar.disabled = false;
      });
  }

  // Normaliza distintos formatos de JSON a { "Cat": [ "pal1", "pal2" ] }
  function normalizarCategorias(raw) {
    // caso 1: { "categorias": [ {nombre, palabras:[...]} ] }
    if (raw && raw.categorias && Array.isArray(raw.categorias)) {
      raw.categorias.forEach(entry => {
        if (entry.nombre && Array.isArray(entry.palabras)) {
          categoriasObj[entry.nombre] = entry.palabras.map(p => String(p).toLowerCase());
        }
      });
      buildCategoriaButtons();
      return;
    }

    // caso 2: formato mapa simple { "Cat": ["p1","p2",...] }
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      let isMapOfArrays = true;
      for (let k in raw) {
        if (!Array.isArray(raw[k])) { isMapOfArrays = false; break; }
      }
      if (isMapOfArrays) {
        for (let k in raw) {
          // array puede ser de strings o de objetos {palabra:..}
          const arr = raw[k];
          categoriasObj[k] = arr.map(item => {
            if (typeof item === "string") return item.toLowerCase();
            if (typeof item === "object" && item.palabra) return String(item.palabra).toLowerCase();
            return String(item).toLowerCase();
          });
        }
        buildCategoriaButtons();
        return;
      }
    }

    // si no reconocemos formato -> fallback minimal
    console.warn("Formato de categorias.json no reconocido. Usando fallback.");
    categoriasObj["Animales"] = ["perro","gato","leon"];
    buildCategoriaButtons();
  }

  // Crear botones en DOM
  function buildCategoriaButtons() {
    categoriasContainer.innerHTML = "";
    Object.keys(categoriasObj).forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "categoria";
      btn.textContent = cat;
      btn.style.backgroundColor = `hsl(${Math.floor(Math.random()*360)}, 70%, 60%)`;
      btn.addEventListener("click", () => {
        iniciarPartida(cat);
      });
      categoriasContainer.appendChild(btn);
    });
  }

  // Iniciar partida
  function iniciarPartida(cat) {
    if (!cat || !categoriasObj[cat]) return;
    categoriaActual = cat;
    palabraSecreta = categoriasObj[cat][Math.floor(Math.random() * categoriasObj[cat].length)].toLowerCase();
    console.log("Palabra secreta:", palabraSecreta);
    nombreJugador = nombreInput.value.trim() || "Anónimo";
    jugadorNombreEl.textContent = nombreJugador;
    categoriaTitulo.textContent = cat;
    puntaje = 0;
    puntajeEl.textContent = puntaje;
    listaIntentos.innerHTML = "";
    mostrarPantalla("juego");
    iniciarTemporizador();
  }

  // Temporizador
  function iniciarTemporizador() {
    clearInterval(intervalo);
    tiempo = 60;
    contadorEl.textContent = tiempo;
    progresoEl.style.width = "100%";
    progresoEl.style.background = "linear-gradient(90deg,#00ff95,#00d1ff)";
    intervalo = setInterval(() => {
      tiempo--;
      contadorEl.textContent = tiempo;
      const pct = (tiempo / 60) * 100;
      progresoEl.style.width = pct + "%";
      if (tiempo > 30) progresoEl.style.background = "linear-gradient(90deg,#00ff95,#00d1ff)";
      else if (tiempo > 10) progresoEl.style.background = "linear-gradient(90deg,#ffd166,#ff9a00)";
      else progresoEl.style.background = "linear-gradient(90deg,#ff6b6b,#ff4d4d)";

      if (tiempo <= 0) {
        clearInterval(intervalo);
        finalizarPartida(false);
      }
    }, 1000);
  }

  // Probar intento
  btnProbar.addEventListener("click", () => {
    const intentoRaw = inputPalabra.value.trim();
    if (!intentoRaw) return;
    const intento = intentoRaw.toLowerCase();
    const porc = similitudLevenshtein(intento, palabraSecreta);
    const li = document.createElement("li");
    li.textContent = `${intentoRaw} — ${porc.toFixed(1)}%`;
    if (porc >= 80) li.classList.add("intento-verde");
    else if (porc >= 50) li.classList.add("intento-amarillo");
    else li.classList.add("intento-rojo");
    listaIntentos.prepend(li);

    if (porc === 100) {
      // acierto
      puntaje += Math.max(10, Math.round(tiempo)); // ejemplo
      puntajeEl.textContent = puntaje;
      clearInterval(intervalo);
      finalizarPartida(true);
    }
    inputPalabra.value = "";
  });

  // Finalizar partida
  function finalizarPartida(ganado, incorrecto) {
    if (ganado){
      correctSound.play();
      alert(`🎉 ${nombreJugador}, acertaste! Puntaje: ${puntaje}`)
    } else if (incorrecto) {
      wrongSound.play();
    }
    else {
      timeOutSound.play();
      alert(`⏰ Tiempo agotado! La palabra era: ${palabraSecreta}. Puntaje: ${puntaje}`);
    }
    guardarRanking({ nombre: nombreJugador, puntos: puntaje, categoria: categoriaActual, fecha: new Date().toLocaleString() });
    mostrarRanking();
    mostrarPantalla("ranking");
  }

  // Guardar ranking en localStorage
  function guardarRanking(entry) {
    const arr = JSON.parse(localStorage.getItem("ranking") || "[]");
    arr.push(entry);
    arr.sort((a,b)=> b.puntos - a.puntos);
    localStorage.setItem("ranking", JSON.stringify(arr.slice(0,50)));
  }

  function mostrarRanking() {
    const arr = JSON.parse(localStorage.getItem("ranking") || "[]");
    // rankingPantalla.style.backgroundColor = arr.length === 0 ? "#f8d7da" : "#d4edda";
    rankingPantalla.style.color = '#444';
    listaRanking.style.backgroundColor = arr.length === 0 ? "#dd6f7aff" : "#69bf7c";
    listaRanking.style.width = "100%";
    listaRanking.style.height = "100%";
    listaRanking.style.listStyleType = 'none';
    if (arr.length === 0) {
      listaRanking.innerHTML = "<li>No hay partidas jugadas aún.</li>";
      return;
    }
    listaRanking.innerHTML = arr.map((r,i)=> `<li>${i+1}. ${r.nombre} — ${r.puntos} pts <small class="small">(${r.categoria})</small></li>`).join("");
  }

  // Levenshtein -> porcentaje
  function similitudLevenshtein(a, b) {
    a = String(a || "");
    b = String(b || "");
    // paso por letras
    const m = a.length, n = b.length;
    if (m === 0) return n === 0 ? 100 : 0;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i-1] === b[j-1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
      }
    }
    const dist = dp[m][n];
    const maxLen = Math.max(m, n);
    return Math.round((1 - dist / maxLen) * 10000) / 100; // dos decimales
  }

  // botones volver / navegación
  btnVolverInicio.addEventListener("click", () => mostrarPantalla("inicio"));
  btnSalir.addEventListener("click", () => {
    clearInterval(intervalo);
    mostrarPantalla("categorias");
  });
  document.getElementById("btnVolverDesdeRanking").addEventListener("click", () => {
    mostrarPantalla("inicio");
  });

  // inicio: cargar categorias
  cargarCategorias();

  // botón comenzar: habilitado sólo cuando categoriasCargadas === true
  btnComenzar.addEventListener("click", () => {
    const nombre = nombreInput.value.trim();
    if (!nombre) {
      alert("Por favor, ingresa tu nombre.");
      return;
    }
    if (!categoriasCargadas) {
      alert("Las categorías todavía se están cargando. Esperá un momento.");
      return;
    }
    nombreJugador = nombre;
    jugadorNombreEl.textContent = nombreJugador;
    mostrarPantalla("categorias");
  });

});
