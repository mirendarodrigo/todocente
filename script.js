const valueOpt = {
    correccion: ["Exámenes", "Trabajo Practico", "Carpetas/Cuadernos",],
    planificacion: ["Examen", "Trabajo Practico", "Clases", "Planificacion de Catedra", "Actos Institucionales", "Salidas Educativas"],
    documentacion: ["Solicitar", "Presentar", "Revisar"],
    reunion: ["Equipo Docente", "Directivos", "Padres", "Cita Particular"],
    otro: []
}


const selectCat = document.getElementById("categorias");
const selectSub = document.getElementById("subCat");
const otrosInput = document.getElementById("otro");
const instInput = document.getElementById("institucion");
const cursoInput = document.getElementById("curso");
const comentarioInput = document.getElementById("comentario");
const primerColumna = document.getElementById("firstColumn");
const segundaColumna = document.getElementById("secondColumn");
const tercerColumna = document.getElementById("thirdColumn");
const mainBtn = document.getElementById("botonPrincipal");
const modal = document.getElementById("modal");
const addBtn = document.getElementById("add");
const cancelBtn = document.getElementById("cancel");
const taskColumn = document.getElementById("taskColumns");
const global = document.querySelector(".global");
const deleteIcon = document.querySelector(".deleteIcon");
const confDelete = false;
const toSave = [];
const read = localStorage.getItem("saved");
const recuperado = JSON.parse(read);
const editIcon = document.getElementById("editIcon");

//back
const toDocenteBack = "https://todocentebackend.onrender.com"; 
const usuarioLocal = JSON.parse(localStorage.getItem("todocenteUser"));
let usuarioRegistrado = false;
let registroId = null;

if (usuarioLocal && usuarioLocal.uid) {
    usuarioRegistrado = true;
    registroId = usuarioLocal.uid;
} else {
    usuarioRegistrado = false;
}

mainBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    global.classList.add("blur");
})

selectCat.addEventListener("change", cargarSelect);

selectSub.addEventListener("change", () => {
    instInput.focus();
})

otrosInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        instInput.focus();
    }
})

instInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        cursoInput.focus();
    }
})

cursoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        comentarioInput.focus();
    }
})

comentarioInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        addBtn.focus();
    }
})

addBtn.addEventListener("click", agregarTarea)
cancelBtn.addEventListener("click", () => {
    resetForm();
    modal.classList.add("hidden");
    global.classList.remove("blur");
})



function cargarSelect() {
    const clave = selectCat.value;
    if (clave.length === 0) {
        selectSub.disabled = true;
    } else { selectSub.disabled = false; }

    if (clave === "otro") {
        selectSub.style.display = "none";
        otrosInput.style.display = "block";
        otrosInput.focus();
    } else {
        otrosInput.style.display = "none";
        selectSub.style.display = "block";
    }

    selectSub.innerHTML = "";
    const caratula = document.createElement("option");
    caratula.textContent = "Opciones";
    selectSub.appendChild(caratula);
    caratula.selected = true;
    caratula.disabled = true;


    valueOpt[clave].forEach(opt => {

        const opcion = document.createElement("option");
        opcion.textContent = opt;
        selectSub.appendChild(opcion);

    });
}

function validarFormulario() {

    const categoriaSeleccionada = selectCat.value;
    const subcategoriaSeleccionada = selectCat.value === "otro" ? otrosInput.value.trim() : selectSub.value;

    if (!categoriaSeleccionada) {
        alert("Por favor, seleccioná una categoría.");
        return false;
    }

    if (!subcategoriaSeleccionada || subcategoriaSeleccionada === "Opciones" || subcategoriaSeleccionada === "Subcategoría") {
        alert("Por favor, seleccioná o escribí una subcategoría.");
        return false;
    }

    return true;
}



function normalizarFormulario() {


    if (instInput.value.trim() === "") {
        instInput.value = "--"
    }
    if (cursoInput.value.trim() === "") {
        cursoInput.value = "--"
    }
    if (comentarioInput.value.trim() === "") {
        comentarioInput.value = "--"
    }

}

async function agregarTarea() {
    const editandoId = modal.dataset.editandoId;
    if (editandoId) {
        const index = toSave.findIndex(t => t.id == editandoId);
        if (index !== -1) {
            const tareaObjeto = toSave[index];
            tareaObjeto.categoria = selectCat.value;
            tareaObjeto.subcategoria = selectCat.value === "otro" ? otrosInput.value : selectSub.value;
            tareaObjeto.institucion = instInput.value;
            tareaObjeto.curso = cursoInput.value;
            tareaObjeto.comentario = comentarioInput.value;

            
            toSave[index] = tareaObjeto;
            localStorage.setItem("saved", JSON.stringify(toSave));

           
            const tarjetaVieja = document.querySelector(`[data-id="${editandoId}"]`);
            if (tarjetaVieja) {
                const nuevaTarjeta = crearTarjetaDesdeDatos(tareaObjeto);
                tarjetaVieja.parentNode.replaceChild(nuevaTarjeta, tarjetaVieja);
            }

            resetForm();
            modal.classList.add("hidden");
            global.classList.remove("blur");
            modal.dataset.editandoId = "";
            return;
        }
    }

    if (!validarFormulario()) return;
    normalizarFormulario();

    const { tarjeta, tareaObjeto } = crearTarjeta();

    primerColumna.appendChild(tarjeta);
    taskColumn.classList.remove("hidden");
    modal.classList.add("hidden");
    global.classList.remove("blur");

    moverTarea(tarjeta, tareaObjeto.estado);

    if (usuarioRegistrado) {
        
        tareaObjeto.uid = registroId; 
        const respuesta = await saveTaskToBackend(tareaObjeto);
        if (respuesta && respuesta._id) {
            tareaObjeto._id = respuesta._id; 
        }
    }

    toSave.push(tareaObjeto);
    localStorage.setItem("saved", JSON.stringify(toSave));

    resetForm();
    modal.dataset.editandoId = "";
}


function resetForm() {
    selectCat.value = "";
    selectSub.innerHTML = '<option disabled selected>Subcategoría</option>';
    otrosInput.value = "";
    instInput.value = "";
    cursoInput.value = "";
    comentarioInput.value = "";
    otrosInput.style.display = "none";
    selectSub.style.display = "block";
    selectSub.disabled = true;

}

function crearTarjeta() {
    const tarjeta = document.createElement("li");
    tarjeta.classList.add("tarea");
    const categoriaTexto = selectCat.options[selectCat.selectedIndex].text;


    const tareaObjeto = {
        id: Date.now(),
        categoria: selectCat.value,
        subcategoria: selectCat.value === "otro" ? otrosInput.value : selectSub.value,
        institucion: instInput.value,
        curso: cursoInput.value,
        comentario: comentarioInput.value,
        estado: "todo"

    }

    tarjeta.innerHTML = `<strong>${categoriaTexto} ${tareaObjeto.subcategoria}</strong><br>
        <i class="fa-duotone fa-solid fa-school ins"></i> : ${tareaObjeto.institucion} <br>
        <i class="fa-solid fa-chalkboard-user cur"></i> : ${tareaObjeto.curso} <br>
        <i class="fa-solid fa-comment com"></i>     : ${tareaObjeto.comentario}
        <div class="dropDown">
        <button><i class="fa-solid fa-pen-to-square editIcon"></i></button>
        <button><i class="fa-solid fa-arrow-left izqIcon"></i></button>
        <button><i class="fa-solid fa-arrow-right derIcon"></i></button>
        <button><i class="fa-regular fa-trash-can deleteIcon"></i></button>
        </div>`;

    tarjeta.querySelector(".deleteIcon").addEventListener("click", () => { eliminarTarea(tarjeta) });
    tarjeta.querySelector(".editIcon").addEventListener("click", () => editarTarea(tarjeta));
    tarjeta.querySelector(".izqIcon").addEventListener("click", () => moverTarea(tarjeta, "izquierda"))
    tarjeta.querySelector(".derIcon").addEventListener("click", () => moverTarea(tarjeta, "derecha"))

    tarjeta.dataset.id = tareaObjeto.id;


    return { tarjeta, tareaObjeto };
}

function eliminarTarea(tarjeta) {
  const idTarea = parseInt(tarjeta.dataset.id);
  tarjeta.remove();

  const indice = toSave.findIndex(t => t.id === idTarea);
  if (indice !== -1) {
    const tareaEliminada = toSave[indice];
    toSave.splice(indice, 1);

    if (usuarioRegistrado) {
      deleteTaskFromBackend(tareaEliminada.id);
    } else {
      localStorage.setItem("saved", JSON.stringify(toSave));
    }
  }
}



function crearTarjetaDesdeDatos(tareaObjeto) {
    const tarjeta = document.createElement("li");
    tarjeta.classList.add("tarea");

    const categoriaTexto = tareaObjeto.categoria.charAt(0).toUpperCase() + tareaObjeto.categoria.slice(1);

    tarjeta.innerHTML = `<strong>${categoriaTexto} / ${tareaObjeto.subcategoria}</strong><br>
        <i class="fa-duotone fa-solid fa-school ins"></i> : ${tareaObjeto.institucion} <br>
        <i class="fa-solid fa-chalkboard-user cur"></i> : ${tareaObjeto.curso} <br>
        <i class="fa-solid fa-comment com"></i>     : ${tareaObjeto.comentario}
        <div class="dropDown">
        <button><i class="fa-solid fa-pen-to-square editIcon"></i></button>
        <button><i class="fa-solid fa-arrow-left izqIcon"></i></button>
        <button><i class="fa-solid fa-arrow-right derIcon"></i></button>
        <button><i class="fa-regular fa-trash-can deleteIcon"></i></button>
        </div>`;
    tarjeta.querySelector(".deleteIcon").addEventListener("click", () => { eliminarTarea(tarjeta) });
    tarjeta.querySelector(".editIcon").addEventListener("click", () => editarTarea(tarjeta));
    tarjeta.querySelector(".izqIcon").addEventListener("click", () => moverTarea(tarjeta, "izquierda"))
    tarjeta.querySelector(".derIcon").addEventListener("click", () => moverTarea(tarjeta, "derecha"))

    tarjeta.dataset.id = tareaObjeto.id;

    return tarjeta;
}

function revisarColumnas() {
    const tareas = taskColumn.querySelectorAll(".columns ul li");
    if (tareas.length === 0) {
        taskColumn.classList.add("hidden");
    }
}

function editarTarea(tarjeta) {
    const id = parseInt(tarjeta.dataset.id);
    const tarea = toSave.find(t => t.id === id);
    if (!tarea) return;

    modal.classList.remove("hidden");
    global.classList.add("blur");

    selectCat.value = tarea.categoria;
    cargarSelect();

    if (tarea.categoria === "otro") {
        otrosInput.value = tarea.subcategoria;
        otrosInput.style.display = "block";
        selectSub.style.display = "none";
    } else {
        selectSub.value = tarea.subcategoria;
        otrosInput.style.display = "none";
        selectSub.style.display = "block";
    }
    if (tarea.institucion === "--") {
        instInput
    } else { instInput.value = tarea.institucion; }

    if (tarea.curso === "--") {
        cursoInput;
    } else { cursoInput.value = tarea.curso; }
    if (tarea.comentario === "--") {
        comentarioInput;
    } else { comentarioInput.value = tarea.comentario; }

    modal.dataset.editandoId = tarea.id;
}

function acomodarTarea(tarjeta, estado) {
    if (estado === "todo") {
        primerColumna.appendChild(tarjeta);
    } else if (estado === "doing") {
        segundaColumna.appendChild(tarjeta);
    } else { tercerColumna.appendChild(tarjeta); }
}

function moverTarea(tarjeta, direccion) {
    const id = parseInt(tarjeta.dataset.id);
    const tarea = toSave.find(t => t.id === id)
    if (!tarea) return;

    const status = ["todo", "doing", "done"];
    let indiceTarea = status.indexOf(tarea.estado);

    if (direccion === "izquierda" && indiceTarea > 0) { indiceTarea--; } else if (direccion === "derecha" && indiceTarea < status.length - 1) {
        indiceTarea++;
    } else { return; }

    tarea.estado = status[indiceTarea];
    localStorage.setItem("saved", JSON.stringify(toSave));

    acomodarTarea(tarjeta, tarea.estado);
}


async function fetchTasksFromBackend() {
    try {
        const response = await fetch(`${toDocenteBack}/${registroId}`);
        if (!response.ok) throw new Error("Error al obtener tareas desde backend");
        const tareas = await response.json();
        return tareas;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function saveTaskToBackend(tareaObjeto) {
    try {
        const response = await fetch(toDocenteBack, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...tareaObjeto, userId: registroId }),
        });
        if (!response.ok) throw new Error("Error al guardar tarea en backend");
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function deleteTaskFromBackend(tareaId) {
    try {
        const response = await fetch(`${toDocenteBack}/${tareaId}?userId=${registroId}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Error al eliminar tarea en backend");
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function cargarTareas() {
  toSave.length = 0; 
  let tareas = [];

  if (usuarioRegistrado) {
    tareas = await fetchTasksFromBackend();
  } else {
    const read = localStorage.getItem("saved");
    tareas = read ? JSON.parse(read) : [];
  }

  tareas.forEach(t => {
    const tarjeta = crearTarjetaDesdeDatos(t);
    acomodarTarea(tarjeta, t.estado);
    tarjeta.querySelector(".deleteIcon").addEventListener("click", () => { eliminarTarea(tarjeta) });
    toSave.push(t);
    taskColumn.classList.remove("hidden");
  });
}
