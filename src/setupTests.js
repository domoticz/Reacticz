import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import JSONClientSingleton from './util/JSONClientSingleton';

const localStorageMock = {
  __dataStore: [],
  getItem: jest.fn(function(key) {
    return this.__dataStore[key] || null
  }),
  removeItem: jest.fn(function(key) { delete this.__dataStore[key] }),
  setItem: jest.fn(function(key, val) {
    this.__dataStore[key] = val
  })
};
global.localStorage = localStorageMock;

const testJSONClientSingleton = new JSONClientSingleton();
testJSONClientSingleton.setServerUrl('http://ac.me:42');

// This sets the mock adapter on the default instance
const axiosMock = new MockAdapter(axios);

// Mock any GET request to /users
// arguments for reply are (status, data, headers)
axiosMock.onGet().reply(function(config) {
  console.log(config);
  switch (config.url) {
    case 'http://ac.me:42/json.htm?type=devices&filter=all&used=true&order=Name':
      return [200, {}];
    default:
      return [404];
  }
});

// The welcome message when there is no config. Used in multiple tests.
global.welcomeMessage = <span>Welcome to Reacticz, please setup your server config to proceed</span>;
