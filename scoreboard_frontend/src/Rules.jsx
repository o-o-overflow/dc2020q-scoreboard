import React from "react";

function Rules() {
  return (
    <>
      <h2>Intro</h2>
      <p>Some DEF CON Quals specific introduction.</p>

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

      <h2>New challenge category: GOLF</h2>
      <p>
      Last year, we challenged you with an <a href="https://scoreboard2019.oooverflow.io/#/leaderboard/speedrun-012">entire category of speedruns</a>: bite-size problems designed for hacking races.
      Speedrun challenges added a twist by letting the top teams dictate awarded points by beating each other to the punch.
      </p>

      <p>What if they could also dictate the difficulty?</p>

      <p>
      This year, the Order of the Overflow is excited to introduce a new style of CTF challenge: golf.
      In a golf challenge, teams race against time to solve a challenge that's gradually degrading in difficulty.
      The sooner they solve it, the more difficult it remains, the harder it is for other teams to catch up, and the more points it will be worth.
      Can you keep those points out of the hands of your competition?
      </p>

      <p>
      More information on Golf Challenges <a href="https://oooverflow.io/dc-ctf-2020-quals/">here</a>.
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

      <h2>Twitter and <del>IRC</del>discord</h2>
      <p>
        All game announcements will be made through our Twitter account{" "}
        <a href="https://twitter.com/oooverflow">@oooverflow</a>
      </p>
      <p>
        Times change, and we must change with them. With DEF CON going online this year,
        and doing so via discord, we're using discord for our idling this year.
        You can (and should) also hang out with us on the official DEF CON discord{" "}
        <a href="https://discord.io/ctf">discord.io/ctf</a> in the CTF category!
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
