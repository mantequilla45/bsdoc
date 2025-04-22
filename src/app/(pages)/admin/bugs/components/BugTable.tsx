/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2, XCircle, Save, Eye } from 'lucide-react';
import { Button } from '../../user-management/components/Button';
import { FaCheck } from 'react-icons/fa6';

interface BugReport {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string | null;
    status: string;
    user_id: string | null;
    created_at: string;
    updated_at: string | null;
    profiles: {
        email: string | null;
    } | null;
}

interface BugTableProps {
    bugs: BugReport[];
    totalBugs: number;
    searchTerm: string;
    onViewBug: (id: string) => void;
    onUpdateBug: (id: string, updatedBugData: Partial<BugReport>) => void;
    onDeleteBug: (id: string) => void;
}

const BugTable: React.FC<BugTableProps> = ({
    bugs,
    totalBugs,
    searchTerm,
    onViewBug,
    onUpdateBug,
    onDeleteBug
}) => {
    const [sortField, setSortField] = useState<keyof BugReport>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [editingBug, setEditingBug] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<BugReport>>({});
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    // Handle sorting
    const handleSort = (field: keyof BugReport) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Get sorted bugs
    const getSortedBugs = () => {
        if (!bugs) return [];

        return [...bugs].sort((a, b) => {
            let valueA: any;
            let valueB: any;

            // Handle nested fields like profiles.email
            if (sortField === 'profiles') {
                valueA = a.profiles?.email || '';
                valueB = b.profiles?.email || '';
            } else {
                valueA = a[sortField] || '';
                valueB = b[sortField] || '';
            }

            // Convert to lowercase if string
            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();

            // Compare based on direction
            if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Start editing a bug
    const startEditing = (bug: BugReport) => {
        setEditingBug(bug.id);
        setEditFormData({
            title: bug.title,
            description: bug.description,
            category: bug.category,
            severity: bug.severity,
            status: bug.status
        });
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingBug(null);
        setEditFormData({});
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    // Save edited bug
    const saveBug = (id: string) => {
        onUpdateBug(id, editFormData);
        setEditingBug(null);
        setEditFormData({});
    };

    // Delete bug
    const deleteBug = (id: string) => {
        if (confirmDelete === id) {
            onDeleteBug(id);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setConfirmDelete(null);
    };

    const renderSortIcon = (field: keyof BugReport) => {
        if (sortField !== field) return <ChevronDown className="h-4 w-4 opacity-50" />;
        return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('default', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    // Format date for mobile view (shorter)
    const formatMobileDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('default', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    const getSeverityStyles = (severity: string | null) => {
        switch (severity) {
            case 'Critical':
                return 'bg-red-100 text-red-800';
            case 'High':
                return 'bg-orange-100 text-orange-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Open':
                return 'bg-blue-100 text-blue-800';
            case 'In Progress':
                return 'bg-purple-100 text-purple-800';
            case 'Resolved':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const sortedBugs = getSortedBugs();

    return (
        <div className="w-full">
            {bugs.length === 0 ? (
                <div className="text-center py-8">
                    {searchTerm ? (
                        <p className="text-gray-600">No user feedback matching "{searchTerm}"</p>
                    ) : (
                        <p className="text-gray-600">No user feedback available</p>
                    )}
                </div>
            ) : (
                <>
                    <div className="mb-4 text-sm text-gray-600">
                        {searchTerm ? `Found ${bugs.length} bugs matching "${searchTerm}"` : `Showing ${bugs.length} of ${totalBugs} total bugs`}
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden">
                        <div className="space-y-4">
                            {sortedBugs.map(bug => (
                                <div key={bug.id} className="bg-white rounded-lg shadow p-3 border border-gray-200">
                                    {editingBug === bug.id ? (
                                        // Editing mode - Mobile
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <div className="text-xs text-gray-500 font-mono">
                                                    ID: {bug.id.substring(0, 5)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatMobileDate(bug.created_at)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={editFormData.title || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-sm text-xs"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Category</label>
                                                    <select
                                                        name="category"
                                                        value={editFormData.category || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-sm text-xs"
                                                    >
                                                        <option value="Bug Report">Bug Report</option>
                                                        <option value="Feature Request/Feedback">Feature Request/Feedback</option>
                                                        <option value="General Inquiry">General Inquiry</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Severity</label>
                                                    <select
                                                        name="severity"
                                                        value={editFormData.severity || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-sm text-xs"
                                                    >
                                                        <option value="Trivial">Trivial</option>
                                                        <option value="Minor">Minor</option>
                                                        <option value="Major">Major</option>
                                                        <option value="Critical">Critical</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Status</label>
                                                <select
                                                    name="status"
                                                    value={editFormData.status || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-sm text-xs"
                                                >
                                                    <option value="Open">Open</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Resolved">Resolved</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Reporter: {bug.profiles?.email || 'Visitor'}
                                            </div>
                                            <div className="flex justify-end space-x-2 mt-2">
                                                <Button
                                                    onClick={() => saveBug(bug.id)}
                                                    variant="success"
                                                    size="sm"
                                                    className="flex items-center text-xs"
                                                >
                                                    <Save className="w-3 h-3 mr-1" />
                                                    Save
                                                </Button>
                                                <Button
                                                    onClick={cancelEditing}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="flex items-center text-xs"
                                                >
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View mode - Mobile
                                        <>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-xs font-mono text-gray-500">
                                                    {bug.id.substring(0, 5)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatMobileDate(bug.created_at)}
                                                </div>
                                            </div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                                                {bug.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                    {bug.category}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-md ${getSeverityStyles(bug.severity)}`}>
                                                    {bug.severity || 'Low'}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-md ${getStatusStyles(bug.status)}`}>
                                                    {bug.status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mb-3">
                                                Reporter: {bug.profiles?.email || 'Visitor'}
                                            </div>

                                            {confirmDelete === bug.id ? (
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        onClick={() => deleteBug(bug.id)}
                                                        variant="danger"
                                                        size="sm"
                                                        className="flex items-center text-xs"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" />
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        onClick={cancelDelete}
                                                        variant="secondary"
                                                        size="sm"
                                                        className="flex items-center text-xs"
                                                    >
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-2 justify-end">
                                                    <Button
                                                        onClick={() => onViewBug(bug.id)}
                                                        variant="primary"
                                                        size="sm"
                                                        className="flex items-center font-normal text-xs"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => startEditing(bug)}
                                                        variant="secondary"
                                                        size="sm"
                                                        className="flex items-center text-xs"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => deleteBug(bug.id)}
                                                        variant="danger"
                                                        size="sm"
                                                        className="flex items-center text-xs"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('id')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>ID</span>
                                            {renderSortIcon('id')}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('title')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Title</span>
                                            {renderSortIcon('title')}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('category')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Category</span>
                                            {renderSortIcon('category')}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('severity')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Severity</span>
                                            {renderSortIcon('severity')}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Status</span>
                                            {renderSortIcon('status')}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Created</span>
                                            {renderSortIcon('created_at')}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Reporter</span>
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedBugs.map(bug => (
                                    <tr key={bug.id} className="hover:bg-gray-50">
                                        {editingBug === bug.id ? (
                                            // Editing mode
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-[70px]">
                                                    {bug.id.substring(0, 5)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap w-[400px]">
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        value={editFormData.title || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-sm text-sm"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap w-[200px]">
                                                    <select
                                                        name="category"
                                                        value={editFormData.category || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-sm text-sm"
                                                    >
                                                        <option value="Bug Report">Bug Report</option>
                                                        <option value="Feature Request/Feedback">Feature Request/Feedback</option>
                                                        <option value="General Inquiry">General Inquiry</option>

                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap w-[120px]">
                                                    <select
                                                        name="severity"
                                                        value={editFormData.severity || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-sm text-sm"
                                                    >
                                                        <option value="Trivial">Trivial</option>
                                                        <option value="Minor">Minor</option>
                                                        <option value="Major">Major</option>
                                                        <option value="Critical">Critical</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap w-[120px]">
                                                    <select
                                                        name="status"
                                                        value={editFormData.status || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-sm text-sm"
                                                    >
                                                        <option value="Open">Open</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Resolved">Resolved</option>
                                                        <option value="Closed">Closed</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(bug.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {bug.profiles?.email || 'Visitor'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            onClick={() => saveBug(bug.id)}
                                                            variant="success"
                                                            size="sm"
                                                            className="flex items-center"
                                                        >
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={cancelEditing}
                                                            variant="secondary"
                                                            size="sm"
                                                            className="flex items-center"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            // View mode
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-[70px]">
                                                    {bug.id.substring(0, 5)}
                                                </td>
                                                <td className="px-6 py-[21px] whitespace-nowrap text-sm font-medium text-gray-900 w-[400px]">
                                                    {bug.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-[200px]">
                                                    {bug.category}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-[120px]">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityStyles(bug.severity)}`}>
                                                        {bug.severity || 'Low'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-[120px]">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(bug.status)}`}>
                                                        {bug.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(bug.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {bug.profiles?.email || 'Visitor'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {confirmDelete === bug.id ? (
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                onClick={() => deleteBug(bug.id)}
                                                                variant="danger"
                                                                size="sm"
                                                                className="flex items-center"
                                                            >
                                                                <FaCheck className="h-4 w-3" />
                                                            </Button>
                                                            <Button
                                                                onClick={cancelDelete}
                                                                variant="secondary"
                                                                size="sm"
                                                                className="flex items-center"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                onClick={() => onViewBug(bug.id)}
                                                                variant="primary"
                                                                size="sm"
                                                                className="flex items-center font-normal text-xs"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>

                                                            <Button
                                                                onClick={() => startEditing(bug)}
                                                                variant="secondary"
                                                                size="sm"
                                                                className="flex items-center"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => deleteBug(bug.id)}
                                                                variant="danger"
                                                                size="sm"
                                                                className="flex items-center"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default BugTable;