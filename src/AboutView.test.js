import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import AboutView from './AboutView';

it('renders without crashing', () => {
  const wrapper = mount(<AboutView />);
});
