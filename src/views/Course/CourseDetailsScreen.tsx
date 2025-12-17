import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import VideoStreamingScreen from '../../components/courseSection/VideoStreaming';
import LectureItem from '../../components/courseSection/LectureItem';
import { apiService } from '../../services/service';
import { useSelector, TypedUseSelectorHook, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import * as Progress from 'react-native-progress';
import { setCourse } from '../../store/selectedCourseSlice';

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CourseDetailsScreen = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [video, setVideo] = useState<string | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);

  const token = useTypedSelector(state => state.auth.token);
  const refCourse = useTypedSelector(state => state.globalState.id);

  const navigation: any = useNavigation(); // cast to any to avoid TS nav typing issues in this snippet
  const dispatch = useDispatch();

  const getCourseLessons = async () => {
    if (!refCourse) {
      // no course id available yet
      setCourses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiService.getLessonById({ token, refCourse });

      // Defensive checks
      const lessons = Array.isArray(res?.lessons) ? res.lessons : [];
      setCourses(lessons);

      // If API returns purchase status, set it; fallback false
      if (typeof res?.hasPurchased === 'boolean') {
        setHasPurchased(res.hasPurchased);
      } else {
        // fallback or determine purchase from response
        setHasPurchased(false);
      }

      if (lessons.length > 0) {
        const first = lessons[0];
        console.log('First lesson:', first);
        setVideo(first.videoUrl ?? first.video ?? null);
        setThumb(first.thumbUrl ?? first.thumbnail ?? null);
        setCurrentLessonId(first._id ?? null);
        console.log('Video URL:', first.videoUrl ?? first.video);
        console.log('Thumb URL:', first.thumbUrl ?? first.thumbnail);
      } else {
        // reset if no lessons
        setVideo(null);
        setThumb(null);
        setCurrentLessonId(null);
      }
    } catch (error) {
      console.log('Error fetching courses', error);
      Alert.alert('Error', 'Unable to fetch course lessons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch whenever token or refCourse changes
    getCourseLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refCourse]);

  const handleLecturePress = (item: any, index: number) => {
    const locked = index !== 0 && !hasPurchased;

    if (locked) {
      Alert.alert('Locked', 'Buy the course to unlock this lecture.');
      return;
    }

    // Animate and set the selected video
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (e) {
      // LayoutAnimation can throw on some platforms - ignore safely
      // console.log('LayoutAnimation error', e);
    }

    setVideo(item.videoUrl ?? item.video ?? null);
    setThumb(item.thumbUrl ?? item.thumbnail ?? null);
    setCurrentLessonId(item._id ?? null);
  };

  const buyCourse = (course: any | null) => {
    // If you want to dispatch whole course object, pass a proper object; otherwise pass id
    if (course && typeof course === 'object') {
      dispatch(setCourse(course));
    } else if (refCourse) {
      // fallback: dispatch minimal info
      dispatch(setCourse({ id: refCourse }));
    }

    // Navigate to Buy screen, with some params if needed
    navigation.navigate('BuyNowScreen' as never);
  };

  const completedLectures = courses.filter(c => c?.watched === true).length;
  const progress = courses.length > 0 ? completedLectures / courses.length : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading Course...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={22} color="#333" />
      </TouchableOpacity>

      {/* Video Player */}
      <View style={{ height: 250 }}>
        <VideoStreamingScreen
          source={video}
          thumbnail={thumb}
          endThumbnail={thumb}
          fullViewd={() => {}}
        />
      </View>

      {/* Progress */}
      {(hasPurchased || completedLectures > 0) && (
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 14, marginBottom: 6 }}>Course Progress</Text>
          <Progress.Bar
            progress={progress}
            width={null}
            height={10}
            color="#4f46e5"
            borderRadius={8}
            unfilledColor="#e5e7eb"
          />
        </View>
      )}

      {/* Lessons */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionHeaderText}>Course Lectures</Text>

        {courses.length === 0 && (
          <View style={{ padding: 16 }}>
            <Text style={{ color: '#666' }}>
              No lessons found for this course.
            </Text>
          </View>
        )}

        {courses.map((item, index) => {
          const locked = index !== 0 && !hasPurchased;
          return (
            <TouchableOpacity
              key={item._id ?? `lesson-${index}`}
              onPress={() => handleLecturePress(item, index)}
              style={[styles.lectureCard, locked && { opacity: 0.7 }]}
              disabled={locked}
            >
              <LectureItem
                number={index + 1}
                title={item.title ?? 'Untitled'}
                type={item.type}
                accessType={locked ? 'locked' : 'unlocked'}
                duration={item.duration}
                fullViewd={item.watched}
              />
              {locked && (
                <MaterialIcons
                  name="lock"
                  size={18}
                  color="#9ca3af"
                  style={{ position: 'absolute', right: 16, top: '40%' }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Buy Button */}
      {!hasPurchased && (
        <View style={styles.buyContainer}>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => buyCourse(courses[0] ?? null)}
            disabled={courses.length === 0}
          >
            <MaterialIcons
              name="shopping-cart"
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buyButtonText}>Buy Full Course</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CourseDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 80,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  lectureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buyContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  buyButton: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
