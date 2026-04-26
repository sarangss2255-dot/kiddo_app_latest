import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useAuth } from '../AuthContext';
import { Trophy, Star, Clock, CheckCircle2, LogOut } from 'lucide-react-native';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Task } from '../types';

function TaskCard({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) {
  const animatedStyle = useAnimatedStyle(() => {
    const isCompleted = task.status === 'completed';
    return {
      transform: [
        { scale: withSpring(isCompleted ? 0.95 : 1, { damping: 15 }) },
      ],
      opacity: withTiming(isCompleted ? 0.6 : 1, { duration: 400 }),
      backgroundColor: withTiming(isCompleted ? '#f8fafc' : '#ffffff', { duration: 400 }),
    };
  });

  return (
    <Animated.View 
      entering={FadeInDown.springify().damping(15)}
      exiting={FadeOut.duration(300)}
      layout={LinearTransition.springify().damping(15)}
      style={[styles.taskCard, task.status === 'completed' && styles.taskCompleted, animatedStyle]}
    >
      <View style={styles.taskInfo}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            {task.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{task.category}</Text>
              </View>
            )}
            <Text style={styles.taskTitle}>{task.title}</Text>
          </View>
          <Text style={styles.taskDesc}>{task.description}</Text>
          {task.dueDate && (
            <View style={styles.dueDateBadge}>
              <Clock color="#94a3b8" size={12} />
              <Text style={styles.dueDateText}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
            </View>
          )}
        </View>
        <View style={styles.pointsInfo}>
          <Text style={styles.pointsValue}>+{task.points}</Text>
          <Text style={styles.pointsLabel}>PTS</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {task.status === 'pending' ? (
          <TouchableOpacity 
            onPress={() => onComplete(task.id)}
            style={styles.completeBtn}
          >
             <CheckCircle2 color="#fff" size={20} />
             <Text style={styles.completeBtnText}>I'm Done!</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitingBadge}>
            <Clock color="#059669" size={16} />
            <Text style={styles.waitingText}>Waiting for Parent</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export default function KidDashboard() {
  const { profile } = useAuth();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'tasks'),
      where('assignedTo', '==', profile.uid),
      where('status', 'in', ['pending', 'completed'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(taskList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'completed',
        completedAt: Date.now()
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Trophy color="#fff" size={32} />
          </View>
          <View>
            <Text style={styles.greeting}>Hi, {profile?.displayName}!</Text>
            <View style={styles.pointsBadge}>
              <Star color="#f59e0b" fill="#f59e0b" size={16} />
              <Text style={styles.pointsText}>{profile?.points || 0} Points</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => auth.signOut()} style={styles.logoutBtn}>
          <LogOut color="#94a3b8" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Your Missions</Text>
        
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onComplete={handleCompleteTask} />
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        <View style={styles.navItemActive}>
          <Trophy color="#0ea5e9" size={24} />
          <Text style={styles.navTextActive}>Missions</Text>
        </View>
        <View style={styles.navItem}>
          <Star color="#94a3b8" size={24} />
          <Text style={styles.navText}>Rewards</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#fbbf24',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-3deg' }],
  },
  greeting: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0c4a6e',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
    gap: 6,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0369a1',
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#075985',
    marginBottom: 20,
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderBottomWidth: 6,
    borderBottomColor: '#bae6fd',
  },
  taskCompleted: {
    opacity: 0.6,
    borderBottomColor: '#dcfce7',
  },
  taskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369a1',
    textTransform: 'uppercase',
  },
  taskDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
  },
  pointsInfo: {
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f97316',
  },
  pointsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  completeBtn: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  completeBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  waitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  waitingText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 13,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 14,
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  navItem: {
    alignItems: 'center',
    opacity: 0.5,
  },
  navItemActive: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  navTextActive: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0ea5e9',
    textTransform: 'uppercase',
  },
});
