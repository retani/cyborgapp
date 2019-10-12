import React, {PureComponent} from 'react';
import { Dimensions } from 'react-native';
import styled from 'styled-components/native'
import { WebView } from 'react-native-webview';

const {height, width} = Dimensions.get('window');

class ImagePlayer extends PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    return <WebView
      source={{ uri: this.props.url }}
      style={{ width, height }}
    />
  }
}

export { ImagePlayer }
