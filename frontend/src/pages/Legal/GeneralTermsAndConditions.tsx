const GeneralTermsAndConditions = () => {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-3xl font-bold">General Terms & Conditions</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">1. Scope</h2>
        <p>
          These Terms & Conditions apply to all services provided on pollio.app. By using the platform, you agree to comply with these terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. Liability Disclaimer</h2>
        <p>
          We do not guarantee the accuracy, completeness, or availability of the content created by users on this platform. All content is user-generated, and Pollio assumes no liability for any damages arising from the use of this site or from user-contributed content.
        </p>
        <p>
          Pollio.app is a learning project and provided "as is" without any warranties. Use at your own risk.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Content Responsibility</h2>
        <p>
          Users are solely responsible for the content they create and share. You must not publish or distribute any content that is illegal, offensive, discriminatory, or violates the rights of others.
        </p>
        <p className="font-medium text-red-500">
          Hate speech, harassment, or any form of abusive content is strictly prohibited and will lead to immediate removal and possible banning from the platform.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials. We reserve the right to suspend accounts that violate these terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Modifications</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of the platform after changes have been published constitutes your acceptance of the updated terms.
        </p>
      </section>

      <p className="text-sm text-muted-foreground pt-4">
        Last updated: July 2025
      </p>
    </div>
  );
};

export default GeneralTermsAndConditions;