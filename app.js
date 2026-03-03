async function cargarProductos() {
  try {
    const response = await fetch("/api/productos");
    const productos = await response.json();

    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    if (!Array.isArray(productos)) {
      lista.innerHTML = "<li>Error cargando productos</li>";
      return;
    }

    productos.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.id} - ${p.nombre} - $${p.precio}`;
      lista.appendChild(li);
    });

  } catch (error) {
    console.error(error);
    alert("Error al conectar con el servidor");
  }
}
