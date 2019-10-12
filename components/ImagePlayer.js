import React, {PureComponent} from 'react';
import { Dimensions } from 'react-native';
import styled from 'styled-components/native'
import { WebView } from 'react-native-webview';

class ImagePlayer extends PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    const {height, width} = Dimensions.get('window');
    return <WebView
      source={{ uri: this.props.url }}
      style={{ width, height }}
    />
  }
}

export { ImagePlayer }
