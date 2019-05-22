import React from "react";

function Rules() {
  return (
    <div className="rules">
      <h1 id="intro">Intro</h1>
      <h1 id="rules">Rules</h1>

      <ul>
        <li>
          No Denial of Service—DoS is super lame, don’t do it or you will be
          banned
        </li>
        <li>No sharing flags, exploits, or hints—Do your own hacks</li>
        <li>
          No attacks against our infrastructure—Hack the challenges, not us
        </li>
        <li>No automated scanning—For these challenges, do better</li>
      </ul>

      <h1 id="scoring">Scoring</h1>

      <p>
        All challenges will be adaptive scoring based on the number of solves:
        starting at 500 and decreasing from there (based on the total number of
        teams that solved the challenge).
      </p>

      <h1 id="flag-format">Flag Format</h1>

      <p>
        Unless otherwise noted in the challenge description, all flags will be
        in the format:
      </p>

      <div className="highlighter-rouge">
        <div className="highlight">
          <pre className="highlight">
            <code>OOO&#123;...&#125;</code>
          </pre>
        </div>
      </div>

      <p>
        <strong>
          AND YOU MUST SUBMIT THE WHOLE THING, INCLUDING THE OOO&#123;…&#125;.
        </strong>
      </p>

      <h1 id="pow">POW</h1>

      <p>
        We may implement a POW (proof of work) in front of a challenge if we
        feel it is necessary. Specific POW, along with a client, will be
        released at game time.
      </p>

      <h1 id="hints">Hints</h1>

      <p>
        Do not expect hints. Particularly if a service is already pwned, it
        would be unfair to give one team a hint when it’s already solved. If we
        feel that something is significantly wrong, then we will update the
        description and tweet about it.
      </p>

      <h1>IRC/Twitter</h1>
      <p>
        All game announcements will be made through our Twitter account{" "}
        <a href="https://twitter.com/oooverflow">@oooverflow</a>.
      </p>

      <p>
        You can hang out with us on IRC{" "}
        <a href="https://hackint.org">hackint.org</a> in #defconctf
      </p>

      <h1 id="submission-delay">Flag Submission Delay</h1>

      <p>Flags can be submitted once every 30 seconds per challenge.</p>

      <h1 id="team-size">Team Size</h1>

      <p>No limit on team sizes.</p>

      <h1 id="disclaimer">Disclaimer</h1>

      <p>
        We reserve the right to change these rules or scoring anytime before the
        competition starts.
      </p>
    </div>
  );
}
export default Rules;
