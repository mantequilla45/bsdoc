import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { ProfileUser } from './ProfileUser';
import { Badge } from './Badge';
import { Button } from './Button';

interface UserTableProps {
    users: ProfileUser[];
    totalUsers: number;
    searchTerm: string;
    confirmDelete: string | null;
    onEditUser: (id: string) => void;
    onDeleteUser: (id: string) => void;
    onCancelDelete: () => void;
}

// Function to get role badge variant
const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
        case 'admin':
            return 'danger';
        case 'moderator':
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
    onEditUser,
    onDeleteUser,
    onCancelDelete
}) => {
    return (
        <>
            <div className="overflow-x-auto">
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
                                    <td className="px-6 py-4 whitespace-nowrap">
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
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={getRoleBadgeVariant(user.role)}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="font-mono">{user.id.slice(0, 8)}...</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEditUser(user.id)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Edit
                                            </Button>

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
                                                    size="sm"
                                                    onClick={() => onDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                    Total users: <span className="font-semibold">{users.length}</span>
                    {searchTerm && (
                        <> (filtered from {totalUsers})</>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserTable;