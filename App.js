import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, StatusBar, ScrollView } from 'react-native';
import { ScreenOrientation } from 'expo';
import styled from 'styled-components/native'

import { Settings, VideoPlayer, URLPlayer, ImagePlayer } from './components/'

ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

const simpleDDP = require("simpleddp");
const ws = require("isomorphic-ws");

//let host = {
//  address: "playmaster.intergestalt.dev",
//  ssl: true
//}


let host = {
  address: "localhost",
  port: 3000,
  ssl: false
}

console.log(`ws${host.ssl ? "s" : ""}://${host.address}:${host.port}/websocket`)

let opts = {
  endpoint: `ws${host.ssl ? "s" : ""}://${host.address}${host.port ? ":"+host.port : ""}/websocket`,
  SocketConstructor: ws,
  reconnectInterval: 5000
};

server = new simpleDDP(opts);

let playerIdSubscription = null

export default function App() {
  const [connected, setConnected] = useState(false);
  const [playerData, setPlayerData] = useState({});
  const [playersMetaData, setPlayersMetaData] = useState([]);
  const [globalData, setGlobalData] = useState({});
  const [mediaData, setMediaData] = useState([]);
  const [playerId, setPlayerId] = useState(null);

  async function sub(playerId) {
    setPlayerId(playerId)
    server.subscribe("players",{playerId, noPingback: true})
    server.collection('players').onChange( newData => {
      if ( newData.added && newData.added.pingtime || newData.changed && newData.changed.fieldsChanged.pingtime ) {
        server.call('playerPingback', playerId);
      }
      setPlayerData( newData.added || newData.changed.next )
    });
  }

  useEffect(() => {

    server.on('connected', () => { setConnected(true); });
    server.on('disconnected', () => { setConnected(false) }); 

    // subscribe to globals
    server.subscribe("globals")
    const globalsReactiveCursor = server.collection('globals').reactive()
    globalsReactiveCursor.onChange( newData => {
      setGlobalData( Object.fromEntries( newData.map(d => [d.name, d.value]) )  )
    })

    // subscribe to player meta
    server.subscribe("playersMeta")
    server.collection('players').reactive().onChange( newData => {
      setPlayersMetaData( [...newData] )
    })     

    // subscribe to media
    server.subscribe("media")
    server.collection('media').reactive().onChange( newData => {
      setMediaData( [...newData] )
    })    
    
  }, []);

  let player = null

  if (playerData) {
    const currentMedia = mediaData.find(media => media.name === playerData.filename)
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

      { !playerId &&
        <Settings players={ playersMetaData } onSetPlayerId={sub} />        
      }

      <ScreenLabel show={ playerData && playerData.show_labels }>
        <Label>
          { playerData && playerData.info }
          </Label>
      </ScreenLabel>
      
      <InfoText pointerEvents="none">
        Host: { host.address }{ "\n" }
        Player: { playerData && playerData.info + " " }[/{ playerId }]{ "\n" }
        Status: { !connected && "not "}connected
      </InfoText>
      
      { false && 
        <ScrollView>
          <DebugText pointerEvents="none">
            { "\n" } PLAYER { JSON.stringify(playerData) }{ "\n" }
            { "\n" } GLOBAL { JSON.stringify(globalData) }{ "\n" }
            { "\n" } MEDIA { JSON.stringify(mediaData) }{ "\n" }
            { "\n" } PLAYERMETA { JSON.stringify(playersMetaData) }{ "\n" }
          </DebugText>
        </ScrollView>
      }

    </Container>
  );
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
  opacity:0.5;
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


