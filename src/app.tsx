import React from "react";
import { Text, Window, hot, View, Button, Image } from "@nodegui/react-nodegui";
import { QIcon, QPushButtonEvents, QMainWindowEvents, QWidgetEvents, QMouseEvent, AspectRatioMode } from "@nodegui/nodegui";
import path from "path";
import open from "open";
// import Jimp from "jimp-compact";

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
    this.state = {
      position: {x: 0, y: 0},
      backgroundColor: "grey",
      img: {},
      pixel: {}
    }
  }

  render() {
    const {x,y} = this.state.position
    const {img, pixel} = this.state

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
      >
        <View
        mouseTracking={true}
        on={handler}
        style={containerStyle}>
          <View style={`background-color: rgb(${pixel.r},${pixel.g},${pixel.b}); height: 50px`}>
            <Text>{`The mouse position is: ${x} - ${y}`}</Text>
            <Text>
              {!this.state.img.width ? "No screenshot captured yet" : " "}
              </Text>
            <Button on={buttonHandler} text={"Retake screen"}/>
          </View>

          {/* {testImage ?
          <Image
            id="img"
            aspectRatioMode={null}
            width={400}
            height={400}
            src={"assets/trippy.png"}
          />
          : null } */}
        </View>
      </Window>
    );
  }
}

const containerStyle = `
  flex: 1;
`;

const styleSheet = `
  #welcome-text {
    font-size: 24px;
    padding-top: 20px;
    qproperty-alignment: 'AlignHCenter';
  }
`;

export default hot(App);
