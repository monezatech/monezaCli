import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Switch} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../store/index';
import {setLanguage, onToggleTheme} from '../../store/SettingSlice';
import {useNavigation, useTheme} from '@react-navigation/native';
import i18n from '../../i18n/i18n';
import {useTranslation} from 'react-i18next';

type Props = {
  toggleTheme: () => void;
};

export default function SettingsScreen({toggleTheme}: Props) {
  const {t} = useTranslation();
  const language = useSelector((state: RootState) => state.settings.language);

  const dispatch = useDispatch();
  const {colors} = useTheme();
  const handleThemeChange = () => {
    dispatch(onToggleTheme());
    toggleTheme();
  };

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const isDarkTheme = useSelector(
    (state: RootState) => state.settings.isDarkMode,
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, {color: colors.text}]}>
        {t('select_language')}
      </Text>
      <Picker
        selectedValue={language}
        onValueChange={lang => dispatch(setLanguage(lang))}
        style={[styles.picker, {color: colors.text}]}
        dropdownIconColor={colors.text}
        mode="dropdown">
        <Picker.Item label={t('en')} value="en" />
        <Picker.Item label={t('es')} value="es" />
        <Picker.Item label={t('fr')} value="fr" />
        <Picker.Item label={t('hi')} value="hi" />
      </Picker>

      <View style={styles.themeContainer}>
        <Text style={[styles.label, {color: colors.text}]}>Theme</Text>
        <Switch value={isDarkTheme} onValueChange={handleThemeChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  label: {fontSize: 18, marginBottom: 10},
  picker: {height: 70, width: '100%', borderRadius: 12},
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
});
