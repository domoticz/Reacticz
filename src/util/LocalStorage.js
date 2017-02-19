
class LocalStorage {
  constructor() {
    let hasLocalStorage = 'localStorage' in global;
    this.ls = null;
    if (hasLocalStorage) {
      const testKey = 'localstorage.test-key';
      try {
        this.ls = global.localStorage;
        this.ls.setItem(testKey, 'foo');
        this.ls.removeItem(testKey);
      } catch (e) {
        hasLocalStorage = false;
      }
    } else {
      console.log('Localstorage not supported !');
    }
  }

  write(key, data) {
    this.ls && this.ls.setItem(key, JSON.stringify(data));
  }

  read(key) {
    if (this.ls) {
      return JSON.parse(this.ls.getItem(key));
    }
    return null;
  }

  getKeys() {
    if (this.ls) {
      return Object.keys(this.ls);
    }
    return [];
  }

  delete(key) {
    this.ls && this.ls.removeItem(key);
  }

}

export default LocalStorage;
