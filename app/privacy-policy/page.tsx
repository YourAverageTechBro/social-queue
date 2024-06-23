import Footer from "@/components/common/Footer";

const PrivacyPolicy = () => {
  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-gray-500 mb-4">Last updated: 5/6/24</p>

        <h1 className="text-3xl font-bold mb-4">
          {"Welcome to YK Labs LLC's Social Queue"}
        </h1>

        <p className="mb-4">
          At YK Labs LLC, we prioritize your privacy and are committed to
          safeguarding your personal data. This Privacy Policy outlines how we
          collect, use, disclose, and protect your information when you use our
          product, Social Queue.
        </p>

        <p className="mb-4">
          By using Social Queue, you agree to the collection and use of
          information in accordance with this Privacy Policy. If you do not
          agree with the terms of this policy, please do not access or use the
          product.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          1. Information We Collect
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2">
            <strong>Personal Information:</strong> This includes information
            that can be used to identify you, such as your name, email address,
            phone number, and billing information.
          </li>
          <li className="mb-2">
            <strong>Usage Data:</strong> We may collect information about how
            you access and use Social Queue, including IP address, browser type,
            device type, and usage patterns.
          </li>
          <li className="mb-2">
            <strong>Cookies and Similar Technologies:</strong> We use cookies
            and similar technologies to enhance your experience and track your
            usage of the product.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2">
            To provide and improve the product: We use your information to
            provide, maintain, and improve Social Queue, including
            troubleshooting issues and personalizing your experience.
          </li>
          <li className="mb-2">
            For communication: We may use your contact information to
            communicate with you about your account, updates to Social Queue,
            and marketing promotions.
          </li>
          <li className="mb-2">
            To comply with legal obligations: We may process your data as
            required by law or in response to legal requests.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          3. Information Sharing
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2">
            With your consent: We may share your information with third parties
            if you have given us your explicit consent.
          </li>
          <li className="mb-2">
            Service providers: We may share your information with service
            providers who help us operate and maintain Content Marketing
            Blueprint.
          </li>
          <li className="mb-2">
            Legal requirements: We may disclose your information if required by
            law or to protect our rights, property, or safety.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">4. Data Security</h2>
        <p className="mb-4">
          We take data security seriously and implement appropriate technical
          and organizational measures to protect your information from
          unauthorized access, alteration, or destruction. However, no method of
          transmission over the internet or electronic storage is completely
          secure.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">5. Data Retention</h2>
        <p className="mb-4">
          We retain your information only for as long as necessary to fulfill
          the purposes outlined in this Privacy Policy, unless a longer
          retention period is required or permitted by law.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">6. Your Rights</h2>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2">
            Access and correction: You have the right to access and correct your
            personal information.
          </li>
          <li className="mb-2">
            Deletion: You may request the deletion of your personal information,
            subject to legal and contractual obligations.
          </li>
          <li className="mb-2">
            Opt-out: You can opt out of receiving marketing communications from
            us at any time.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          7. Third-Party Links
        </h2>
        <p className="mb-4">
          Social Queue may contain links to third-party websites. We are not
          responsible for the privacy practices or content of these websites.
          Please review their privacy policies before providing any personal
          information.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          8. International Data Transfers
        </h2>
        <p className="mb-4">
          Your information may be transferred to and processed in countries
          other than the one in which you reside. These countries may have
          different data protection laws. We take appropriate measures to ensure
          your information is protected in accordance with this Privacy Policy.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          9. Children's Privacy
        </h2>
        <p className="mb-4">
          Social Queue is not intended for individuals under the age of 18. We
          do not knowingly collect personal information from children. If you
          are a parent or guardian and become aware that your child has provided
          us with personal information, please contact us.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          10. Changes to This Privacy Policy
        </h2>
        <p className="mb-4">
          {`We may update this Privacy Policy from time to time. We will notify you
        of any changes by posting the new policy on this page and updating the
        "Last updated" date. Your continued use of Social Queue
        after such changes constitutes your acceptance of the updated policy.`}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">Contact Us</h2>
        <p className="mb-4">
          If you have any questions or concerns about this Privacy Policy or our
          data practices, please contact us at:
        </p>

        <p className="mb-4">YK Labs LLC</p>
        <p className="mb-4">business@yklabs.io</p>

        <p>
          By using Social Queue, you acknowledge that you have read and
          understood this Privacy Policy and agree to its terms. Thank you for
          trusting us with your personal information.
        </p>

        <p>
          use and transfer to any other app of information received from Google
          APIs will adhere to{" "}
          <a
            className="underline text-orange-600"
            href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
