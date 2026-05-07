import PageLayout from "../components/layout/PageLayout";
import Container from "../components/ui/Container";

export default function PrivacyPolicyPage() {
  return (
    <PageLayout
      title="Privacy Policy"
      subtitle="We respect your privacy and are committed to protecting your personal data."
    >
      <section className="bg-white/60 py-10 sm:py-14">
        <Container>
          <div className="prose max-w-none text-brand-black/80">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Karthikeyan Analysis Study Circle ("we," "us," "our," or
              "Company") is committed to protecting your privacy. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways. The
              information we may collect on the site includes:
            </p>
            <ul>
              <li>
                <strong>Personal Data:</strong> Name, email address, phone
                number, address, educational background, and payment information
              </li>
              <li>
                <strong>Usage Data:</strong> Browser type, IP address, pages
                visited, time spent on pages, and other diagnostic data
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies to enhance your
                experience and track usage patterns
              </li>
              <li>
                <strong>Communication Data:</strong> Messages sent through
                contact forms or email
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Use of Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our courses and services</li>
              <li>
                Send course updates, notifications, and promotional materials
              </li>
              <li>Process your transactions and send related information</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Monitor and analyze trends and usage for improvement</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>4. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share information only with service providers who
              assist us in operating our website and conducting our business,
              subject to strict confidentiality agreements.
            </p>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your
              personal information against unauthorized access, alteration,
              disclosure, or destruction. However, no method of transmission
              over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access, update, or delete your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Request restrictions on how we use your data</li>
              <li>
                Lodge a complaint with relevant data protection authorities
              </li>
            </ul>
          </section>

          <section>
            <h2>7. Third-Party Services</h2>
            <p>
              Our website may contain links to third-party websites. We are not
              responsible for their privacy practices. We encourage you to
              review their privacy policies before providing any information.
            </p>
          </section>

          <section>
            <h2>8. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2>9. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy
              practices, please contact us at:
            </p>
            <div className="mt-4 rounded-xl border border-black/10 bg-white p-4">
              <p>Email: karthikeyananalysisstudycircle@gmail.com</p>
              <p>Phone: +91 63859 39895</p>
              <p>Address: No - 110, Uthamar Gandhi Road, Chennai - 600034</p>
            </div>
          </section>

          <p className="text-sm text-brand-black/50">Last Updated: April 2026</p>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
