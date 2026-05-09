import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { contactsService } from "../services/firebaseService";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
    setError("");
    setSuccess(false);

    try {
      await contactsService.submitContact({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
      });

      setSuccess(true);
      setFormData({
        name: "",
        phone: "",
        email: "",
        message: "",
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Contact us"
      subtitle="We'd love to hear from you! Send us a message and we'll respond as soon as possible."
    >
      <section className="bg-white/60 py-14">
        <Container>
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-brand-navy">Get In Touch</h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Form */}
            <div>
              <Card color="blue">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {success && (
                    <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                      <p className="text-green-700 font-medium">
                        Thank you! Your message has been sent successfully.
                        We'll get back to you soon.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">
                      Full name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full name"
                      required
                      className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      required
                      className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      required
                      className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Message"
                      required
                      rows="5"
                      className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-navy/20"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Sending..." : "Send Now"}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact Information */}
            <div>
              <Card color="orange">
                <h3 className="text-2xl font-bold text-brand-navy mb-6">
                  Talk To Us
                </h3>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-green/10">
                        <Mail className="h-6 w-6 text-brand-green" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-black">EMAIL</h4>
                      <p className="text-sm text-brand-black/70 mt-1">
                        karthikeyananalysisstudycircle@gmail.com
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-green/10">
                        <Phone className="h-6 w-6 text-brand-green" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-black">
                        PHONE NUMBER
                      </h4>
                      <p className="text-sm text-brand-black/70 mt-1">
                        +91 63859 39895
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-green/10">
                        <MapPin className="h-6 w-6 text-brand-green" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-black">
                        ADDRESS
                      </h4>
                      <p className="text-sm text-brand-black/70 mt-1">
                        No - 110, Uthamar Gandhi Road, Chennai – 600034.
                      </p>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div>
                    <h4 className="font-semibold text-brand-black mb-4">
                      Follow Us:
                    </h4>
                    <div className="flex gap-4">
                      <a
                        href="https://t.me/karthikeyananalysis"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-brand-navy text-white hover:bg-brand-navy/80 transition"
                        aria-label="Telegram"
                      >
                        <i className="fab fa-telegram text-sm"></i>
                      </a>
                      <a
                        href="https://youtube.com/@karthikeyananalysis"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                        aria-label="YouTube"
                      >
                        <i className="fab fa-youtube text-sm"></i>
                      </a>
                      <a
                        href="https://www.instagram.com/karthikeyan_analysis?igsh=ZWw2ZGd6ZnEyeHA="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition"
                        aria-label="Instagram"
                      >
                        <i className="fab fa-instagram text-sm"></i>
                      </a>
                      <a
                        href="https://wa.me/message/LNAXQMM3G4OBM1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-500 text-white hover:bg-green-600 transition"
                        aria-label="WhatsApp"
                      >
                        <i className="fab fa-whatsapp text-sm"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Google Maps Section */}
      <section className="bg-white py-14">
        <Container>
          <div className="rounded-2xl overflow-hidden shadow-lg h-96">
            <iframe
              src="https://maps.google.com/maps?q=13%C2%B003%2742.5%22N%2080%C2%B014%2748.3%22E&t=m&z=15&output=embed&iwloc=near"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Karthikeyan Analysis Location"
            />
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
