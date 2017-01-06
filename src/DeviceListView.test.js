import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import DeviceListView from './DeviceListView';

it('renders without crashing', () => {
  const wrapper = mount(<DeviceListView />);
});
