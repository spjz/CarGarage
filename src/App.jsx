import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Garage from './components/Garage';

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Garage} />
            </Switch>
        </Router>
    );
}

export default App;