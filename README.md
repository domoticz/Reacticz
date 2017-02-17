[![Build Status](https://travis-ci.org/t0mg/reacticz.svg?branch=master)](https://travis-ci.org/t0mg/reacticz)

# Reacticz

A [Domoticz](http://www.domoticz.com) dashboard as a static web app, using [MQTT](http://mqtt.org) and [React](https://facebook.github.io/react/).

## TL;DR

Have a Domoticz home automation server with MQTT gateway? Open [this page](http://reacticz.t0m.fr) and start building your custom dashboard!

![reacticz](https://cloud.githubusercontent.com/assets/1903597/21564032/c2789068-ce88-11e6-8531-7a6f689e505c.png)

All widgets are draggable and resizeable. See more screenshots [on the wiki](https://github.com/t0mg/reacticz/wiki/Supported-devices).

## Requirements

- A [Domoticz](http://www.domoticz.com) server running on your home network.
- An [MQTT](http://mqtt.org) broker also running locally. For example [Mosquitto](https://mosquitto.org/) can easily be installed [on Raspberry Pi](http://blog.ithasu.org/2016/05/enabling-and-using-websockets-on-mosquitto/) or [Synology Diskstation](https://primalcortex.wordpress.com/2015/06/11/mosquitto-broker-with-websockets-enabled-on-the-synology-nas/). Make sure that websockets are enabled, as described in these articles.
- A properly configured MQTT Client gateway in Domoticz, to bind the above two (see [Domoticz Wiki](https://www.domoticz.com/wiki/MQTT#Add_hardware_.22MQTT_Client_Gateway.22)).

Optionally, you can build this project and host the resulting files on a webserver of your choosing. Or you can use the [public Reacticz url](http://reacticz.t0m.fr) that points at the [gh-pages branch of this repository](https://github.com/t0mg/reacticz/tree/gh-pages).

## Running, building, testing

If you only want to use Reacticz without modifying it, you can simply use the [public server](http://reacticz.t0m.fr) or [download the files](https://github.com/t0mg/reacticz/archive/gh-pages.zip) it serves, and jump to [Configuration](#configuration).

If you want to build this project yourself, for example to host your own instance of Reacticz, use the commands below. These are provided by [Create React App](https://github.com/facebookincubator/create-react-app), for more details please refer to [the full guide here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

####Important note
By default, Reacticz builds assuming it will be hosted at the root of the server (like the [public server](http://reacticz.t0m.fr) does). If you host Reacticz on a subpath of your server, you'll need to change the `homepage` property in `package.json` to make sure it matches the url where your build will be deployed (or relative paths might break). 

For example, **if you want to deploy to a `reacticz` directory in your Domoticz `www` directory, the homepage property should be set as follows:**
```js
"homepage": "http://localhost:8080/reacticz",
```
--
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

All configuration settings are stored on your web browser's [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) only and are not shared with the rest of the world. When using the dashboard, your browser uses MQTT (via websockets) and JSON to talk directly to your Domoticz server through your local network, there is no external third party involved. 

In other words it is safe to use the [public server](http://reacticz.t0m.fr). 

**Disclaimer:** on the public server some very basic, anonymous Google Analytics are collected (such as number of visitors, time spent, or country location), but personal configuration or dashboard actions are **not** tracked. If you [make your own build](#running-building-testing) of Reacticz, the analytics code will not be inserted.

## Customizing the dashboard

### Selecting devices

To add widgets to your dashboard you must choose them from a list of all available devices.

Unfold the menu bar (cog icon on the top right corner) and click the list-like icon to go to the Device selection screen. All your Domoticz devices should show up there. Tick the checkbox next to the devices you want to appear in your dashboard. Once you're done, click the Home icon in the menu to get back to the home screen and start [organizing your widgets](#organizing-the-widgets).

If you have room plans configured in Domoticz, you can also use the selector to automatically check all the devices corresponding to a given room plan.

### Organizing the widgets

On the home screen, open the menu bar and click the padlock icon to unlock your dashboard layout and enter edit mode. When the padlock is unlocked, all widgets become draggable and resizable (and can no longer be clicked). Organize them to your liking and click the padlock again to lock the layout and return to normal use.

Just like the [server configuration](#configuration), the layout is stored locally on your browser, and will be restored every time you open Reacticz on this device.

### Theming options

It is possible to change the color theme of Reacticz by using the selector in the information page.

## Sharing your configuration

The information page (last icon in the menu bar) provides a special link that lets you share your configuration with other devices of your home network so that you can clone your custom dashboard without having to redo it manually on each device.

## Supported widgets

See the [dedicated wiki page](https://github.com/t0mg/reacticz/wiki/Supported-devices) for a list of currently supported devices.

## Credits

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

The dashboard grid is handled by [React-grid-layout](https://github.com/STRML/react-grid-layout).

Reacticz communicates with Domoticz thanks to the [MQTT.js](https://github.com/mqttjs/MQTT.js) and [axios](https://github.com/mzabriskie/axios) packages.

Weather widget icons are based on [Kevin Aguilar's Material Design Weather Icon Set](https://material.uplabs.com/posts/material-design-weather-icon-set).

Other icons are from [material.io](https://material.io/icons/) and [Material Design Icons](https://materialdesignicons.com).
