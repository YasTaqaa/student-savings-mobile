import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { common, input, button, colors } from '../styles/utils';

interface ClassPickerProps {
  label?: string;
  selectedClass: string;
  onSelectClass: (className: string) => void;
  preselectedGrade?: string;
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

  const allClasses = ['1', '2', '3', '4A', '4B', '5', '6A', '6B'];

  const availableClasses = preselectedGrade
    ? allClasses.filter((c) => c.startsWith(String(preselectedGrade)))
    : allClasses;

  const handleSelect = (kelas: string) => {
    if (disabled) return;
    onSelectClass(kelas);
    setModalVisible(false);
  };

  const emojis: Record<string, string> = {
    '1': '1️⃣',
    '2': '2️⃣',
    '3': '3️⃣',
    '4A': '4️⃣',
    '4B': '4️⃣',
    '5': '5️⃣',
    '6A': '6️⃣',
    '6B': '6️⃣',
  };

  return (
    <View style={{ marginBottom: 12 }}>
      {label && (
        <Text style={[common.caption, common.mb1]}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        style={[
          input.base,
          common.flexRow,
          common.itemsCenter,
          common.justifyBetween,
          disabled && { backgroundColor: colors.gray[200] },
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <Text>
          {selectedClass ? `Kelas ${selectedClass}` : 'Pilih kelas'}
        </Text>
        <Text>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
      <View style={common.modal}>
          <View style={common.modalContent}>
            <Text style={[common.subtitle, common.mb2]}>
              {preselectedGrade ? `Kelas ${preselectedGrade}` : 'Pilih Kelas'}
            </Text>

            {availableClasses.map((kelas) => {
              const isSelected = selectedClass === kelas;
              return (
                <TouchableOpacity
                  key={kelas}
                  style={[
                    button.secondary,
                    common.flexRow,
                    common.itemsCenter,
                    common.justifyBetween,
                    common.mb1,
                    isSelected && { borderColor: colors.primary },
                  ]}
                  onPress={() => handleSelect(kelas)}
                  activeOpacity={0.7}
                >
                  <View style={common.flexRow}>
                    <Text style={{ marginRight: 8 }}>
                      {emojis[kelas] ?? '🏫'}
                    </Text>
                    <Text>Kelas {kelas}</Text>
                  </View>
                  {isSelected && (
                    <Text style={{ color: colors.primary }}>Dipilih</Text>
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[button.primary, common.mt2]}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={button.textWhite}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
