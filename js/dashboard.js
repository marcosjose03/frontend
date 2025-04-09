document.addEventListener("DOMContentLoaded", function () {
    const selectFiltro = document.getElementById("filtro-modulo");
  
    cargarHabitos();
    actualizarBarraProgresoDesdeBackend();
    selectFiltro.addEventListener("change", function () {
      cargarHabitos();
    });
    cargarEstadisticasPorModulo();
  });
  
  const API_URL = "http://localhost:8080/api/habitos";
  const TOKEN = localStorage.getItem("token");
  
  function cargarHabitos() {
    if (!TOKEN) {
      alert("No estás autenticado");
      window.location.href = "/login.html";
      return;
    }
  
    const moduloSeleccionado = document.getElementById("filtro-modulo").value;
    let url = API_URL;
    if (moduloSeleccionado) {
      url += `/${moduloSeleccionado}`;
    }
  
    fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al obtener los hábitos");
        }
        return response.json();
      })
      .then(habitos => {
        const lista = document.getElementById("habitos-list");
        lista.innerHTML = "";
  
        if (habitos.length === 0) {
          lista.innerHTML = "<p>No hay hábitos en este módulo.</p>";
          return;
        }
  
        habitos.forEach(habito => {
          // Creamos el <li> principal
          const li = document.createElement("li");
  
          // Creamos un <span> para el texto del hábito
          const spanTexto = document.createElement("span");
          spanTexto.className = "habito-texto";
          spanTexto.textContent = `${habito.nombre} - ${habito.modulo}`;
  
          // Creamos un contenedor para los botones
          const botonesDiv = document.createElement("div");
          botonesDiv.className = "botones-habito";
  
          // Botón Completar
          const btnCompletar = document.createElement("button");
          btnCompletar.classList.add("btn", "completar");
          btnCompletar.textContent = habito.completado ? "✔ Completado" : "Completar";
          btnCompletar.onclick = function () {
            marcarCompletado(habito.id);
          };
  
          // Botón Eliminar
          const btnEliminar = document.createElement("button");
          btnEliminar.classList.add("btn", "eliminar");
          btnEliminar.textContent = "❌ Eliminar";
          btnEliminar.onclick = function () {
            eliminarHabito(habito.id);
          };
  
          // Agregamos los botones al contenedor
          botonesDiv.appendChild(btnCompletar);
          botonesDiv.appendChild(btnEliminar);
  
          // Agregamos el texto y el contenedor de botones al <li>
          li.appendChild(spanTexto);
          li.appendChild(botonesDiv);
  
          // Agregamos el <li> a la lista principal
          lista.appendChild(li);
        });
  
        actualizarBarraProgresoDesdeBackend();
      })
      .catch(error => console.error("Error:", error));
  }
  
  document.getElementById("habito-form").addEventListener("submit", function (event) {
    event.preventDefault();
  
    const nombre = document.getElementById("habito-nombre").value;
    const modulo = document.getElementById("habito-modulo").value;
  
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, modulo })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al agregar hábito");
        }
        return response.json();
      })
      .then(() => {
        cargarHabitos();
        document.getElementById("habito-form").reset();
      })
      .catch(error => console.error("Error:", error));
  });
  
  function marcarCompletado(id) {
    fetch(`${API_URL}/${id}/completar`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al marcar hábito como completado");
        }
        cargarEstadisticasPorModulo();
        cargarHabitos();
      })
      .catch(error => console.error("Error:", error));
  }
  
  function eliminarHabito(id) {
    if (!confirm("¿Seguro que deseas eliminar este hábito?")) return;
  
    fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al eliminar hábito");
        }
        cargarEstadisticasPorModulo();
        cargarHabitos();
      })
      .catch(error => console.error("Error:", error));
  }
  
  function cerrarSesion() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
  
  function actualizarBarraProgresoDesdeBackend() {
    if (!TOKEN) return;
  
    fetch(API_URL, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al obtener los hábitos");
        }
        return response.json();
      })
      .then(habitos => {
        const total = habitos.length;
        const completados = habitos.filter(h => h.completado === true).length;
        const porcentaje = total === 0 ? 0 : Math.round((completados / total) * 100);
  
        const barra = document.getElementById("barra-progreso");
        const texto = document.getElementById("porcentaje-progreso");
  
        if (barra && texto) {
          barra.style.width = `${porcentaje}%`;
          texto.textContent = `${porcentaje}% completado`;
        } else {
          console.error("No se encontraron los elementos de progreso en el DOM.");
        }
      })
      .catch(error => console.error("Error al actualizar barra de progreso:", error));
  }
  
  function cargarEstadisticasPorModulo() {
    const usuarioId = localStorage.getItem("usuarioId");
  
    fetch(`http://localhost:8080/api/habitos/stats/modulo/${usuarioId}`, {
      headers: {
        "Authorization": `Bearer ${TOKEN}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Error al obtener estadísticas por módulo");
        }
        return res.json();
      })
      .then(data => {
        const modulos = data.map(item => item.modulo || "Sin módulo");
        const completados = data.map(item => item.completados);
        const canvas = document.getElementById("graficoHabitos");
        const ctx = canvas.getContext("2d");
  
        if (window.miGraficoHabitos) {
          window.miGraficoHabitos.destroy();
        }
  
        window.miGraficoHabitos = new Chart(ctx, {
          type: "bar",
          data: {
            labels: modulos,
            datasets: [{
              label: "Hábitos completados por módulo",
              data: completados,
              backgroundColor: "#4caf50"
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
      })
      .catch(error => console.error("Error:", error));
  }
  