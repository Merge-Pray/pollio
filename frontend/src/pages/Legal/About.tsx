import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";

const About = () => {
  return (
    <div className="max-w-2xl mx-auto mt-10 px-6 pb-20">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">About Pollio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-base leading-relaxed">
          <p>
            <strong>Pollio.app</strong> is a lightweight and interactive survey platform
            built to let you create polls and share them with others in seconds.
            Whether you're gathering quick feedback or planning a group decision —
            Pollio keeps it simple.
          </p>

          <p>
            Designed with a focus on user experience, real-time updates, and clean design,
            Pollio integrates a modern React.js frontend with a robust Node.js and MongoDB backend.
          </p>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">🚀 Features</h2>
            <ul className="list-disc list-inside ml-2">
              <li>Create custom polls with text, images, or dates</li>
              <li>Invite others by simply sharing a link</li>
              <li>Real-time vote tracking and result display</li>
              <li>User accounts and authentication via JWT or Google OAuth</li>
              <li>Persistent data storage with full backend integration</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">🛠️ Tech Stack</h2>
            <ul className="list-disc list-inside ml-2">
              <li>Frontend: React.js (Vite, Zustand, Tailwind CSS)</li>
              <li>Backend: Node.js, Express, MongoDB (Mongoose)</li>
              <li>Auth: JSON Web Token (JWT) & Google OAuth</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">📚 Built With Purpose</h2>
            <p>
              Pollio was developed as part of the <strong>DCI Web Development Program</strong>,
              during the Backend Module. The goal: build a fullstack app from scratch — including
              authentication, database modeling, and real-world API integration.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">👨‍💻 Team</h2>
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

          <p className="pt-4 border-t text-sm text-muted-foreground">
            View the project on GitHub:{" "}
            <a
              href="https://github.com/Merge-Pray/pollio"
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/Merge-Pray/pollio
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;