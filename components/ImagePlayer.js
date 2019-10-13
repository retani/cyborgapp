import React, {PureComponent} from 'react';
import { Dimensions, Image } from 'react-native';
import styled from 'styled-components/native'

class ImagePlayer extends PureComponent {
  constructor(props) {
    super()
    this.state = {}
  }

  loadStart = () => {
    this.setState({ loading: true })
  }

  loadEnd = () => {
    this.setState({ loading: false })
  }

  render() {
    const {height, width} = Dimensions.get('window');
    return <Image
      source={{ uri: this.props.url }}
      resizeMode="cover"
      style={{ width, height }}
      onLoadStart={ this.loadStart }
      onLoad={ this.loadEnd }
    />
  }
}

export { ImagePlayer }
