
class LocalStorage {
  constructor() {
    let hasLocalStorage = 'localStorage' in global;
    this.ls = null;
    if (hasLocalStorage) {
      const testKey = 'react-localstorage.mixin.test-key';
      try {
        this.ls = global.localStorage;
        this.ls.setItem(testKey, 'foo');
        this.ls.removeItem(testKey);
      } catch (e) {
        hasLocalStorage = false;
      }
    }
    if (!hasLocalStorage) {
      console.log('Localstorage not supported !');
    }
  }

  write(key, data) {
    this.ls.setItem(key, JSON.stringify(data));
  }

  read(key) {
    return JSON.parse(this.ls.getItem(key));
  }

  delete(key) {
    this.ls.removeItem(key);
  }

}

export default LocalStorage;
