import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { common, input, button, colors } from '../styles/utils';

interface ClassPickerProps {
  label?: string;
  selectedClass: string;
  onSelectClass: (className: string) => void;
  preselectedGrade?: string; 
}

export default function ClassPicker({
  label = 'Kelas',
  selectedClass,
  onSelectClass,
  preselectedGrade,
}: ClassPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Semua kelas yang tersedia
  const allClasses = [
    '1',
    '2',
    '3',
    '4A',
    '4B',
    '5',
    '6A',
    '6B',
  ];

  // Jika preselectedGrade ada, hanya tampilkan kelas itu
  const availableClasses = preselectedGrade
    ? [preselectedGrade]
    : allClasses;

  const classEmojis: Record<string, string> = {
    '1': '1️⃣',
    '2': '2️⃣',
    '3': '3️⃣',
    '4A': '4️⃣',
    '4B': '4️⃣',
    '5': '5️⃣',
    '6A': '6️⃣',
    '6B': '6️⃣',
  };

  const handleSelect = (className: string) => {
    onSelectClass(className);
    setModalVisible(false);
  };

  return (
    <View>
      {label && <Text style={input.label}>{label}</Text>}

      {/* Input */}
      <TouchableOpacity
        style={[
          input.base,
          common.flexRow,
          common.justifyBetween,
          common.itemsCenter,
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            common.textBase,
            selectedClass ? common.textBlack : common.textGray500,
          ]}
        >
          {selectedClass ? `Kelas ${selectedClass}` : 'Pilih kelas'}
        </Text>
        <Text style={[common.textGray500, { fontSize: 12 }]}>▼</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            common.flex1,
            common.justifyCenter,
            common.itemsCenter,
            { backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 20 },
          ]}
        >
          <View
            style={[
              common.bgWhite,
              common.roundedXl,
              common.shadowLg,
              { padding: 24, width: '100%', maxWidth: 340 },
            ]}
          >
            <Text
              style={[
                common.textXl,
                common.fontBold,
                common.textBlack,
                common.textCenter,
                common.mb4,
              ]}
            >
              {preselectedGrade
                ? `Kelas ${preselectedGrade}`
                : 'Pilih Kelas'}
            </Text>

            {/* Grid kelas */}
            <View
              style={[
                common.flexRow,
                {
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                },
              ]}
            >
              {availableClasses.map((cls) => {
                const isSelected = selectedClass === cls;

                return (
                  <TouchableOpacity
                    key={cls}
                    style={[
                      common.justifyCenter,
                      common.itemsCenter,
                      {
                        width: '31%',
                        aspectRatio: 1,
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.gray[50],
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.gray[100],
                        marginBottom: 12,
                        padding: 12,
                      },
                    ]}
                    onPress={() => handleSelect(cls)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 36, marginBottom: 8 }}>
                      {classEmojis[cls]}
                    </Text>
                    <Text
                      style={[
                        common.textSm,
                        common.fontBold,
                        common.textCenter,
                        isSelected
                          ? common.textWhite
                          : common.textBlack,
                      ]}
                    >
                      Kelas {cls}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={button.secondary}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={button.text}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
