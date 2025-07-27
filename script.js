document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("fileInput");
  const searchInput = document.getElementById("searchInput");

  const popup = document.getElementById("popup");
  const popupTitle = document.getElementById("popupTitle");
  const closeBtn = document.getElementById("closeBtn");
  const saveBtn = document.getElementById("saveBtn");
  const modeloInput = document.getElementById("modelo");
  const matriculaInput = document.getElementById("matricula");
  const descripcionInput = document.getElementById("descripcion");
  const vehicleList = document.getElementById("vehicleList");

  function obtenerVehiculos() {
    return JSON.parse(localStorage.getItem("vehiculos") || "[]");
  }

  function guardarVehiculos(lista) {
    localStorage.setItem("vehiculos", JSON.stringify(lista));
  }

  function cargarVehiculos(filtro = "") {
    const vehiculos = obtenerVehiculos();
    const vehiculosFiltrados = vehiculos.filter(v =>
      v.modelo.toLowerCase().includes(filtro.toLowerCase()) ||
      v.matricula.toLowerCase().includes(filtro.toLowerCase())
    );

    vehicleList.innerHTML = "";

    vehiculosFiltrados.forEach((vehiculo) => {
      const indexReal = vehiculos.findIndex(v =>
        v.modelo === vehiculo.modelo &&
        v.matricula === vehiculo.matricula &&
        v.descripcion === vehiculo.descripcion
      );

      const div = document.createElement("div");
      div.className = "vehicle-item";

      const info = document.createElement("span");
      info.textContent = `${vehiculo.modelo} - ${vehiculo.matricula}`;
      info.addEventListener("click", () => {
        alert(`Modelo: ${vehiculo.modelo}\nMatrícula: ${vehiculo.matricula}\nDescripción: ${vehiculo.descripcion || "N/A"}`);
      });

      const editarBtn = document.createElement("button");
      editarBtn.textContent = "✏️";
      editarBtn.title = "Editar";
      editarBtn.addEventListener("click", () => editarVehiculo(indexReal));

      const eliminarBtn = document.createElement("button");
      eliminarBtn.textContent = "🗑️";
      eliminarBtn.title = "Eliminar";
      eliminarBtn.addEventListener("click", () => eliminarVehiculo(indexReal));

      div.appendChild(info);
      div.appendChild(editarBtn);
      div.appendChild(eliminarBtn);
      vehicleList.appendChild(div);
    });
  }

  function guardarVehiculo() {
    const modelo = modeloInput.value.trim();
    const matricula = matriculaInput.value.trim();
    const descripcion = descripcionInput.value.trim();

    // Acepta 1234ABC o A1234BC
    const regexMatricula = /^(\d{4}[A-Z]{3}|[A-Z]{1}\d{4}[A-Z]{2})$/i;

    if (!modelo || !matricula) {
      alert("Por favor completa el modelo y la matrícula.");
      return;
    }

    if (!regexMatricula.test(matricula)) {
      alert("La matrícula debe tener el formato 1234ABC o A1234BC.");
      return;
    }

    const editIndex = popup.getAttribute("data-edit-index");
    const vehiculos = obtenerVehiculos();
    const vehiculo = { modelo, matricula };
    if (descripcion) vehiculo.descripcion = descripcion;

    if (editIndex === "") {
      vehiculos.push(vehiculo);
    } else {
      vehiculos[parseInt(editIndex)] = vehiculo;
      popup.setAttribute("data-edit-index", "");
    }

    guardarVehiculos(vehiculos);
    modeloInput.value = "";
    matriculaInput.value = "";
    descripcionInput.value = "";
    popup.classList.add("hidden");
    cargarVehiculos(searchInput.value);
  }

  function editarVehiculo(index) {
    const vehiculo = obtenerVehiculos()[index];
    modeloInput.value = vehiculo.modelo;
    matriculaInput.value = vehiculo.matricula;
    descripcionInput.value = vehiculo.descripcion || "";
    popupTitle.textContent = "Editar Vehículo";
    popup.setAttribute("data-edit-index", index);
    popup.classList.remove("hidden");
  }

  function eliminarVehiculo(index) {
    const vehiculos = obtenerVehiculos();
    vehiculos.splice(index, 1);
    guardarVehiculos(vehiculos);
    cargarVehiculos(searchInput.value);
  }

  function descargarJSON() {
    const vehiculos = obtenerVehiculos();
    const blob = new Blob([JSON.stringify(vehiculos, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vehiculos.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function cargarDesdeArchivo(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const nuevosVehiculos = JSON.parse(e.target.result);
        if (!Array.isArray(nuevosVehiculos)) throw new Error("Formato incorrecto");

        guardarVehiculos(nuevosVehiculos);
        cargarVehiculos();
        alert("Vehículos cargados correctamente.");
      } catch (err) {
        alert("Error al leer el archivo: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  // Eventos
  addBtn.addEventListener("click", () => {
    popupTitle.textContent = "Nuevo Vehículo";
    modeloInput.value = "";
    matriculaInput.value = "";
    descripcionInput.value = "";
    popup.setAttribute("data-edit-index", "");
    popup.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => popup.classList.add("hidden"));
  saveBtn.addEventListener("click", guardarVehiculo);
  downloadBtn.addEventListener("click", descargarJSON);

  uploadBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", function () {
    if (this.files.length > 0) {
      cargarDesdeArchivo(this.files[0]);
    }
  });

  // Para que con "Enter" se guarde
  /*
  modeloInput.addEventListener("keydown", e => {
    if (e.key === "Enter") guardarVehiculo();
  });
  matriculaInput.addEventListener("keydown", e => {
    if (e.key === "Enter") guardarVehiculo();
  });
  descripcionInput.addEventListener("keydown", e => {
    if (e.key === "Enter") guardarVehiculo();
  });

  searchInput.addEventListener("input", () => {
    cargarVehiculos(searchInput.value);
  });
  */

  cargarVehiculos();
});
