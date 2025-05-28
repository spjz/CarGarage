import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Garage from './components/Garage';
import CarDetails from './components/CarDetails';

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Garage} />
                <Route path="/car/:registrationnumber" component={CarDetails} />
            </Switch>
        </Router>
    );
}

export default App;