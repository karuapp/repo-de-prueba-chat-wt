import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
//import politicaDePrivacidade from `${process.env.REACT_APP_BACKEND_URL}/public/documentos/politicaPrivacidade.pdf`;
//import termosDeUso from `${process.env.REACT_APP_BACKEND_URL}/public/documentos/termosDeUso.pdf`;
import { Box, Button, Container, CssBaseline, Grid, TextField, Typography } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";

import api from "../../services/api";
import Link from "@material-ui/core/Link";
import { i18n } from '../../translate/i18n';
import { openApi } from '../../services/api';
import CheckToken from '../../components/ForgotPassword/CheckToken/CheckToken'
import ResetPassword from '../../components/ForgotPassword/ResetPassword/ResetPassword'
const logo = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/login.png`;
const randomValue = Math.random(); // Generate a random number
const logoWithRandom = `${logo}?r=${randomValue}`;


const Copyright = () => {
	return (
		<Typography variant="body2" color="powered" align="center">
			{"Copyright "}

			{new Date().getFullYear()}{" - "}

 			{`${process.env.REACT_APP_NAME_SYSTEM}`}
 		</Typography>
 	);
 };



const useStyles = makeStyles(theme => ({
	root: {
		width: "100vw",
		height: "100vh",
		// background: `${process.env.REACT_APP_BACKDROP_LOADING}`,
		// backgroundImage: "url(https://th.bing.com/th/id/OIP.YRbnvsV4zu-8RejDYPrlKwHaDt?pid=ImgDet&rs=1)",
		// backgroundRepeat: "no-repeat",
		// backgroundSize: "100% 100%",
		// backgroundPosition: "center",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
	},
	paper: {
		backgroundColor: "white",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "55px 30px",
		borderRadius: "12.5px",
	},
	avatar: {
		margin: theme.spacing(1),  
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%", // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	powered: {
		color: `${process.env.REACT_APP_POWERED_COLOR_LOGIN}`,
	}
}));


const ForgotPassword = () => {
    const classes = useStyles();

    const nextComponent = [
        { id: 1, nome: 'checkEmail' },
        { id: 2, nome: "checkToken" },
        { id: 3, nome: "resetPassword" }
    ]

    const [stage, setStage] = useState(nextComponent[0].nome);
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");

    const [backdropColor, setbackdropColor] = useState('');

	useEffect(() => {
    	fetchBackdropBackground();
  	}, []);

    const fetchBackdropBackground = async () => {
  
 
    try {
    	const response = await api.get("/settings/backgroundPages");
      	const backdropBackground = response.data.value;
    
        //console.log(response);
      	
      	setbackdropColor(backdropBackground);
    	} catch (error) {
    		console.error('Error retrieving toolbar background color', error);
    	}
  	};

  	const backdropStyle = {
    	background: backdropColor,
  	};

    //console.log(backdropStyle);
    //console.log(backdropColor);

    //Veificar se o email digitado existe no banco
    const verifyEmail = async () => {
        let { data } = await openApi.post("/users/findByEmail", {
            email: email
        });
        if (data === null) {
            toast.error("E-mail não cadastrado");
            return false
        }
        return true;
    }

    //Envio do token
    const enviarToken = async () => {
        let emailIsValid = await verifyEmail();
        if (emailIsValid) {
            const { data } = await openApi.post("/users/sendemail", {
                email: email
            })
            setToken(data.token);
            setStage(nextComponent[1].nome);
        }
    }

    const handleSubmit = async (e) => {
        enviarToken();
    }

    return (
      <div className={classes.root} style={backdropStyle}>
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            {stage === nextComponent[0].nome && (
                <div className={classes.paper}>
                    <div>
						<img style={{ margin: "0 auto", width: "80%" }} src={logoWithRandom} alt={`${process.env.REACT_APP_NAME_SYSTEM}`} />
					</div>
                    <Typography component="h3" variant="h5" style={{ marginTop: '15px', marginBottom: '15px' }}>
  						Esqueci Minha Senha
					</Typography>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label={"E-mail"}
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={handleSubmit}
                    >
                        Enviar
                    </Button>
                    <Grid container justify="flex-end">
                        <Grid item>
                            <Link
                                href="#"
                                variant="body2"
                                component={RouterLink}
                                to="/login"
                            >
                                {i18n.t("signup.buttons.login")}
                            </Link>
                        </Grid>
                    </Grid>
                </div>
            )}
            {stage === nextComponent[1].nome && <CheckToken token={token} email={email} setStage={setStage} />}
            {stage === nextComponent[2].nome && <ResetPassword email={email}/>}
            <Box mt={8} style={{ color: "white" }}>{ <Copyright /> }</Box>
        </Container>
        </div>
    );
};

export default ForgotPassword;