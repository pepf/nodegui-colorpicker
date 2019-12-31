import React from "react";
import { Text, View } from "@nodegui/react-nodegui";

const rgbToHex = ({r,g,b}) => {
    const componentToHex = comp => {
      var hex = Number(comp).toString(16);
      if (hex.length < 2) {
           hex = "0" + hex;
      }
      return hex;
    }

    var red = componentToHex(r);
    var green = componentToHex(g);
    var blue = componentToHex(b);

    return red+green+blue;
};

const ColorBox = ({color}) => (
  <View style={wrapper}>
    <View id="selected" style={`background-color: rgb(${color.r},${color.g},${color.b});`}></View>
    <View style={colorCodes}>
      <Text style={label}>{`R: ${color.r}, G: ${color.g} B: ${color.b}`}</Text>
      <Text style={label}>{`#${rgbToHex(color)}`}</Text>
    </View>
  </View>
)

const wrapper = `
  margin-top: 10px;
  flex-direction: 'row';
  justify-content: 'flex-start';
  align-items: 'flex-start';
`
const colorCodes = `
  flex-direction: 'column';
  margin-left: 10px
`

const label = `

`

export default ColorBox