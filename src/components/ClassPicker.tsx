import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
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
        <View style={[
          common.flex1,
          common.justifyCenter,
          common.itemsCenter,
          { backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 20 }
        ]}>
          <View style={[
            common.bgWhite,
            common.roundedXl,
            common.shadowLg,
            { padding: 24, width: '100%', maxWidth: 340 }
          ]}>
            <Text style={[
              common.textXl,
              common.fontBold,
              common.textBlack,
              common.textCenter,
              common.mb4
            ]}>
              {preselectedGrade ? `Kelas ${preselectedGrade}` : 'Pilih Kelas'}
            </Text>
            
            <View style={[
              common.flexRow,
              { justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' }
            ]}>
              {availableGrades.map((grade) => {
                const isSelected = selectedClass === `${grade}`;
                
                return (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      common.justifyCenter,
                      common.itemsCenter,
                      common.rounded,
                      {
                        width: '31%',
                        aspectRatio: 1,
                        backgroundColor: isSelected ? colors.primary : colors.gray[50],
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: isSelected ? colors.primary : colors.gray[100],
                        marginBottom: 12,
                        padding: 12,
                      }
                    ]}
                    onPress={() => handleSelect(grade)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 36, marginBottom: 8 }}>
                      {gradeEmojis[grade - 1]}
                    </Text>
                    <Text style={[
                      common.textSm,
                      common.fontBold,
                      common.textCenter,
                      isSelected ? common.textWhite : common.textBlack
                    ]}>
                      Kelas {grade}
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
