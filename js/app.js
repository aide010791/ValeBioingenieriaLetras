//Codigo para enviar los datos a una hoja de excel usando sheetbest
const formulario = document.getElementById('formulario-registro');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Variables básicas del formulario
    const id = generarIdUnico();
    const fecha = document.getElementById('fecha').value;
    const nombre = document.getElementById('nombre').value;
    const boleta = document.getElementById('boleta').value;
    const materia = document.getElementById('materia').value;
    const profesor = document.getElementById('profesor').value;
    const mesaDeTrabajo = document.getElementById('mesa_trabajo').value;

    // Recopilar datos de equipos en un arreglo, cada elemento será una línea en Excel
    let datosEquipos = [];
    const equiposCheckbox = document.querySelectorAll('.contenedor-equipos input[type="checkbox"]');

    equiposCheckbox.forEach(checkbox => {
        if (checkbox.checked) {
            const cantidadInput = document.getElementById(checkbox.id + "_cantidad");
            const cantidad = cantidadInput ? cantidadInput.value : '1'; // Si hay un campo de cantidad, usa su valor; de lo contrario, asume '1'
            datosEquipos.push(`${checkbox.value}: ${cantidad}`);
        }
    });

    // Convertir el arreglo de datos de equipos en una cadena de texto con saltos de línea
    const datosEquiposTexto = datosEquipos.join('\n');


    // Recopilar datos de puntas en un arreglo
    let datosPuntas = [];
    const puntasCheckbox = document.querySelectorAll('.contenedor-puntas input[type="checkbox"]');

    puntasCheckbox.forEach(checkbox => {
        if (checkbox.checked) {
            const cantidadInput = document.getElementById(checkbox.id.replace('_check', ''));
            const cantidad = cantidadInput ? cantidadInput.value : '1';
            datosPuntas.push(`${checkbox.value}: ${cantidad}`);
        }
    });

    const datosPuntasTexto = datosPuntas.join('\n'); // Convertir a texto con saltos de línea

    // Verificar si STM32 está seleccionado
    const stm32Checkbox = document.getElementById('checkbox-stm32f4');
    let stm32Texto = '';
    if (stm32Checkbox.checked) {
        const cantidadStm32 = document.getElementById('campo-numerico-stm32f4').value;
        stm32Texto = `STM32F4: ${cantidadStm32}`;
    }

    // Recopilar datos de BiofÃ­sica
    const datosBiofisica = recopilarDatosBiofisica();

    // Recopilar los nombres de las herramientas agregadas, excluyendo la palabra 'delete'
    const herramientas = Array.from(document.querySelectorAll('#lista-herramientas .herramienta-item'))
        .map(item => {
            // Buscamos solo los nodos de texto dentro del div de la herramienta
            const nodosDeTexto = Array.from(item.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim());
            return nodosDeTexto.join('');
        })
        .join('\n'); // Usa '\n' para separar las herramientas y que aparezcan en lista en Excel



    const respuesta = await fetch('https://sheet.best/api/sheets/9b7a3d95-91f9-45f2-969f-a0a8e73d8df4/tabs/VALEF', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "ID": id,
            "FECHA": fecha,
            "NOMBRE": nombre,
            "BOLETA": boleta,
            "MATERIA": materia,
            "PROFESOR": profesor,
            "EQUIPOS": datosEquiposTexto, // Asegúrate de que esta parte ya esté implementada
            "MESA DE TRABAJO": mesaDeTrabajo,
            "PUNTAS": datosPuntasTexto,
            "TARJETA STM32F4": stm32Texto,
            "BIOFISICA": datosBiofisica,
            "HERRAMIENTA": herramientas,

        })
    });

    Swal.fire({
        title: 'Registro completado con éxito',
        text: 'Tus datos han sido enviados Tu número de ID es:' +id,
        icon: 'success',
        confirmButtonText: 'OK'
    });

    //const data=await respuesta.json();
    limpiarFormulario();


    console.log(respuesta);
});

// Función para generar un ID de tres letras aleatorias
function generarIdUnico() {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let id = '';

    do {
        id = '';
        for (let i = 0; i < 3; i++) {
            const indiceAleatorio = Math.floor(Math.random() * letras.length);
            id += letras[indiceAleatorio];
        }
    } while (idYaExiste(id));

    guardarId(id);
    return id;
}

// Función para verificar si un ID ya existe en localStorage
function idYaExiste(id) {
    const idsExistentes = JSON.parse(localStorage.getItem('idsGenerados') || '[]');
    return idsExistentes.includes(id);
}

// Función para guardar el ID en localStorage
function guardarId(id) {
    const idsExistentes = JSON.parse(localStorage.getItem('idsGenerados') || '[]');
    idsExistentes.push(id);
    localStorage.setItem('idsGenerados', JSON.stringify(idsExistentes));
}


function limpiarFormulario() {
    // Limpia todos los campos de texto y nÃºmero
    document.querySelectorAll('#formulario-registro input[type="text"], #formulario-registro input[type="number"]').forEach(input => {
        input.value = '';
    });

    // Desmarca todos los checkboxes
    document.querySelectorAll('#formulario-registro input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Oculta los campos numÃ©ricos adicionales y resetea su valor a la mÃ­nima cantidad posible
    document.querySelectorAll('#formulario-registro input[type="number"]').forEach(input => {
        input.style.display = 'none';
        input.value = input.min;  // Restablece el valor al mÃ­nimo si tiene un atributo 'min'
    });

    // Borra todos los elementos dentro del contenedor de herramientas
    const listaHerramientas = document.getElementById('lista-herramientas');
    while (listaHerramientas.firstChild) {
        listaHerramientas.removeChild(listaHerramientas.firstChild);
    }
}


/* document.getElementById('btn-guardar').addEventListener('click', async function () {
    // Genera un nuevo ID para el nuevo registro
    const nuevoId = generarId();
    const fecha = document.getElementById('fecha').value;
    const nombre = document.getElementById('nombre').value;
    const boleta = document.getElementById('boleta').value;
    const materia = document.getElementById('materia').value;
    const profesor = document.getElementById('profesor').value;

    try {
        const respuesta = await fetch(`https://sheet.best/api/sheets/9b7a3d95-91f9-45f2-969f-a0a8e73d8df4/tabs/VALEF`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "ID": nuevoId, // Usa el nuevo ID generado
                "FECHA": fecha,
                "NOMBRE": nombre,
                "BOLETA": boleta,
                "MATERIA": materia,
                "PROFESOR": profesor

            })
        });

        if (respuesta.ok) {
            Swal.fire({
                title: 'Registro guardado con éxito',
                text: `Nuevo ID del registro: ${nuevoId}`,
                icon: 'success',
                confirmButtonText: 'OK'
            });
            limpiarFormulario();

            // Restablece la visualización de los botones
            document.getElementById('btn-registro').style.display = 'inline-block';
            document.getElementById('btn-guardar').style.display = 'none';
            delete formulario.dataset.idRegistro; // Elimina el ID almacenado después de guardar, si existe
        } else {
            Swal.fire('Error', 'Hubo un problema al guardar el registro', 'error');
        }
    } catch (error) {
        console.error('Error al guardar el registro:', error);
        Swal.fire('Error', 'Hubo un problema al guardar el registro', 'error');
    }
}); */

//Puntas
document.querySelectorAll('.contenedor-puntas input[type="checkbox"]').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        // Extrae la parte base del id del checkbox para construir el id del campo numérico
        var baseId = checkbox.id.replace('_check', '');
        var cantidadInputId = baseId;
        var cantidadInput = document.getElementById(cantidadInputId);

        // Asegúrate de que el campo numérico existe antes de cambiar su display
        if (cantidadInput) {
            cantidadInput.style.display = checkbox.checked ? 'inline-block' : 'none'; // 'inline-block' para que aparezca en la misma línea
        } else {
            // Si el campo numérico no se encuentra, muestra un mensaje de error en la consola
            console.error('No se encontró el campo numérico con id:', cantidadInputId);
        }
    });
});

//Herramientas
document.addEventListener('DOMContentLoaded', function () {
    var inputHerramienta = document.getElementById('herramienta-input');
    var botonAgregar = document.getElementById('agregar-herramienta');
    var listaHerramientas = document.getElementById('lista-herramientas');

    // Función para eliminar la herramienta de la lista
    function eliminarHerramienta(event) {
        event.target.parentElement.remove();
    }

    // Función para agregar la herramienta a la lista
    function agregarHerramienta() {
        var herramienta = inputHerramienta.value.trim();
        if (herramienta) {
            var elementoLista = document.createElement('div'); // Crear un nuevo div para la herramienta
            elementoLista.classList.add('herramienta-item'); // Añadir clase para estilos

            // Crear y agregar el ícono de basura
            var iconoBasura = document.createElement('span');
            iconoBasura.classList.add('material-symbols-outlined');
            iconoBasura.textContent = 'delete';
            iconoBasura.style.cursor = 'pointer';
            iconoBasura.addEventListener('click', eliminarHerramienta);
            elementoLista.appendChild(iconoBasura);

            // Agregar el texto de la herramienta
            var textoHerramienta = document.createTextNode(' ' + herramienta);
            elementoLista.appendChild(textoHerramienta);

            listaHerramientas.appendChild(elementoLista);
            inputHerramienta.value = '';
        } else {
            alert('Por favor, escribe el nombre de una herramienta.');
        }
    }

    botonAgregar.addEventListener('click', agregarHerramienta);
});


//Equipos
document.addEventListener('DOMContentLoaded', function () {
    // Seleccionar todos los checkboxes dentro del contenedor de equipos
    var checkboxes = document.querySelectorAll('.contenedor-equipos input[type="checkbox"]');

    // Función para manejar el cambio de estado del checkbox
    function toggleNumericField() {
        // Seleccionar el campo numérico asociado. Está en el mismo contenedor div que el checkbox
        var numericField = this.parentNode.querySelector('.numericos');

        // Solo cambiar el estilo si numericField no es null
        if (numericField) {
            numericField.style.display = this.checked ? 'inline-block' : 'none';
        }
    }
    // Añadir el event listener a cada checkbox
    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', toggleNumericField);
    });
});

//Tarjeta STM32
document.addEventListener('DOMContentLoaded', function () {
    // Seleccionar el checkbox y el campo numérico por su ID
    var checkboxSTM32F4 = document.getElementById('checkbox-stm32f4');
    var campoNumericoSTM32F4 = document.getElementById('campo-numerico-stm32f4');

    // Función para mostrar u ocultar el campo numérico
    function toggleCampoNumerico() {
        // Cambiar el estilo de display del campo numérico según el estado del checkbox
        campoNumericoSTM32F4.style.display = checkboxSTM32F4.checked ? 'inline-block' : 'none';
    }

    // Añadir un event listener al checkbox para que se ejecute la función cuando cambie su estado
    checkboxSTM32F4.addEventListener('change', toggleCampoNumerico);
});

//Biofisica
document.addEventListener('DOMContentLoaded', function () {
    // Selecciona todos los checkboxes dentro de la clase 'biofisica'
    var checkboxes = document.querySelectorAll('.biofisica .nombre-equipo input[type="checkbox"]');

    // Función para mostrar u ocultar el campo numérico o de texto correspondiente
    function toggleCampo(e) {
        // Obtiene el ID del checkbox y construye el ID del campo correspondiente
        var campoID = e.target.id + '_cantidad';

        // Selecciona el campo numérico o de texto basado en el ID construido
        var campo = document.getElementById(campoID);

        // Muestra u oculta el campo basado en el estado del checkbox
        campo.style.display = e.target.checked ? 'inline-block' : 'none';
    }

    // Añade un escuchador de eventos a cada checkbox para llamar a la función toggleCampo cuando se cambie el estado del checkbox
    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', toggleCampo);
    });
});



function recopilarDatosBiofisica() {
    const biofisicaData = [];
    document.querySelectorAll('.biofisica .equipo').forEach(equipo => {
        const checkbox = equipo.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            // Obteniendo el texto del label asociado al checkbox
            const label = equipo.querySelector(`label[for="${checkbox.id}"]`);
            const textoLabel = label ? label.textContent : '';

            const inputCantidad = equipo.querySelector('.cantidad-equipo input');
            let cantidad = '1'; // Valor por defecto si no hay input o no está visible

            if (inputCantidad && inputCantidad.style.display !== 'none') {
                // Manejando el caso especial para "Navaja" o cualquier otro campo de texto
                if (inputCantidad.type === 'text') {
                    cantidad = inputCantidad.value ? inputCantidad.value : '1';
                } else { // Para inputs numéricos
                    cantidad = inputCantidad.value && inputCantidad.value !== '' ? inputCantidad.value : '1';
                }
            }

            // Ajustando el formato para que coincida con el deseado
            biofisicaData.push(`${textoLabel}: ${cantidad}`);
        }
    });
    return biofisicaData.join('\n');
}


//Modifica el formulario
const btnModificar = document.getElementById('btn-modificar');

btnModificar.addEventListener('click', async () => {
    // Usar SweetAlert2 para solicitar el ID del usuario
    const { value: idUsuario } = await Swal.fire({
        title: 'Ingresa tu número de ID',
        input: 'text',
        inputLabel: 'ID para modificar tu registro',
        inputPlaceholder: 'Número de ID',
        inputAttributes: {
            'aria-label': 'Por favor, ingresa tu número de ID aquí'
        },
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Necesitas escribir algo!';
            }
            if (!/^[A-Z]{3}$/.test(value)) { // Asegura que el ID tiene exactamente tres letras mayúsculas
                return 'El ID debe consistir en tres letras mayúsculas.';
            }
        }
    });

    if (idUsuario) {
        try {
            const respuesta = await fetch(`https://sheet.best/api/sheets/9b7a3d95-91f9-45f2-969f-a0a8e73d8df4/tabs/VALEF/search?ID=${idUsuario}`);
            const datos = await respuesta.json();

            if (datos.length > 0) {
                const registro = datos[0]; // Asumiendo que el ID es único y solo devuelve un registro
                llenarFormularioConDatos(registro);
                Swal.fire({
                    title: '¡Registro encontrado!',
                    text: 'El formulario ha sido llenado con los datos del registro.',
                    icon: 'success'
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'No se encontró ningún registro con ese ID.',
                    icon: 'error'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Hubo un error al buscar el registro: ' + error,
                icon: 'error'
            });
            console.error("Hubo un error al buscar el registro: ", error);
        }
    }
});


/* const btnModificar = document.getElementById('btn-modificar');

btnModificar.addEventListener('click', async () => {
    const idUsuario = prompt("Por favor, ingresa tu numero de ID para modificar tu registro:");

    if (idUsuario) {
        try {
            const respuesta = await fetch(`https://sheet.best/api/sheets/9b7a3d95-91f9-45f2-969f-a0a8e73d8df4/tabs/VALE/search?ID=${idUsuario}`);
            const datos = await respuesta.json();

            if (datos.length > 0) {
                const registro = datos[0]; // Asumiendo que el ID es unico y solo devuelve un registro
                llenarFormularioConDatos(registro);
            } else {
                alert("No se encontro ningun registro con ese ID.");
            }
        } catch (error) {
            console.error("Hubo un error al buscar el registro: ", error);
        }
    }
}); */

//Funcion para llevar los datos de excel de vuelta al formulario
function llenarFormularioConDatos(datos) {
    // Asigna los valores basicos
    
    document.getElementById('fecha').value = datos.FECHA || '';
    document.getElementById('nombre').value = datos.NOMBRE || '';
    document.getElementById('boleta').value = datos.BOLETA || '';
    document.getElementById('materia').value = datos.MATERIA || '';
    document.getElementById('profesor').value = datos.PROFESOR || '';


    // Asigna el valor de la Mesa de Trabajo
    document.getElementById('mesa_trabajo').value = datos['MESA DE TRABAJO'] || '';

    // Procesa y asigna los equipos
    const equipos = datos.EQUIPOS ? datos.EQUIPOS.split('\n') : [];
    equipos.forEach(equipo => {
        const [nombre, cantidad] = equipo.split(':').map(e => e.trim());
        const checkbox = document.querySelector(`input[name="herramientas"][value="${nombre}"]`);
        if (checkbox) {
            checkbox.checked = true;
            // Asegúrate de que el input asociado al checkbox se muestre y se asigne el valor correspondiente
            const cantidadInput = document.getElementById(`${checkbox.id}_cantidad`);
            if (cantidadInput) {
                cantidadInput.style.display = 'inline'; // Asegúrate de que el input se muestre correctamente
                cantidadInput.value = cantidad || 1; // Si no hay cantidad especificada, usa 1 como valor predeterminado
                // Simula un evento change para que el campo numérico se muestre, si es necesario
                // Esto es opcional, dependiendo de si necesitas que se dispare alguna lógica adicional en el evento change
                checkbox.dispatchEvent(new Event('change'));
            }
        }
    });




    // Muestra las opciones de puntas y asigna valores si están seleccionadas
    const puntas = datos.PUNTAS ? datos.PUNTAS.split('\n') : [];
    puntas.forEach(punta => {
        const [nombre, cantidad] = punta.split(':').map(e => e.trim());
        const checkbox = document.querySelector(`input[name="herramientas"][value="${nombre}"]`);
        if (checkbox) {
            checkbox.checked = true;
            const cantidadInput = document.getElementById(`${checkbox.id.replace('_check', '')}`);
            if (cantidadInput) {
                cantidadInput.style.display = 'inline';
                cantidadInput.value = cantidad || 1;
            }
        }
    });

    // Tarjeta STM32F4
    /* const tarjetaSTM32F4 = datos['TARJETA STM32F4'];
    const checkboxSTM32F4 = document.getElementById('checkbox-stm32f4');
    const campoNumericoSTM32F4 = document.getElementById('campo-numerico-stm32f4');

    if (tarjetaSTM32F4) {
     checkboxSTM32F4.checked = true;
     campoNumericoSTM32F4.value = tarjetaSTM32F4; // Establece el valor
    campoNumericoSTM32F4.style.display = 'inline-block'; // Asegura que el campo se muestre si hay un valor
    } else {
         checkboxSTM32F4.checked = false;
         campoNumericoSTM32F4.style.display = 'none'; // Asegura que el campo se oculte si no hay un valor
    } */

    if (datos['TARJETA STM32F4']) {
        const [_, cantidadStm32] = datos['TARJETA STM32F4'].split(':');
        const checkboxSTM32F4 = document.getElementById('checkbox-stm32f4');
        const campoNumericoSTM32F4 = document.getElementById('campo-numerico-stm32f4');

        checkboxSTM32F4.checked = true;
        campoNumericoSTM32F4.style.display = 'inline-block';
        campoNumericoSTM32F4.value = cantidadStm32.trim();
    }



    // Procesa y asigna los datos de biofisica
    const biofisica = datos.BIOFISICA ? datos.BIOFISICA.split('\n') : [];
    biofisica.forEach(item => {
        const [nombre, cantidad] = item.split(':').map(e => e.trim());
        const checkbox = document.querySelector(`input[name="biofisica"][value="${nombre}"]`);
        if (checkbox) {
            checkbox.checked = true;
            const cantidadInput = document.getElementById(`${checkbox.id}_cantidad`);
            if (cantidadInput) {
                cantidadInput.style.display = 'inline'; // 
                cantidadInput.value = cantidad || 1; // Si no hay cantidad especificada, usa 1 como valor predeterminado
            }
        }
    });

    // Procesa y asigna las herramientas y aditamentos
    const herramientas = datos.HERRAMIENTA ? datos.HERRAMIENTA.split('\n') : [];
    const contenedorHerramientas = document.getElementById('lista-herramientas');
    contenedorHerramientas.innerHTML = ''; // Limpia el contenedor antes de agregar nuevos elementos
    herramientas.forEach(herramienta => {
        const elementoLista = document.createElement('div');
        elementoLista.classList.add('herramienta-item'); // Añadir clase para estilos

        // Crear y agregar el ícono de basura
        const iconoBasura = document.createElement('span');
        iconoBasura.classList.add('material-symbols-outlined');
        iconoBasura.textContent = 'delete';
        iconoBasura.style.cursor = 'pointer';
        iconoBasura.addEventListener('click', eliminarHerramienta);
        elementoLista.appendChild(iconoBasura);

        // Agregar el texto de la herramienta
        const textoHerramienta = document.createTextNode(' ' + herramienta);
        elementoLista.appendChild(textoHerramienta);

        contenedorHerramientas.appendChild(elementoLista);
    });


    // Función para eliminar la herramienta de la lista
    function eliminarHerramienta(event) {
        event.target.parentElement.remove();
    }



    /* // Procesa y asigna las herramientas y aditamentos
    const herramientas = datos.HERRAMIENTA ? datos.HERRAMIENTA.split('\n') : [];
    const contenedorHerramientas = document.getElementById('lista-herramientas');
    contenedorHerramientas.innerHTML = ''; // Limpia el contenedor antes de agregar nuevos elementos
    herramientas.forEach(herramienta => {
        const div = document.createElement('div');
        div.classList.add('herramienta-item'); // Asegura aplicar el mismo estilo que a los nuevos elementos

        // Crear y agregar el ícono
        var icono = document.createElement('span');
        icono.classList.add('material-symbols-outlined');
        icono.textContent = 'build'; // Asume que tienes un ícono 'build' o elige el que corresponda
        div.appendChild(icono);

        // Agregar el texto de la herramienta
        var texto = document.createTextNode(' ' + herramienta);
        div.appendChild(texto);

        contenedorHerramientas.appendChild(div);
    });
 */

    /*  // Procesa y asigna las herramientas y aditamentos
     const herramientas = datos.HERRAMIENTA ? datos.HERRAMIENTA.split('\n') : [];
     const contenedorHerramientas = document.getElementById('lista-herramientas');
     contenedorHerramientas.innerHTML = ''; // Limpia el contenedor antes de agregar nuevos elementos
     herramientas.forEach(herramienta => {
         const div = document.createElement('div');
         div.textContent = herramienta;
         contenedorHerramientas.appendChild(div);
     }); */
}


/* function toggleCampoNumerico() {
    var checkboxSTM32F4 = document.getElementById('checkbox-stm32f4');
    var campoNumericoSTM32F4 = document.getElementById('campo-numerico-stm32f4');
    campoNumericoSTM32F4.style.display = checkboxSTM32F4.checked ? 'inline-block' : 'none';
}

// Mantener el event listener como estaba
document.addEventListener('DOMContentLoaded', function () {
    var checkboxSTM32F4 = document.getElementById('checkbox-stm32f4');
    // Reutilizar toggleCampoNumerico para el event listener
    checkboxSTM32F4.addEventListener('change', toggleCampoNumerico);
}); */

