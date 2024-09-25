import express from 'express';
import { createClient } from 'redis';
import { promisify } from 'util'

const listProducts = [
    {Id: 1, name: "Suitcase 250", price: 50, stock: 4},
    {Id: 2, name: "Suitcase 450", price: 100, stock: 10},
    {Id: 3, name: "Suitcase 650", price: 350, stock: 2},
    {Id: 4, name: "Suitcase 1050", price: 550, stock: 5}
]

const getItemById = (id) => {
    const item = listProducts.find(obj => obj.itemId === id);
  
    if (item) {
      return Object.fromEntries(Object.entries(item));
    }
  };
  
  const app = express();
  const client = createClient();
  const PORT = 1245;
  
  /**
   * Modifies the reserved stock for a given item.
   * @param {number} itemId - The id of the item.
   * @param {number} stock - The stock of the item.
   */
  const reserveStockById = async (itemId, stock) => {
    return promisify(client.SET).bind(client)(`item.${itemId}`, stock);
  };
  
  /**
   * Retrieves the reserved stock for a given item.
   * @param {number} itemId - The id of the item.
   * @returns {Promise<String>}
   */
  const getCurrentReservedStockById = async (itemId) => {
    return promisify(client.GET).bind(client)(`item.${itemId}`);
  };
  
  app.get('/list_products', (_, res) => {
    res.json(listProducts);
  });
  
  app.get('/list_products/:itemId(\\d+)', (req, res) => {
    const itemId = Number.parseInt(req.params.itemId);
    const productItem = getItemById(Number.parseInt(itemId));
  
    if (!productItem) {
      res.json({ status: 'Product not found' });
      return;
    }
    getCurrentReservedStockById(itemId)
      .then((result) => Number.parseInt(result || 0))
      .then((reservedStock) => {
        productItem.currentQuantity = productItem.initialAvailableQuantity - reservedStock;
        res.json(productItem);
      });
  });
  
  app.get('/reserve_product/:itemId', (req, res) => {
    const itemId = Number.parseInt(req.params.itemId);
    const productItem = getItemById(Number.parseInt(itemId));
  
    if (!productItem) {
      res.json({ status: 'Product not found' });
      return;
    }
    getCurrentReservedStockById(itemId)
      .then((result) => Number.parseInt(result || 0))
      .then((reservedStock) => {
        if (reservedStock >= productItem.initialAvailableQuantity) {
          res.json({ status: 'Not enough stock available', itemId });
          return;
        }
        reserveStockById(itemId, reservedStock + 1)
          .then(() => {
            res.json({ status: 'Reservation confirmed', itemId });
          });
      });
  });
  
  const resetProductsStock = () => {
    return Promise.all(
      listProducts.map(
        item => promisify(client.SET).bind(client)(`item.${item.itemId}`, 0),
      )
    );
  };
  
  app.listen(PORT, () => {
    resetProductsStock()
      .then(() => {
        console.log(`API available on localhost port ${PORT}`);
      });
  });
  
  export default app;