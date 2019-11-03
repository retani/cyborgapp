import React, {PureComponent} from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native'

class Settings extends PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  renderButton(player, isActive) {
    return <TouchableOpacity
        key={player.id}
        onPress={() => this.props.onSetPlayerId(player.id)}
      >
      <Label active = {isActive}>
        {player.info}
        {/*&nbsp;
        [/{player.id}]*/}
      </Label>
    </TouchableOpacity>
  }

  render() {
    const buttons = this.props.players.map( player => this.renderButton(player, this.props.playerId === player.id ) )
    return <Container>
      <Label>
        { this.props.hostname }
      </Label>
      <Label>
        <Tag good={this.props.connected} >
          &nbsp;
          { this.props.connected ? "connected" : "disconnected"}
          &nbsp;
        </Tag> 
      </Label>     
      <Line />
      <View>
        { buttons }
      </View>
    </Container>
  }
}

export { Settings }

const Container = styled.View`
  left:70;
  top:5;
  position: absolute;
`

const Label = styled.Text`
  color: white;
  font-weight: bold;
  paddingVertical: 5;
  paddingHorizontal: 10;
  border-radius: 4;
  opacity:0.9;
  text-shadow-color: rgba(0, 0, 0, 1);
  text-shadow-radius: 5;  
  ${ props => props.active ? "border: 2px solid white; left: -2" : null }
`

const Line = styled.View`
  width: 200;
  border-bottom-width: 2;
  paddingVertical: 2;
  margin-bottom: 7;
  border-style: solid;
  border-color: white;
`

const Tag = styled(Label)`
  border-radius: 4;
  background-color: ${ props => props.good ? "green" : "red"}
`