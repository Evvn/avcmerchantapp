class Addons {
  static database = {
    hopscotch: []
  };

  static setAll({ addons, venueName }) {
    Addons.database[venueName] = addons;
  }

  static add({ addon, venueName }) {
    if (!Addons.database[venueName]) {
      Addons.database[venueName] = [];
    }
    Addons.database[venueName].push(addon);
  }

  static getAll(venueName) {
    if (!Addons.database[venueName]) {
      Addons.database[venueName] = [];
    }
    return Addons.database[venueName];
  }

  static reset(venueName) {
    if (!Addons.database[venueName]) {
      Addons.database[venueName] = [];
    }
    if (Addons.database[venueName].length) {
      Addons.database[venueName] = [];
    }
  }
}

export default Addons;
