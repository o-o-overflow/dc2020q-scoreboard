import React from 'react';

function Rules() {
  return (
      <div className="rules lcars-u-5">
		<h1>Introduction</h1>

		<div>
		  <p>Welcome to DEF CON CTF Quals. May we take your order?</p>
		  <p>This year marks a transition. For those who are not aware, DEF CON CTF regularly rotates organizers. This year is the first year of the Order of the Overflow. If you are interested in who we are, you can read all about us <a href="https://www.defcon.org/html/defcon-26/dc-26-ctf.html">at the changeover announcement</a>. Otherwise, read on for the rules!</p>

		  <p>This year, we have grilled up a smattering of tasty challenges for your enjoyment.
			A broad selection of challenges is available on our menu,
			divided in five categories of (very) roughly incremental difficulty:
			</p>
      </div>
      <ul>
        <li className="category-amuse">Amuse Bouche</li>
        <li className="category-appetizers">Appetizers</li>
        <li className="category-signature">Signature Dishes</li>
        <li className="category-grill">From the Grill</li>
        <li className="category-desserts">Fruit and Desserts</li>
      </ul>
	  <h1>Scoring</h1>
	  <div>
		We do adaptive scoring based on the number of solves. All challenges start out at 500 and decrease from there.
	  </div>
	  <h1>Flag Format</h1>
	  <div>
		<p>Unless otherwise noted in the challenge description, all flags will be in the format: <pre>OOO&#123;...&#125;</pre> <b>AND YOU MUST SUBMIT THE WHOLE THING, INCLUDING THE OOO&#123;...&#125;</b></p>
	  </div>
	  <h1>Opening Challenges</h1>
	  <div>
		For this year, we will decide what challenges to open.
	  </div>
	  <h1>IRC/Twitter</h1>
	  <div>
		<p>All game announcements will be made through our Twitter account <a href="https://twitter.com/oooverflow">@oooverflow</a>.</p>

		<p>You can hang out with us on IRC <a href="https://hackint.org">hackint.org</a> in #defconctf</p>
	  </div>
	  <h1>Rules</h1>

	  <ol>
		<li>No Denial of Service&mdash;DoS is super lame, don't do it or you will be banned</li>
		<li>No sharing flags, exploits, or hints&mdash;Do your own hacks</li>
		<li>No attacks against our infrastructure&mdash;Hack the challenges, not us</li>
		<li>No automated scanning&mdash;For these challenges, do better</li>
	  </ol>

	  <h1>Hints</h1>
	  <p>
		Any hints that we give will be distributed as announcements on our Twitter account <a href="https://twitter.com/oooverflow">@oooverflow</a>.
	  </p>
	  <p>
		No hints will be given once a challenge is solved.
	  </p>
	  <h1>Team Size</h1>
	  <p>
		No limit on team sizes.
	  </p>

    </div>
  );
}
export default Rules;
