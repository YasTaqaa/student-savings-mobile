import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { CLASS_OPTIONS } from '../types';
import { common, colors, container, button } from '../styles/utils';

interface Props {
  label: string;
  selectedClass: string;
  onSelectClass: (className: string) => void;
}

export default function ClassPicker({ label, selectedClass, onSelectClass }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (className: string) => {
    onSelectClass(className);
    setModalVisible(false);
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={[common.textSm, common.fontSemibold, common.textBlack, { marginBottom: 6 }]}>
        {label}
      </Text>
      
      <TouchableOpacity
        style={[common.bgGray50, common.px4, common.py3, common.roundedLg, common.flexRow, common.justifyBetween, common.itemsCenter]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[common.textBase, selectedClass ? common.textBlack : common.textGray500]}>
          {selectedClass || 'Pilih Kelas'}
        </Text>
        <Text style={[common.textXl, common.textPrimary]}>›</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={container.modal}>
          <View style={[container.modalContent, { maxHeight: '80%' }]}>
            <Text style={[common.textXl, common.fontSemibold, { marginBottom: 20 }, common.textCenter]}>
              Pilih Kelas
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {CLASS_OPTIONS.map((gradeOption) => (
                <View key={gradeOption.grade} style={{ marginBottom: 20 }}>
                  <Text style={[common.textSm, common.fontSemibold, common.textGray500, { marginBottom: 8 }]}>
                    Kelas {gradeOption.grade}
                  </Text>
                  
                  <View style={[common.flexRow, { flexWrap: 'wrap', gap: 8 }]}>
                    {gradeOption.classes.map((className) => (
                      <TouchableOpacity
                        key={className}
                        style={[
                          common.px4,
                          common.py3,
                          common.roundedLg,
                          common.itemsCenter,
                          { minWidth: 80 },
                          selectedClass === className ? common.bgPrimary : common.bgGray50,
                        ]}
                        onPress={() => handleSelect(className)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          common.textBase,
                          common.fontSemibold,
                          selectedClass === className ? common.textWhite : common.textBlack,
                        ]}>
                          {className}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[button.secondary, { marginTop: 20 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={button.text}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
