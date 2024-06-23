import Footer from "@/components/common/Footer";

const TermsOfService = () => {
  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-gray-500 mb-4">Last updated: 5/6/24</p>

        <h1 className="text-3xl font-bold mb-4">Welcome to Social Queue</h1>

        <p className="mb-4">
          {`Welcome to Social Queue, a product provided by YK Labs
        LLC ("we," "us," or "our"). These Terms of Service ("Terms") govern your
        access to and use of Social Queue, including any content,
        functionality, and services offered through the product. By using
        Social Queue, you agree to be bound by these Terms. If
        you do not agree with these Terms, please do not access or use the
        product.`}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          1. Access and Use of Social Queue
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2">
            <strong>Eligibility:</strong> To use Social Queue, you must be at
            least 18 years old or the age of majority in your jurisdiction.
          </li>
          <li className="mb-2">
            <strong>Account Registration:</strong> You may need to create an
            account to use certain features of Social Queue. You agree to
            provide accurate and complete information during the registration
            process and to keep your account information up to date.
          </li>
          <li className="mb-2">
            <strong>User Conduct:</strong> You agree not to use Content
            Marketing Blueprint for any unlawful purpose or in any manner that
            could damage, disable, overburden, or impair the product.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          2. Intellectual Property
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2">
            <strong>Ownership:</strong> YK Labs LLC owns all intellectual
            property rights in Social Queue, including its content, design, and
            functionality.
          </li>
          <li className="mb-2">
            <strong>License:</strong> We grant you a limited, non-exclusive,
            non-transferable, revocable license to use Social Queue for your
            personal or business use, subject to these Terms.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">3. User Content</h2>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2">
            <strong>Ownership:</strong> You retain ownership of any content you
            create and upload to Social Queue.
          </li>
          <li className="mb-2">
            <strong>License:</strong> By submitting content to Content Marketing
            Blueprint, you grant us a non-exclusive, worldwide, royalty-free,
            and transferable license to use, reproduce, modify, distribute, and
            display your content as necessary to provide and improve the
            product.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          4. Subscription and Billing
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2">
            <strong>Fees:</strong> If Social Queue offers subscription plans,
            you agree to pay the fees associated with your chosen plan. All fees
            are non-refundable unless otherwise stated.
          </li>
          <li className="mb-2">
            <strong>Billing:</strong> Subscription fees will be billed in
            advance, and your subscription will renew automatically unless you
            cancel it.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">5. Termination</h2>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2">
            <strong>By You:</strong> You may terminate your account at any time
            by following the instructions provided in Social Queue.
          </li>
          <li className="mb-2">
            <strong>By Us:</strong> We reserve the right to terminate your
            account or suspend your access to Social Queue at our discretion,
            without notice, for any reason, including a breach of these Terms.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          6. Disclaimers and Limitations of Liability
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li className="mb-2">
            <strong>Disclaimer:</strong>{" "}
            {`Social Queue is provided
          "as is" and "as available." We make no warranties or representations
          regarding the product's accuracy, reliability, or suitability for your
          purposes.`}
          </li>
          <li className="mb-2">
            <strong>Limitation of Liability:</strong> To the maximum extent
            permitted by law, YK Labs LLC will not be liable for any indirect,
            incidental, special, or consequential damages arising out of or in
            connection with your use of Social Queue.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-2">7. Indemnification</h2>
        <p className="mb-4">
          You agree to indemnify and hold harmless YK Labs LLC from and against
          any claims, damages, liabilities, and expenses arising out of your use
          of Social Queue or your violation of these Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">
          8. Changes to These Terms
        </h2>
        <p className="mb-4">
          {`We reserve the right to modify these Terms at any time. We will notify
        you of any changes by posting the updated Terms on this page and
        updating the "Last updated" date. Your continued use of Content
        Marketing Blueprint after such changes constitutes your acceptance of
        the updated Terms.`}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">9. Governing Law</h2>
        <p className="mb-4">
          These Terms are governed by the laws of [jurisdiction], without regard
          to its conflict of law provisions.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-2">10. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms or your use of Content
          Marketing Blueprint, please contact us at:
        </p>

        <p className="mb-4">YK Labs LLC</p>
        <p className="mb-4">business@yklabs.io</p>

        <p>
          By using Social Queue, you acknowledge that you have read and
          understood these Terms of Service and agree to be bound by them. Thank
          you for choosing Social Queue.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default TermsOfService;
