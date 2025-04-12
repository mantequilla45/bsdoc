import React, { useState } from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { ProfileUser } from './ProfileUser';
import { Badge } from './Badge';
import { Button } from './Button';

interface UserTableProps {
    users: ProfileUser[];
    totalUsers: number;
    searchTerm: string;
    confirmDelete: string | null;
    onSaveUser: (id: string, updatedUser: Partial<ProfileUser>) => void;
    onDeleteUser: (id: string) => void;
    onCancelDelete: () => void;
}

// Function to get role badge variant
const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
        case 'admin':
            return 'danger';
        case 'doctor':
            return 'warning';
        case 'user':
            return 'info';
        default:
            return 'default';
    }
};

const UserTable: React.FC<UserTableProps> = ({
    users,
    totalUsers,
    searchTerm,
    confirmDelete,
    onSaveUser,
    onDeleteUser,
    onCancelDelete
}) => {
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<ProfileUser>>({});

    // Available roles for dropdown
    const availableRoles = ['user', 'doctor', 'admin'];

    const handleEditClick = (user: ProfileUser) => {
        setEditingUserId(user.id);
        setEditFormData({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role
        });
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setEditFormData({});
    };

    const handleSaveEdit = (id: string) => {
        onSaveUser(id, editFormData);
        setEditingUserId(null);
        setEditFormData({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="w-full relative">
            {/* Mobile View */}
            <div className="flex justify-end px-4 py-3">
                <div className="text-xs text-gray-600">
                    Total users: <span className="font-semibold">{users.length}</span>
                    {searchTerm && (
                        <> (filtered from {totalUsers})</>
                    )}
                </div>
            </div>
            <div className="md:hidden">
                {users.length === 0 ? (
                    <div className="text-center p-4 text-gray-500">
                        {searchTerm ? 'No users match your search' : 'No users found'}
                    </div>
                ) : (
                    <div className="space-y-4 md:px-2">
                        {users.map((user) => (
                            <div key={user.id} className="bg-white rounded-lg shadow p-3 border border-gray-200">
                                {editingUserId === user.id ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-gray-600 text-xs font-medium">
                                                    {editFormData.first_name?.charAt(0) ?? ''}{editFormData.last_name?.charAt(0) ?? ''}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 w-full">
                                                <input
                                                    name="first_name"
                                                    className="text-xs border rounded px-2 py-1"
                                                    value={editFormData.first_name || ''}
                                                    onChange={handleInputChange}
                                                    placeholder="First name"
                                                />
                                                <input
                                                    name="last_name"
                                                    className="text-xs border rounded px-2 py-1"
                                                    value={editFormData.last_name || ''}
                                                    onChange={handleInputChange}
                                                    placeholder="Last name"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Email</label>
                                            <input
                                                name="email"
                                                className="text-xs border rounded px-2 py-1 w-full"
                                                value={editFormData.email || ''}
                                                onChange={handleInputChange}
                                                placeholder="Email"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Role</label>
                                            <select
                                                name="role"
                                                className="text-xs border rounded px-2 py-1 w-full"
                                                value={editFormData.role || ''}
                                                onChange={handleInputChange}
                                            >
                                                {availableRoles.map(role => (
                                                    <option key={role} value={role}>
                                                        {role}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-2">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleSaveEdit(user.id)}
                                                className="text-white text-xs"
                                            >
                                                <Check className="w-3 h-3 mr-1" />
                                                Save
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                                className="text-xs"
                                            >
                                                <X className="w-3 h-3 mr-1" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <span className="text-gray-600 text-xs font-medium">
                                                        {user?.first_name?.charAt(0) ?? ''}{user?.last_name?.charAt(0) ?? ''}
                                                    </span>
                                                </div>
                                                <div className="ml-2">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[160px]">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant={getRoleBadgeVariant(user.role)} >
                                                {user.role}
                                            </Badge>
                                        </div>
                                        <div className="mt-2">
                                            <div className="text-xs text-gray-500 mb-2">
                                                ID: <span className="font-mono">{user.id}</span>
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditClick(user)}
                                                    className="text-blue-600 hover:text-blue-900 text-xs"
                                                >
                                                    <Edit className="w-3 h-3 mr-1" />
                                                    Edit
                                                </Button>

                                                {confirmDelete === user.id ? (
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => onDeleteUser(user.id)}
                                                            className="text-xs"
                                                        >
                                                            Confirm
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={onCancelDelete}
                                                            className="text-xs"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDeleteUser(user.id)}
                                                        className="text-red-600 hover:text-red-900 text-xs"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" />
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}


            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    {searchTerm ? 'No users match your search' : 'No users found'}
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap w-[500px]">
                                        {editingUserId === user.id ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <span className="text-gray-600 font-medium">
                                                        {editFormData.first_name?.charAt(0) ?? ''}{editFormData.last_name?.charAt(0) ?? ''}
                                                    </span>
                                                </div>
                                                <div className="space-x-2">
                                                    <input
                                                        name="first_name"
                                                        className="text-sm border rounded px-2 py-1 w-24"
                                                        value={editFormData.first_name || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="First name"
                                                    />
                                                    <input
                                                        name="last_name"
                                                        className="text-sm border rounded px-2 py-1 w-24"
                                                        value={editFormData.last_name || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="Last name"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <span className="text-gray-600 font-medium">
                                                        {user?.first_name?.charAt(0) ?? ''}{user?.last_name?.charAt(0) ?? ''}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-[400px]">
                                        {editingUserId === user.id ? (
                                            <input
                                                name="email"
                                                className="text-sm border rounded px-2 py-1 w-full"
                                                value={editFormData.email || ''}
                                                onChange={handleInputChange}
                                                placeholder="Email"
                                            />
                                        ) : (
                                            user.email
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap w-[150px]">
                                        {editingUserId === user.id ? (
                                            <select
                                                name="role"
                                                className="text-sm border rounded px-2 py-1"
                                                value={editFormData.role || ''}
                                                onChange={handleInputChange}
                                            >
                                                {availableRoles.map(role => (
                                                    <option key={role} value={role}>
                                                        {role}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Badge variant={getRoleBadgeVariant(user.role)}>
                                                {user.role}
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="font-mono">{user.id}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {editingUserId === user.id ? (
                                                <>
                                                    <Button
                                                        variant="success"
                                                        size="icon"
                                                        onClick={() => handleSaveEdit(user.id)}
                                                        className="text-white"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        onClick={handleCancelEdit}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditClick(user)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            )}

                                            {confirmDelete === user.id ? (
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => onDeleteUser(user.id)}
                                                    >
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={onCancelDelete}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                        Total users: <span className="font-semibold">{users.length}</span>
                        {searchTerm && (
                            <> (filtered from {totalUsers})</>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserTable;