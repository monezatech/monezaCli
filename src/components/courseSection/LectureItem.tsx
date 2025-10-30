import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Progress from 'react-native-progress';

const LectureItem = ({
  number,
  title,
  type,
  duration,
  fullViewd,
  accessType, // free | preview | locked
}) => {
  const displayType = type
    ? type.charAt(0).toUpperCase() + type.slice(1)
    : 'Unknown';

  const renderBadge = type => {
    const color =
      type === 'free' ? '#10b981' : type === 'preview' ? '#f59e0b' : '#ef4444';
    return (
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{type?.toUpperCase()}</Text>
      </View>
    );
  };

  const isLocked = accessType === 'locked';

  return (
    <View
      style={[
        styles.container,
        isLocked && { opacity: 0.6 }, // dim locked cards
      ]}
    >
      <View style={styles.indexCircle}>
        <Text style={styles.indexText}>{number}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title || 'Untitled Lecture'}</Text>

        <View style={styles.metaRow}>
          <MaterialCommunityIcons
            name={
              type === 'video'
                ? isLocked
                  ? 'lock'
                  : 'play-circle-outline'
                : 'file-document-outline'
            }
            size={18}
            color={isLocked ? '#ef4444' : '#6b7280'}
          />
          <Text style={styles.metaText}>
            {displayType} · {duration || '0 min'}
          </Text>
        </View>

        {accessType && renderBadge(accessType)}
      </View>

      {fullViewd && !isLocked && (
        <Progress.Circle
          size={24}
          progress={1}
          showsText={false}
          color="#10b981"
          unfilledColor="#e5e7eb"
          borderWidth={0}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  indexCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  indexText: { color: '#fff', fontWeight: '600' },
  content: { flex: 1 },
  title: { fontSize: 16, color: '#1f2937', fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 13, color: '#6b7280', marginLeft: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default LectureItem;
