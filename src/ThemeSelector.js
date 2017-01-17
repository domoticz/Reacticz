import React, { Component } from 'react';

class ThemeSelector extends Component {

  onChange = (event) => {
    this.props.onThemeChange(event.target.value);
  }

  render() {
    const themeIds = [];
    for (const themeKey in this.props.themes) {
      if ({}.hasOwnProperty.call(this.props.themes, themeKey)) {
        themeIds.push(themeKey);
      }
    }
    const options = themeIds.map(
      function(themeId) {
        return (
          <option key={themeId} value={themeId}>{themeId}</option>
        );
      }, this);
    return (
      <select className="ThemeSelector" onChange={this.onChange} value={this.props.currentTheme}>{options}</select>
    );
  }

}

export default ThemeSelector
