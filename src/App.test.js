import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import App from './App';

it('renders without crashing', () => {
  const wrapper = mount(<App />);
  expect(wrapper.contains(welcomeMessage)).toEqual(true);
  wrapper.unmount();
});

it('reads config from localstorage', () => {
  var serverConfig = {
    mqttBrokerUrl: 'ws://dummy-broker:9001',
    domoticzUrl: 'http://dummy-domoticz:8080'
  };
  global.localStorage.setItem('serverConfig', JSON.stringify(serverConfig));
  const div = document.createElement('div');
  const wrapper = mount(<App />);
  const settings = <h2>Welcome to your Reacticz dashboard!</h2>;
  expect(wrapper.contains(settings)).toEqual(true);
  expect(wrapper.state('serverConfig')).toEqual(serverConfig);
  wrapper.unmount();
});

