import React, { Component } from 'react'
import { PanResponder, View, Text } from 'react-native'
import styled from 'styled-components/native'

const triggerOffset = 100

class Trigger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      reached: false,
      dx: 0,
    }
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
        this.setState({ active: true })
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        // console.log(gestureState)
        this.setState({
          dx: gestureState.dx,
          reached: gestureState.dx > triggerOffset
        })     
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        // console.log(gestureState)
        if (this.state.reached) {
          if (props.onTrigger) props.onTrigger()
        }
        this.setState({ active: false, dx: 0, reached: false })
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  render() {
    return <Container
         opacity={this.props.opacity}
         active={this.state.active}
         reached={this.state.reached}
         dx={this.state.dx}
         {...this._panResponder.panHandlers}
        >
        <Label reached={this.state.reached}>
          { this.state.reached ? "OK" : ( this.props.text || "Hide" ) + " ➠➠➠" }
        </Label>
      </Container>
  }
}

export { Trigger }

const Label = styled.Text`
  color: ${ props => props.reached ? "black" : "white"};;
`

const Container = styled.View`
  opacity: ${ props => props.reached ? 0.8 : (props.opacity || 1) };
  background-color: ${ props => props.reached ? "white" : "black"};
  width: 60;
  height: 60;
  left: ${props => props.active ? 12 + props.dx : props.dx };
  bottom: 0;
  position: absolute;
  justify-content: center;
  align-items: center;
  border: solid 1px white;
  z-index: 100;
`