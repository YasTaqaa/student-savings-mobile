import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { common, input, button, colors } from '../styles/utils';

interface ClassPickerProps {
  label?: string;
  selectedClass: string;
  onSelectClass: (className: string) => void;
  preselectedGrade?: number;
}

export default function ClassPicker({ 
  label = 'Kelas', 
  selectedClass, 
  onSelectClass,
  preselectedGrade 
}: ClassPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  
  const grades = [1, 2, 3, 4, 5, 6];
  const availableGrades = preselectedGrade ? [preselectedGrade] : grades;
  
  const handleSelect = (grade: number) => {
    onSelectClass(`${grade}`);
    setModalVisible(false);
  };
  
  const gradeEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
  
  return (
    <View>
      {label && <Text style={input.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          input.base,
          common.flexRow,
          common.justifyBetween,
          common.itemsCenter
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[
          common.textBase,
          selectedClass ? common.textBlack : common.textGray500
        ]}>
          {selectedClass ? `Kelas ${selectedClass}` : 'Pilih kelas'}
        </Text>
        <Text style={[common.textGray500, { fontSize: 12 }]}>▼</Text>
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {preselectedGrade ? `Kelas ${preselectedGrade}` : 'Pilih Kelas'}
            </Text>
            
            <View style={styles.gradeContainer}>
              {availableGrades.map((grade, index) => {
                const isSelected = selectedClass === `${grade}`;
                
                return (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      styles.gradeCard,
                      isSelected && styles.gradeCardSelected
                    ]}
                    onPress={() => handleSelect(grade)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.gradeEmoji}>
                      {gradeEmojis[grade - 1]}
                    </Text>
                    <Text style={[
                      styles.gradeText,
                      isSelected && styles.gradeTextSelected
                    ]}>
                      Kelas {grade}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  gradeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gradeCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
  },
  gradeCardSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  gradeEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  gradeTextSelected: {
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
