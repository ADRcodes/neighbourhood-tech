import React, { useState, useEffect } from "react";
import "./RegisterEventForm.css";

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

  useEffect(() => {
    fetch("http://localhost:8080/api/venues")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch venues");
        return res.json();
      })
      .then((data) => setVenues(data))
      .catch((err) => console.error("Error fetching venues:", err));
  }, []);

  const [organizers, setOrganizers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/organizers")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch organizers");
        return res.json();
      })
      .then((data) => setOrganizers(data))
      .catch((err) => console.error("Error fetching organizers:", err));
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
      date: formData.date,
      description: formData.description,
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity),
      organizer: { id: parseInt(formData.organizerId) },
      venue: { id: parseInt(formData.venueId) },
      tags: formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim())
        : [],
    };

    console.log("Submitting event payload:", payload);

    fetch("http://localhost:8080/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create event");
        return res.json();
      })
      .then((data) => {
        console.log("Event created:", data);
        setFormData({
          company: "",
          title: "",
          date: "",
          description: "",
          price: "",
          capacity: "",
          venueId: "",
          tags: "",
        });
      })
      .catch((err) => console.error("Error creating event:", err));
  };

  return (
    <div className="phone-frame tiled-background">
      <div className="register-event-container">
        <h1>Create New Event</h1>

        <form onSubmit={handleSubmit} className="register-event-form">
          <input
            className="input-field"
            name="company"
            placeholder="Company"
            value={formData.company}
            onChange={handleChange}
            required
          />
          <input
            className="input-field"
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            className="input-field"
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <textarea
            className="input-field"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            maxLength="2000"
            required
          />
          <input
            className="input-field"
            type="number"
            step="0.01"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <input
            className="input-field"
            type="number"
            name="capacity"
            placeholder="Capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            required
          />

          <select
            className="input-field"
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
            className="input-field"
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
            className="input-field"
            name="tags"
            placeholder="Tags (comma separated)"
            value={formData.tags}
            onChange={handleChange}
          />

          <button type="submit" className="auth-button register-button">
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterEventForm;
