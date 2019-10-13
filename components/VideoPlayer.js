import React, {PureComponent} from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components/native'
import { Video } from 'expo-av';

class VideoPlayer extends PureComponent {
  constructor() {
    super()
    this.state = {}
    this._onPlaybackStatusUpdate = this._onPlaybackStatusUpdate.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (this.props.state === "stop" && prevProps.state !== "stop") {
      this.playbackObject.setStatusAsync({positionMillis:false})
    }
  }

  _onPlaybackStatusUpdate = playbackStatus => {
    if (!playbackStatus.isLoaded) {
      // Update your UI for the unloaded state
      if (playbackStatus.error) {
        console.log(`Encountered a fatal error during playback: ${playbackStatus.error}`);
        // Send Expo team the error on Slack or the forums so we can help you debug!
      }
    } else {
      // Update your UI for the loaded state
  
      if (playbackStatus.isPlaying) {
        // Update your UI for the playing state
      } else {
        // Update your UI for the paused state
      }
  
      if (playbackStatus.isBuffering) {
        // Update your UI for the buffering state
      }
  
      if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
        // The player has just finished playing and will stop. Maybe you want to play something else?
        this.props.onPlayerStateChanged("stop")
      }
  
    }
  };
  
  _handleVideoRef = component => {
    this.playbackObject = component;
    //this.playbackObject.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
  }

  loadStart = () => {
    this.setState({ loading: true })
  }

  loadEnd = () => {
    this.setState({ loading: false })
  }  

  render() {
    return <Video
      ref={this._handleVideoRef}
      onPlaybackStatusUpdate={ this._onPlaybackStatusUpdate }
      onLoadStart={ this.loadStart }
      onLoad={ this.loadEnd }
      source={{ uri: this.props.url }}
      rate={1.0}
      volume={ parseFloat(this.props.volume)}
      isMuted={false}
      downloadFirst
      resizeMode="cover"
      shouldPlay={ this.props.state === "play" }
      isLooping={ this.props.loop }
      style={{ width: "100%", height: "100%" }}
    />
  }
}

export { VideoPlayer }

