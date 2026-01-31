"use client";
import React, { useState } from "react";
import { IoSend } from "react-icons/io5";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="prose prose-lg mx-auto py-12 px-4 max-w-xl">
      <h2>Contact Us</h2>
      <p className="alert alert-soft alert-info mb-3">
        Have questions or feedback? We would love to hear from you. Fill out the
        form below and we will get back to you as soon as possible.
      </p>

      {success && (
        <div className="alert alert-success mb-4">
          <span>Your message has been sent successfully!</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label block">
            <span className="label-text">Name</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label block">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label block">
            <span className="label-text">Subject</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Message subject"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label block">
            <span className="label-text">Message</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your message"
            className="textarea textarea-bordered h-32 w-full"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          <IoSend />
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </main>
  );
}
