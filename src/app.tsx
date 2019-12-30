import React from "react";
import { Text, Window, hot, View, Button, Image } from "@nodegui/react-nodegui";
import {
  QIcon,
  QPushButtonEvents,
  QWidgetEvents,
  QPushButtonSignals,
  QWidgetSignals,
  QMouseEvent,
  AspectRatioMode,
  WindowType,
  WidgetAttribute,
  WidgetEventTypes } from "@nodegui/nodegui";
import { setTitleBarStyle } from '@nodegui/plugin-title-bar'
import path from "path";
import open from "open";
import os from "os"

import { loadImage, getPixelColor, takeScreenshot } from "./loadImage";
import nodeguiIcon from "../assets/nodegui.jpg";
import testImage from "../assets/trippy.png";

const map = function (in_min: number, in_max: number, out_min: number, out_max: number, value: number): number {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const rootDir = path.resolve(__dirname, "..");

const width = 500;
const height = 500;

const minSize = { width, height };
const winIcon = new QIcon(path.resolve(__dirname, nodeguiIcon));


type AppState = {
  position: {x: number, y: number},
  backgroundColor: string
}
class App extends React.Component<{}, AppState> {

  constructor(props: any) {
    super(props)
    this.windowRef = React.createRef()
    this.state = {
      position: {x: 0, y: 0},
      backgroundColor: "grey",
      img: {},
      pixel: {},
      selectedPixel: {}
    }
  }

  componentDidMount() {
    if(!this.windowRef) return
    const win = this.windowRef.current;
    setTitleBarStyle(win.native, 'hidden')
  }

  render() {
    const {x,y} = this.state.position
    const {img, pixel, selectedPixel} = this.state

    const handler = {
      [WidgetEventTypes.MouseMove]: (e: any) => {
        const event = new QMouseEvent(e);
        this.setState({position: {x: event.x(), y: event.y()}})

        // If image is loaded
        if (this.state.img.width) {
          const mappedX = map(0, width, 0, this.state.img.width, event.x())
          const mappedY = map(0, height, 0, this.state.img.height, event.y())
          const pixel = getPixelColor(mappedX, mappedY)
          this.setState({pixel})
        }
      },
      [WidgetEventTypes.MouseButtonPress]: (e:any) => {
        this.setState({selectedPixel: this.state.pixel})
      }
    };

    const buttonHandler = {
      [WidgetEventTypes.MouseButtonRelease]: (e: any) => {
        const FILE = "screenshot.png"
        const tmpScreenshotFile = path.resolve(rootDir, `tmp/${FILE}`);
        takeScreenshot(tmpScreenshotFile).then(() => {
          console.log("Loading screenshot in...")
          loadImage(tmpScreenshotFile).then(img => {
            const {width, height} = img.bitmap
            this.setState({img: {width, height}})
          })
        })
      }
    }

    return (
      <Window
        windowIcon={winIcon}
        windowTitle="💅🏼 Color picker"
        minSize={minSize}
        styleSheet={styleSheet}
        ref={this.windowRef}
      >
        <View
        mouseTracking={true}
        on={handler}
        style={containerStyle}>
          <View id="header">
            <Text>{`The mouse position is: ${x} - ${y}`}</Text>
            <Text>
              {!this.state.img.width ? "No screenshot captured yet" : " "}
            </Text>
            <View id="row">
              <Button style={`padding: 10px`} on={buttonHandler} text={"📸"}/>
              <View id="hover" style={`background-color: rgb(${pixel.r},${pixel.g},${pixel.b});`}></View>
              {selectedPixel.r ?  <View id="selected" style={`background-color: rgb(${selectedPixel.r},${selectedPixel.g},${selectedPixel.b});`}></View> : null}
            </View>
          </View>

        </View>
      </Window>
    );
  }
}

const containerStyle = `
  flex: 1;
`;

const styleSheet = `
 #header {
   padding: 10px;
   padding-top: 30px;
   min-height: 75px;
   background-color: #efefef;
 }
 #header * {
   margin-right: 10px;
 }

  #row {
    flex: 1;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
  }
  #selected, #hover {
    width: 50px;
    height: 50px;
    border: 1px solid white;
  }
`;

export default hot(App);
