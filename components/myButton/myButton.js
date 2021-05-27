import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const MyButton = ({height, width, onPress, title, fontSize}) => {
    return (
        <TouchableOpacity onPress={onPress} style={{height, width, borderColor: 'red', alignItems: 'center', justifyContent: 'center', borderWidth: 1}}>
            <Text style={{textAlign:'center', textAlignVertical: 'center', fontSize, transform: [{translateY: -fontSize / 4}]}}>{title}</Text>
        </TouchableOpacity>
    );
}

export default MyButton;