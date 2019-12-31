import path from "path";
import open from "open";
import os from "os"

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
  WidgetEventTypes,
  NodeWidget,
  QMainWindow,
  QSize
} from "@nodegui/nodegui";
import { setTitleBarStyle } from '@nodegui/plugin-title-bar'

import { loadImage, getPixelColor, takeScreenshot } from "./loadImage";
import { savePosition, restorePosition } from "./window";
import nodeguiIcon from "../assets/nodegui.jpg";
import ColorBox from "./components/ColorBox";

const map = function (in_min: number, in_max: number, out_min: number, out_max: number, value: number): number {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const rootDir = path.resolve(__dirname, "..");

const FILE = "screenshot.png"
const tmpScreenshotFile = path.resolve(rootDir, `tmp/${FILE}`);

const width = 500;
const height = 100;

const minSize = { width, height };
const winIcon = new QIcon(path.resolve(__dirname, nodeguiIcon));


type AppState = {
  position: {x: number, y: number},
  img: object,
  pixel: object,
  selectedPixel: object
}

type WindowRef = {
  current: NodeWidget
}
class App extends React.Component<{}, AppState> {

  windowRef: WindowRef

  constructor(props: any) {
    super(props)
    this.windowRef = React.createRef()
    this.state = {
      position: {x: 0, y: 0},
      isPicking: false,
      img: {},
      pixel: {},
      selectedPixel: {}
    }
  }

  componentDidMount() {
    if(!this.windowRef) return
    const win = this.windowRef.current;
    // setTitleBarStyle(win.native, 'hidden')
    win.hide();
    win.setWindowFlag(WindowType.FramelessWindowHint, true);
    win.setWindowFlag(WindowType.Widget, true);
    if (os.platform() === "darwin") {
      win.setAttribute(WidgetAttribute.WA_TranslucentBackground, true);
    }
    win.show();
  }

  render() {
    const {x,y} = this.state.position
    const {img, pixel, isPicking, selectedPixel} = this.state

    const handler = {
      [WidgetEventTypes.MouseMove]: (e: any) => {
        const event = new QMouseEvent(e);
        this.setState({position: {x: event.globalX(), y: event.globalY()}})

        // If image is loaded
        if (this.state.img.width) {
          // If retina, image is twice the size of the reported pxs
          const pixel = getPixelColor(event.globalX() * 2, event.globalY() * 2)
          this.setState({pixel})
        }
      },
      [WidgetEventTypes.MouseButtonRelease]: (e:any) => {
        this.setState({isPicking: false, selectedPixel: this.state.pixel})
        restorePosition(this.windowRef)
      }
    };

    const buttonHandler = {
      [WidgetEventTypes.MouseButtonRelease]: (e: any) => {
        takeScreenshot(tmpScreenshotFile).then(() => {
          savePosition(this.windowRef)
          this.windowRef.current.setGeometry(0,0, 1680, 1000)
          loadImage(tmpScreenshotFile).then(img => {
            const {width, height} = img.bitmap
            this.setState({isPicking: true, img: {width, height}})
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
        on={handler}
        mouseTracking={true}
        style={containerStyle}>
          <View id="header">
            <Text>
              {isPicking ? `The mouse position is: ${x} - ${y}`: "Click the camera to begin picking"}
            </Text>
            <View id="row">
              <Button style={`padding: 10px`} on={buttonHandler} text={"📸"}/>
              <ColorBox color={isPicking ? pixel : selectedPixel} />
            </View>
          </View>
          {/* <Image id="img"
            on={handler}
            mouseTracking={true}
            aspectRatioMode={AspectRatioMode.KeepAspectRatio}
            src={tmpScreenshotFile} /> */}

        </View>
      </Window>
    );
  }
}

const containerStyle = `
  flex: 1;
`;

const styleSheet = `
  #img {
    flex: 1;
    width: 1000px;
    overflow: hidden;
  }
 #header {
   padding: 10px;
   padding-top: 30px;
   min-height: 75px;
   width: 400px;
   background-color: #efefef;
 }

  #row {
    flex: 1;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
  }
  #selected, #hover {
    margin-left: 10px;
    width: 50px;
    height: 50px;
    border: 1px solid white;
  }
`;

export default hot(App);
