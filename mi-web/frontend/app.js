async function cargarProductos() {
  const username = document.getElementById('username').value;
  if (!username) return alert('Ingrese un usuario');

  try {
    const response = await fetch(`/api/productos?username=${encodeURIComponent(username)}`);
    const productos = await response.json();

    const tbody = document.querySelector('#productosTable tbody');
    tbody.innerHTML = '';

    productos.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.idProductos}</td>
        <td>${p.nameProductos}</td>
        <td>${p.descriptionProductos}</td>
        <td>${p.codigoBarraProductos}</td>
        <td>${p.priceProductos}</td>
        <td>${p.nameEmpresasPaises}</td>
        <td>${p.namePaisLista}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    alert('Error cargando productos: ' + err.message);
  }
}