import OverflowReset from "./overflowReset";

export const metadata = {
  title: "Terms of Service | FetishClip",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <OverflowReset />
      <h1 className="text-3xl font-extrabold mb-6">Terms of Service</h1>
      <p className="mb-6 text-gray-500 italic">Last updated: July 26, 2025</p>
      <ol className="list-decimal ml-5 space-y-6 text-gray-800">
        <li>
          <strong>Introduction</strong>
          <p>
            Welcome to FetishClip ("we", "us", "our", or "the Service"), an
            online video platform providing adult, fetish, and NSFW video
            content for adults aged 18 and over. By accessing or using our
            website ({" "}
            <a
              href="https://www.fetishclip.com"
              className="text-orange-600 underline"
              target="_blank"
            >
              www.fetishclip.com
            </a>
            ) or any of our online services (including mobile versions), you
            agree to these Terms of Service ("Terms") and confirm you are of age
            of majority in your jurisdiction.
          </p>
        </li>
        <li>
          <strong>Eligibility &amp; Age Restriction</strong>
          <ul className="list-disc ml-5">
            <li>
              You must be at least 18 years old (or legal age in your country)
              to use this Service.
            </li>
            <li>
              By using this Service, you affirm you meet the age requirement and
              agree to provide accurate information.
            </li>
          </ul>
        </li>
        <li>
          <strong>User Accounts</strong>
          <ul className="list-disc ml-5">
            <li>
              You must register for an account to use premium features. Account
              details must be accurate and kept up to date.
            </li>
            <li>
              You are responsible for your account security. Alert us
              immediately of unauthorized activity.
            </li>
            <li>You may not share access or credentials with others.</li>
          </ul>
        </li>
        <li>
          <strong>Content</strong>
          <ul className="list-disc ml-5">
            <li>
              Content is adult-oriented and may not be suitable for all
              audiences. You access such content at your own risk.
            </li>
            <li>
              It is forbidden to upload, request, or share any illegal,
              non-consensual, underage, or otherwise restricted material.
            </li>
            <li>
              We reserve the right (but have no obligation) to monitor, remove,
              or restrict any content that violates these Terms or applicable
              law.
            </li>
          </ul>
        </li>
        <li>
          <strong>Payments and Subscriptions</strong>
          <ul className="list-disc ml-5">
            <li>
              Payments are managed by third-party providers (such as Stripe). By
              subscribing, you agree to their terms and privacy policy.
            </li>
            <li>
              Subscriptions renew automatically unless canceled. You may cancel
              at any time in your account settings.
            </li>
            <li>No refunds except as required by law.</li>
          </ul>
        </li>
        <li>
          <strong>Intellectual Property</strong>
          <ul className="list-disc ml-5">
            <li>
              All content (including site design, text, videos, graphics) is the
              property of FetishClip or its licensors.
            </li>
            <li>
              Do not copy, reproduce, or distribute any content without written
              permission.
            </li>
          </ul>
        </li>
        <li>
          <strong>User Conduct</strong>
          <ul className="list-disc ml-5">
            <li>You agree to use the Service responsibly and respectfully.</li>
            <li>
              Strictly prohibited: harassment, hate speech, illegal activity,
              uploading viruses/malware, exploiting security gaps.
            </li>
            <li>
              Any violations may result in account suspension or deletion.
            </li>
          </ul>
        </li>
        <li>
          <strong>Privacy</strong>
          <p>
            We are committed to privacy and data protection. See our{" "}
            <a href="/privacy" className="text-orange-600 underline">
              Privacy Policy
            </a>{" "}
            for details. By using the Service, you consent to the collection and
            processing of your data as described therein.
          </p>
        </li>
        <li>
          <strong>Liability Disclaimer</strong>
          <ul className="list-disc ml-5">
            <li>
              This Service is provided “as is”. We do not guarantee uptime,
              availability, or suitability for any particular purpose.
            </li>
            <li>
              To the maximum extent permitted by law, FetishClip and its
              affiliates are not liable for damages arising from your use of the
              Service.
            </li>
            <li>
              We do not endorse or guarantee the accuracy, legality, or
              suitability of user-submitted content.
            </li>
          </ul>
        </li>
        <li>
          <strong>EU Rights and Dispute Resolution</strong>
          <ul className="list-disc ml-5">
            <li>
              EU users have rights under the GDPR and EU consumer protection
              rules.
            </li>
            <li>
              Disputes should be addressed to us first at{" "}
              <a
                href="mailto:support@fetishclip.com"
                className="text-orange-600 underline"
              >
                support@fetishclip.com
              </a>
              . Unresolved disputes may qualify for resolution through the EU
              Online Dispute Resolution platform.
            </li>
          </ul>
        </li>
        <li>
          <strong>Changes to Terms</strong>
          <ul className="list-disc ml-5">
            <li>
              We may update these Terms from time to time. We will notify you of
              changes by email or site notice.
            </li>
            <li>
              Continued use after changes take effect constitutes your
              acceptance of those changes.
            </li>
          </ul>
        </li>
        <li>
          <strong>Contact</strong>
          <ul className="list-disc ml-5">
            <li>
              Email:{" "}
              <a
                href="mailto:support@fetishclip.com"
                className="text-orange-600 underline"
              >
                support@fetishclip.com
              </a>
            </li>
          </ul>
        </li>
      </ol>
    </main>
  );
}
