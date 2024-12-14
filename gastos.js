
document.addEventListener("DOMContentLoaded", () => {
    const nuevoGastoBtn = document.getElementById("nuevoGastoBtn");
    const formularioGasto = document.getElementById("formularioGasto");
    const gastoForm = document.getElementById("gastoForm");
    const cancelarBtn = document.getElementById("cancelarBtn");
    const listadoGastos = document.getElementById("listadoGastos");
    const informeBtn = document.getElementById("Informe");
    const reporteDiv = document.getElementById("reporte");
    const descargarInformeBtn = document.getElementById("descargarInforme");
    const gastos = [];


    // Muestra el formulario para agregar un gasto
    nuevoGastoBtn.addEventListener("click", () => {
        formularioGasto.style.display = "block";
    });

    // Ocultar formulario de gasto
    cancelarBtn.addEventListener("click", () => {
        formularioGasto.style.display = "none";
        gastoForm.reset();
    });

    // Agrega nuevo gasto
    gastoForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const comerciante = document.getElementById("comerciante").value;
        const categoria = document.getElementById("categoria").value;
        const fecha = document.getElementById("fecha").value;
        const monto = parseFloat(document.getElementById("monto").value);
        const descripcion = document.getElementById("descripcion").value;
        const factura = document.getElementById("factura").files[0];

        const facturaURL = factura ? URL.createObjectURL(factura) : "";

        const gasto = {
            comerciante,
            categoria,
            fecha,
            monto,
            descripcion,
            facturaURL,
        };

        gastos.push(gasto);
        actualizarListadoGastos();
        formularioGasto.style.display = "none";
        gastoForm.reset();

       

    });

    // Actualiza el listado de gastos
    function actualizarListadoGastos() {
        listadoGastos.innerHTML = "";

        gastos.forEach((gasto, index) => {
            const card = document.createElement("div");
            card.classList.add("card", "mb-3");

            card.innerHTML = `
            <div class="card-body d-flex flex-wrap align-items-center">
            <div class="datos-gasto me-3">
            <h5 class="card-title">${gasto.comerciante}</h5>
            <p class="card-text">
                <strong>Categoría:</strong> ${gasto.categoria}<br>
                <strong>Fecha:</strong> ${gasto.fecha}<br>
                <strong>Monto:</strong> $${gasto.monto.toFixed(2)}<br>
                <strong>Descripción:</strong> ${gasto.descripcion}
            </p>
            </div>
            ${
                gasto.facturaURL
                ? `<div class="factura-link me-3"><a href="${gasto.facturaURL}" target="_blank" class="btn btn-primary">Ver Factura</a></div>`
                : ""
            }
                <div class="acciones">
                    <button class="btn btn-danger eliminar-btn" data-index="${index}">Eliminar</button>
                    </div>
                </div>
            `;


            listadoGastos.appendChild(card);
            
        });

        // Añadir eventos de eliminación
        const botonesEliminar = document.querySelectorAll(".eliminar-btn");
            botonesEliminar.forEach((btn) => {
             btn.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                eliminarGasto(index);
             });
        });


            function eliminarGasto(index) {
            // Eliminar el gasto del arreglo
             gastos.splice(index, 1);

            // Actualizar el listado de gastos
            actualizarListadoGastos();
        }

    }

    // Mostrar/ocultar informe de gastos
    informeBtn.addEventListener("click", () => {
        if (reporteDiv.style.display === "none" || !reporteDiv.style.display) {
            mostrarInforme();
            reporteDiv.style.display = "block";
        } else {
            reporteDiv.style.display = "none";
        }
    });
    
    function mostrarInforme() {
        reporteDiv.innerHTML = ""; // Limpiar el informe previo

        // Agrupar los gastos por mes
        const totalPorMes = {};

        gastos.forEach((gasto) => {
            const fecha = new Date(gasto.fecha);
            const mes = fecha.toLocaleString("Es-ES", { month: "long", year: "numeric" }); // Ejemplo: enero 2024

            if (!totalPorMes[mes]) {
                totalPorMes[mes] = 0;
            }
            totalPorMes[mes] += gasto.monto;
        });

        // Crear tabla del informe
        const table = document.createElement("table");
        table.className = "table table-striped table-bordered mt-4";

        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>Mes</th>
                <th>Total de Gastos</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        for (const mes in totalPorMes) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${mes}</td>
                <td>$${totalPorMes[mes].toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);

        reporteDiv.appendChild(table);
    }

    // Inicialmente oculta el informe
    reporteDiv.style.display = "none";


    function calcularTotalPorMes() {
        const totalPorMes = {};
    
        gastos.forEach((gasto) => {
            const fecha = new Date(gasto.fecha);
            const mes = fecha.toLocaleString("es-ES", { month: "long", year: "numeric" });
    
            if (!totalPorMes[mes]) {
                totalPorMes[mes] = 0;
            }
            totalPorMes[mes] += gasto.monto;
        });
    
        return totalPorMes;
    }

    descargarInformeBtn.addEventListener("click", () => {
        // Elegir el formato 
        const formato = prompt("¿En qué formato deseas descargar el informe? (Excel o PDF)").toLowerCase();
    
        if (formato === "excel") {
            descargarInformeExcel();
        } else if (formato === "pdf") {
            descargarInformePDF();
        } else {
            alert("Formato no reconocido. Por favor elige 'Excel' o 'PDF'.");
        }
    });
    
    function descargarInformeExcel() {
        const totalPorMes = calcularTotalPorMes();
        const datos = [["Mes", "Total de Gastos"]]; // Encabezados
    
        for (const mes in totalPorMes) {
            datos.push([mes, totalPorMes[mes].toFixed(2)]); // Datos
        }
    
        const hoja = XLSX.utils.aoa_to_sheet(datos); // Crear hoja de Excel
        const libro = XLSX.utils.book_new(); // Crear libro
        XLSX.utils.book_append_sheet(libro, hoja, "Informe de Gastos");
    
        XLSX.writeFile(libro, "Informe_de_Gastos.xlsx"); // Descargar el archivo
    }
    
    async function descargarInformePDF() {
        const totalPorMes = calcularTotalPorMes();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Informe de Gastos", 10, 10);
    
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
    
        let y = 20; // Coordenada Y inicial
    
        doc.text("Mes", 10, y);
        doc.text("Total de Gastos", 80, y);
    
        y += 10;
    
        for (const mes in totalPorMes) {
            doc.text(mes, 10, y);
            doc.text(`$${totalPorMes[mes].toFixed(2)}`, 80, y);
            y += 10;
        }
    
        doc.save("Informe_de_Gastos.pdf"); // Descargar el archivo
    } 
    
    
    
});

