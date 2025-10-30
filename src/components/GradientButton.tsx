import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import buttonIcon from '../assets/images/buttonicon.png';

const GradientButton = ({ onPress, text }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.buttonContainer}>
      <LinearGradient
        colors={['#4960F9', '#1433FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <Text style={styles.text}>{text}</Text>

        <ImageBackground
          source={buttonIcon}
          style={styles.arrowBackground}
          imageStyle={{ borderTopRightRadius: 28, borderBottomRightRadius: 28 }}
        >
          <Text style={styles.arrow}>➝</Text>
        </ImageBackground>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    height: 75,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    paddingLeft: 20,
    borderRadius: 28,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrowBackground: {
    width: 150,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#fff',
    fontSize: 34,
  },
});

export default GradientButton;
