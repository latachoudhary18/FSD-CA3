const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const PORT = 3003;
const DATA_FILE = path.join(__dirname, 'data', 'inventory.json');
const LOG_FILE = path.join(__dirname, 'data', 'audit.log');

// Initialize EventEmitter for real-time inventory notifications & audit logging
class InventoryEmitter extends EventEmitter {}
const inventoryEvents = new InventoryEmitter();

inventoryEvents.on('inventoryUpdated', ({ action, item }) => {
  const logLine = `[${new Date().toISOString()}] ACTION=${action} | ITEM=${JSON.stringify(item)}\n`;
  console.log('EVENT NOTIFICATION:', logLine.trim());

  // Append event log using WriteStream
  const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
  logStream.write(logLine);
  logStream.end();
});

// Helper: Read JSON file safely
function readInventory(callback) {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return callback(err, null);
    try {
      const parsed = JSON.parse(data || '[]');
      callback(null, parsed);
    } catch (parseErr) {
      callback(parseErr, null);
    }
  });
}

// Helper: Write JSON file safely
function writeInventory(records, callback) {
  fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8', callback);
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  // Route 1: GET /api/inventory (Streams file directly to response)
  if (req.method === 'GET' && req.url === '/api/inventory') {
    res.writeHead(200);
    const readStream = fs.createReadStream(DATA_FILE, 'utf8');
    readStream.on('error', (err) => {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to stream inventory file', details: err.message }));
    });
    readStream.pipe(res);
    return;
  }

  // Route 2: POST /api/inventory (Add new item)
  if (req.method === 'POST' && req.url === '/api/inventory') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const input = JSON.parse(body);

        // Input Validation
        if (!input.name || typeof input.quantity !== 'number' || input.quantity <= 0 || typeof input.price !== 'number' || input.price <= 0) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: 'Invalid input. Provide name, positive quantity, and positive price.' }));
        }

        readInventory((err, records) => {
          if (err) {
            res.writeHead(500);
            return res.end(JSON.stringify({ error: 'Database read error' }));
          }

          const newItem = {
            id: Date.now().toString().slice(-4),
            name: input.name.trim(),
            quantity: input.quantity,
            price: input.price
          };

          records.push(newItem);
          writeInventory(records, (writeErr) => {
            if (writeErr) {
              res.writeHead(500);
              return res.end(JSON.stringify({ error: 'Database write error' }));
            }

            // Emit Event
            inventoryEvents.emit('inventoryUpdated', { action: 'CREATE', item: newItem });

            res.writeHead(201);
            res.end(JSON.stringify({ message: 'Item created successfully', item: newItem }));
          });
        });
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Malformed JSON body' }));
      }
    });
    return;
  }

  // Route 3: DELETE /api/inventory/:id
  if (req.method === 'DELETE' && req.url.startsWith('/api/inventory/')) {
    const id = req.url.split('/')[3];

    readInventory((err, records) => {
      if (err) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: 'Database read error' }));
      }

      const index = records.findIndex((item) => item.id === id);
      if (index === -1) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: `Item with ID ${id} not found` }));
      }

      const [deletedItem] = records.splice(index, 1);
      writeInventory(records, (writeErr) => {
        if (writeErr) {
          res.writeHead(500);
          return res.end(JSON.stringify({ error: 'Database write error' }));
        }

        inventoryEvents.emit('inventoryUpdated', { action: 'DELETE', item: deletedItem });
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Item deleted', item: deletedItem }));
      });
    });
    return;
  }

  // Fallback 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Route not found. Use GET /api/inventory or POST /api/inventory' }));
});

server.listen(PORT, () => {
  console.log(`Core Node.js Inventory Server running at http://localhost:${PORT}`);
});