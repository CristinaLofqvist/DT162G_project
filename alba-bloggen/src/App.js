import React from 'react';
import './App.css';
import {Grid, Header, Body, Footer, Button, SocialMediaLink, RegisterForm, AppStyle, Home, Register, Login, UserUpdate } from './Components';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom"

function App() {
  return (
    <Router>
      <div className="App">
        <AppStyle />
        <Grid>
          <Header></Header>
            <Switch>
              <Route exact path="/">
                <Home />
              </Route>
              <Route exact path="/Register">
                <Register />
              </Route>
              <Route exact path="/Login">
                <Login />
              </Route>
              <Route exact path="/UserUpdate">
                <UserUpdate />
              </Route>
            </Switch>
          <Footer>
            <SocialMediaLink href="https://www.youtube.com" margin="10px" imageSrc="./Images/youtube.png" alt="Youtube link" ></SocialMediaLink>
            <SocialMediaLink href="https://www.facebook.com" margin="10px" imageSrc="./Images/facebook.png" alt="Facebook link" ></SocialMediaLink>
            <SocialMediaLink href="https://www.instagram.com" margin="10px" imageSrc="./Images/instagram.png" alt="Instagram link" ></SocialMediaLink>
            <SocialMediaLink href="https://www.linkedin.com" margin="10px" imageSrc="./Images/linkedin.png" alt="Linkedin link" ></SocialMediaLink>
            <SocialMediaLink href="https://www.pinterest.com" margin="10px" imageSrc="./Images/pinterest.png" alt="Pinterest link" ></SocialMediaLink>
          </Footer>
        </Grid>
      </div>
    </Router>
  );
}

export default App;
