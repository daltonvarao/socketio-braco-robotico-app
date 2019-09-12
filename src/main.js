import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Slider, TextInput, ToastAndroid, Vibration } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import io from 'socket.io-client'
import { mapper } from './services/utils'

const colors = {
  danger: 'rgba(220, 53, 69, 0.9)',
  success: 'rgba(40, 167, 69, 0.9)',
  primary: '#006df099',
  secondary: '#006df099',
  dark: '#333333',
  backgroundColor: '#f5fcff',
  white: 'white'
}


export default class Main extends Component {

  state = {
    garraValue: 20,
    frontValue: 10,
    accelerometerData: {},
    socketURLConnection: '',
    connected: false, 
    socket: ''
  }

  componentDidMount() {
    Accelerometer.setUpdateInterval(10);
    Accelerometer.addListener(accelerometerData => {
      this.sendAccelerometerData(accelerometerData);
    });
  }

  sendAccelerometerData( accelerometerData ) {
    if (this.state.connected){
      let { x, y } = accelerometerData;
      this.setState({ accelerometerData });

      this.state.socket.emit('y-axis', mapper(y, -1, 1, 0, 100));
      this.state.socket.emit('x-axis', mapper(x, -1, 1, 0, 140));
    }
  }
  sendEstadoGarra = (garraValue) => {
    this.setState({ garraValue })
    this.state.socket.emit('estado-garra', garraValue);
  }

  sendEstadoFront = (frontValue) => {
    this.setState({ frontValue })
    this.state.socket.emit('estado-front', frontValue);
  }

  connectWithSocketServer = () => {
    const { socketURLConnection } = this.state;
    
    const socket = io(`http://${socketURLConnection}`, {
      forceNew: true
    });

    socket.on('connect', () => {
      this.setState({ connected: true, socket });
      ToastAndroid.show('Conectado!', ToastAndroid.LONG);
      Vibration.vibrate(100);
    });
  }

  disconnectSocketServer = () => {
    const { socket } = this.state;
    socket.disconnect();

    this.setState({ socket, connected: false });
    ToastAndroid.show('Desconectado!', ToastAndroid.LONG);
    Vibration.vibrate(100);
  }


  renderConnectionButton () {
    if (this.state.connected){
      return (
        <TouchableOpacity onPress={this.disconnectSocketServer}>
          <Text style={{ color: colors.danger }}>× desconectar</Text>
        </TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity onPress={this.connectWithSocketServer}>
          <Text style={{ color: colors.success }}>conectar</Text>
        </TouchableOpacity>
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.connectionContainer}> 
          <Text style={{color: colors.primary, marginTop: 20}}>Braço Robótico App</Text>
          <TextInput
            placeholder={'Endereço de IP do braço robótico'}
            style={styles.input}
            placeholderTextColor={colors.primary}
            onChangeText={(socketURLConnection) => { this.setState({ socketURLConnection }) }}
            onSubmitEditing={this.connectWithSocketServer}
            on
          />
          <Text style={styles.connectionText}>IP do braço robótico: {this.state.socketURLConnection}</Text>
          <Text style={this.state.connected? styles.successText : styles.dangerText }>{this.state.connected ? '● conectado' : '× desconectado' }</Text>
        </View>

        <Slider
          style={styles.verticalSlider}
          width={300}
          height={300}
          maximumTrackTintColor={colors.primary}
          minimumTrackTintColor={colors.primary}
          thumbTintColor={colors.primary}
          minimumValue={10}
          maximumValue={55}
          step={1}
          onValueChange={(frontValue) => { this.sendEstadoFront(frontValue) }}
          disabled={ !this.state.connected }
        />
        <Text style={styles.connectionText}>Frente: {this.state.frontValue}</Text>

        <Slider
          style={styles.horizontalSlider}
          width={300}
          height={20}
          maximumTrackTintColor={colors.primary}
          minimumTrackTintColor={colors.primary}
          thumbTintColor={colors.primary}
          minimumValue={20}
          maximumValue={90}
          step={1}
          onValueChange={(garraValue) => { this.sendEstadoGarra(garraValue) }}
          disabled={ !this.state.connected }
        />
        <Text style={styles.connectionText}>Garra: {this.state.garraValue}</Text>
        
        {this.renderConnectionButton()}
      
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20
  },

  garraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  garra: {
    borderColor: colors.primary ,
    borderWidth: 2,
    borderRadius: 5,
    padding: 20,
    width: 200,
    alignItems: 'center',
  },
  
  garraText: {
    color: colors.primary
  },

  axisContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  

  verticalSlider: {
    transform: [ { rotate: "-90deg" } ],
    alignSelf: 'center',
  },

  horizontalSlider: {
    alignSelf: 'center',
  },

  input: {
    borderColor: colors.primary,
    borderWidth: 1,
    padding: 15,
    color: colors.primary,
    alignSelf: 'stretch',
    marginTop: 20,
    borderRadius: 5,
    marginBottom: 20,
  },

  connectionContainer: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  connectionText: {
    color: colors.primary,
    marginBottom: 5
  },

  successText: {
    color: colors.success,
    marginBottom: 5
  },

  dangerText: {
    color: colors.danger,
    marginBottom: 5
  },

});
