import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import Container from "../ui/Container";
import SectionHeader from "../ui/SectionHeader";
import Card from "../ui/Card";
import { testimonialsService } from "../../services/firebaseService";

function isEmbeddableVideoUrl(url) {
  if (!url) return false;
  const u = String(url);
  return (
    u.includes("youtube.com/") ||
    u.includes("youtu.be/") ||
    u.includes("player.vimeo.com/") ||
    u.includes("vimeo.com/")
  );
}

export default function StudentTestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const data = await testimonialsService.getTestimonials(true); // Only active testimonials
      setTestimonials(data);
    } catch (error) {
      console.error("Error loading testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-white via-slate-50/30 to-white py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-md space-y-4 py-8 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
            <p className="text-sm font-medium text-brand-black/55">
              Loading testimonials…
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <div className="h-36 w-full max-w-[10rem] animate-pulse rounded-2xl bg-black/[0.06]" />
              <div className="hidden h-36 w-full max-w-[10rem] animate-pulse rounded-2xl bg-black/[0.06] sm:block" />
              <div className="hidden h-36 w-full max-w-[10rem] animate-pulse rounded-2xl bg-black/[0.06] md:block" />
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <>
      <section className="bg-gradient-to-b from-white via-slate-50/30 to-white py-16 md:py-20">
        <Container>
          <SectionHeader
            eyebrow="Student Success Stories"
            title="What Our Students Say"
            subtitle="Real testimonials from students who achieved their dreams with our coaching."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {/* Student Image or Video Thumbnail */}
                    <div className="relative mb-4 overflow-hidden rounded-xl ring-1 ring-black/[0.06]">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.studentName}
                          className="h-48 w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-brand-navy/12 via-brand-purple/10 to-brand-orange/10">
                          <div className="text-center">
                            <p className="text-sm font-semibold text-brand-navy">
                              {testimonial.studentName || "Student"}
                            </p>
                            <p className="mt-1 text-xs text-brand-black/60">
                              {testimonial.videoUrl ? "Video testimonial" : "Testimonial"}
                            </p>
                          </div>
                        </div>
                      )}

                      {testimonial.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setSelectedVideo(testimonial)}
                          className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors hover:bg-black/45"
                          aria-label="Play testimonial video"
                        >
                          <div className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/10">
                            <Play className="h-6 w-6 text-brand-navy fill-brand-navy" />
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Student Info */}
                    <div>
                      <h3 className="text-base font-semibold text-brand-navy">
                        {testimonial.studentName}
                      </h3>
                      {testimonial.achievement && (
                        <p className="text-xs text-brand-orange font-semibold uppercase tracking-wide mt-1">
                          {testimonial.achievement}
                        </p>
                      )}
                      {testimonial.exam && (
                        <p className="text-sm text-brand-black/70 mt-2">
                          {testimonial.exam}
                        </p>
                      )}
                    </div>

                    {/* Testimonial Text */}
                    <p className="mt-4 text-sm leading-relaxed text-brand-black/70 line-clamp-4">
                      "{testimonial.content}"
                    </p>

                    {/* Rating */}
                    {testimonial.rating && (
                      <div className="mt-4 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-4 w-4 rounded-full ${
                              i < testimonial.rating
                                ? "bg-brand-orange"
                                : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-2xl">
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-10 right-0 z-10 rounded-lg p-1 text-white transition-colors hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
              {isEmbeddableVideoUrl(selectedVideo.videoUrl) ? (
                <iframe
                  src={`${selectedVideo.videoUrl}${selectedVideo.videoUrl.includes("?") ? "&" : "?"}autoplay=1`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedVideo.studentName}
                />
              ) : (
                <video
                  key={selectedVideo.videoUrl}
                  src={selectedVideo.videoUrl}
                  className="h-full w-full"
                  controls
                  playsInline
                  preload="metadata"
                />
              )}
            </div>
            {selectedVideo.studentName && (
              <div className="mt-4 text-white">
                <p className="font-semibold text-lg">
                  {selectedVideo.studentName}
                </p>
                {selectedVideo.achievement && (
                  <p className="text-sm text-gray-400">
                    {selectedVideo.achievement}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
