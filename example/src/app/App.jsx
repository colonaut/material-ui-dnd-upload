import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/main.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin';

//

(function () {

    //Needed for React Developer Tools
    window.React = React;

    //Needed for onTouchTap
    //Can go away when react 1.0 release
    //Check this repo:
    //https://github.com/zilverline/react-tap-event-plugin
    injectTapEventPlugin();

    // Render the main app react component into the document body.
    // For more details see: https://facebook.github.io/react/docs/top-level-api.html#react.render
    ReactDOM.render(<Main />, document.getElementById('example'));

})();