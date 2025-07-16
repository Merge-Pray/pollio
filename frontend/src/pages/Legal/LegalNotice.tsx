import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LegalNotice = () => {
  return (
    <div className="max-w-2xl mx-auto mt-10 px-6 pb-20">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Legal Notice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-base leading-relaxed">
          <p>
            <strong>Pollio.app</strong> is a student-built project developed as part of the Web Development curriculum at DCI (Digital Career Institute).
          </p>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Responsible for Content</h2>
            <p>
              This application was developed for educational purposes by the following team:
            </p>
            <ul className="list-disc list-inside ml-2">
              <li>
                Calle –{" "}
                <a
                  href="https://github.com/cmgoersch"
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @cmgoersch
                </a>
              </li>
              <li>
                Sarah –{" "}
                <a
                  href="https://github.com/SarahDomscheit"
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @SarahDomscheit
                </a>
              </li>
              <li>
                Ben –{" "}
                <a
                  href="https://github.com/benNurtjipta"
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @benNurtjipta
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Project Repository</h2>
            <p>
              Source code is publicly available at:{" "}
              <a
                href="https://github.com/Merge-Pray/pollio"
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/Merge-Pray/pollio
              </a>
            </p>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Disclaimer</h2>
            <p>
              This app is for demonstration and educational purposes only.
              No liability is accepted for correctness, completeness, or up-to-date content. The use of this service is at your own risk.
            </p>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Contact</h2>
            <p>
              For questions regarding this project, please contact the team via GitHub.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalNotice;