// src/components/ClassPicker.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { common, input, button, colors } from '../styles/utils';

interface ClassPickerProps {
  label?: string;
  selectedClass: string;
  onSelectClass: (className: string) => void;
  preselectedGrade?: number;
  disabled?: boolean;
}

export default function ClassPicker({
  label = 'Kelas',
  selectedClass,
  onSelectClass,
  preselectedGrade,
  disabled = false,
}: ClassPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const grades = [1, 2, 3, 4, 5, 6];
  const availableGrades = preselectedGrade ? [preselectedGrade] : grades;

  const handleSelect = (grade: number) => {
    if (disabled) return;
    onSelectClass(`${grade}`);
    setModalVisible(false);
  };

  const gradeEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];

  return (
    <View>
      {label && (
        <Text style={input.label}>
          {label}
        </Text>
      )}

      {/* Tombol input utama */}
      <TouchableOpacity
        style={[
          input.base,
          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', opacity: disabled ? 0.6 : 1 },
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <Text style={selectedClass ? common.textBlack : common.textGray500}>
          {selectedClass ? `Kelas ${selectedClass}` : 'Pilih kelas'}
        </Text>
        <Text style={common.textGray400}>▾</Text>
      </TouchableOpacity>

      {/* Modal pilih kelas */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={common.flex1}>
          <View style={common.modal}>
            <View style={common.modalContent}>
              <Text
                style={[
                  common.textLg,
                  common.fontBold,
                  common.mb3,
                  common.textBlack,
                  common.textCenter,
                ]}
              >
                {preselectedGrade ? `Kelas ${preselectedGrade}` : 'Pilih Kelas'}
              </Text>

              {availableGrades.map((grade) => {
                const isSelected = selectedClass === `${grade}`;
                return (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      button.secondary,
                      common.flexRow,
                      common.itemsCenter,
                      common.justifyBetween,
                      common.mb2,
                      {
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? colors.primary : colors.gray[100],
                      },
                    ]}
                    onPress={() => handleSelect(grade)}
                    activeOpacity={0.7}
                  >
                    <View style={[common.flexRow, common.itemsCenter]}>
                      <Text style={{ fontSize: 24, marginRight: 8 }}>
                        {gradeEmojis[grade - 1]}
                      </Text>
                      <Text style={common.textBlack}>Kelas {grade}</Text>
                    </View>
                    {isSelected && (
                      <Text style={[common.textPrimary, common.fontSemibold]}>Dipilih</Text>
                    )}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[button.primary, common.mt3]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={button.textWhite}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
