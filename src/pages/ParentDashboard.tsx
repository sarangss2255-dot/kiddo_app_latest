import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, FlatList, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../AuthContext';
import { Plus, Users, CheckCircle2, XCircle, LayoutDashboard, LogOut, Star } from 'lucide-react-native';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { Task, UserProfile } from '../types';

export default function ParentDashboard() {
  const { profile } = useAuth();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [kids, setKids] = React.useState<UserProfile[]>([]);
  const [showAddTask, setShowAddTask] = React.useState(false);
  const [newTask, setNewTask] = React.useState({ title: '', description: '', points: '10', assignedTo: '', dueDate: '' });

  React.useEffect(() => {
    if (!profile?.familyId) return;

    const tasksQuery = query(collection(db, 'tasks'), where('familyId', '==', profile.familyId));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });

    const kidsQuery = query(
      collection(db, 'users'), 
      where('familyId', '==', profile.familyId),
      where('role', '==', 'kid')
    );
    const unsubscribeKids = onSnapshot(kidsQuery, (snapshot) => {
      setKids(snapshot.docs.map(doc => doc.data() as UserProfile));
    });

    return () => {
      unsubscribeTasks();
      unsubscribeKids();
    };
  }, [profile?.familyId]);

  const handleAddTask = async () => {
    if (!profile?.familyId || !auth.currentUser) return;
    if (!newTask.title || !newTask.assignedTo) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        points: parseInt(newTask.points),
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).getTime() : null,
        familyId: profile.familyId,
        createdBy: auth.currentUser.uid,
        status: 'pending',
        createdAt: Date.now()
      });
      setShowAddTask(false);
      setNewTask({ title: '', description: '', points: '10', assignedTo: '', dueDate: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const approveTask = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), { status: 'approved', approvedAt: Date.now() });
      await updateDoc(doc(db, 'users', task.assignedTo), { points: increment(task.points) });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
           <View style={styles.logoContainer}>
              <LayoutDashboard color="#fff" size={20} />
           </View>
           <Text style={styles.logoText}>ParentHub</Text>
        </View>
        
        <TouchableOpacity onPress={() => auth.signOut()} style={styles.logoutBtn}>
          <LogOut color="#f87171" size={20} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome, {profile?.displayName}</Text>
          <Text style={styles.welcomeSub}>Manage your family's tasks and rewards.</Text>
        </View>

        <TouchableOpacity 
          onPress={() => setShowAddTask(true)}
          style={styles.addTaskBtn}
        >
          <Plus color="#fff" size={24} />
          <Text style={styles.addTaskBtnText}>Assign New Task</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users color="#6366f1" size={20} />
            <Text style={styles.sectionTitle}>Family Members</Text>
          </View>
          {kids.map(kid => (
            <View key={kid.uid} style={styles.kidRow}>
               <View style={styles.kidInfo}>
                  <View style={styles.avatarMini}><Text style={styles.avatarText}>{kid.displayName[0]}</Text></View>
                  <Text style={styles.kidName}>{kid.displayName}</Text>
               </View>
               <View style={styles.kidPoints}>
                  <Star color="#f59e0b" fill="#f59e0b" size={14} />
                  <Text style={styles.pointsLabel}>{kid.points || 0}</Text>
               </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CheckCircle2 color="#22c55e" size={20} />
            <Text style={styles.sectionTitle}>Active Tasks</Text>
          </View>
          {tasks.filter(t => t.status !== 'approved').map(task => (
            <View key={task.id} style={styles.taskItem}>
               <View style={styles.taskMain}>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, task.status === 'completed' ? styles.statusSuccess : styles.statusPending]}>
                       <Text style={[styles.statusText, task.status === 'completed' ? styles.statusTextSuccess : styles.statusTextPending]}>{task.status}</Text>
                    </View>
                    <Text style={styles.itemTitle}>{task.title}</Text>
                  </View>
                  <Text style={styles.itemDesc}>{task.description}</Text>
                  <View style={styles.taskMetaRow}>
                    <Text style={styles.itemAssignee}>Assigned to: <Text style={styles.bold}>{kids.find(k => k.uid === task.assignedTo)?.displayName}</Text></Text>
                    {task.dueDate && (
                      <Text style={styles.itemDueDate}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
                    )}
                  </View>
               </View>
               <View style={styles.taskActions}>
                  <Text style={styles.itemPoints}>{task.points} pts</Text>
                  {task.status === 'completed' && (
                    <TouchableOpacity onPress={() => approveTask(task)} style={styles.approveIcon}>
                       <CheckCircle2 color="#fff" size={24} />
                    </TouchableOpacity>
                  )}
               </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showAddTask} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Mission</Text>
              <TouchableOpacity onPress={() => setShowAddTask(false)}>
                <XCircle color="#94a3b8" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Task Title</Text>
              <TextInput 
                style={styles.input}
                value={newTask.title}
                onChangeText={text => setNewTask({...newTask, title: text})}
                placeholder="e.g. Clean your room"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
                value={newTask.description}
                onChangeText={text => setNewTask({...newTask, description: text})}
                placeholder="Make sure to put away all the toys!"
              />

              <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
              <TextInput 
                style={styles.input}
                value={newTask.dueDate}
                onChangeText={text => setNewTask({...newTask, dueDate: text})}
                placeholder="2024-12-31"
              />

              <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
              <TextInput 
                style={styles.input}
                value={newTask.dueDate}
                onChangeText={text => setNewTask({...newTask, dueDate: text})}
                placeholder="2024-12-31"
              />

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Points</Text>
                  <TextInput 
                    style={styles.input}
                    keyboardType="numeric"
                    value={newTask.points}
                    onChangeText={text => setNewTask({...newTask, points: text})}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Assign To</Text>
                  <View style={styles.select}>
                    {kids.map(kid => (
                      <TouchableOpacity 
                        key={kid.uid} 
                        onPress={() => setNewTask({...newTask, assignedTo: kid.uid})}
                        style={[styles.selectOption, newTask.assignedTo === kid.uid && styles.selectOptionActive]}
                      >
                        <Text style={[styles.selectText, newTask.assignedTo === kid.uid && styles.selectTextActive]}>{kid.displayName}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <TouchableOpacity onPress={handleAddTask} style={styles.submitBtn}>
                 <Text style={styles.submitBtnText}>Launch Mission 🚀</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', flexDirection: 'row' },
  sidebar: { width: 80, backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#e2e8f0', paddingVertical: 20, alignItems: 'center' },
  sidebarHeader: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { width: 44, height: 44, backgroundColor: '#4f46e5', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  logoText: { fontSize: 10, fontWeight: '900', color: '#1e293b', textTransform: 'uppercase' },
  logoutBtn: { marginTop: 'auto', alignItems: 'center' },
  logoutText: { fontSize: 9, fontWeight: '800', color: '#f87171', textTransform: 'uppercase', marginTop: 4 },
  mainContent: { flexGrow: 1, padding: 30 },
  welcomeSection: { marginBottom: 32 },
  welcomeTitle: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
  welcomeSub: { fontSize: 16, color: '#64748b', fontWeight: '500' },
  addTaskBtn: { backgroundColor: '#4f46e5', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40, elevation: 4 },
  addTaskBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  kidRow: { backgroundColor: '#fff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  kidInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarMini: { width: 36, height: 36, backgroundColor: '#eef2ff', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#6366f1', fontWeight: '800' },
  kidName: { fontWeight: '700', color: '#334155' },
  kidPoints: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff7ed', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pointsLabel: { fontWeight: '900', color: '#9a3412', fontSize: 13 },
  taskItem: { backgroundColor: '#fff', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  taskMain: { flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusPending: { backgroundColor: '#fef3c7' },
  statusSuccess: { backgroundColor: '#dcfce7' },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  statusTextPending: { color: '#92400e' },
  statusTextSuccess: { color: '#166534' },
  itemTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  itemDesc: { fontSize: 14, color: '#64748b', marginBottom: 6 },
  itemAssignee: { fontSize: 11, color: '#94a3b8' },
  taskMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  itemDueDate: { fontSize: 11, color: '#ef4444', fontWeight: '700' },
  bold: { color: '#475569', fontWeight: '800' },
  taskActions: { alignItems: 'flex-end', marginLeft: 16 },
  itemPoints: { fontWeight: '900', color: '#4f46e5', marginBottom: 8 },
  approveIcon: { backgroundColor: '#22c55e', padding: 8, borderRadius: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 30, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  label: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 14, fontSize: 16, color: '#1e293b', marginBottom: 20 },
  modalForm: { flex: 1 },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  col: { flex: 1 },
  select: { gap: 10 },
  selectOption: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  selectOptionActive: { backgroundColor: '#e0e7ff', borderColor: '#4f46e5' },
  selectText: { fontWeight: '700', color: '#64748b', textAlign: 'center' },
  selectTextActive: { color: '#4f46e5' },
  submitBtn: { backgroundColor: '#4f46e5', paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
});
