import React, {PureComponent} from 'react';
import { StyleSheet, Text, View, StatusBar, ScrollView, AsyncStorage } from 'react-native';
import { ScreenOrientation } from 'expo';
import styled from 'styled-components/native'

import { retrieveData, storeData } from './helpers'
import { Trigger, Settings, VideoPlayer, URLPlayer, ImagePlayer } from './components/'

ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

const simpleDDP = require("simpleddp");
const ws = require("isomorphic-ws");

const hosts = {
  intergestalt: {
    address: "playmaster.intergestalt.dev",
    ssl: true
  },
  localhost: {
    address: "localhost",
    port: 3000,
    ssl: false
  }
}

let host = hosts.intergestalt

let endpoint = `ws${host.ssl ? "s" : ""}://${host.address}${host.port ? ":"+host.port : ""}/websocket`

console.log(endpoint)

let opts = {
  endpoint,
  SocketConstructor: ws,
  reconnectInterval: 5000
};

const server = new simpleDDP(opts);

let playerIdSubscription = null
let playerIdOnChange = null

export default class App extends PureComponent {
  constructor() {
    super()
    this.state = {
      connected: false,
      playerData: {},
      playersMetaData: [],
      globalData: {},
      mediaData: [],
      playerId: null,
      showSettings: true,
    }
  }

  sub = (pId) => {
    if (playerIdSubscription) {
      playerIdSubscription.stop()
      playerIdSubscription.remove()
    }
    if (playerIdOnChange) {
      playerIdOnChange.stop()
    }
    this.setState({playerId: pId})
    storeData("playerId", pId)
    playerIdSubscription = server.subscribe("players",{playerId: pId, noPingback: true})
    // register player change event function
    playerIdOnChange = server.collection('players').onChange(newData => {
      if ( newData.added && newData.added.pingtime || newData.changed && newData.changed.fieldsChanged.pingtime ) {
        server.call('playerPingback', pId);
      }
      this.setState({playerData: ( newData.added || newData.changed.next )})
    });    

  }

  componentDidMount() {

    console.log("mount")

    server.on('connected', () => { this.setState({connected: true}) });
    server.on('disconnected', () => { this.setState({connected: false}) });

    // subscribe to globals
    server.subscribe("globals")
    server.collection('globals').reactive().onChange( newData => {
      this.setState({globalData: Object.fromEntries( newData.map(d => [d.name, d.value]) )  })
    })

    // subscribe to player meta
    server.subscribe("playersMeta").onReady( async () => {
      const savedPlayerId = await retrieveData("playerId")
      const players = (server.collection('players').filter( doc => (doc.id === savedPlayerId) ).fetch())
      if (players.length === 1) {
        this.sub(savedPlayerId)
      }
    })
    server.collection('players').reactive().onChange( newData => {
      this.setState({playersMetaData: [...newData].sort( (a,b) => (a.info > b.info)) })
    })     

    // subscribe to media
    server.subscribe("media")
    server.collection('media').reactive().onChange( newData => {
      this.setState({mediaData: [...newData] })
    })    

  }

  render() {
    player = null
    let playerData = this.state.playerData

    if (playerData) {
      const currentMedia = this.state.mediaData.find(media => media.name === playerData.filename)
      if (currentMedia) {
        const mediaserver_address = playerData.mediaserver_address
        switch(currentMedia.target) {
          case "video": player = 
            <VideoPlayer 
              url={ "http://" + mediaserver_address + currentMedia.url }
              volume={ playerData.volume }
              state={ playerData.state }
              loop={ Array.isArray(playerData.loop) && playerData.loop.indexOf(currentMedia.name) >= 0 }
              onPlayerStateChanged={ state => server.call('setState', { playerId, state }) }
            />
          break;
          case "iframe": player = 
            <URLPlayer 
              url={ currentMedia.url }
              state={ playerData.state }
            />
          break;
          case "img": player = 
            <ImagePlayer 
              url={ currentMedia.url }
              state={ playerData.state }
            />
          break;        
          default: player = <DebugText> *** </DebugText>
        }
      }
    }

    return (
      <Container>
        
        <StatusBar 
          hidden={true}
        />
        
        <Fullscreen>
          { player }
        </Fullscreen>
        
        <Faceplate 
          show={ playerData && playerData.state === "stop" }
        />

        { this.state.showSettings &&
          <Settings 
            players = { this.state.playersMetaData } 
            onSetPlayerId={this.sub}
            playerId = { this.state.playerId }
            hostname = { host.address }
            connected = { this.state.connected }
          />
        }

        <Trigger 
          onTrigger={ () => this.setState({ showSettings: !this.state.showSettings }) } 
          visible={this.state.showSettings}
        />

        <ScreenLabel show={ playerData && playerData.show_labels }>
          <Label>
            { playerData && playerData.info }
            </Label>
        </ScreenLabel>

        <InfoText pointerEvents="none">
          {/*
          Host: { host.address }{ "\n" }
          Player: { playerData && playerData.info + " " }[/{ this.state.playerId }]{ "\n" }
          Status: { !this.state.connected && "not "}connected
          */}
        </InfoText>
        
        { false && 
          <ScrollView>
            <DebugText pointerEvents="none">
              { "\n" } PLAYER { JSON.stringify(this.state.playerData) }{ "\n" }
              { "\n" } GLOBAL { JSON.stringify(this.state.globalData) }{ "\n" }
              { "\n" } MEDIA { JSON.stringify(this.state.mediaData) }{ "\n" }
              { "\n" } PLAYERMETA { JSON.stringify(this.state.playersMetaData) }{ "\n" }
            </DebugText>
          </ScrollView>
        }

      </Container>
    );
  }
}

const Container = styled.View`
  flex: 1;
  background-color: #333;
  color: #fff;
  align-items: center;
  justify-content: center;
`

const InfoText = styled.Text`
  position: absolute;
  left: 10;
  top: 10;
  color: #fff;
  text-align: left;
  font-weight: bold;
  opacity: 0.5;
  text-shadow-color: rgba(0, 0, 0, 1);
  text-shadow-radius: 5;
`

const DebugText = styled.Text`
  color: #fff;
  text-align: center;
  opacity:0.6;
`

const Fullscreen = styled.View`
  background-color: #000;
  width: 100%;
  height: 100%;
  position: absolute;
  align-items: center;
  justify-content: center;  
`

const Faceplate = styled.View`
  display: ${ props => props.show ? 'flex' : 'none' };
  background-color: #000;
  width: 100%;
  height: 100%;
  position: absolute;
  align-items: center;
  justify-content: center;  
`

const ScreenLabel = styled.View`
  display: ${ props => props.show ? 'flex' : 'none' };
  width: 100%;
  height: 100%;
  position: absolute;
  align-items: center;
  justify-content: center;  
`

const Label = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 30;
`


