// State array holding inventory records
let inventoryData = [];

// DOM References
const inventoryForm = document.getElementById('inventoryForm');
const formError = document.getElementById('formError');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const refreshBtn = document.getElementById('refreshBtn');
const tableBody = document.getElementById('inventoryTableBody');
const itemCount = document.getElementById('itemCount');
const apiLog = document.getElementById('apiLog');

// Helper: Log JSON request/response for academic demonstration
function logHttpActivity(method, endpoint, status, payload) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method,
    endpoint,
    status,
    jsonPayload: payload
  };
  apiLog.textContent = JSON.stringify(logEntry, null, 2);
}

// 1. Fetch initial sample data using Fetch API & async/await (GET)
async function fetchInitialInventory() {
  try {
    // Using JSONPlaceholder to demonstrate real HTTP GET + JSON parsing
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=4');
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    const rawData = await response.json();

    const categories = ['Electronics', 'Networking', 'Peripherals', 'Electronics'];
    const sampleNames = ['Arduino Uno R4', 'Wi-Fi 6 Router', 'Mechanical Keyboard', 'ESP32 DevKit'];

    inventoryData = rawData.map((post, index) => ({
      id: post.id,
      name: sampleNames[index] || `Component #${post.id}`,
      category: categories[index % categories.length],
      quantity: (index + 1) * 5,
      price: (index + 1) * 1250
    }));

    logHttpActivity('GET', 'https://jsonplaceholder.typicode.com/posts?_limit=4', response.status, inventoryData);
    renderTable();
  } catch (error) {
    formError.textContent = `Failed to load remote data: ${error.message}`;
  }
}

// 2. Render filtered & searched table dynamically via DOM Manipulation
function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filteredItems = inventoryData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  itemCount.textContent = filteredItems.length;
  tableBody.innerHTML = '';

  if (filteredItems.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No matching inventory items found.</td></tr>`;
    return;
  }

  filteredItems.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>#${item.id}</td>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td><button class="btn-danger" data-id="${item.id}">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });
}

// 3. Validate input and send HTTP POST request
async function handleAddItem(event) {
  event.preventDefault();
  formError.textContent = '';

  const name = document.getElementById('itemName').value.trim();
  const category = document.getElementById('itemCategory').value;
  const quantity = Number(document.getElementById('itemQuantity').value);
  const price = Number(document.getElementById('itemPrice').value);

  // Input Validation
  if (name.length < 2) {
    formError.textContent = 'Validation Error: Item name must be at least 2 characters.';
    return;
  }
  if (!category) {
    formError.textContent = 'Validation Error: Please select a valid category.';
    return;
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    formError.textContent = 'Validation Error: Quantity must be a positive whole number.';
    return;
  }
  if (isNaN(price) || price <= 0) {
    formError.textContent = 'Validation Error: Price must be greater than 0.';
    return;
  }

  const newItem = {
    id: Date.now().toString().slice(-4),
    name,
    category,
    quantity,
    price
  };

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });

    const responseJson = await response.json();
    inventoryData.unshift(newItem);
    logHttpActivity('POST', 'https://jsonplaceholder.typicode.com/posts', response.status, {
      requestBody: newItem,
      serverResponse: responseJson
    });

    inventoryForm.reset();
    renderTable();
  } catch (error) {
    formError.textContent = `POST Request Failed: ${error.message}`;
  }
}

// 4. Event Delegation for Delete (HTTP DELETE)
async function handleDeleteItem(event) {
  if (!event.target.classList.contains('btn-danger')) return;
  const itemId = event.target.getAttribute('data-id');

  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${itemId}`, {
      method: 'DELETE'
    });
    inventoryData = inventoryData.filter((item) => String(item.id) !== String(itemId));
    logHttpActivity('DELETE', `https://jsonplaceholder.typicode.com/posts/${itemId}`, response.status, { deletedId: itemId });
    renderTable();
  } catch (error) {
    formError.textContent = `DELETE Request Failed: ${error.message}`;
  }
}

// Event Listeners
inventoryForm.addEventListener('submit', handleAddItem);
searchInput.addEventListener('input', renderTable);
categoryFilter.addEventListener('change', renderTable);
refreshBtn.addEventListener('click', fetchInitialInventory);
tableBody.addEventListener('click', handleDeleteItem);

// Initialize on page load
fetchInitialInventory();