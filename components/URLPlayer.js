import React, {PureComponent} from 'react';
import { Dimensions } from 'react-native';
import styled from 'styled-components/native'
import { WebView } from 'react-native-webview';

class URLPlayer extends PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    const {height, width} = Dimensions.get('window');
    return <WebView
      source={{ uri: this.props.url }}
      style={{ width, height }}
      allowsInlineMediaPlayback
      /* originWhitelist={['https://', 'http://', 'ws://', 'wss://']} */
      /* user agent: desktop safari (to play minecraft) */
      userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15"
      mixedContentMode="always" /* allow https to load http */
      mediaPlaybackRequiresUserAction={false}
      keyboardDisplayRequiresUserAction={false}
      /* incognito */
      cacheEnabled={false}
    />
  }
}

export { URLPlayer }
