class Orders {
  static database = {
    hopscotch: []
  };

  static setAll({ items, venueName }) {
    Orders.database[venueName] = items;
  }

  static add({ item, venueName }) {
    if (!Orders.database[venueName]) {
      Orders.database[venueName] = [];
    }
    Orders.database[venueName].push(item);
  }

  static getAll(venueName) {
    if (!Orders.database[venueName]) {
      Orders.database[venueName] = [];
    }
    return Orders.database[venueName];
  }

  static reset(venueName) {
    if (!Orders.database[venueName]) {
      Orders.database[venueName] = [];
    }
    if (Orders.database[venueName].length) {
      Orders.database[venueName] = [];
    }
  }
}

export default Orders;
