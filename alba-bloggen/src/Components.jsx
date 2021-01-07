import React, { useState, useEffect, useCallback, createRef } from 'react';
import styled from 'styled-components';
import { createGlobalStyle } from 'styled-components';
import PlayfairDisplayWoff from './fonts/PlayfairDisplay.woff';
import PlayfairDisplayWoff2 from './fonts/PlayfairDisplay.woff2';
import MontserratWoff from './fonts/Montserrat.woff';
import MontserratWoff2 from './fonts/Montserrat.woff2';
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
const devMode = false
let appUrl
if(devMode){
    appUrl = "http://localhost:9000"
} else {
    appUrl = "https://dt162gproject.herokuapp.com"
}
/***React projekt by Cristina Löfqvist Mid University Sweden***/

/**
 * TODOS:
 * * It would be nice to extrace logout button to an own component with its own submit handler
 * to not clog the code on the places which this is needed as it is used in about 5 components.
 *
 * * Rewrite hook that calls res api as it is not very organized.
 * 
 * * It would be nice to add default values to some of the properties in the styled components.
 * 
 * * Somehow rewrite the blogg component as it is pretty messy
 * 
 * Overall not quite bad
 * 
 */

/* Hook to extract value fom input field*/

const useInput = (initialValue) => {
    const [value, setValue] = useState(initialValue)

    return {
        value,
        setValue,
        reset: () => setValue(""),
        bind: {
            value,
            onChange: event => {
                setValue(event.target.value);
            }
        }
    }
}

/**
 * Calls a rest api at the giver url
 * @param {*} url 
 * @param {*} method 
 * @param {*} body 
 * @param {*} headers 
 */
const callRestApi = async (url, method, body, withCredentials, headers = { 'Content-Type': 'application/json' }) => {

    const requestData = {
        url: url,
        method: method,
        headers: headers,
    }
    if (withCredentials) {
        requestData.credentials = withCredentials
    }
    if (body) {
        requestData.body = body
    }
    const requestOptions = {
        method: requestData.method,
        headers: requestData.headers,
        credentials: requestData.credentials,
        body: JSON.stringify(requestData.body)
    }
    if (!requestData.url) {
        return
    }

    let returnData = { isLoaded: false };
    const res = await fetch(requestData.url, requestOptions)
    const json = await res.json();
    if (!res.ok) {
        returnData.status = res.status
        returnData.error = json
        returnData.isLoaded = true;
    }

    returnData.status = res.status
    returnData.data = json
    returnData.isLoaded = true;
    return returnData
}

/**
 * Hook to call a rest api at the  given url
 * @param {*} url 
 * @param {*} method 
 * @param {*} body 
 * @param {*} headers 
 */

const useRestApiCall = (url, method, body, withCredentials, headers = { 'Content-Type': 'application/json' }) => {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [data, setData] = useState(null);
    const [status, setStatus] = useState(null);

    const requestData = {
        url: url,
        method: method,
        headers: headers,
    }
    if (withCredentials) {
        requestData.credentials = withCredentials
    }
    if (body) {
        requestData.body = body
    }

    const fetchData = useCallback(async () => {
        const requestOptions = {
            method: requestData.method,
            headers: requestData.headers,
            credentials: requestData.credentials,
            body: JSON.stringify(requestData.body)
        }
        if (!requestData.url) {
            return
        }
        const res = await fetch(requestData.url, requestOptions)
        const json = await res.json();
        if (!res.ok) {
            setStatus(res.status)
            setError(json)
            setIsLoaded(true)
        }
        setData(json);
        setStatus(res.status)
        setIsLoaded(true)

    }, [requestData])

    /*Call to api*/
    useEffect(() => {
        if (!isLoaded) {
            fetchData()
        }
    }, [isLoaded, fetchData])

    return { data: data, isLoaded: isLoaded, error: error, status: status };
}

export const AppStyle = createGlobalStyle`
    @font-face {
        font-family: 'PlayfairDisplay';
        src: localStorage('Font Name'), local('FontName'), 
        url(${PlayfairDisplayWoff2}) format ('woff2'), 
        url(${PlayfairDisplayWoff}) format ('woff');
        font-style: getDefaultNormalizer; 
    }
    @font-face {
        font-family: 'Montserrat';
        src: localStorage('Font Name'), local('FontName'), 
        url(${MontserratWoff2}) format ('woff2'), 
        url(${MontserratWoff}) format ('woff');
        font-style: getDefaultNormalizer; 
    }
    label, button, p {
        font-family: Montserrat; 
    }
    h1,h2,h3 {
        font-family: PlayfairDisplay; 
    }
    a {
        text-decoration: none;
    }
`


export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: 500px auto 100px;
  height: 100vh;
  grid-template-areas: "h h h h h h h h h h h h" "m m m m m m m m m m m m" "f f f f f f f f f f f f";
`

export const HeaderBase = styled.header`
    grid-area: h;
    width: 100%;
    background-image: url("./Images/laura-vinck-Hyu76loQLdk-unsplash.png");
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

export const Body = styled.main`
    grid-area: m;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
    height: 100%;
`

export const Footer = styled.footer`
    grid-area: f;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`

export const SocialMediaIcon = styled.img`
    width:24px;
    height:24px;
`

export const MarginAnchor = styled.a`
    margin: ${(props) => props.margin}
`

export const Input = styled.input`
    width: 400px;
    height: 35px;
    border-top-style: hidden;
    border-right-style: hidden;
    border-left-style: hidden;
    border-bottom-style: solid;
`

export const Logo = styled.img`
    width: 130px;
    height: 130px;
    position: absolute;
    z-index: 1001;
    top: 10px;
    left: 10px;
`
export const Button = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 40px;
    color: black;
    border-style: solid;
    border-color: black;
    background-color: white;
    padding-top: 10px;
    padding-right: 30px;
    padding-bottom: 10px;
    padding-left: 30px;
    width: 150px;
    height: 62px;
`

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;  
    align-items: center;
    margin: 20px;
    padding: 20px;
    border-style: solid; 
    max-width: 600px; 
    height: ${(props) => props.height}
`

export const FlexWrapper = styled.div`
    display:flex;
    flex-direction: column;
`
export const SideBySide = styled.div`
    display:flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
`

export const BloggBody = styled.div`
    display:flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
`


const CrossComponent = styled.div`
  
    border-radius: 10px;
    transform:  rotate(${(props) => props.rotate});
    background: black;
`
const CrossBody = styled.button`
    width:24px;
    height:24px;
`

const Cross = () => {
    return (
        <CrossBody>
            <CrossComponent rotate="45deg" />
            <CrossComponent rotate="-45deg" />
        </CrossBody>
    )
}

export const Header = ({ logo, logoAlt, ...props }) => {
    return (
        <HeaderBase>
            <Link to="/">
                <Logo src="./Images/logo2.png" alt="Logotype"></Logo>
            </Link>
            <h1>Välkomen till Alba bloggen</h1>
        </HeaderBase>
    )
}

export const SocialMediaLink = ({ ...props }) => {
    return (
        <MarginAnchor {...props}><SocialMediaIcon src={props.imageSrc}></SocialMediaIcon></MarginAnchor>
    );
}

export const RegisterForm = (props) => {
    /**
     * Hooks to get data from input fields in the below form
     */
    const { value: firstName, bind: bindFirstName, reset: resetFirstName } = useInput('');
    const { value: lastName, bind: bindLastName, reset: resetLastName } = useInput('');
    const { value: email, bind: bindEmail, reset: resetEmail } = useInput('');
    const { value: userName, bind: bindUserName, reset: resetUserName } = useInput('');
    const { value: password, bind: bindPassword, reset: resetPassword } = useInput('');


    const loggedin = window.sessionStorage.getItem("loggedin")

    /**
    * Initialize sent data flag (sendData)
    * and data response object
    */
    let sendData = false;
    let data = {};

    /**
     * Sumbithandler which is called on the register button
     * Gets the input values and calls rest api user/create
     * @param {*} evt 
     */
    const handleSubmit = (evt) => {
        evt.preventDefault();
        if (firstName === "" || lastName === "" || lastName === "" || userName === "" || password === "") {
            //alert("No field can be empty")
        } else {
            const body = { firstName: firstName, lastName: lastName, userName: userName, email: email, password: password }
            data = callRestApi(appUrl + "/user/create", "POST", body)
            sendData = true;
            resetUserName();
            resetPassword();
            resetFirstName();
            resetEmail();
            resetLastName();
        }
    }

    /**
     * Submithandler called when logout button is pressed
     * Calls rest api /user/logout
     * @param {*} evt 
     */
    const handleSubmitLogout = (evt) => {
        evt.preventDefault();
        callRestApi(appUrl + "/user/logout", "POST")
        sessionStorage.removeItem('loggedin');
        window.location.reload();
    }


    /**
     * User is logged in render logout button
     */
    if (loggedin) {
        return (
            <Button onClick={handleSubmitLogout}>Logga ut</Button>
        )
    }

    /**
     * Checks for the response data from above call to /user/create called in Submithandler
     */
    if (data.error) {
        return (
            <div>Error: {data.error.message}</div>
        )
    } else if (!data.isLoaded && sendData) {
        return (
            <div>Loading...</div>
        )
    }

    /**
     * User is not logged in and a before submit is ok
     * Render the register form
     */
    return (
        <Form height="600px" onSubmit={handleSubmit}>
            <FlexWrapper>
                <label>Förnamn:</label>
                <Input type="text" {...bindFirstName} ></Input>
            </FlexWrapper>
            <FlexWrapper>
                <label>Efternamn:</label>
                <Input type="text" {...bindLastName} ></Input>
            </FlexWrapper>
            <FlexWrapper>
                <label>Email:</label>
                <Input type="text" {...bindEmail}></Input>
            </FlexWrapper>
            <FlexWrapper>
                <label>Användarnamn:</label>
                <Input type="text" {...bindUserName}></Input>
            </FlexWrapper>
            <FlexWrapper>
                <label>Lösenord:</label>
                <Input type="text" {...bindPassword}></Input>
            </FlexWrapper>
            <Button type="submit">Registrera</Button>
        </Form>
    );
}

export const LoginForm = (props) => {

    let userName = createRef()
    let password = createRef()

    /**
     * Submithandler for the login form
     * exectude when login button is pressed
     * Checks that no field is empty befor call of /user/login rest api
     * @param {*} evt 
     */
    const handleSubmit = async (evt) => {
        evt.preventDefault();
        if (userName.current.value === "" || password.current.value === "") {
            alert("No field can be empty")
        } else {
            const body = { cred: { userName: userName.current.value, password: password.current.value } }
            const data = await callRestApi(appUrl + "/user/login", "POST", body)
            /**
             * Checks for the response data from above call to /user/login called in Submithandler
             */
            if (data.error) {
                return (
                    <div>Error: {data.error.message}</div>
                )
            } else if (data.isLoaded === false) {
                return (
                    <div>Loading...</div>
                )
            }
            window.sessionStorage.setItem("loggedin", JSON.stringify(data.data.userId));
            window.location.reload();
        }
    }
    /**
     * User is not logged in render Login form
     */
    return (
        <Form height="600px" onSubmit={handleSubmit}>
            <FlexWrapper>
                <label>Användarnamn:</label>
                <Input type="text" ref={userName}></Input>
            </FlexWrapper>
            <FlexWrapper>
                <label>Lösenord:</label>
                <Input type="text" ref={password}></Input>
            </FlexWrapper>
            <Button type="submit">Logga in</Button>
        </Form>
    );
}

export const PostForm = (props) => {

    let title = createRef()
    let content = createRef()
    const loggedin = window.sessionStorage.getItem("loggedin")
    /**
     * Submithandler for the post form
     * exectude when post button is pressed
     * Checks that no field is empty befor call of blogg/posts/add/ rest api
     * @param {*} evt 
     */
    const handleSubmit = async (evt) => {
        evt.preventDefault();
        if (title.current.value === "" || content.current.value === "") {
            //alert("No field can be empty")
        } else {
            const body = { title: title.current.value, content: content.current.value }
            const data = await callRestApi(appUrl + "/blogg/posts/add/" + loggedin, "POST", body)
            if (data.error) {
                return (
                    <div>Error: {data.error.message}</div>
                )
            } else if (data.isLoaded === false) {
                return (
                    <div>Loading...</div>
                )
            }
            window.location.reload();
        }
    }
    
    return (
        <Form height="600px" onSubmit={handleSubmit}>
            <FlexWrapper>
                <label>Titel:</label>
                <Input type="text" ref={title}></Input>
            </FlexWrapper>
            <FlexWrapper>
                <label>Innehåll:</label>
                <Input type="text" ref={content}></Input>
            </FlexWrapper>
            <Button type="submit">Gör inlägg</Button>
        </Form>
    );
}



export const Home = () => {

    const loggedin = window.sessionStorage.getItem("loggedin")

    /**
     * Event handler connected to submit button (logout button)
     * to call rest api user/logout
     * @param {*} evt 
     */
    const handleSubmitLogout = async (evt) => {
        evt.preventDefault();
        const data = await callRestApi(appUrl + "/user/logout/" + loggedin, "POST")
        if (data.error) {
            return (
                <div>Error: {data.error.message}</div>
            )
        } else if (data.isLoaded === false) {
            return (
                <div>Loading...</div>
            )
        }
        sessionStorage.removeItem('loggedin');
        window.location.reload()
    }

    /**
     * User is logged in render logout button
     */
    if (loggedin) {
        return (
            <Body>
                <p></p>
                <Link to="/UserUpdate">
                    <Button>Uppdatera användaruppgifter</Button>
                </Link>
                <p></p>
                <Button onClick={handleSubmitLogout}>Logga ut</Button>
                <p></p>
                <PostForm></PostForm>
                <Blogg></Blogg>
            </Body>
        )
    }

    /**
     * User is not logged in render login and register buttons
     * which is Links that rout to different components such as login page and register page
     */
    return (
        <Body>
            <p></p>
            <Link to="/Login">
                <Button>Logga in</Button>
            </Link>
            <p></p>
            <Link to="/Register">
                <Button>Registrera ny användare</Button>
            </Link>
            <h2>Senaste blogginlägg:</h2>
            <img src="./Images/icons8-book-and-pencil-100.png" alt="bookicon"></img>
            <Blogg></Blogg>
        </Body>
    );

}

export const Register = () => {
    return (
        <Body>
            <img src="./Images/icons8-customer-64.png" alt="avataricon"></img>
            <RegisterForm></RegisterForm>
        </Body>
    )
}

export const Login = () => {
    const loggedin = window.sessionStorage.getItem("loggedin")
    /**
    * Submithandler called when logout button is pressed
    * Calls rest api /user/logout
    * @param {*} evt 
    */
    const handleSubmitLogout = (evt) => {
        evt.preventDefault();
        const data = callRestApi(appUrl + "/user/logout/" + loggedin, "POST")
        if (data.error) {
            return (
                <div>Error: {data.error.message}</div>
            )
        } else if (data.isLoaded === false) {
            return (
                <div>Loading...</div>
            )
        }
        sessionStorage.removeItem('loggedin');
        window.location.reload();
    }

    /**
     * User is logged in render logout button
     */
    if (loggedin) {
        return (
            <Body>
                <Button onClick={handleSubmitLogout}>Logga ut</Button>
            </Body>
        )
    }
    return (
        <Body>
            <img src="./Images/icons8-customer-64.png" alt="avataricon"></img>
            <h2>Logga in:</h2>
            <LoginForm></LoginForm>
        </Body>
    )
}

const UpdateForm = () => {
    /**
     * Hook to get values from input fields
     */
    const { value: newEmail, bind: bindNewEmail, reset: resetNewEmail } = useInput('');

    /**
     * Initialize response data object and data sent flag (sendData)
     */
    let data = {}
    let sendData = false;

    /**
     * Submithandler to call user/update when button is clicked
     * in form for user update
     * @param {*} evt 
     */
    const handleSubmit = (evt) => {
        evt.preventDefault();
        if (newEmail === "") {
            //alert("No field can be empty")
        } else {
            const body = { email: newEmail }
            console.log(body)
            data = callRestApi(appUrl + "/user/update/" + window.sessionStorage.getItem("loggedin"), "PUT", body)
            resetNewEmail();
        }
    }
    /**
     * Checks for the above call in the eventhandler to the rest api user/update
     */
    if (data.error) {
        return (
            <div>Error: {data.error.message}</div>
        )
    } else if (!data.isLoaded && sendData) {
        return (
            <div>Loading...</div>
        )
    }

    /**
     * Everything is ok show the return the form
     */
    return (
        <Form height="600px" onSubmit={handleSubmit}>
            <FlexWrapper>
                <label>Ny email:</label>
                <Input type="text" {...bindNewEmail}></Input>
            </FlexWrapper>
            <Button type="submit">Updatera</Button>
        </Form>
    );
}

export const UserUpdate = () => {

    if (window.sessionStorage.getItem("loggedin")) {
        return (
            <Body>
                <UpdateForm />
            </Body>
        )
    }
}

export const Blogg = () => {
    /**
     * Hooks to call rest api for get posts and check if a user is currently logged in
     */
    const posts = useRestApiCall(appUrl + "/blogg/posts/get", "GET")
    const loggedin = window.sessionStorage.getItem("loggedin")

    /**
     * Helper function to map the posts.data aray to article elements and add a delete cross to the
     * posts that are created by the currently logged in user
     * @param {*} posts 
     */
    const mapPosts = (posts) => {

        if (loggedin) {
            return (
                <BloggBody>
                    {posts.data.map(post => (
                        <article key={post.postId}>

                            {

                                //loggedinUser.data.map(user => (
                                post.userId == loggedin ? (

                                    <>
                                        <Button onClick={async () => {
                                            const data = await callRestApi(appUrl + "/blogg/posts/delete/" + post.postId + "/" + loggedin, "DELETE")
                                            if (data.error) {
                                                return (
                                                    <div>Error: {data.error.message}</div>
                                                )
                                            } else if (data.isLoaded === false) {
                                                return (
                                                    <div>Loading...</div>
                                                )
                                            }
                                            window.location.reload();
                                        }}>Ta bort <b>↓</b></Button>
                                        <h1>{post.title}</h1>
                                    </>
                                ) : (<h1>{post.title}</h1>)
                            }
                            <p>{post.content}</p>
                            <p>{post.postDate}</p>
                            <p>By: {post.userName}</p>
                        </article>
                    ))}
                </BloggBody>
            );
        } else {
            return (
                <BloggBody>
                    {posts.data.map(post => (
                        <article key={post.postId}>
                            <h1>{post.title}</h1>
                            <p>{post.content}</p>
                            <p>{post.postDate}</p>
                            <p>By: {post.userName}</p>
                        </article>
                    ))}
                </BloggBody>
            );
        }
    }

    /**
     * Check response from hooks:
     * useCallRestApi("blogg/posts/get") for getting all posts
     */
    if (posts.error) {
        return (
            <BloggBody>
                <div>Error: {posts.error.message}</div>
            </BloggBody>
        )
    } else if (!posts.isLoaded) {
        return (
            <BloggBody>
                <div>Loading...</div>
            </BloggBody>
        )
    }

    /**
     * Return of blogg body with posts if everything is ok and no user is logged in
     */
    if (posts.data && posts.isLoaded && posts.status === 200 && posts.data !== null) {
        return mapPosts(posts)
    }

    /**
     * Return of bloggbody if no posts are present
     */
    return (
        <BloggBody></BloggBody>
    )
}







