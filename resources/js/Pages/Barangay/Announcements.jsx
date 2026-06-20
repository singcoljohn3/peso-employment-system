import BarangayLayout from '@/Layouts/BarangayLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    Megaphone,
    Plus,
    Edit,
    Trash2,
    Calendar,
    Clock,
    X,
    Check,
    AlertCircle
} from 'lucide-react';

export default function Announcements({ barangay }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'training',
        priority: 'medium',
        date: new Date().toISOString().split('T')[0]
    });
    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            title: 'Skills Training Program',
            content: 'Free skills training program for barangay residents. Registration starts on January 20, 2024.',
            type: 'training',
            date: '2024-01-20',
            status: 'active',
            priority: 'high'
        },
        {
            id: 2,
            title: 'Job Fair at Municipal Hall',
            content: 'Annual job fair featuring 50+ companies. Bring your resume and valid ID.',
            type: 'event',
            date: '2024-02-15',
            status: 'active',
            priority: 'medium'
        },
        {
            id: 3,
            title: 'PESO Office Hours Change',
            content: 'Starting February 1, PESO office will be open from 8AM to 5PM Monday to Friday.',
            type: 'information',
            date: '2024-02-01',
            status: 'active',
            priority: 'low'
        }
    ]);

    const getTypeColor = (type) => {
        switch (type) {
            case 'training':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'event':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'information':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'bg-red-50 text-red-700';
            case 'medium':
                return 'bg-amber-50 text-amber-700';
            case 'low':
                return 'bg-green-50 text-green-700';
            default:
                return 'bg-slate-50 text-slate-700';
        }
    };

    const deleteAnnouncement = (id) => {
        setAnnouncements(announcements.filter(a => a.id !== id));
    };

    const handleAddAnnouncement = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            alert('Please fill in all required fields');
            return;
        }

        if (editingId) {
            // Update existing announcement
            setAnnouncements(announcements.map(a => 
                a.id === editingId 
                    ? { ...a, title: formData.title, content: formData.content, type: formData.type, priority: formData.priority, date: formData.date }
                    : a
            ));
        } else {
            // Add new announcement
            const newAnnouncement = {
                id: Date.now(),
                title: formData.title,
                content: formData.content,
                type: formData.type,
                date: formData.date,
                status: 'active',
                priority: formData.priority
            };
            setAnnouncements([newAnnouncement, ...announcements]);
        }

        setFormData({
            title: '',
            content: '',
            type: 'training',
            priority: 'medium',
            date: new Date().toISOString().split('T')[0]
        });
        setEditingId(null);
        setShowAddModal(false);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleEdit = (announcement) => {
        setFormData({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            priority: announcement.priority,
            date: announcement.date
        });
        setEditingId(announcement.id);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setFormData({
            title: '',
            content: '',
            type: 'training',
            priority: 'medium',
            date: new Date().toISOString().split('T')[0]
        });
        setEditingId(null);
        setShowAddModal(false);
    };

    return (
        <BarangayLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Announcements
                </h2>
            }
        >
            <Head title="Announcements" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">Barangay Announcements</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Post and manage employment-related announcements for {barangay?.barangay_name || 'your barangay'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            New Announcement
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <Megaphone className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Announcements</p>
                                    <p className="text-lg font-bold text-slate-900">{announcements.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                    <Check className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Active</p>
                                    <p className="text-lg font-bold text-slate-900">
                                        {announcements.filter(a => a.status === 'active').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">High Priority</p>
                                    <p className="text-lg font-bold text-slate-900">
                                        {announcements.filter(a => a.priority === 'high').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Announcements List */}
                    <div className="space-y-4">
                        {announcements.length > 0 ? (
                            announcements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                                <Megaphone className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-slate-900">{announcement.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getTypeColor(announcement.type)}`}>
                                                        {announcement.type}
                                                    </span>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                                                        {announcement.priority} priority
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleEdit(announcement)}
                                                className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                            >
                                                <Edit className="h-3 w-3" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteAnnouncement(announcement.id)}
                                                className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4">{announcement.content}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(announcement.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Status: <span className="font-medium text-green-600">{announcement.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                                <Megaphone className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                <p className="text-slate-500">No announcements found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Announcement Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="mb-4 text-xl font-bold text-slate-900">{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
                        <form onSubmit={handleAddAnnouncement} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Enter announcement title"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Content</label>
                                <textarea
                                    rows={4}
                                    value={formData.content}
                                    onChange={(e) => handleInputChange('content', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Enter announcement content"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
                                    <select 
                                        value={formData.type}
                                        onChange={(e) => handleInputChange('type', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="training">Training</option>
                                        <option value="event">Event</option>
                                        <option value="information">Information</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
                                    <select 
                                        value={formData.priority}
                                        onChange={(e) => handleInputChange('priority', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    {editingId ? 'Update Announcement' : 'Post Announcement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </BarangayLayout>
    );
}
