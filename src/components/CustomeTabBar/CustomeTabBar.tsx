// src/components/CustomTabBar/CustomTabBar.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';
import { COLORS } from '../../theme/colors';

interface Props {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<Props> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.wrapper}>
      {Platform.OS === 'ios' ? (
        <BlurView
          blurType="dark"
          blurAmount={20}
          reducedTransparencyFallbackColor="rgba(60,60,60,0.7)"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={styles.androidBlurFallback} />
      )}

      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIcon = (): JSX.Element | null => {
            const color = isFocused ? '#00ff91' : '#aaa';
            switch (route.name) {
              case 'Home':
                return <MaterialIcons name="home" size={22} color={color} />;
              case 'Challenges':
                return <MaterialIcons name="trophy" size={22} color={color} />;
              case 'Analytics':
                return (
                  <MaterialIcons name="chart-bar" size={22} color={color} />
                );
              case 'Feed':
                return (
                  <MaterialIcons name="file-document" size={22} color={color} />
                );
              case 'Profile':
                return <MaterialIcons name="person" size={22} color={color} />;
              default:
                return null;
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tab}
            >
              {getIcon()}
              <Text style={[styles.label, isFocused && styles.labelFocused]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  androidBlurFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(60,60,60,0.7)',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.lightMuted,
    marginTop: 4,
  },
  labelFocused: {
    color: COLORS.brightAccent,
  },
});
