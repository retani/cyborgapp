import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { ScreenOrientation } from 'expo';
import styled from 'styled-components/native'

import { VideoPlayer } from './components/VideoPlayer'

ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

const simpleDDP = require("simpleddp");
const ws = require("isomorphic-ws");

//let host = "192.168.0.137:3000"
let host = "playmaster.intergestalt.dev"
let playerId = "audience"

let opts = {
  endpoint: `wss://${host}/websocket`,
  SocketConstructor: ws,
  reconnectInterval: 5000
};

export default function App() {
  const [connected, setConnected] = useState(false);
  const [playerData, setPlayerData] = useState({});
  const [globalData, setGlobalData] = useState({});
  const [mediaData, setMediaData] = useState([]);

  useEffect(() => {

    server = new simpleDDP(opts);

    server.on('connected', () => { setConnected(true); });
    server.on('disconnected', () => { setConnected(false) });

    // subscribe to globals
    server.subscribe("globals")
    const globalsReactiveCursor = server.collection('globals').reactive()
    globalsReactiveCursor.onChange( newData => {
      setGlobalData( Object.fromEntries( newData.map(d => [d.name, d.value]) )  )
    })
    
    // subscribe to player
    server.subscribe("players",{playerId, noPingback: true})
    server.collection('players').onChange( newData => {
      if ( newData.added && newData.added.pingtime || newData.changed && newData.changed.fieldsChanged.pingtime ) {
        server.call('playerPingback', playerId);
      }
      setPlayerData( newData.added || newData.changed.next )
    });

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
        case "video": player = <VideoPlayer 
                          url={ "http://" + mediaserver_address + currentMedia.url }
                          volume={ playerData.volume }
                          state={ playerData.state }
                          loop={ Array.isArray(playerData.loop) && playerData.loop.indexOf(currentMedia._id) >= 0 }
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
      <InfoText>
        Host: { host }{ "\n" }
        Player: { playerData && playerData.info + " " }[/{ playerId }]{ "\n" }
        Status: { !connected && "not "}connected
      </InfoText>
      <DebugText>
        { "\n" } PLAYER { JSON.stringify(playerData) }{ "\n" }
        { "\n" } GLOBAL { JSON.stringify(globalData) }{ "\n" }
        { "\n" } MEDIA { JSON.stringify(mediaData) }{ "\n" }
      </DebugText>
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
  color: #fff;
  text-align: left;
  font-weight: bold;
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