import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import SettingsView from './SettingsView';

it('renders without crashing', () => {
  const wrapper = mount(<SettingsView />);
});
