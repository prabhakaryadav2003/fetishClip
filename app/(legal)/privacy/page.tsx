import OverflowReset from "./overflowReset";

export const metadata = {
  title: "Privacy Policy | FetishClip",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <OverflowReset />
      <h1 className="text-3xl font-extrabold mb-6">Privacy Policy</h1>
      <p className="mb-6 text-gray-500 italic">Last updated: July 26, 2025</p>

      <ol className="list-decimal ml-5 space-y-6 text-gray-800">
        <li>
          <strong>What Information We Collect</strong>
          <ul className="list-disc ml-5">
            <li>
              Email, chosen display name, date of birth (for age verification if
              required), and securely hashed passwords.
            </li>
            <li>
              Payment data processed by third-parties (e.g., Paypal); we do not
              store full payment info.
            </li>
            <li>
              Usage: IP address, account activity, device/browser, video history
              (for service and analytics).
            </li>
            <li>Cookies for authentication and analytics.</li>
            <li>Voluntary data: Profile info, uploads, support requests.</li>
          </ul>
        </li>
        <li>
          <strong>How We Use Your Data</strong>
          <ul className="list-disc ml-5">
            <li>To provide and manage your account and access to videos.</li>
            <li>To process payments and manage subscriptions.</li>
            <li>To improve service, respond to queries, and analyze usage.</li>
            <li>
              To comply with legal requirements and ensure security/moderation.
            </li>
          </ul>
        </li>
        <li>
          <strong>Legal Basis for Processing</strong>
          <ul className="list-disc ml-5">
            <li>Your consent (account creation, explicit opt-ins).</li>
            <li>
              Performance of a contract (service provision, order fulfilment).
            </li>
            <li>
              Legal obligation (age verification, moderation as required).
            </li>
            <li>Legitimate interest (security, analytics; you may object).</li>
          </ul>
        </li>
        <li>
          <strong>Sharing &amp; International Transfers</strong>
          <ul className="list-disc ml-5">
            <li>We do not sell your data.</li>
            <li>
              Selected third parties may process data for payment, analytics,
              storage, or moderation only.
            </li>
            <li>
              Data may be transferred outside the EU/EEA only to trusted
              partners with adequate data protection (e.g., SCCs, adequacy
              decision).
            </li>
          </ul>
        </li>
        <li>
          <strong>Your Rights (GDPR)</strong>
          <ul className="list-disc ml-5">
            <li>
              <strong>Access:</strong> Ask for a copy of your data any time.
            </li>
            <li>
              <strong>Rectification:</strong> Update/correct your data in
              profile or by contacting support.
            </li>
            <li>
              <strong>Erasure ("right to be forgotten"):</strong> Request
              account deletion, subject to retention requirements.
            </li>
            <li>
              <strong>Restriction/Objection:</strong> Limit or object to
              processing under certain circumstances.
            </li>
            <li>
              <strong>Portability:</strong> Request your data in a portable
              format.
            </li>
            <li>
              <strong>Withdraw Consent:</strong> Withdraw at any time in
              settings or by contacting us.
            </li>
          </ul>
          <p className="mt-3">
            Email{" "}
            <a
              href="mailto:support@fetishclip.com"
              className="text-orange-600 underline"
            >
              support@fetishclip.com
            </a>{" "}
            for requests. We respond within 30 days.
          </p>
        </li>
        <li>
          <strong>Data Security</strong>
          <ul className="list-disc ml-5">
            <li>
              All data is encrypted in transit and at rest where possible.
            </li>
            <li>
              Passwords are always stored using secure cryptographic hashes.
            </li>
            <li>We maintain security procedures to protect your data.</li>
          </ul>
        </li>
        <li>
          <strong>Data Retention</strong>
          <ul className="list-disc ml-5">
            <li>Account data is kept as necessary for service or by law.</li>
            <li>Some summarized statistics may be retained for analytics.</li>
          </ul>
        </li>
        <li>
          <strong>Children</strong>
          <p>
            Our service is only for users 18+. If you suspect a minor has
            created an account, please contact us immediately.
          </p>
        </li>
        <li>
          <strong>Complaints</strong>
          <ul className="list-disc ml-5">
            <li>
              EU users can file data protection complaints with their local Data
              Protection Authority (DPA).
            </li>
            <li>
              See:{" "}
              <a
                href="https://edpb.europa.eu/about-edpb/board/members_en"
                className="text-orange-600 underline"
                target="_blank"
              >
                EDPB DPA Members
              </a>
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
