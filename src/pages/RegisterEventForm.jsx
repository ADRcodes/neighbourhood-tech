import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SelectField from "../components/SelectField";
import { MOCK_EVENTS } from "../data/mockEvents";

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
  const navigate = useNavigate();

  useEffect(() => {
    const collect = () => {
      const map = new Map();
      MOCK_EVENTS.forEach((ev) => {
        if (ev?.venue?.id) {
          map.set(ev.venue.id, ev.venue);
        }
      });
      return Array.from(map.values());
    };
    setVenues(collect());
  }, []);

  const [organizers, setOrganizers] = useState([]);

  useEffect(() => {
    const collect = () => {
      const map = new Map();
      MOCK_EVENTS.forEach((ev) => {
        if (ev?.organizer?.id) {
          map.set(ev.organizer.id, ev.organizer);
        }
      });
      return Array.from(map.values());
    };
    setOrganizers(collect());
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
        alert("Successfully created event!");
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
        navigate("/");
      })
      .catch((err) => console.error("Error creating event:", err));
  };

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#fce7f3_0%,transparent_45%),radial-gradient(circle_at_bottom,#dbeafe_0%,transparent_40%)]">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-soft-light" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-[190px] z-30 flex justify-center">
        <div className="rounded-2xl max-w-[500px] border border-brand-200/70 bg-white/95 mx-6 px-10 py-8 text-center text-sm text-text shadow-[0_18px_40px_-30px_rgba(16,24,40,0.5)]">
          <p className="text-sm font-semibold text-text">Event submissions are a work in progress.</p>
          <p className="mt-2 text-text-muted">
            If you’d like to add your events, send me a link to a public calendar or a site where you have them listed (other than Facebook) at{" "}
            <a className="font-semibold text-primary hover:underline" href="mailto:alexrussellria@gmail.com">
              alexrussellria@gmail.com
            </a>
            .
          </p>
        </div>
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-[368px] z-20 w-[180vw] -translate-x-1/2 rotate-[-20deg] border-y border-black/40 text-black text-center text-xs font-bold uppercase tracking-[0.4em] shadow-[0_20px_60px_-34px_rgba(0,0,0,0.7)]"
        style={{
          background:
            "repeating-linear-gradient(45deg, rgb(246, 208, 0) 0 22px, rgb(15, 15, 15) 22px 44px)",
        }}
        aria-hidden="true"
      >
        <div className="relative py-5">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-[#f6d000] px-6 py-1.5 text-black shadow-[0_10px_24px_-16px_rgba(0,0,0,0.6)] whitespace-nowrap">
              Under Construction • Under Construction • Under Construction • Under Construction • Under Construction
            </span>
          </div>
        </div>
      </div>
      <div className="relative mx-auto max-w-4xl px-4 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="lg:w-1/3 space-y-8 text-text lg:pr-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-text-muted font-semibold">Host</p>
              <h1 className="mt-3 text-3xl lg:text-4xl font-semibold text-text/70">Launch a neighbourhood event</h1>
              <p className="mt-4 text-text-muted/80 leading-relaxed">Share your workshop, meetup, or jam session. We’ll feature it across the community and highlight it in the weekly drop.</p>
            </div>
            <div className="rounded-3xl border border-brand-200/60 bg-surface/80 p-5 lg:p-6 shadow-[0_18px_40px_-28px_rgba(16,24,40,0.55)] space-y-3 text-text-muted/80">
              <p className="text-sm text-text-muted font-semibold">Tips</p>
              <ul className="space-y-3 text-sm leading-relaxed">
                <li>• Outline what attendees will learn or do.</li>
                <li>• Include venue directions and accessibility notes.</li>
                <li>• Add tags so the right crowd finds you.</li>
              </ul>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <form
              onSubmit={handleSubmit}
              aria-disabled="true"
              className="space-y-6 rounded-3xl border border-brand-200/70 bg-surface/95 backdrop-blur-xl p-6 lg:p-8 shadow-[0_40px_100px_-60px_rgba(16,24,40,0.65)] opacity-60"
            >
              <fieldset disabled className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-text mb-2">Event title</label>
                    <input
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-text shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      name="title"
                      placeholder="Neighbourhood Prototype Night"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Host / Company</label>
                    <input
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-text shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      name="company"
                      placeholder="Neighbourhood Tech"
                      value={formData.company}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Date & time</label>
                    <input
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-text shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Organizer</label>
                    <SelectField
                      name="organizerId"
                      value={formData.organizerId}
                      onChange={handleChange}
                      placeholder={organizers.length ? "Select organizer" : "Loading organizers..."}
                      options={organizers.map((o) => ({ value: o.id, label: o.name }))}
                      onCreate={(label) => {
                        const newId = Date.now();
                        const newOption = { id: newId, name: label };
                        setOrganizers((prev) => [...prev, newOption]);
                        setFormData((prev) => ({ ...prev, organizerId: newId }));
                      }}
                      disabled={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Venue</label>
                    <SelectField
                      name="venueId"
                      value={formData.venueId}
                      onChange={handleChange}
                      placeholder={venues.length ? "Select venue" : "Loading venues..."}
                      options={venues.map((v) => ({ value: v.id, label: v.name }))}
                      onCreate={(label) => {
                        const newId = Date.now();
                        const newOption = { id: newId, name: label };
                        setVenues((prev) => [...prev, newOption]);
                        setFormData((prev) => ({ ...prev, venueId: newId }));
                      }}
                      disabled={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Capacity</label>
                    <input
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-text shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      type="number"
                      name="capacity"
                      placeholder="50"
                      value={formData.capacity}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Ticket price (CAD)</label>
                    <input
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-text shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      type="number"
                      step="0.01"
                      name="price"
                      placeholder="0 for free"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-text mb-2">Tags</label>
                    <input
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-text shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      name="tags"
                      placeholder="design, networking, coffee"
                      value={formData.tags}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-text mb-2">Description</label>
                    <textarea
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-text shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[140px]"
                      name="description"
                      placeholder="What should folks expect? Agenda, vibe, who it's for..."
                      value={formData.description}
                      onChange={handleChange}
                      maxLength="2000"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-onprimary px-5 py-2.5 text-sm font-semibold shadow-[0_16px_36px_-20px_rgba(220,73,102,0.95)]"
                >
                  Publish event
                </button>
              </fieldset>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 px-4 py-2 text-sm font-semibold text-text-muted hover:text-text hover:border-brand-200 transition"
              >
                ← Back home
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterEventForm;
