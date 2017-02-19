import LocalStorage from './LocalStorage'

class ConfigStorageHelper {

  constructor() {
    this.configs_ = null;
    this.store = new LocalStorage();

    // Remove this after a few weeks:
    this.migrateConfigs();
  }

  getConfigs() {
    if (!this.configs_) {
      this.configs_ = this.store.read('configs') || [];
    }
    return this.configs_;
  }

  setConfigs(configs) {
    this.store.write('configs', configs);
    this.configs_ = configs;
  }

  getConfig(id) {
    const configs = this.getConfigs();
    return configs[id];
  }

  getNextId(currentId, opt_prev = false) {
    const configs = this.getConfigs();
    if (configs.length <= 1) {
      return null;
    }
    let configId;
    if (opt_prev) {
      configId = currentId === 0 ? configs.length - 1 : currentId - 1;
    } else {
      configId = currentId === (configs.length - 1) ? 0 : currentId + 1;
    }
    return configId;
  }

  storeConfigChange(configId, partialConfigObject) {
    const configs = this.getConfigs().slice(0);
    const modifiedConfig = configs[configId] || {};
    const newConfig = Object.assign(modifiedConfig, partialConfigObject);
    configs[configId] = newConfig;
    this.setConfigs(configs);
  }

  deleteConfig(configId) {
    const configs = this.getConfigs().slice(0);
    configs.splice(configId, 1);
    this.setConfigs(configs);
  }

  addConfig(opt_config) {
    const configs = this.getConfigs().slice(0);
    const newId = configs.length;
    const newConfig = opt_config || {
      name: 'Dashboard ' + newId,
      layout: [],
      whitelist: []
    };
    configs.push(newConfig);
    this.setConfigs(configs);
    return newId;
  }

  migrateConfigs() {
    const allLayouts = this.store.getKeys().filter(function (propertyName) {
      return propertyName.indexOf("layout") === 0;
    });
    if (allLayouts.length === 0 || this.getConfigs().length > 0) {
      // No migration required.
      return;
    }
    const configs = [];
    for (let i = 0; i < allLayouts.length; i++) {
      const id = allLayouts[i].substring(6);
      let config = {};
      // Compatibility mode: attempt to load from old system and migrate data.
      const layout = this.store.read('layout' + id);
      if (layout) {
        config.layout = layout;
        this.store.delete('layout' + id);
      }
      const whitelist = this.store.read('whitelist' + id);
      if (whitelist) {
        config.whitelist = whitelist;
        this.store.delete('whitelist' + id);
      }
      if (config.whitelist || config.layout) {
        config.name = 'Dashboard' + (id ? ' ' + id : '');
        configs.push(config);
      }
    }
    console.log('Migrated ' + allLayouts.length + ' layout configuration(s).');
    this.store.write('configs', configs);
    document.location.reload();
  }

}

export default ConfigStorageHelper;
