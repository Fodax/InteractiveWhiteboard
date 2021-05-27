import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import MyCanvas from './components/myCanvas'
import { StyleSheet, Button, View, TextInput, Dimensions } from 'react-native';
import Sender from './services/sendService';
import { lockAsync, OrientationLock } from 'expo-screen-orientation';

export default function App() {
	const [address, setAddress] = useState(null);
	const [ratio, setRatio] = useState(null);
	const [sender, setSender] = useState(null);
	const [isIpEnter, setIsIpEnter] = useState(false);
	const [screen, setScreen] = useState(null);

	useEffect(() => {
		lockAsync(OrientationLock.LANDSCAPE_RIGHT).then(() => {
			setScreen(Dimensions.get("screen"));
		});
	}), [];

	const onMessage = (e) => {
		const obj = JSON.parse(e.data);

		if (obj.hasOwnProperty('Type') && obj.Type === 'Ratio') {
			setRatio(obj.Data);
		}
	};

	const saveIp = () => {
		let newSender = new Sender(`${address}:8080`, onMessage);

		setSender(newSender);
		setIsIpEnter(true);
	};

	const onChangeIP = (ip) => {
		setAddress(ip);
	};

	const next = () => {
		sender.send({
			Type: "SwitchSlide",
    		Data: "Next" 
		});
	};

	const prev = () => {
		sender.send({
			Type: "SwitchSlide",
    		Data: "Previous"
		});
	};

	const sendDots = (array) => {
		sender.send({
			Type: "DrawLine",
			Data: array
		});
	};

	const onFinishLine = () => {
		sender.send({
			Type: "EndLine",
    		Data: null
		});
	};

	const onCleanCanvas = () => {
		sender.send({
			Type: "CleanCanvas",
    		Data: null
		});
	};

	const onChangeBrushParameters = (parameters) => {
		sender.send({
			Type: "ChangeBrushParameters",
    		Data: parameters
		});
	};

	const saveSlide = () => {
		sender.send({
			Type: "SaveSlide",
    		Data: null
		});
	};

	const ipInput = <>
		<MyTextInput placeholder="Введите ip адрес" onChangeText={onChangeIP}/>
		<Button onPress={saveIp} title="Ок"/>
	</>;

	const canvas = screen ? <MyCanvas
		ratio={ratio}
		next={next}
		prev={prev}
		sendDots={sendDots}
		onFinishLine={onFinishLine}
		onCleanCanvas={onCleanCanvas}
		onChangeBrushParameters={onChangeBrushParameters}
		saveSlide={saveSlide}
		screen={screen}
  	/> : null;

  return (
	<View style={styles.container}>
		{ isIpEnter ? canvas : ipInput }

		<StatusBar style="auto" hidden={true} />
	</View>
  );
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center'
	},
	textInput: {
		textAlign: 'center'
	},
	buttonContainer: {
		flexDirection: 'row'
	}
});


const MyTextInput = ({placeholder, onChangeText}) => {
	return <TextInput style={styles.textInput} placeholder={placeholder} onChangeText={onChangeText}/>;
}