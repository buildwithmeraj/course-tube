import React from "react";
export const metadata = {
  title: `Privacy Policy | ${process.env.SITE_NAME}`,
  description: `Privacy Policy of ${process.env.SITE_NAME}. `,
};
export default function PrivacyPolicyPage() {
  return (
    <main className="prose prose-lg mx-auto py-12 px-4 max-w-4xl">
      <h2>Privacy Policy</h2>
      <p className="text-sm text-muted">Last updated: January 18, 2026</p>

      <section>
        <h5>1. Introduction</h5>
        <p>
          CourseTube (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
          operates the website. This page informs you of our policies regarding
          the collection, use, and disclosure of personal data when you use our
          service and the choices you have associated with that data.
        </p>
      </section>

      <section>
        <h5>2. Information Collection and Use</h5>
        <p>
          We collect several different types of information for various
          purposes:
        </p>

        <h3>2.1 Account Information</h3>
        <p>
          When you create an account, we collect your email address and any
          profile information you provide. This is used to authenticate you and
          personalize your experience.
        </p>

        <h3>2.2 Usage Data</h3>
        <p>
          We automatically collect information about your interactions with our
          service, including:
        </p>
        <ul>
          <li>Courses you enroll in</li>
          <li>Videos you watch</li>
          <li>Your progress in courses</li>
          <li>Search queries</li>
          <li>Browser and device information</li>
        </ul>

        <h3>2.3 Cookies</h3>
        <p>
          We use cookies to enhance your experience. You can instruct your
          browser to refuse all cookies or to indicate when a cookie is being
          sent.
        </p>
      </section>

      <section>
        <h5>3. Use of Data</h5>
        <p>CourseTube uses the collected data for various purposes:</p>
        <ul>
          <li>To provide and maintain our service</li>
          <li>To notify you about changes to our service</li>
          <li>To allow you to participate in interactive features</li>
          <li>To provide customer support</li>
          <li>
            To gather analysis or valuable information to improve our service
          </li>
          <li>To monitor the usage of our service</li>
          <li>To detect, prevent and address technical issues</li>
        </ul>
      </section>

      <section>
        <h5>4. Security of Data</h5>
        <p>
          The security of your data is important to us, but remember that no
          method of transmission over the Internet is 100% secure. While we
          strive to use commercially acceptable means to protect your personal
          data, we cannot guarantee its absolute security.
        </p>
      </section>

      <section>
        <h5>5. Changes to This Privacy Policy</h5>
        <p>
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the &quot;Last updated&quot; date at the top of this Privacy
          Policy.
        </p>
      </section>

      <section>
        <h5>6. Contact Us</h5>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at{" "}
          <a
            href="mailto:privacy@coursetube.example"
            className="text-primary hover:underline"
          >
            privacy@coursetube.example
          </a>
        </p>
      </section>
    </main>
  );
}
