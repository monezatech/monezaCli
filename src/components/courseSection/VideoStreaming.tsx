import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';

const STORAGE_KEY = 'video_last_position';

const VideoStreamingScreen = ({
  source,
  thumbnail,
  endThumbnail,
  fullViewd,
}) => {
  const playerRef = useRef(null);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [lastPosition, setLastPosition] = useState(0);
  const [showEndThumbnail, setShowEndThumbnail] = useState(false);

  useEffect(() => {
    const loadPosition = async () => {
      try {
        const savedTime = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTime) {
          const parsed = parseFloat(savedTime);
          if (!isNaN(parsed)) setLastPosition(parsed);
        }
      } catch (e) {
        console.warn('Error loading saved time', e);
      }
    };
    loadPosition();
  }, []);

  const handleProgress = async data => {
    setCurrentTime(data.currentTime);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, data.currentTime.toString());
    } catch (e) {
      console.warn('Error saving current time', e);
    }
  };

  const handleLoad = () => {
    if (playerRef.current && lastPosition > 0) {
      playerRef.current.seek(lastPosition);
    }
  };

  const handleEnd = () => {
    if (!isVideoCompleted) {
      setIsVideoCompleted(true);
      setShowEndThumbnail(true);
      fullViewd?.(true); // Mark lesson as watched in parent
      AsyncStorage.removeItem(STORAGE_KEY); // Clear position
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoWrapper}>
        {!showEndThumbnail ? (
          <Video
            ref={playerRef}
            source={{ uri: source }}
            style={styles.video}
            controls
            resizeMode="contain"
            paused={paused}
            onProgress={handleProgress}
            onLoad={handleLoad}
            onEnd={handleEnd}
            onError={error => console.error('Video Error:', error)}
          />
        ) : (
          <FastImage
            source={{ uri: endThumbnail || thumbnail }}
            style={styles.thumbnail}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  videoWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
});

export default VideoStreamingScreen;
