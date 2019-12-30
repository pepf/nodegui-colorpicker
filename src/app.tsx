import React from "react";
import { Text, Window, hot, View, Button, Image } from "@nodegui/react-nodegui";
import { QIcon, QPushButtonEvents, QMainWindowEvents, QWidgetEvents, QMouseEvent, AspectRatioMode, WindowType, WidgetAttribute } from "@nodegui/nodegui";
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
    const win = this.windowRef.current
    win.hide(); //https://forum.qt.io/topic/60642/framelesswindowhint-fails-at-runtime-on-mainwindow
    // win.resize(300, 300);

    win.setWindowFlag(WindowType.FramelessWindowHint, true);
    win.setWindowFlag(WindowType.Widget, true);
    if (os.platform() === "darwin") {
      win.setAttribute(WidgetAttribute.WA_TranslucentBackground, true);
    }
    win.show();
  }

  render() {
    const {x,y} = this.state.position
    const {img, pixel, selectedPixel} = this.state

    const handler = {
      [QWidgetEvents.MouseMove]: (e: any) => {
        const event = new QMouseEvent(e);
        this.setState({position: {x: event.x(), y: event.y()}})
        // console.log("mouse moved!", event.button(), event.x(), event.y())

        // If image is loaded
        if (this.state.img.width) {
          const mappedX = map(0, width, 0, this.state.img.width, event.x())
          const mappedY = map(0, height, 0, this.state.img.height, event.y())
          const pixel = getPixelColor(mappedX, mappedY)
          this.setState({pixel})
        }
      },
      [QWidgetEvents.MouseButtonRelease]: (e:any) => {
        this.setState({selectedPixel: this.state.pixel})
      }
    };

    const buttonHandler = {
      [QWidgetEvents.MouseButtonRelease]: (e: any) => {
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
        windowTitle="Hello 👋🏽"
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
            <View id="row">
              <Button on={buttonHandler} text={"📸"}/>
              <Text>
                {!this.state.img.width ? "No screenshot captured yet" : " "}
              </Text>
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
   height: 75px;
   background-color: #efefef;
 }

  #row {
    flex: 1;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
  #selected, #hover {
    width: 50px;
    height: 50px;
    border: 1px solid white;
  }
`;

export default hot(App);
