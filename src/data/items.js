class Items {
  static database = {
    hopscotch: []
  };

  static setAll({ items, venueName }) {
    Items.database[venueName] = items;
  }

  static add({ item, venueName }) {
    if (!Items.database[venueName]) {
      Items.database[venueName] = [];
    }
    Items.database[venueName].push(item);
  }

  static getAll(venueName) {
    if (!Items.database[venueName]) {
      Items.database[venueName] = [];
    }
    return Items.database[venueName];
  }

  static reset(venueName) {
    if (!Items.database[venueName]) {
      Items.database[venueName] = [];
    }
    if (Items.database[venueName].length) {
      Items.database[venueName] = [];
    }
  }
}

export default Items;
