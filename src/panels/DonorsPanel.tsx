import React, { useEffect, useState } from "react";

import { _Donor as Donor } from "../models/donor";
import * as donorService from "../services/donorService";

const DonorsPanel: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [view, setView] = useState<"list" | "detail" | "form">("list");
  const [selected, setSelected] = useState<Donor | null>(null);
  const [formData, setFormData] = useState<Partial<Donor>>({});

  useEffect(() => {
    void loadDonors();
  }, []);

  const loadDonors = async () => {
    const data = await donorService.getDonors();
    setDonors(data);
  };

  const handleCreate = () => {
    setFormData({});
    setSelected(null);
    setView("form");
  };

  const handleEdit = (donor: Donor) => {
    setSelected(donor);
    setFormData(donor);
    setView("form");
  };

  const handleView = (donor: Donor) => {
    setSelected(donor);
    setView("detail");
  };

  const handleDelete = async (donor: Donor) => {
    if (window.confirm(`Delete donor ${donor.name}?`)) {
      await donorService.deleteDonor(donor.id);
      void loadDonors();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      await donorService.updateDonor(selected.id, formData);
    } else {
      await donorService.createDonor(formData);
    }
    await loadDonors();
    setView("list");
    setSelected(null);
    setFormData({});
  };

  if (view === "detail" && selected) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setView("list")}
          className="text-blue-600 hover:underline"
        >
          ← Back to Donors
        </button>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-xl font-semibold mb-2">{selected.name}</h3>
          <p className="text-gray-700">Email: {selected.email}</p>
          {selected.phone && (
            <p className="text-gray-700">Phone: {selected.phone}</p>
          )}
          {selected.address && (
            <p className="text-gray-700">Address: {selected.address}</p>
          )}
          {selected.notes && (
            <p className="text-gray-700">Notes: {selected.notes}</p>
          )}
          <p className="text-gray-700">Total Given: ${selected.totalGiven}</p>
          {selected.givingHistory && selected.givingHistory.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Giving History</h4>
              <ul className="list-disc pl-5 text-gray-700">
                {selected.givingHistory.map((g, idx) => (
                  <li key={idx}>
                    {g.date.toLocaleDateString()} - ${g.amount}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 space-x-2">
            <button
              onClick={() => handleEdit(selected)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(selected)}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "form") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <h3 className="text-xl font-semibold">
          {selected ? "Edit Donor" : "New Donor"}
        </h3>
        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={formData.email || ""}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Phone"
          value={formData.phone || ""}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Address"
          value={formData.address || ""}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
        <div className="space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setView("list");
              setSelected(null);
            }}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Donors</h3>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Donor
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Total Given</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor) => (
              <tr key={donor.id} className="border-t">
                <td className="p-2">{donor.name}</td>
                <td className="p-2">{donor.email}</td>
                <td className="p-2">${donor.totalGiven}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => handleView(donor)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(donor)}
                    className="text-green-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(donor)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonorsPanel;
