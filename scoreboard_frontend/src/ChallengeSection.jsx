import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";
import Challenge from "./Challenge";
import HiddenChallenge from "./HiddenChallenge";

function ChallengeSection(props) {
  const challenges = function (start, end) {
    return  props.challenges.slice(start, end).map((challenge, index) => {
      if (challenge.unopened) {
        return (
            <HiddenChallenge id={challenge.unopened} key={challenge.unopened}/>
        );
      }

      return (
            <Challenge
                {...challenge}
                authenticated={props.authenticated}
                key={challenge.id}
                onClick={props.onClick}
                item_index={index+start}
            />
      );
    });
  };


  return (
    <div >
         <div className={"tablecontent"} >
           <table>
             <tbody>
               <tr>
                   {challenges(0,6)}
               </tr>
               <tr>
                 {challenges(6,12)}
               </tr>
               <tr>
                 {challenges(12,18)}
               </tr>
             </tbody>
           </table>

         </div>

    </div>
  );
}
ChallengeSection.propTypes = exact({
  authenticated: PropTypes.bool.isRequired,
  challenges: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
});
export default ChallengeSection;
