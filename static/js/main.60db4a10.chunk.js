(this.webpackJsonpscoreboard_frontend=this.webpackJsonpscoreboard_frontend||[]).push([[0],{36:function(e,t,a){e.exports=a(63)},62:function(e,t,a){},63:function(e,t,a){"use strict";a.r(t);var n=a(0),l=a.n(n),o=a(17),r=a.n(o),s=a(13),c=a(21),i=a(5),m=a(6),u=a(8),h=a(7),d=a(9),g=a(18),p=a.n(g),f=a(10);a(14);var v=function(e){var t,a=e.id,n=e.points,o=e.solved,r=e.tags,s=e.item_index,c="challenge";o?(c+="challenge-solved",t={backgroundImage:"url('pics/d/".concat(s,".gif')")}):t={backgroundImage:"url('pics/a/".concat(s,".gif')")};var i=r.split(",").map((function(e,t){return l.a.createElement("div",{title:"".concat(e.trim()),className:"category category-".concat(e.trim()),key:t})}));return l.a.createElement("div",{className:c,onClick:function(){return e.onClick(e)},onKeyPress:function(){},style:t},l.a.createElement("div",null,i),l.a.createElement("div",{className:"challenge-title"},l.a.createElement("img",{src:"/pics/nomic.png",alt:"no microphone"}),a),l.a.createElement("div",{className:"challenge-score"},n))};var E=function(e){return l.a.createElement("div",{className:"challenge challenge-hidden"})};var b=function(e){return e.challenges.map((function(t,a){return t.unopened?l.a.createElement(E,{id:t.unopened,key:a}):l.a.createElement(v,Object.assign({},t,{key:t.id,onClick:e.onClick,item_index:a}))}))},y=function(e){function t(e){var a;return Object(i.a)(this,t),(a=Object(u.a)(this,Object(h.a)(t).call(this,e))).componentWillUnmount=function(){a.props.onUnload()},a.buildSections=function(e){var t=a.props.challenges[e]||[],n=Array.from(Array(a.props.unopened[e]||0),(function(e,t){return{unopened:t+1e3}}));return l.a.createElement(b,{challenges:t.concat(n),key:e,onClick:a.props.onClick,title:e})},a.sectionOrder=["haiku"],a}return Object(d.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){var e=this.sectionOrder.map(this.buildSections);return l.a.createElement(l.a.Fragment,null,l.a.createElement("div",{className:"d-flex justify-content-center"},l.a.createElement("img",{alt:"zoom",style:{height:"93px"},src:"/pics/zooom.png"})),l.a.createElement("div",{className:"footer-padding justify-content-center row"},e),";",l.a.createElement("footer",{className:"navbar navbar-dark bg-dark fixed-bottom"},l.a.createElement("div",null,l.a.createElement("img",{alt:"zoom-video",src:"/pics/video_icons.png"})),l.a.createElement("div",null,l.a.createElement("a",{href:"https://discord.gg/yTjdTH",target:"_blank",rel:"noopener noreferrer"},l.a.createElement("img",{alt:"zoom-chat",src:"/pics/chat.png"}))),l.a.createElement("h3",null,l.a.createElement("a",{href:"https://oooverflow.io/"},l.a.createElement("span",{className:"badge badge-danger"},"Leave")))))}}]),t}(l.a.Component),k=a(33),w=a.n(k),C=function(e){function t(e){var a;return Object(i.a)(this,t),(a=Object(u.a)(this,Object(h.a)(t).call(this,e))).handleFlagChange=function(e){a.setState({flag:e.target.value})},a.handleKeyPress=function(e){"Enter"===e.key&&a.handleSubmit()},a.handleSubmit=function(){a.state.flag.length<1||a.state.flag.length>160?a.setState({status:"invalid flag"}):a.worker.postMessage(a.state.flag)},a.loadData=function(){a.setState({description:"Loading..."}),fetch("scoreboard.json",{method:"GET"}).then((function(e){return e.json().then((function(t){return{body:t,status:e.status}}))})).then((function(e){var t=e.body,n=e.status;if(200!==n)return console.log(n),void console.log(t.message);var l=new w.a.Converter({literalMidWordUnderscores:!0,simplifiedAutoLink:!0}).makeHtml(t[a.props.challengeId].description),o=t[a.props.challengeId].flag_hash;a.setState({description:l,flagHash:o})}))},a.state={description:"",flag:"",flagHash:"",status:""},a.worker=new Worker("worker.js"),a.worker.onmessage=function(e){if(e.data.complete){var t=e.data.digest===a.state.flagHash?"success!":"incorrect flag";a.setState({status:t})}},a}return Object(d.a)(t,e),Object(m.a)(t,[{key:"componentDidMount",value:function(){this.loadData()}},{key:"componentWillUnmount",value:function(){this.worker.terminate()}},{key:"render",value:function(){var e;""!==this.state.status&&(e=l.a.createElement("div",{className:"alert alert-secondary"},"Status: ",this.state.status));var t="";this.props.solved||(t=l.a.createElement(l.a.Fragment,null,l.a.createElement("label",{htmlFor:"flag",className:"sr-only"},"Flag"),l.a.createElement("input",{id:"flag",className:"form-control",placeholder:"flag (format: OOO{\u2026})",onChange:this.handleFlagChange,onKeyPress:this.handleKeyPress,type:"text",value:this.state.flag}),l.a.createElement("input",{className:"btn btn-primary",onClick:this.handleSubmit,type:"button",value:"Submit Flag"})));var a=1===this.props.numSolved?"1 solve":"".concat(this.props.numSolved," solves");return l.a.createElement("div",{className:"modal-dialog",role:"document"},l.a.createElement("div",{className:"modal-content"},l.a.createElement("div",{className:"modal-header"},l.a.createElement("h5",{className:"modal-title"},"".concat(this.props.challengeId," (").concat(a,")")),l.a.createElement("button",{"aria-label":"Close",className:"close",onClick:this.props.onClose,type:"button"},l.a.createElement("span",{"aria-hidden":"true"},"\xd7"))),l.a.createElement("div",{className:"modal-body"},l.a.createElement("div",{dangerouslySetInnerHTML:{__html:this.state.description}}),e),l.a.createElement("div",{className:"modal-footer"},t,l.a.createElement("button",{className:"btn btn-secondary",onClick:this.props.onClose,type:"button"},"Close"))))}}]),t}(l.a.Component),O=function(e){function t(){return Object(i.a)(this,t),Object(u.a)(this,Object(h.a)(t).apply(this,arguments))}return Object(d.a)(t,e),Object(m.a)(t,[{key:"body",value:function(){var e=this;return this.props.teamScoreboardOrder.map((function(t){return l.a.createElement("tr",{key:t.name},l.a.createElement("td",{className:"sticky-left",key:t.name},t.name),e.solvedRow(new Set(t.solves)))}))}},{key:"header",value:function(){var e=this;return this.challenges.map((function(t){return l.a.createElement("th",{key:t,scope:"row"},t," (",e.props.solvesByChallenge[t]||0,")")}))}},{key:"solvedRow",value:function(e){return this.challenges.map((function(t){return l.a.createElement("td",{key:t},e.has(t)?"\u2714":"\u274c")}))}},{key:"render",value:function(){var e=this;return this.challenges=[],Object.keys(this.props.challenges).map((function(t){return e.props.challenges[t].map((function(t){return e.challenges.push(t.id)}))})),this.challenges.sort(),l.a.createElement("div",{className:"table-responsive bg-light"},l.a.createElement("table",{className:"table table-hover table-sm"},l.a.createElement("thead",null,l.a.createElement("tr",null,l.a.createElement("th",{className:"sticky-left",scope:"column"},"Team"),this.header())),l.a.createElement("tbody",null,this.body())))}}]),t}(l.a.Component);var S=function(e){var t=[["Challenges","/",!0],["Rules","/rules"],["Scoreboard","/scoreboard"],["Solves","/solves"]].map((function(e){return l.a.createElement("li",{className:"nav-item",key:e[0]},l.a.createElement(s.c,{className:"nav-link",exact:e[2],to:e[1]},e[0]))}));return l.a.createElement("nav",{className:"navbar navbar-expand-md navbar-dark bg-dark sticky-top"},l.a.createElement(s.b,{className:"navbar-brand",to:"/"},"DC28 Quals"),l.a.createElement("div",{className:"navbar-collapse"},l.a.createElement("ul",{className:"navbar-nav mr-auto"},t)))};var T=function(){return l.a.createElement("div",{className:"bg-light"},l.a.createElement("h2",null,"Intro"),l.a.createElement("p",null,"Some DEF CON Quals specific introduction."),l.a.createElement("h2",null,"Specifc Rules"),l.a.createElement("ul",null,l.a.createElement("li",null,"No Denial of Service\u2014DoS is super lame, don't do it or you will be banned"),l.a.createElement("li",null,"No sharing flags, exploits, or hints\u2014Do your own hacks"),l.a.createElement("li",null,"No attacks against our infrastructure\u2014Hack the challenges, not us"),l.a.createElement("li",null,"No automated scanning\u2014For these challenges, do better")),l.a.createElement("h2",null,"Scoring"),l.a.createElement("p",null,"All challenges will be adaptive scoring based on the number of solves: starting at 500 and decreasing from there (based on the total number of teams that solved the challenge). We"," ",l.a.createElement("a",{href:"https://github.com/o-o-overflow/scoring-playground"},"released a scoring playground")," ","so that teams with questions or concerns about the exact scoring algorithm can see how that affects the overall ranking."),l.a.createElement("h2",null,"New challenge category: GOLF"," ",l.a.createElement("span",{"aria-label":"woman golfing emoji",role:"img"},"\ud83c\udfcc\ufe0f\u200d\u2640\ufe0f"),l.a.createElement("span",{"aria-label":"man golfing emoji",role:"img"},"\ud83c\udfcc\ufe0f\u200d\u2642\ufe0f"),l.a.createElement("span",{"aria-label":"golf hole flag",role:"img"},"\u26f3")),l.a.createElement("p",null,"Last year, we challenged you with an"," ",l.a.createElement("a",{href:"https://scoreboard2019.oooverflow.io/#/leaderboard/speedrun-012"},"entire category of speedruns"," ",l.a.createElement("span",{"aria-label":"racecar",role:"img"},"\ud83c\udfce\ufe0f")),": bite-size problems designed for hacking races. Speedrun challenges added a twist by letting the top teams dictate awarded points by beating each other to the punch."),l.a.createElement("p",null,"What if they could also dictate the difficulty?"),l.a.createElement("p",null,"This year, the Order of the Overflow is excited to introduce a new style of CTF challenge: golf"," ",l.a.createElement("span",{"aria-label":"golf hole flag",role:"img"},"\u26f3"),". In a golf challenge, teams race against time to solve a challenge that's gradually degrading in difficulty. The sooner they solve it, the more difficult it remains, the harder it is for other teams to catch up, and the more points it will be worth. Can you keep those points out of the hands of your competition?"),l.a.createElement("p",null,"More information on"," ",l.a.createElement("a",{href:"https://oooverflow.io/dc-ctf-2020-quals/"},"Golf Challenges here"),"."),l.a.createElement("h2",null,"Flag Format"),l.a.createElement("p",null,"All flags will be in the format: ",l.a.createElement("code",null,"OOO{\u2026}")),l.a.createElement("p",null,l.a.createElement("strong",null,l.a.createElement("em",null,"NOTE: You must submit the whole thing, including the"," ",l.a.createElement("code",null,"OOO{\u2026}"),"."))),l.a.createElement("h2",null,"Proof of Work (POW)"),l.a.createElement("p",null,"We may implement a POW in front of a challenge if we feel it is necessary. Specific POW, along with a client, will be released at game time."),l.a.createElement("h2",null,"Hints"),l.a.createElement("p",null,"Do not expect hints. Particularly if a service is already pwned, it would be unfair to give one team a hint when it's already solved. If we feel that something is significantly wrong, then we will update the description and tweet about it. If you ask for hints on ",l.a.createElement("del",null,"IRC")," ","or discord, expect to be referred to this URL."),l.a.createElement("h2",null,"Twitter and ",l.a.createElement("del",null,"IRC"),"discord"),l.a.createElement("p",null,"All game announcements will be made through our Twitter account"," ",l.a.createElement("a",{href:"https://twitter.com/oooverflow"},"@oooverflow")),l.a.createElement("p",null,"Times change, and we must change with them. With"," ",l.a.createElement("a",{href:"https://forum.defcon.org/node/232005"},"DEF CON Safe Mode this year"),", and doing so via discord, we're using discord for our idling this year. You can (and should) also hang out with us on the official DEF CON discord ",l.a.createElement("a",{href:"https://discord.gg/yTjdTH"},"discord.gg/yTjdTH")," in the CTF category!"),l.a.createElement("h2",null,"Flag Submission Delay"),l.a.createElement("p",null,"Flags can be submitted once every 30 seconds per challenge."),l.a.createElement("h2",null,"Team Size"),l.a.createElement("p",null,"There is no limit on team sizes."),l.a.createElement("h2",null,"Disclaimer"),l.a.createElement("p",null,"We reserve the right to change these rules or scoring anytime before the competition starts."))};var N=function(e){var t=1,a=e.teamScoreboardOrder.map((function(a){return{lastSolveTime:a.lastSolveTime,name:a.name,num:t++,points:e.pointsByTeam[a.name],solves:a.solves.map((function(t){return function(e,t){var a=e[t].split(",")[0].replace(/ /g,"-");return l.a.createElement("span",{className:"category-".concat(a),key:t,title:t})}(e.categoryByChallenge,t)}))}})).map((function(t){return l.a.createElement("tr",{key:t.name,id:t.name},l.a.createElement("td",null,t.num),l.a.createElement("td",null,t.points),l.a.createElement("td",null,function(t){var a=e.teams[t];return void 0!==a?l.a.createElement("a",{href:"https://ctftime.org/team/".concat(a),target:"_blank",rel:"noopener noreferrer"},t):t}(t.name)),l.a.createElement("td",null,t.solves))})),n=e.team?l.a.createElement("button",{type:"button",className:"btn btn-link",onClick:function(){var t=document.getElementById(e.team);t&&window.scroll({behavior:"smooth",top:t.offsetTop})}},"(My Team)"):null;return l.a.createElement("div",{className:"table-responsive bg-light"},l.a.createElement("table",{className:"table table-hover table-sm"},l.a.createElement("thead",null,l.a.createElement("tr",null,l.a.createElement("th",{scope:"col"},"Place"),l.a.createElement("th",{scope:"col"},"Points"),l.a.createElement("th",{scope:"col"},"Team ",n),l.a.createElement("th",{scope:"col"},"Completed"))),l.a.createElement("tbody",null,a)))};p.a.setAppElement("#root");var j=function(e){function t(e){var a;return Object(i.a)(this,t),(a=Object(u.a)(this,Object(h.a)(t).call(this,e))).handleCloseModal=function(){a.setState({showModal:null})},a.handleOpenChallengeModal=function(e){a.setState({showChallengeId:e.id,showModal:"challenge"})},a.loadChallenges=function(){fetch("challenges.json",{method:"GET"}).then((function(e){return e.json().then((function(t){return{body:t,status:e.status}}))})).then((function(e){var t=e.body,n=e.status;if(200!==n)return console.log(n),void console.log(t.message);a.processChallenges(t.message)})).catch((function(e){console.log(e)}))},a.loadTeams=function(){fetch("teams.json",{method:"GET"}).then((function(e){return e.json().then((function(t){return{body:t,status:e.status}}))})).then((function(e){var t=e.body,n=e.status;if(200!==n)return console.log(n),void console.log(t.message);a.setState({teams:t.message.teams})})).catch((function(e){console.log(e)}))},a.processChallenges=function(e){var t={},n={},l={},o={};e.solves.forEach((function(e){var a=Object(c.a)(e,3),r=a[0],s=a[1],i=a[2];r in n?n[r]+=1:n[r]=1,s in l?(t[s]=Math.max(t[s],i),l[s].push(r),s in o||(o[s]={}),o[s][r]=i):(t[s]=i,l[s]=[r],s in o||(o[s]={}),o[s][r]=i)}));var r={},s={};e.open.forEach((function(e){var t,o=Object(c.a)(e,4),i=o[0],m=o[1],u=o[2];o[3];a.categoryByChallenge[i]=m,r[i]=(t=n[i],!Number.isInteger(t)||t<2?500:parseInt(100+400/(1+.08*t*Math.log(t)),10));var h={id:i,points:r[i],solved:(l[a.state.team]||[]).includes(i),tags:m};u in s?s[u].push(h):s[u]=[h]}));var i={};Object.keys(l).forEach((function(e){var t=0;l[e].forEach((function(e){t+=r[e]})),i[e]=t}));var m=Object.keys(i).map((function(e){return{lastSolveTime:t[e],name:e,points:i[e],solves:l[e]}}));m.sort((function(e,t){return e.points===t.points?e.lastSolveTime-t.lastSolveTime:t.points-e.points})),a.setState({challenges:s,lastSolveTimeByTeam:t,pointsByTeam:i,teamScoreboardOrder:m,solvesByTeam:l,solvesByChallenge:n,unopened:e.unopened_by_category})},a.state={challenges:{},lastSolveTimeByTeam:{},openedByCategory:{},solvesByChallenge:{},pointsByTeam:{},showChallengeId:"",showModal:null,solvesByTeam:{},teams:{},teamScoreboardOrder:[],unopened:{}},a.categoryByChallenge={},a}return Object(d.a)(t,e),Object(m.a)(t,[{key:"componentDidMount",value:function(){this.loadChallenges(),this.loadTeams()}},{key:"render",value:function(){var e=this,t=(this.state.solvesByTeam[this.state.team]||[]).includes(this.state.showChallengeId);return l.a.createElement(l.a.Fragment,null,l.a.createElement(S,null),l.a.createElement("main",{role:"main",className:"container-fluid"},l.a.createElement(f.a,{exact:!0,path:"/",render:function(){return l.a.createElement(y,{challenges:e.state.challenges,onClick:e.handleOpenChallengeModal,onUnload:e.handleCloseModal,unopened:e.state.unopened})}}),l.a.createElement(f.a,{exact:!0,path:"/rules",component:T}),l.a.createElement(f.a,{exact:!0,path:"/scoreboard",render:function(){return l.a.createElement(N,{categoryByChallenge:e.categoryByChallenge,lastSolveTimeByTeam:e.state.lastSolveTimeByTeam,pointsByTeam:e.state.pointsByTeam,solvesByTeam:e.state.solvesByTeam,teamScoreboardOrder:e.state.teamScoreboardOrder,team:e.state.team,teams:e.state.teams})}}),l.a.createElement(f.a,{exact:!0,path:"/solves",render:function(){return l.a.createElement(O,{challenges:e.state.challenges,solvesByChallenge:e.state.solvesByChallenge,teamScoreboardOrder:e.state.teamScoreboardOrder})}}),l.a.createElement(p.a,{className:"anything-but-the-default",contentLabel:"Challenge Modal",isOpen:"challenge"===this.state.showModal,onRequestClose:this.handleCloseModal},l.a.createElement(C,{challengeId:this.state.showChallengeId,onClose:this.handleCloseModal,onSolve:this.loadChallenges,solved:t,numSolved:this.state.solvesByChallenge[this.state.showChallengeId]||0}))))}}]),t}(l.a.Component);var B=function(){return l.a.createElement(s.a,null,l.a.createElement(j,null))};a(62);r.a.render(l.a.createElement(B),document.getElementById("root"))}},[[36,1,2]]]);
