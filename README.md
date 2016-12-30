# Reacticz

A [Domoticz](http://www.domoticz.com) dashboard as a static web app, using [MQTT](http://mqtt.org) and [React](https://facebook.github.io/react/).

## TL;DR

Have a Domoticz home automation server with MQTT gateway? Open [this page](http://reacticz.t0m.fr) and start building your custom dashboard!

![reacticz](https://cloud.githubusercontent.com/assets/1903597/21564032/c2789068-ce88-11e6-8531-7a6f689e505c.png)

All widgets are draggable and resizeable. See more screenshots [here](#supported-widgets).

## Requirements

- A [Domoticz](http://www.domoticz.com) server running on your home network.
- An [MQTT](http://mqtt.org) broker also running locally. For example [Mosquitto](https://mosquitto.org/) can easily be installed [on Raspberry Pi](http://blog.ithasu.org/2016/05/enabling-and-using-websockets-on-mosquitto/) or [Synology Diskstation](https://primalcortex.wordpress.com/2015/06/11/mosquitto-broker-with-websockets-enabled-on-the-synology-nas/). Make sure that websockets are enabled, as described in these articles.
- A properly configured MQTT Client gateway in Domoticz, to bind the above two (see [Domoticz Wiki](https://www.domoticz.com/wiki/MQTT#Add_hardware_.22MQTT_Client_Gateway.22)).

Optionally, you can build this project and host the resulting files on a webserver of your choosing. Or you can use the [public Reacticz url](http://reacticz.t0m.fr) that points at the [gh-pages branch of this repository](https://github.com/t0mg/reacticz/tree/gh-pages).

## Running, building, testing

If you only want to use Reacticz without modifying it, you can simply use the [public server](http://reacticz.t0m.fr) or [download the files](https://github.com/t0mg/reacticz/archive/gh-pages.zip) it serves, and jump to [Configuration](#configuration).

If you want to build this project yourself, use the commands below. These are provided by [Create React App](https://github.com/facebookincubator/create-react-app), for more details please refer to [the full guide here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

In the project directory, you can run:

### `npm install`

Downloads and installs the required dependencies.

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>

### `npm run build`

Builds the app for production to the `build` folder.<br>

## Configuration

When opening Reacticz for the first time on a new device, you will be redirected to the Server settings screen. Just enter the address and port of your Domoticz server and MQTT broker and click Save (see [Requirements](#requirements)). If the configuration is correct you will then land on the home screen (an empty dashboard).

### Note on personal data

All configuration settings are stored on your web browser's [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) only and are not shared with the rest of the world. When using the dashboard, your browser uses MQTT and JSON to talk directly to your Domoticz server through your local network, there is no third party involved.

## Customizing the dashboard

### Selecting devices

To add widgets to your dashboard you must choose them from a list of all available devices.

Unfold the menu bar (cog icon on the top right corner) and click the list-like icon to go to the Device selection screen. All your Domoticz devices should show up there. Tick the checkbox next to the devices you want to appear in your dashboard. Once you're done, click the Home icon in the menu to get back to the home screen and start [organizing your widgets](#organizing-the-widgets).

### Organizing the widgets

On the home screen, open the menu bar and click the padlock icon to unlock your dashboard layout and enter edit mode. When the padlock is unlocked, all widgets become draggable and resizable (and can no longer be clicked). Organize them to your liking and click the padlock again to lock the layout and return to normal use.

Just like the [server configuration](#configuration), the layout is stored locally on your browser, and will be restored every time you open Reacticz on this device.

## Sharing your configuration

The information page (last icon in the menu bar) provides a special link that lets you share your configuration with other devices of your home network so that you can clone your custom dashboard without having to redo it manually on each device.

## Supported widgets

The following device types are currently supported on Reacticz dashboard:

- Scenes<br>
![scene](https://cloud.githubusercontent.com/assets/1903597/21553174/3c9381fa-ce07-11e6-8c7b-e1a80b1073fe.png)
- Groups<br>
![group](https://cloud.githubusercontent.com/assets/1903597/21552972/93fd8c6c-ce05-11e6-845d-2b53c8f54f02.gif)
- Weather + Humidity + Baro<br>
![weather](https://cloud.githubusercontent.com/assets/1903597/21553236/94acbbf4-ce07-11e6-9b05-058c7365c22e.png)
- On/Off switches<br>
![switch](https://cloud.githubusercontent.com/assets/1903597/21552964/8e6b1710-ce05-11e6-8ed0-cc42b2665cca.gif)
- Dimmer switches<br>
![dimmer](https://cloud.githubusercontent.com/assets/1903597/21552962/8a9941d4-ce05-11e6-92d5-65ca7f9d1df1.gif)
- RGBW switches<br>
![rgbw](https://cloud.githubusercontent.com/assets/1903597/21552958/8699516e-ce05-11e6-8659-10839f1f6e8e.gif)
- Blinds<br>
![blinds](https://cloud.githubusercontent.com/assets/1903597/21553177/3ef9b77a-ce07-11e6-8ad2-aebd19d1bd96.png)

## Credits

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

The dashboard grid is handled by [React-grid-layout](https://github.com/STRML/react-grid-layout).

Reacticz communicates with Domoticz thanks to the [MQTT.js](https://github.com/mqttjs/MQTT.js) and [axios](https://github.com/mzabriskie/axios) packages.

Weather widget icons are based on [Kevin Aguilar's Material Design Weather Icon Set](https://material.uplabs.com/posts/material-design-weather-icon-set).

Other icons are from [material.io](https://material.io/icons/).
