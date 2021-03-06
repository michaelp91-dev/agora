import Login from './Login';
import SubscribeForm from './subscribe/SubscribeForm';
import React from 'react';
import Encart from "./login/encart";
import Document from './document/Document';
import DocumentEdit from "./document/DocumentEdit";
import DocumentView from "./document/DocumentView";
import InviteNavigate from "./invite/InviteNavigate";
import {
    Switch,
    Route,
    Link
} from 'react-router-dom';
import Barre from "./barre/Barre";
import Search from "./document/search/Search";
import _403 from "./403";


export default function App() {

    return (

            <div>
                <nav className="navbar navbar-light bg-light">
                    <ul className="nav">
                        <li className="nav-item active">
                            <Link to="/home" className="nav-link">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/subscribe" className="nav-link">Inscription</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/login" className="nav-link">Connexion</Link>
                        </li>
                    </ul>
                    <Encart></Encart>
                </nav>
                <div className="container">
                    <Switch>
                        <Route path="/subscribe">
                            <SubscribeForm></SubscribeForm>
                        </Route>
                        <Route path="/login">
                            <Login></Login>
                        </Route>
                        <Route path="/home">
                            <Home></Home>
                        </Route>
                        <Route path="/documents">
                            <Barre></Barre>
                            <Search></Search>
                        </Route>
                        <Route path="/documentedit/:id">
                            <Barre></Barre>
                            <DocumentEdit></DocumentEdit>
                        </Route>
                        <Route path="/document/:id">
                            <Barre></Barre>
                            <DocumentView></DocumentView>
                        </Route>
                        <Route path="/document">
                            <Document></Document>
                        </Route>
                        <Route path="/invite/:id">
                            <InviteNavigate></InviteNavigate>
                        </Route>
                        <Route path="/403">
                            <_403></_403>
                        </Route>
                    </Switch>
                </div>
            </div>
    );
}

function Home() {
    return (
        <h1>Home</h1>
    )
}