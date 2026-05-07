import PageLayout from "../components/layout/PageLayout";
import Container from "../components/ui/Container";

export default function TermsConditionsPage() {
  return (
    <PageLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using our services."
    >
      <section className="bg-white/60 py-10 sm:py-14">
        <Container>
          <div className="prose max-w-none text-brand-black/80">
          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be
              bound by the terms and provision of this agreement. If you do not
              agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the
              materials (information or software) on Karthikeyan Analysis Study
              Circle's website for personal, non-commercial transitory viewing
              only. This is the grant of a license, not a transfer of title, and
              under this license you may not:
            </p>
            <ul>
              <li>Modifying or copying the materials</li>
              <li>
                Using the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                Attempting to decompile or reverse engineer any software
                contained on the website
              </li>
              <li>
                Removing any copyright or other proprietary notations from the
                materials
              </li>
              <li>
                Transferring the materials to another person or "mirroring" the
                materials on any other server
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Disclaimer</h2>
            <p>
              The materials on Karthikeyan Analysis Study Circle's website are
              provided on an "as is" basis. We make no warranties, expressed or
              implied, and hereby disclaim and negate all other warranties
              including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </p>
          </section>

          <section>
            <h2>4. Limitations</h2>
            <p>
              In no event shall Karthikeyan Analysis Study Circle or its
              suppliers be liable for any damages (including, without
              limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use the
              materials on the website.
            </p>
          </section>

          <section>
            <h2>5. Accuracy of Materials</h2>
            <p>
              The materials appearing on Karthikeyan Analysis Study Circle's
              website could include technical, typographical, or photographic
              errors. We do not warrant that any of the materials on our website
              are accurate, complete, or current.
            </p>
          </section>

          <section>
            <h2>6. Course Content</h2>
            <p>
              All course materials, content, and curriculum provided through our
              website are the intellectual property of Karthikeyan Analysis
              Study Circle. Students are granted a limited, non-transferable
              license to access the content for personal educational use only.
            </p>
          </section>

          <section>
            <h2>7. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Harass or cause distress or inconvenience to any person</li>
              <li>
                Transmit obscene or offensive content or disrupt the normal flow
                of dialogue
              </li>
              <li>
                Share login credentials or allow unauthorized access to your
                account
              </li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2>8. Account Termination</h2>
            <p>
              We reserve the right to terminate any account that violates these
              terms or engages in abusive behavior. Termination may be without
              notice and without refund.
            </p>
          </section>

          <section>
            <h2>9. Modifications to Terms</h2>
            <p>
              We may revise these terms of service for our website at any time
              without notice. By using this website, you are agreeing to be
              bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2>10. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in
              accordance with the laws of India, and you irrevocably submit to
              the exclusive jurisdiction of the courts located in Chennai.
            </p>
          </section>

          <section>
            <h2>11. Contact Information</h2>
            <p>
              If you have any questions about these Terms & Conditions, please
              contact us at:
            </p>
            <div className="mt-4 rounded-xl border border-black/10 bg-white p-4">
              <p>Email: karthikeyananalysisstudycircle@gmail.com</p>
              <p>Phone: +91 63859 39895</p>
            </div>
          </section>

          <p className="text-sm text-brand-black/50">Last Updated: April 2026</p>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
