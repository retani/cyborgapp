import React, {PureComponent} from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components/native'
import { Video } from 'expo-av';

class VideoPlayer extends PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    return <Video
      source={{ uri: this.props.url }}
      rate={1.0}
      volume={ this.props.volume}
      isMuted={false}
      resizeMode="cover"
      shouldPlay={ this.props.state === "play" }
      isLooping={ this.props.loop }
      style={{ width: "100%", height: "100%" }}
    />
  }
}

export { VideoPlayer }
