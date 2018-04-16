import React from 'react';

function Rules() {
  return (
    <div className="rules">
      <div>
        A broad selection of challenges is available on our menu,
        divided in five categories of roughly incremental difficulty:
      </div>
      <ul>
        <li className="category-amouse">Amouse Bouche</li>
        <li className="category-appetizers">Appetizers</li>
        <li className="category-signature">Signature Dishes</li>
        <li className="category-grill">From the Grill</li>
        <li className="category-guest">Guest Chefs</li>
        <li className="category-desserts">Fruit and Desserts</li>
      </ul>
      <div>
        At the beginning, only the <i>amouse bouche</i> section of the menu is open.
        Once a team has solved three dishes from one category, it
        gain access to the next category on the
        menu. Moreover, to avoid teams to get stuck at an early stage, a menu
        category is open to everyone once it is reached by at least
        five different teams.
      </div>
      <div>
        Each challenge is worth a variable number of points, based
        on the number N of times it has been solved -- according to
        the following formula:
      </div>
      <blockquote>Points = 100 + 400 / (1 + 0.08 * x * ln(x))</blockquote>
    </div>
  );
}
export default Rules;
