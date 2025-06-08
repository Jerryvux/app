import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthProvider';
import { adminAPI } from '../data/api';
import { COLORS } from '../styles/colors';

const { width, height } = Dimensions.get('window');

const AdminScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [activeTabName, setActiveTabName] = useState('Quản lý người dùng');
  const [users, setUsers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    content: '',
    type: 'TERMS'
  });
  const [messageRecipientId, setMessageRecipientId] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [editingCategory, setEditingCategory] = useState(null);

  const [newVoucher, setNewVoucher] = useState({
    code: '',
    type: 'DISCOUNT',
    discount: '',
    isPercent: false,
    minPurchase: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [editingVoucher, setEditingVoucher] = useState(null);

  const generateRandomCode = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setNewVoucher(prev => ({ ...prev, code: result.toUpperCase() }));
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user || user.role !== 'ADMIN') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [usersRes, policiesRes, categoriesRes, vouchersRes] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getAllPolicies(),
        adminAPI.getAllCategories(),
        adminAPI.getAllVouchers()
      ]);
      setUsers(usersRes.data);
      setPolicies(policiesRes.data);
      setCategories(categoriesRes.data);
      setVouchers(vouchersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!user || user.role !== 'ADMIN') return;
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchData();
      Alert.alert('Thành công', 'Cập nhật vai trò thành công');
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật vai trò');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    if (!user || user.role !== 'ADMIN') return;
    try {
      await adminAPI.toggleUserStatus(userId);
      fetchData();
      Alert.alert('Thành công', 'Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Error toggling user status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleCreatePolicy = async () => {
    if (!user || user.role !== 'ADMIN') return;
    try {
      await adminAPI.createPolicy(newPolicy);
      setNewPolicy({ title: '', content: '', type: 'TERMS' });
      fetchData();
      Alert.alert('Thành công', 'Tạo chính sách mới thành công');
    } catch (error) {
      console.error('Error creating policy:', error);
      Alert.alert('Lỗi', 'Không thể tạo chính sách mới');
    }
  };

  const handleTogglePolicyStatus = async (policyId) => {
    if (!user || user.role !== 'ADMIN') return;
    try {
      await adminAPI.togglePolicyStatus(policyId);
      fetchData();
      Alert.alert('Thành công', 'Cập nhật trạng thái chính sách thành công');
    } catch (error) {
      console.error('Error toggling policy status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái chính sách');
    }
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa tài khoản này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              await adminAPI.deleteUser(userId);
              Alert.alert('Thành công', 'Xóa tài khoản thành công');
              fetchData();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Lỗi', 'Không thể xóa tài khoản');
            }
          },
        },
      ]
    );
  };

  const handleSendMessage = async () => {
    Alert.alert('Thông báo', 'Tính năng đang được phát triển');
    return;
  };

  const handleCreateUser = async () => {
    if (!user || user.role !== 'ADMIN') return;

    if (!newUser.name || !newUser.email || !newUser.password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await adminAPI.createUser(newUser);
      Alert.alert('Thành công', 'Tạo tài khoản thành công');
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'USER'
      });
      fetchData();
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Lỗi', 'Không thể tạo tài khoản');
    }
  };

  const handleCreateCategory = async () => {
    try {
      await adminAPI.createCategory(newCategory);
      setNewCategory({ name: '', description: '', isActive: true });
      fetchData();
      Alert.alert('Thành công', 'Tạo danh mục mới thành công');
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Lỗi', 'Không thể tạo danh mục mới');
    }
  };

  const handleUpdateCategory = async (categoryId, updatedData) => {
    try {
      await adminAPI.updateCategory(categoryId, updatedData);
      setEditingCategory(null);
      fetchData();
      Alert.alert('Thành công', 'Cập nhật danh mục thành công');
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật danh mục');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa danh mục này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              await adminAPI.deleteCategory(categoryId);
              fetchData();
              Alert.alert('Thành công', 'Xóa danh mục thành công');
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Lỗi', 'Không thể xóa danh mục');
            }
          },
        },
      ]
    );
  };

  const handleCreateVoucher = async () => {
    if (!user || user.role !== 'ADMIN') return;
    if (!newVoucher.code || !newVoucher.type || !newVoucher.discount || !newVoucher.startDate || !newVoucher.endDate) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc: Mã voucher, Loại, Giảm giá, Ngày bắt đầu, Ngày kết thúc.');
      return;
    }
    try {
      await adminAPI.createVoucher(newVoucher);
      Alert.alert('Thành công', 'Tạo voucher thành công');
      setNewVoucher({
        code: '',
        type: 'DISCOUNT',
        discount: '',
        isPercent: false,
        minPurchase: '',
        maxDiscount: '',
        startDate: '',
        endDate: '',
        isActive: true
      });
      fetchData();
    } catch (error) {
      console.error('Error creating voucher:', error);
      if (error.response && error.response.status === 409) {
        Alert.alert('Lỗi', `Mã voucher '${newVoucher.code}' đã tồn tại. Vui lòng sử dụng mã khác.`);
      } else if (error.response && error.response.data && typeof error.response.data === 'string') {
        Alert.alert('Lỗi', error.response.data);
      } else {
        Alert.alert('Lỗi', 'Không thể tạo voucher. Vui lòng thử lại.');
      }
    }
  };

  const handleUpdateVoucher = async (voucherId, updatedData) => {
    try {
      await adminAPI.updateVoucher(voucherId, updatedData);
      setEditingVoucher(null);
      fetchData();
      Alert.alert('Thành công', 'Cập nhật voucher thành công');
    } catch (error) {
      console.error('Error updating voucher:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật voucher');
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa voucher này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              await adminAPI.deleteVoucher(voucherId);
              fetchData();
              Alert.alert('Thành công', 'Xóa voucher thành công');
            } catch (error) {
              console.error('Error deleting voucher:', error);
              Alert.alert('Lỗi', 'Không thể xóa voucher');
            }
          },
        },
      ]
    );
  };

  const handleTabChange = (tabName, tabDisplayName) => {
    setActiveTab(tabName);
    setActiveTabName(tabDisplayName);
    setIsMenuOpen(false);
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Bạn không có quyền truy cập trang này</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainTabBar}>
        <Text style={styles.activeTabTitle}>{activeTabName}</Text>
        <TouchableOpacity
          style={styles.menuIconContainer}
          onPress={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {isMenuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
        />
      )}

      {isMenuOpen && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={[styles.menuTab, activeTab === 'users' && styles.activeMenuTab]}
            onPress={() => handleTabChange('users', 'Quản lý người dùng')}
          >
            <Text style={[styles.menuTabText, activeTab === 'users' && styles.activeMenuTabText]}>
              Quản lý người dùng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuTab, activeTab === 'create-user' && styles.activeMenuTab]}
            onPress={() => handleTabChange('create-user', 'Tạo tài khoản')}
          >
            <Text style={[styles.menuTabText, activeTab === 'create-user' && styles.activeMenuTabText]}>
              Tạo tài khoản
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuTab, activeTab === 'policies' && styles.activeMenuTab]}
            onPress={() => handleTabChange('policies', 'Quản lý chính sách')}
          >
            <Text style={[styles.menuTabText, activeTab === 'policies' && styles.activeMenuTabText]}>
              Quản lý chính sách
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuTab, activeTab === 'messages' && styles.activeMenuTab]}
            onPress={() => handleTabChange('messages', 'Gửi thông báo')}
          >
            <Text style={[styles.menuTabText, activeTab === 'messages' && styles.activeMenuTabText]}>
              Gửi thông báo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuTab, activeTab === 'categories' && styles.activeMenuTab]}
            onPress={() => handleTabChange('categories', 'Quản lý danh mục')}
          >
            <Text style={[styles.menuTabText, activeTab === 'categories' && styles.activeMenuTabText]}>
              Quản lý danh mục
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuTab, activeTab === 'vouchers' && styles.activeMenuTab]}
            onPress={() => handleTabChange('vouchers', 'Quản lý voucher')}
          >
            <Text style={[styles.menuTabText, activeTab === 'vouchers' && styles.activeMenuTabText]}>
              Quản lý voucher
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content}>
        {activeTab === 'users' ? (
          <View>
            {users.map(user => (
              <View key={user.id} style={styles.userCard}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleUpdateUserRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                  >
                    <Text style={styles.actionButtonText}>
                      {user.role === 'ADMIN' ? 'Hủy Admin' : 'Cấp Admin'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, !user.isActive && styles.disabledButton]}
                    onPress={() => handleToggleUserStatus(user.id)}
                  >
                    <Text style={styles.actionButtonText}>
                      {user.isActive ? 'Khóa' : 'Mở khóa'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteUser(user.id)}
                  >
                    <Text style={styles.actionButtonText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : activeTab === 'create-user' ? (
          <View>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Tên người dùng"
                value={newUser.name}
                onChangeText={(text) => setNewUser({ ...newUser, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                secureTextEntry
                value={newUser.password}
                onChangeText={(text) => setNewUser({ ...newUser, password: text })}
              />
              <View style={styles.roleSelector}>
                <Text style={styles.roleLabel}>Vai trò:</Text>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    newUser.role === 'USER' && styles.selectedRoleButton
                  ]}
                  onPress={() => setNewUser({ ...newUser, role: 'USER' })}
                >
                  <Text style={[
                    styles.roleButtonText,
                    newUser.role === 'USER' && styles.selectedRoleButtonText
                  ]}>Người dùng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    newUser.role === 'ADMIN' && styles.selectedRoleButton
                  ]}
                  onPress={() => setNewUser({ ...newUser, role: 'ADMIN' })}
                >
                  <Text style={[
                    styles.roleButtonText,
                    newUser.role === 'ADMIN' && styles.selectedRoleButtonText
                  ]}>Admin</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={handleCreateUser}>
                <Text style={styles.submitButtonText}>Tạo tài khoản</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : activeTab === 'policies' ? (
          <View>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Tiêu đề"
                value={newPolicy.title}
                onChangeText={(text) => setNewPolicy({ ...newPolicy, title: text })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nội dung"
                multiline
                value={newPolicy.content}
                onChangeText={(text) => setNewPolicy({ ...newPolicy, content: text })}
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleCreatePolicy}>
                <Text style={styles.submitButtonText}>Tạo mới</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Danh sách chính sách</Text>
            {policies.map(policy => (
              <View key={policy.id} style={styles.policyCard}>
                <Text style={styles.policyTitle}>{policy.title}</Text>
                <Text style={styles.policyType}>Loại: {policy.type}</Text>
                <Text style={styles.policyContent} numberOfLines={3}>
                  {policy.content}
                </Text>
                <TouchableOpacity
                  style={[styles.actionButton, !policy.isActive && styles.disabledButton]}
                  onPress={() => handleTogglePolicyStatus(policy.id)}
                >
                  <Text style={styles.actionButtonText}>
                    {policy.isActive ? 'Ẩn' : 'Hiện'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : activeTab === 'messages' ? (
          <View>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="ID người nhận (Để trống để gửi cho tất cả)"
                keyboardType="number-pad"
                value={messageRecipientId}
                onChangeText={setMessageRecipientId}
              />
              <TextInput
                style={styles.input}
                placeholder="Tiêu đề thông báo"
                value={messageTitle}
                onChangeText={setMessageTitle}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nội dung thông báo"
                multiline
                value={messageContent}
                onChangeText={setMessageContent}
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleSendMessage}>
                <Text style={styles.submitButtonText}>Gửi thông báo</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : activeTab === 'categories' ? (
          <View>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Tên danh mục"
                value={newCategory.name}
                onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả"
                multiline
                value={newCategory.description}
                onChangeText={(text) => setNewCategory({ ...newCategory, description: text })}
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleCreateCategory}>
                <Text style={styles.submitButtonText}>Tạo danh mục</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Danh sách danh mục</Text>
            {categories.map(category => (
              <View key={category.id} style={styles.categoryCard}>
                {editingCategory?.id === category.id ? (
                  <View>
                    <TextInput
                      style={styles.input}
                      value={editingCategory.name}
                      onChangeText={(text) => setEditingCategory({ ...editingCategory, name: text })}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={editingCategory.description}
                      onChangeText={(text) => setEditingCategory({ ...editingCategory, description: text })}
                      multiline
                    />
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={() => handleUpdateCategory(category.id, editingCategory)}
                      >
                        <Text style={styles.actionButtonText}>Lưu</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => setEditingCategory(null)}
                      >
                        <Text style={styles.actionButtonText}>Hủy</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setEditingCategory(category)}
                      >
                        <Text style={styles.actionButtonText}>Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteCategory(category.id)}
                      >
                        <Text style={styles.actionButtonText}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputWithButton}
                  placeholder="Mã voucher"
                  value={newVoucher.code}
                  onChangeText={(text) => setNewVoucher({ ...newVoucher, code: text.toUpperCase() })}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.generateButton} onPress={() => generateRandomCode()}>
                  <Text style={styles.generateButtonText}>Tạo mã</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Giảm giá (%)"
                keyboardType="numeric"
                value={newVoucher.discount}
                onChangeText={(text) => setNewVoucher({ ...newVoucher, discount: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Giá trị đơn hàng tối thiểu"
                keyboardType="numeric"
                value={newVoucher.minPurchase}
                onChangeText={(text) => setNewVoucher({ ...newVoucher, minPurchase: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Giảm giá tối đa"
                keyboardType="numeric"
                value={newVoucher.maxDiscount}
                onChangeText={(text) => setNewVoucher({ ...newVoucher, maxDiscount: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Ngày bắt đầu (YYYY-MM-DD)"
                value={newVoucher.startDate}
                onChangeText={(text) => setNewVoucher({ ...newVoucher, startDate: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Ngày kết thúc (YYYY-MM-DD)"
                value={newVoucher.endDate}
                onChangeText={(text) => setNewVoucher({ ...newVoucher, endDate: text })}
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleCreateVoucher}>
                <Text style={styles.submitButtonText}>Tạo voucher</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Danh sách voucher</Text>
            {vouchers.map(voucher => (
              <View key={voucher.id} style={styles.voucherCard}>
                {editingVoucher?.id === voucher.id ? (
                  <View>
                    <TextInput
                      style={styles.input}
                      value={editingVoucher.code}
                      onChangeText={(text) => setEditingVoucher({ ...editingVoucher, code: text })}
                    />
                    <TextInput
                      style={styles.input}
                      value={editingVoucher.discount}
                      keyboardType="numeric"
                      onChangeText={(text) => setEditingVoucher({ ...editingVoucher, discount: text })}
                    />
                    <TextInput
                      style={styles.input}
                      value={editingVoucher.minPurchase}
                      keyboardType="numeric"
                      onChangeText={(text) => setEditingVoucher({ ...editingVoucher, minPurchase: text })}
                    />
                    <TextInput
                      style={styles.input}
                      value={editingVoucher.maxDiscount}
                      keyboardType="numeric"
                      onChangeText={(text) => setEditingVoucher({ ...editingVoucher, maxDiscount: text })}
                    />
                    <TextInput
                      style={styles.input}
                      value={editingVoucher.startDate}
                      onChangeText={(text) => setEditingVoucher({ ...editingVoucher, startDate: text })}
                    />
                    <TextInput
                      style={styles.input}
                      value={editingVoucher.endDate}
                      onChangeText={(text) => setEditingVoucher({ ...editingVoucher, endDate: text })}
                    />
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={() => handleUpdateVoucher(voucher.id, editingVoucher)}
                      >
                        <Text style={styles.actionButtonText}>Lưu</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => setEditingVoucher(null)}
                      >
                        <Text style={styles.actionButtonText}>Hủy</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.voucherCode}>Mã: {voucher.code}</Text>
                    <Text style={styles.voucherDetails}>Giảm giá: {voucher.isPercent ? `${voucher.discountValue || 0}%` : `${(voucher.discountValue || 0).toLocaleString('vi-VN')}đ`}</Text>
                    {/* <Text style={styles.voucherDetails}>Tối thiểu: {voucher.min_order_value}</Text>
                    <Text style={styles.voucherDetails}>Tối đa: {voucher.maxDiscount}</Text> */}
                    <Text style={styles.voucherDetails}>Từ: {voucher.startDate}</Text>
                    <Text style={styles.voucherDetails}>Đến: {voucher.endDate}</Text>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setEditingVoucher(voucher)}
                      >
                        <Text style={styles.actionButtonText}>Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteVoucher(voucher.id)}
                      >
                        <Text style={styles.actionButtonText}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainTabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  activeTabTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  menuIconContainer: {
    padding: 10,
    marginLeft: 'auto',
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.primary,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  menuOverlay: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    zIndex: 2,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  menuTab: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  activeMenuTab: {
    backgroundColor: COLORS.primary,
  },
  menuTabText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  activeMenuTabText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  actionButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 3,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputWithButton: {
    flex: 1,
    height: 50,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
  },
  generateButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
  },
  generateButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  policyCard: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  policyType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  policyContent: {
    fontSize: 14,
    color: '#444',
    marginBottom: 15,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 5,
  },
  roleLabel: {
    fontSize: 16,
    marginRight: 15,
    color: '#333',
    fontWeight: '600',
  },
  roleButton: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  selectedRoleButton: {
    backgroundColor: COLORS.primary,
  },
  roleButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedRoleButtonText: {
    color: COLORS.background,
  },
  categoryCard: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  voucherCard: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  voucherCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  voucherDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
});

export default AdminScreen; 