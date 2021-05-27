import React, { useState, useEffect, useRef } from 'react';
import { PixelRatio, View, Text, StatusBar } from 'react-native';
import Slider from '@react-native-community/slider';
import MyButton from '../myButton';
import { GLView } from 'expo-gl';
import Expo2DContext from 'expo-2d-context';
import {Picker} from '@react-native-picker/picker';

const heightStatusBar = StatusBar.currentHeight;
const pixelRatio = PixelRatio.get();

const MyCanvas = ({ratio, prev, next, sendDots, onFinishLine, onCleanCanvas, onChangeBrushParameters, saveSlide, screen}) => {
	const [width, setWidth] = useState(null);
	const [height, setHeight] = useState(null);
	const [screenHeight, setScreenHeight] = useState(Math.min(screen.height, screen.width));
	const [screenWidth, setScreenWidth] = useState(Math.max(screen.height, screen.width));
	const [slideButtonWidth, setSlideButtonWidth] = useState(null);
	const [buttonHeight, setButtonHeight] = useState(null);
	const [brushSize, setBrushSize] = useState(5);
	const [brushOpacity, setBrushOpacity] = useState(1);
	const [brushColor, setBrushColor] = useState('0, 0, 0');
	const [isDrawing, setIsDrawing] = useState(false);
	const [dots, setDots] = useState([]);
	const ctx = useRef(null);
	
	useEffect(() => {
		if (screenHeight > screenWidth) {

			const temp = screenWidth;
			setScreenWidth(screenHeight);
			setScreenHeight(temp);
		}
	}, [screenHeight, screenWidth]);

	useEffect(() => {
		const newSlideButtonWidth = screenWidth / 9;
		const newButtonHeight = screenHeight / 8;

		setSlideButtonWidth(newSlideButtonWidth);
		setButtonHeight(newButtonHeight);

		let newHeight = screenHeight - newButtonHeight * 2;
		let newWidth = newHeight * ratio;

		if (newWidth > screenWidth - newSlideButtonWidth * 2) {
			newWidth = screenWidth - newSlideButtonWidth * 2;
			newHeight = newWidth / ratio;
		}

		setHeight(newHeight);
		setWidth(newWidth);
	}, [ratio]);

	handleCanvas = (gl) => {
		const context = new Expo2DContext(gl);

		context.lineCap = 'round';
		context.strokeStyle = `rgb(${brushColor})`;
		context.fillStyle = `rgb(${brushColor})`;
		context.lineWidth = brushSize;
		context.scale(pixelRatio, pixelRatio);

	  	ctx.current = context;
	}

	const isOutOfCanvas = (x, y) => {
		const left = (screen.width - width - heightStatusBar) / 2;
		const right = left + width;
		const top = buttonHeight;
		const bottom = top + height;

		return x < left || x > right || y < top || y > bottom;
	};

	const startDrawing = ({nativeEvent}) => {
		if (nativeEvent.identifier !== 0) {
			return;
		}

		const {locationX, locationY} = nativeEvent;

		ctx.current.beginPath();
		ctx.current.moveTo(locationX, locationY);
		setIsDrawing(true);
	};

	const finishDrawing = ({nativeEvent}) => {
		if (nativeEvent.identifier !== 0) {
			return;
		}

		if (dots.length > 0) {
			sendDots(dots);
			setDots([]);
		}

		onFinishLine();
		
		ctx.current.closePath();
		setIsDrawing(false);
	};

	const draw = ({nativeEvent}) => {
		if (!isDrawing || nativeEvent.identifier !== 0) {
			return;
		}

		const {locationX, locationY} = nativeEvent;
		const {pageX, pageY} = nativeEvent;

		if (isOutOfCanvas(pageX, pageY)) {
			ctx.current.closePath();
			setIsDrawing(false);

			return;
		}

		const x = locationX / width;
		const y = locationY / height;

		dots.push([x, y]);

		if (dots.length >= 10) {
			sendDots(dots);
			setDots([]);
		}

		ctx.current.lineTo(locationX, locationY);
		ctx.current.stroke();
		ctx.current.flush();
	};

	const clear = () => {
		onCleanCanvas();

		ctx.current.clearRect(0, 0, width * pixelRatio, height * pixelRatio);
		ctx.current.flush();
	};

	const onBrushSizeChange = (size) => 
	{
		const rgb = brushColor.split(', ').map((e) => +e);
		
		onChangeBrushParameters([size * pixelRatio, ...rgb, Math.round(brushOpacity * 255)]);

		setBrushSize(size);
		ctx.current.lineWidth = size;
	};

	const onBrushOpacityChange = (opacity) => {
		const rgb = brushColor.split(', ').map((e) => +e);
		
		onChangeBrushParameters([brushSize * pixelRatio, ...rgb, Math.round(opacity * 255)]);

		setBrushOpacity(opacity);
		ctx.current.globalAlpha = opacity;
	};

	const onBrushColorChange = (color) => {
		const rgb = color.split(', ').map((e) => +e);
		
		onChangeBrushParameters([brushSize * pixelRatio, ...rgb, Math.round(brushOpacity * 255)]);

		setBrushColor(color);

		ctx.current.strokeStyle = `rgb(${color})`;
		ctx.current.fillStyle = `rgb(${color})`;
	};

	const canvas = (ratio && screen && width && height && slideButtonWidth && buttonHeight) ? <View style={{flexDirection: 'row', justifyContent: 'space-between', height: screenHeight, width: screenWidth}}>
			<MyButton onPress={prev} heigh={screenHeight} width={slideButtonWidth} fontSize={40} title='<'/>
			<View style={{alignItems: 'center', width: screenWidth - slideButtonWidth * 2, height: screenHeight}}>
				<View style={{flexDirection: 'row'}}>
					<MyButton onPress={clear} height={buttonHeight} width={(screenWidth - slideButtonWidth * 2) / 2} fontSize={20} title='Стереть'/>
					<MyButton onPress={saveSlide} height={buttonHeight} width={(screenWidth - slideButtonWidth * 2) / 2} fontSize={20} title='Сохранить'/>
				</View>
				<GLView
					style={{width, height, borderWidth: 1}}
					onContextCreate={handleCanvas}
					onStartShouldSetResponder={() => true}
					onMoveShouldSetResponder={() => true}
					onResponderStart={startDrawing}
					onResponderRelease={finishDrawing}
					onResponderMove={draw}
				/>
				<View style={{flexDirection: 'row', justifyContent: 'space-around', width: screenWidth - slideButtonWidth * 2}}>
					<View>
						<View style={{flexDirection: 'row'}}>
							<Text>Толщина кисти</Text>
							<Slider
								style={{width: 100}}
								minimumValue={1}
								maximumValue={100}
								minimumTrackTintColor="#1EB1FC"
								maximumTractTintColor="#1EB1FC"
								step={1}
								value={5}
								onValueChange={value => onBrushSizeChange(value)}
								thumbTintColor="#1EB1FC"
							/>
							<Text>{brushSize}</Text>
						</View>
						<View style={{flexDirection: 'row'}}>
							<Text>Прозрачность</Text>
							<Slider
								style={{width: 100}}
								minimumValue={0}
								maximumValue={1}
								minimumTrackTintColor="#1EB1FC"
								maximumTractTintColor="#1EB1FC"
								step={0.1}
								value={1}
								onValueChange={value => onBrushOpacityChange(value)}
								thumbTintColor="#1EB1FC"
							/>
							<Text>{brushOpacity.toFixed(1)}</Text>
						</View>
					</View>
					<Picker
						style={{width: 200}}
						selectedValue={brushColor}
						onValueChange={onBrushColorChange}
					>
						<Picker.Item label="Black" value='0, 0, 0' color='rgb(0, 0, 0)' />
						<Picker.Item label="Red" value='255, 0, 0' color='rgb(255, 0, 0)' />
						<Picker.Item label="Green" value='0, 255, 0' color='rgb(0, 255, 0)' />
						<Picker.Item label="Blue" value='0, 0, 255' color='rgb(0, 0, 255)' />
					</Picker>
				</View>
			</View>
			<MyButton onPress={next} heigh={screenHeight} width={slideButtonWidth} fontSize={40} title='>'/>
		</View> : null;
  
	return canvas;
}

export default MyCanvas;