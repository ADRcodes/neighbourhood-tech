import React, { useState, useEffect } from "react";

const RegisterEventForm = () => {
  const [formData, setFormData] = useState({
    company: "",
    title: "",
    date: "",
    description: "",
    price: "",
    capacity: "",
    organizerId: "",
    venueId: "",
    tags: "",
  });

  const [venues, setVenues] = useState([]);
  const [organizers, setOrganizers] = useState([]);

  useEffect(() => {
    // TODO: Fetch venues and organizers from backend
    // For now, using placeholder data
    setVenues([
      { id: 1, name: "Downtown Conference Center" },
      { id: 2, name: "Tech Park Hall" },
    ]);
    setOrganizers([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
    ]);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      company: formData.company,
      title: formData.title,
      date: formData.date, // backend will parse LocalDateTime
      description: formData.description,
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity),
      organizer: { id: parseInt(formData.organizerId) },
      venue: { id: parseInt(formData.venueId) },
      tags: formData.tags.split(",").map((tag) => tag.trim()),
    };

    console.log("Submitting event payload:", payload);
    // TODO: POST payload to backend endpoint
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-md mx-auto p-4 border rounded"
    >
      <input
        name="company"
        placeholder="Company"
        value={formData.company}
        onChange={handleChange}
        required
      />
      <input
        name="title"
        placeholder="Event Title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <input
        type="datetime-local"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        maxLength="2000"
        required
      />
      <input
        type="number"
        step="0.01"
        name="price"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="capacity"
        placeholder="Capacity"
        value={formData.capacity}
        onChange={handleChange}
        min="1"
        required
      />

      <select
        name="organizerId"
        value={formData.organizerId}
        onChange={handleChange}
        required
      >
        <option value="">Select Organizer</option>
        {organizers.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>

      <select
        name="venueId"
        value={formData.venueId}
        onChange={handleChange}
        required
      >
        <option value="">Select Venue</option>
        {venues.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      <input
        name="tags"
        placeholder="Tags (comma separated)"
        value={formData.tags}
        onChange={handleChange}
      />

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Event
      </button>
    </form>
  );
};

export default RegisterEventForm;
