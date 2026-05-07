import PageLayout from "../components/layout/PageLayout";
import Container from "../components/ui/Container";

export default function RefundPolicyPage() {
  return (
    <PageLayout
      title="Cancellation & Refund Policy"
      subtitle="Details about course cancellations and refunds."
    >
      <section className="bg-white/60 py-10 sm:py-14">
        <Container>
          <div className="prose max-w-none text-brand-black/80">
          <section>
            <h2>1. Cancellation Policy</h2>
            <p>
              Karthikeyan Analysis Study Circle allows students to cancel their
              course enrollment within a specified period. Please review the
              cancellation timeline below:
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <h3 className="font-semibold text-brand-navy">
                  Within 7 days of enrollment
                </h3>
                <p className="mt-2">
                  Students can request a full refund if they cancel within 7
                  days of enrollment. No questions asked.
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <h3 className="font-semibold text-brand-navy">
                  7 to 30 days of enrollment
                </h3>
                <p className="mt-2">
                  A refund of 80% of the course fees will be provided if
                  cancellation is requested between 7 to 30 days of enrollment.
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <h3 className="font-semibold text-brand-navy">After 30 days</h3>
                <p className="mt-2">
                  No refund will be provided for cancellations requested after
                  30 days of enrollment. However, students can pause their
                  course for up to 3 months.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>2. Refund Process</h2>
            <p>To request a refund, follow these steps:</p>
            <ol>
              <li>
                Contact our support team at
                karthikeyananalysisstudycircle@gmail.com
              </li>
              <li>
                Provide your enrollment details and reason for cancellation
              </li>
              <li>
                Our team will verify your eligibility and process your request
              </li>
              <li>Refunds will be processed within 7-10 business days</li>
            </ol>
          </section>

          <section>
            <h2>3. Refund Method</h2>
            <p>
              Refunds will be credited back to the original payment method used
              during enrollment. Please allow 5-7 business days for the refund
              to appear in your account after processing.
            </p>
          </section>

          <section>
            <h2>4. Non-Refundable Items</h2>
            <p>
              The following are non-refundable and will not be included in
              refund calculations:
            </p>
            <ul>
              <li>Course materials already downloaded</li>
              <li>Mock tests and practice papers used</li>
              <li>One-on-one mentorship sessions attended</li>
              <li>Books or physical materials shipped</li>
            </ul>
          </section>

          <section>
            <h2>5. Course Pause Option</h2>
            <p>
              Instead of canceling, you can pause your course for up to 3 months
              without losing access to materials. Contact our support team to
              activate the pause option.
            </p>
          </section>

          <section>
            <h2>6. Special Circumstances</h2>
            <p>
              In cases of medical emergencies, hardship, or other exceptional
              circumstances, please contact our support team. We will review
              requests on a case-by-case basis and may offer alternatives such
              as course transfer or extended pause periods.
            </p>
          </section>

          <section>
            <h2>7. Batch Transfer</h2>
            <p>
              Students can request to transfer to a different batch within 30
              days of enrollment at no additional cost. After 30 days, a
              transfer fee of ₹500 may apply.
            </p>
          </section>

          <section>
            <h2>8. Book Store Refunds</h2>
            <p>
              Books and study materials purchased through our book store can be
              returned within 14 days of purchase if unopened and in original
              condition. Partial refunds apply for used materials based on
              condition.
            </p>
          </section>

          <section>
            <h2>9. Contact Support</h2>
            <p>
              For any questions or refund requests, please reach out to our
              support team:
            </p>
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
