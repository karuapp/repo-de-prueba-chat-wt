import { Button, Grid, IconButton, InputAdornment, Link, TextField, Typography, makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import { Link as RouterLink, useHistory } from "react-router-dom";
import { i18n } from '../../../translate/i18n';
import { toast } from 'react-toastify';
import { openApi } from '../../../services/api';
import { Visibility, VisibilityOff } from '@material-ui/icons';
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

const ResetPassword = ({email}) => {
    const classes = useStyles();
    const history = useHistory();

    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmar, setShowPasswordConfirmar] = useState(false);

    const handleSubmit = async () => {
        if(senha !== confirmarSenha) {
            toast.error("As novas senhas não são iguais");
            return null;
        }
        const {data} = await openApi.post("/users/updatePassword", {
            email: email,
            password: senha
        });

        if(data !== null) {
            toast.success("Usuário atualizado com sucesso!");
            history.push("/login");
        }
    }

    return (
        <div className={classes.paper}>
            <div>
                <img style={{ margin: "0 auto", width: "80%" }} src={logoWithRandom} alt={`${process.env.REACT_APP_NAME_SYSTEM}`} />
            </div>
            <Typography component="h2" variant="h5" style={{ marginTop: '15px', marginBottom: '15px' }}>
  				Criar Nova Senha
			</Typography>
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="senha"
                label={"Nova Senha"}
                name="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="senha"
                autoFocus
                type={showPassword ? 'text' : 'password'}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										aria-label="toggle password visibility"
										onClick={() => setShowPassword((e) => !e)}
									>
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							)
						}}
            />
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="confirmarSenha"
                label={"Confirmar Senha"}
                name="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                autoComplete="confirmarSenha"   
                type={showPasswordConfirmar ? 'text' : 'password'}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										aria-label="toggle password visibility"
										onClick={() => setShowPasswordConfirmar((e) => !e)}
									>
										{showPasswordConfirmar ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							)
						}}
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
    )
}

export default ResetPassword;