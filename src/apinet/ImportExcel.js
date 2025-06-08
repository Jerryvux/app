import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { COLORS } from '../styles/colors';
import api from './netapi';

const ImportExcel = () => {
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true
      });

      if (result.type === 'success') {
        setLoading(true);

        const formData = new FormData();
        formData.append('file', {
          uri: result.uri,
          name: result.name,
          type: result.mimeType
        });

        const response = await api.importProducts(formData);

        Alert.alert(
          'Thành công',
          `Đã import ${response.data.importedCount} sản phẩm thành công!`
        );
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Lỗi', 'Không thể import file. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.importButton, loading && styles.buttonDisabled]}
        onPress={handleImport}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Text style={styles.buttonText}>Import Excel</Text>
            <Text style={styles.buttonSubText}>Chọn file Excel để import dữ liệu</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  importButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonSubText: {
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.8,
  },
});

export default ImportExcel; 