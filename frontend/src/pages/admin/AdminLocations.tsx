import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { LocationItem } from '../../types';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminLocations: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [active, setActive] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getLocations();
      setLocations(data);
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setName('');
    setDescription('');
    setFloorNumber('');
    setActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (loc: LocationItem) => {
    setEditingLocation(loc);
    setName(loc.name);
    setDescription(loc.description || '');
    setFloorNumber(loc.floorNumber || '');
    setActive(loc.active);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingLocation) {
        await adminApi.updateLocation(editingLocation.id, {
          name,
          description,
          floorNumber,
          active,
        });
      } else {
        await adminApi.createLocation({
          name,
          description,
          floorNumber,
          active,
        });
      }
      setModalOpen(false);
      loadLocations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save hospital location.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Hospital Locations & Departments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage physical wards, clinics, counters, and departments in the hospital.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hospital Area</span>
        </button>
      </div>

      {/* Locations Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading hospital departments..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Department / Area</th>
                  <th className="px-6 py-3.5">Floor / Wing</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {loc.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {loc.floorNumber || 'Ground / General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-md">
                      {loc.description || 'Hospital facility'}
                    </td>
                    <td className="px-6 py-4">
                      {loc.active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Disabled</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(loc)}
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-hospital-600 font-semibold p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT LOCATION MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLocation ? 'Edit Hospital Location' : 'Add Hospital Location'}
        subtitle="Defines location options for complainants after scanning the Universal QR"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Area Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pharmacy / Drug Dispensing"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Floor / Wing</label>
              <input
                type="text"
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
                placeholder="e.g. Ground Floor, Wing B"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Department description or landmarks..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white font-bold"
            >
              {actionLoading ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
