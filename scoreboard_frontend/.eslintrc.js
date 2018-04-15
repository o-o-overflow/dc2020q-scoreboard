module.exports = {
  "env": {
    "browser": true
  },
  "extends": "airbnb",
  "parser": "babel-eslint",
  "rules": {
    "jsx-a11y/anchor-is-valid": [ "error", {
      "components": [ "Link" ],
      "specialLink": [ "to" ]
    }]
  },
};
