import React from "react";

function Rules() {
  return (
    <>
      <h2>Intro</h2>
      <p>Some DC29 Quals specific introduction.</p>

      <h2>Specifc Rules</h2>
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

      <h2>Scoring</h2>
      <p>
        All challenges will be adaptive scoring based on the number of solves:
        starting at 500 and decreasing from there (based on the total number of
        teams that solved the challenge).
      </p>

      <h2>Flag Format</h2>
      <p>
        All flags will be in the format: <code>OOO&#123;…&#125;</code>
      </p>
      <p>
        <strong>
          <em>
            NOTE: You must submit the whole thing, including the{" "}
            <code>OOO&#123;…&#125;</code>.
          </em>
        </strong>
      </p>

      <h2>Proof of Work (POW)</h2>
      <p>
        We may implement a POW in front of a challenge if we feel it is
        necessary. Specific POW, along with a client, will be released at game
        time.
      </p>

      <h2>Hints</h2>
      <p>
        Do not expect hints. Particularly if a service is already pwned, it
        would be unfair to give one team a hint when it’s already solved. If we
        feel that something is significantly wrong, then we will update the
        description and tweet about it.
      </p>

      <h2>Twitter and IRC</h2>
      <p>
        All game announcements will be made through our Twitter account{" "}
        <a href="https://twitter.com/oooverflow">@oooverflow</a>.
      </p>
      <p>
        You can hang out with us on IRC{" "}
        <a href="https://hackint.org">hackint.org</a> in #defconctf
      </p>

      <h2>Flag Submission Delay</h2>
      <p>Flags can be submitted once every 30 seconds per challenge.</p>

      <h2>Team Size</h2>
      <p>There is no limit on team sizes.</p>

      <h2>Disclaimer</h2>
      <p>
        We reserve the right to change these rules or scoring anytime before the
        competition starts.
      </p>
    </>
  );
}
export default Rules;
