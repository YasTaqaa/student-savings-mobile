import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { CLASS_OPTIONS } from '../types';

interface ClassPickerProps {
  selectedClass: string;
  onSelectClass: (className: string) => void;
  label?: string;
}

export default function ClassPicker({ selectedClass, onSelectClass, label }: ClassPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectClass = (className: string) => {
    onSelectClass(className);
    setModalVisible(false);
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.pickerButtonText}>
          {selectedClass || 'Pilih Kelas'}
        </Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Kelas</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
              {CLASS_OPTIONS.map((gradeOption) => (
                <View key={gradeOption.grade} style={styles.gradeSection}>
                  <Text style={styles.gradeTitle}>Kelas {gradeOption.grade}</Text>
                  <View style={styles.classGrid}>
                    {gradeOption.classes.map((className) => (
                      <TouchableOpacity
                        key={className}
                        style={[
                          styles.classButton,
                          selectedClass === className && styles.classButtonSelected,
                        ]}
                        onPress={() => handleSelectClass(className)}
                      >
                        <Text
                          style={[
                            styles.classButtonText,
                            selectedClass === className && styles.classButtonTextSelected,
                          ]}
                        >
                          {className}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    fontSize: 24,
    color: '#8E8E93',
  },
  scrollView: {
    padding: 20,
  },
  gradeSection: {
    marginBottom: 24,
  },
  gradeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  classButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  classButtonSelected: {
    backgroundColor: '#007AFF',
  },
  classButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  classButtonTextSelected: {
    color: '#FFF',
  },
});
