import PageLayout from "../components/layout/PageLayout";
import Container from "../components/ui/Container";

export default function ShippingPolicyPage() {
  return (
    <PageLayout
      title="Shipping Policy"
      subtitle="Information about how we deliver books and study materials."
    >
      <section className="bg-white/60 py-10 sm:py-14">
        <Container>
          <div className="prose max-w-none text-brand-black/80">
          <section>
            <h2>1. Shipping Scope</h2>
            <p>
              This shipping policy applies to physical books and study materials
              ordered through our book store. Digital courses and online
              materials are delivered instantly via email and your course
              dashboard.
            </p>
          </section>

          <section>
            <h2>2. Shipping Methods</h2>
            <p>We offer multiple shipping options for your convenience:</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <h3 className="font-semibold text-brand-navy">Standard Shipping</h3>
                <p className="mt-2">
                  Delivery within 5-7 business days. Available across India.
                </p>
                <p className="font-semibold text-brand-orange">
                  ₹50 - ₹150 depending on location
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <h3 className="font-semibold text-brand-navy">Express Shipping</h3>
                <p className="mt-2">
                  Delivery within 2-3 business days. Available in metro cities.
                </p>
                <p className="font-semibold text-brand-orange">₹250 - ₹400</p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <h3 className="font-semibold text-brand-navy">Free Shipping</h3>
                <p className="mt-2">
                  Complimentary shipping on orders above ₹1000 (Standard
                  Shipping)
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>3. Processing Time</h2>
            <p>
              Orders are processed within 1-2 business days after confirmation.
              Processing time does not include weekends and public holidays. You
              will receive a shipping confirmation email with tracking details
              once your order is dispatched.
            </p>
          </section>

          <section>
            <h2>4. Shipping Destinations</h2>
            <p>
              We currently ship to all locations within India. For international
              shipping inquiries, please contact our support team. Shipping
              costs to international addresses will be calculated separately.
            </p>
          </section>

          <section>
            <h2>5. Tracking Your Order</h2>
            <p>
              Once your order is shipped, you will receive a tracking number via
              email. You can use this number to track your package in real-time
              through our shipping partner's website.
            </p>
          </section>

          <section>
            <h2>6. Delivery Address</h2>
            <p>
              Please ensure that you provide a complete and accurate delivery
              address during checkout. We are not responsible for deliveries to
              incorrect addresses provided by customers. Changes to delivery
              address can only be made before the order is shipped.
            </p>
          </section>

          <section>
            <h2>7. Damaged or Lost Shipments</h2>
            <p>
              In case of damaged or lost shipments, please report within 48
              hours of receiving the package. Provide photos of the damage and
              the tracking number. We will investigate and offer replacement or
              refund as appropriate.
            </p>
          </section>

          <section>
            <h2>8. Non-Delivery</h2>
            <p>
              If your order is not delivered within the promised timeframe,
              please contact our support team. We will investigate with the
              shipping partner and provide an updated delivery date or process a
              refund.
            </p>
          </section>

          <section>
            <h2>9. Return Shipping</h2>
            <p>
              For eligible returns, customers are responsible for return
              shipping costs unless the item is defective or damaged. We
              recommend using a courier service that provides tracking for your
              protection.
            </p>
          </section>

          <section>
            <h2>10. Delays & Force Majeure</h2>
            <p>
              We are not responsible for delays caused by circumstances beyond
              our control, including natural disasters, strikes, war, pandemics,
              or government actions. We will make reasonable efforts to notify
              you of any significant delays.
            </p>
          </section>

          <section>
            <h2>11. Contact Support</h2>
            <p>For shipping inquiries or issues, please contact us:</p>
            <div className="mt-4 rounded-xl border border-black/10 bg-white p-4">
              <p>Email: karthikeyananalysisstudycircle@gmail.com</p>
              <p>Phone: +91 63859 39895</p>
              <p>WhatsApp: https://wa.me/message/LNAXQMM3G4OBM1</p>
              <p>Hours: Monday - Saturday, 9 AM - 6 PM IST</p>
            </div>
          </section>

          <p className="text-sm text-brand-black/50">Last Updated: April 2026</p>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
