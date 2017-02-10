import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import SettingsView from './SettingsView';

it('renders without crashing & shows welcome message', () => {
  const wrapper = mount(<SettingsView />);
  expect(wrapper.contains(welcomeMessage)).toEqual(true);
});

it('only shows the welcome message if there is no existing config', () => {
  const wrapper = mount(<SettingsView config={{mqttBrokerUrl: 'ws://dummy', domoticzUrl: 'http://foobar'}}/>);
  expect(wrapper.contains(welcomeMessage)).toEqual(false);
});
