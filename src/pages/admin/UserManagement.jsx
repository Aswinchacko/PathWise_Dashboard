import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Plus,
  Download,
  Upload,
  MoreVertical,
  Mail,
  Shield,
  Calendar,
  Activity
} from 'lucide-react'
import adminService from '../../services/adminService'
import './UserManagement.css'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [bulkAction, setBulkAction] = useState('')

  const usersPerPage = 20

  useEffect(() => {
    loadUsers()
  }, [currentPage, searchQuery, roleFilter, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await adminService.getUsers(
        currentPage,
        usersPerPage,
        searchQuery,
        roleFilter,
        statusFilter
      )
      setUsers(response.users)
      setTotalPages(response.totalPages)
      setTotalUsers(response.total)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserUpdate = async (userId, updates) => {
    try {
      await adminService.updateUser(userId, updates)
      loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId)
        loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user')
      }
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return

    try {
      const promises = selectedUsers.map(userId => {
        switch (bulkAction) {
          case 'activate':
            return adminService.updateUser(userId, { isActive: true })
          case 'deactivate':
            return adminService.updateUser(userId, { isActive: false })
          case 'delete':
            return adminService.deleteUser(userId)
          default:
            return Promise.resolve()
        }
      })

      await Promise.all(promises)
      setSelectedUsers([])
      setBulkAction('')
      loadUsers()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      alert('Failed to perform bulk action')
    }
  }

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Created At'],
      ...users.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role || 'user',
        user.isActive ? 'Active' : 'Inactive',
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user._id))
    }
  }

  return (
    <div className="user-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <Users size={28} />
              User Management
            </h1>
            <p>Manage user accounts, roles, and permissions</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={exportUsers}>
              <Download size={20} />
              Export
            </button>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={20} />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
              <option value="">Bulk Actions</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
            </select>
            <button 
              className="btn-secondary"
              onClick={handleBulkAction}
              disabled={!bulkAction}
            >
              Apply ({selectedUsers.length})
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={selectAllUsers}
                />
              </th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td><div className="skeleton skeleton-checkbox"></div></td>
                  <td><div className="skeleton skeleton-user"></div></td>
                  <td><div className="skeleton skeleton-text"></div></td>
                  <td><div className="skeleton skeleton-badge"></div></td>
                  <td><div className="skeleton skeleton-badge"></div></td>
                  <td><div className="skeleton skeleton-text"></div></td>
                  <td><div className="skeleton skeleton-text"></div></td>
                  <td><div className="skeleton skeleton-actions"></div></td>
                </tr>
              ))
            ) : users.map(user => (
              <tr key={user._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => toggleUserSelection(user._id)}
                  />
                </td>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <div className="user-name">{user.firstName} {user.lastName}</div>
                      <div className="user-id">ID: {user._id.slice(-8)}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="email-cell">
                    <Mail size={16} />
                    {user.email}
                  </div>
                </td>
                <td>
                  <select
                    value={user.role || 'user'}
                    onChange={(e) => handleUserUpdate(user._id, { role: e.target.value })}
                    className={`role-select ${user.role || 'user'}`}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button
                    className={`status-toggle ${user.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleUserUpdate(user._id, { isActive: !user.isActive })}
                  >
                    {user.isActive ? (
                      <>
                        <UserCheck size={16} />
                        Active
                      </>
                    ) : (
                      <>
                        <UserX size={16} />
                        Inactive
                      </>
                    )}
                  </button>
                </td>
                <td>
                  <div className="date-cell">
                    <Calendar size={16} />
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    <Calendar size={16} />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        setEditingUser(user)
                        setShowEditModal(true)
                      }}
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleUserDelete(user._id)}
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
        </div>
        <div className="pagination-controls">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserManagement
