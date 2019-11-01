import React, {PureComponent} from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native'

class Settings extends PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  renderButton(player) {
    return <TouchableOpacity
        key={player.id}
        onPress={() => this.props.onSetPlayerId(player.id)}
      >
      <Label> {player.info} </Label>
    </TouchableOpacity>
  }

  render() {
    const buttons = this.props.players.map( player => this.renderButton(player) )
    return <View>
      { buttons }
    </View>
  }
}

export { Settings }

const Label = styled.Text`
  color: white;
  font-weight: bold;
  paddingVertical: 5;
`
