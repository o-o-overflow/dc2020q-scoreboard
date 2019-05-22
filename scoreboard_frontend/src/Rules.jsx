import React from "react";

function Rules() {
  return (
    <div className="rules">
      <h1 id="intro">Intro</h1>

      <p>
        Hackers rejoice, as all prepare for the wondrous journey ahead for us.
        Technology has lifted us up from the burden of our everyday life, and we
        shall complete the final journey ahead to the long-awaited land: a land
        free of software vulnerabilities. We are brothers and sisters on this
        journey, part of the same whole.
      </p>

      <p>
        Unfortunately, not all can start on this journey right now, so we’ve
        arranged a bit of a training exercise. We’ll need all the security
        expertise we can get on this mission, but we have limited space.
      </p>

      <p>
        Prove yourself worthy, demonstrate your mastery of technology and
        security, and emerge victorious to compete at DEF CON CTF.
      </p>

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

      <h1 id="new-challenge-type-speedrun">New Challenge Type: Speedrun</h1>

      <p>
        We want to see who the fastest hackers are on the planet. So we created
        a new type of challenge: the{" "}
        <code classname="highlighter-rouge">speedrun</code>. There will be one
        speedrun challenge released every 2 hours starting at May 11th 03:00 UTC
        for 24 hours (for a total of 12 challenges). Every speedrun challenge is
        running on the latest Ubuntu 18.04 with libc-2.27 md5 hash of
        50390b2ae8aaa73c47745040f54e602f. To the winner go the spoils.
      </p>

      <h1 id="scoring">Scoring</h1>

      <p>
        As in 2018, all challenges (except for speedruns) will be adaptive
        scoring based on the number of solves: starting at 500 and decreasing
        from there (based on the total number of teams that solved the
        challenge).
      </p>

      <p>
        Speedrun challenges have two ways to earn points: individual and
        overall.
      </p>

      <p>
        Individual challenge scoring is based on the solve order of the
        speedrun:
      </p>

      <ul>
        <li>First to solve: 25 points</li>
        <li>Second to solve: 20 points</li>
        <li>Third to solve: 15 points</li>
        <li>Fourth to solve: 10 points</li>
        <li>All other solves: 5 points</li>
      </ul>

      <p>
        Overall speedrun scoring is based on the total solve time of a team over
        all speedruns (max of 2 hours for unsolved challenges):
      </p>

      <ul>
        <li>First place: 300 points</li>
        <li>Second place: 200 points</li>
        <li>Third place: 100 points</li>
      </ul>

      <p>
        For example, if one team solves all speedrun challenges first, they
        would receive 300 (25*12) points on individual speedrun and 300 points
        for being in first place overall.
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

      <p>
        Flags can be submitted once every 30 seconds per challenge, speedrun's
        limit is lower.
      </p>

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
