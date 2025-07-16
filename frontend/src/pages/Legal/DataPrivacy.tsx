const DataPrivacy = () => {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Data Privacy</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">1. Overview</h2>
        <p>
          At Pollio, we take data privacy seriously. We only collect the data necessary to provide our service and never share personal information without your consent.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. What We Collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Username and email address during registration</li>
          <li>Polls you create or participate in</li>
          <li>Authentication data (e.g., hashed passwords, OAuth token)</li>
        </ul>
        <p className="mt-2">
          We do <strong>not</strong> track your activity beyond what's required for poll functionality.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Use of Data</h2>
        <p>
          The data we collect is used solely to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Create and manage your polls</li>
          <li>Authenticate your user account</li>
          <li>Display results and poll statistics</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. Cookies & Analytics</h2>
        <p>
          We use cookies only for essential session management. No third-party analytics tools (e.g., Google Analytics) are currently integrated.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your data at any time. For inquiries, please contact us via GitHub or directly through your account.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Project Scope</h2>
        <p>
          This platform is a student project for educational purposes (DCI Web Development program) and not a commercial product. No external services are integrated for data monetization or profiling.
        </p>
      </section>

      <p className="text-sm text-muted-foreground pt-4">
        Last updated: July 2025
      </p>
    </div>
  );
};

export default DataPrivacy;