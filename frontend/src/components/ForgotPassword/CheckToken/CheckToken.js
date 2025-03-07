import { Button, Grid, Link, TextField, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { makeStyles } from "@material-ui/core/styles";
import { Link as RouterLink } from "react-router-dom";
import { i18n } from '../../../translate/i18n';
const logo = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/login.png`;
const randomValue = Math.random(); // Generate a random number
const logoWithRandom = `${logo}?r=${randomValue}`;

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

const CheckToken = ({token, email, setStage}) => {
    const classes = useStyles();

    const [tokenInfo, setTokenInfo] = useState("");

    useEffect(() => {
        toast.success(`Informe o token enviado para ${email}`);
    }, [email]);

    const handleSubmit = () => {
        if(tokenInfo === token) {
            toast.success("Token válido");
            setStage("resetPassword");
        } else {
            toast.error("Token inválido, tente novamente");
        }
    }

    return (
        <div className={classes.paper}>
            <div>
                <img style={{ margin: "0 auto", width: "80%" }} src={logoWithRandom} alt={`${process.env.REACT_APP_NAME_SYSTEM}`} />
            </div>
            <Typography component="h2" variant="h5" style={{ marginTop: '15px', marginBottom: '15px' }}>
  				Token
			</Typography>
            <Typography component="p" variant="p" style={{ marginTop: '15px', marginBottom: '15px' }}>
               Digite o token enviado por e-mail.
            </Typography>
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="token"
                label={"Token"}
                name="token"
                value={tokenInfo}
                onChange={(e) => setTokenInfo(e.target.value)}
                autoComplete="token"
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
                Validar Token
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
    )
}

export default CheckToken;