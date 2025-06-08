import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
} from 'react-native';
import { COLORS } from '../styles/colors';
import { getVouchers } from '../data/api';

const VouchersScreen = ({ navigation }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const data = await getVouchers();
        console.log('VouchersScreen: Dữ liệu voucher nhận từ API:', data);
        setVouchers(data);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi tải vouchers:', error);
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const renderVoucher = ({ item }) => (
    <TouchableOpacity style={styles.voucherCard}>
      <View style={styles.voucherContent}>
        <Text style={styles.voucherTitle}>
          {item.type === 'shipping' ? 'Miễn phí vận chuyển' : 'Giảm giá'}
        </Text>
        <Text style={styles.voucherValue}>
          {item.isPercent ? `${item.discountValue || 0}%` : `${(item.discountValue || 0).toLocaleString('vi-VN')}đ`}
        </Text>
        {item.min_order_value > 0 && (
          <Text style={styles.voucherCondition}>
            Đơn hàng tối thiểu: {(item.min_order_value || 0).toLocaleString('vi-VN')}đ
          </Text>
        )}
        {item.end_date && (
          <Text style={styles.voucherExpiry}>
            Hết hạn: {new Date(item.end_date).toLocaleDateString('vi-VN')}
          </Text>
        )}
        <Text style={styles.voucherCode}>Mã: {item.code}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Text>Đang tải vouchers...</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vouchers}
        renderItem={renderVoucher}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có voucher nào</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10
  },
  voucherCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  voucherContent: {
    flexDirection: 'column'
  },
  voucherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark
  },
  voucherValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4,
  },
  voucherCondition: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
  },
  voucherExpiry: {
    fontSize: 12,
    color: COLORS.red,
    marginTop: 4,
  },
  voucherDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 5
  },
  voucherCode: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 5
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: COLORS.gray
  }
});

export default VouchersScreen;