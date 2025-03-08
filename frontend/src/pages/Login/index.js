import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Helmet } from "react-helmet";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import EmailOutlinedIcon from '@material-ui/icons/EmailOutlined';
import VpnKeyOutlinedIcon from '@material-ui/icons/VpnKeyOutlined';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import logo from "../../assets/logo.png";
import ColorModeContext from "../../layout/themeContext";

import "./style.css";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    background: "linear-gradient(to right, #0000FF , #0000CD , #00008B)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  paper: {
    backgroundColor: theme.palette.login,
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
    width: "80%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
    paddingTop: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  submit: {
    "&.MuiButton-root": {
      margin: "20px 0px 16px",
      backgroundColor: "#0020ff",
      borderRadius: " 30px",
    },
    "&:hover": {
      backgroundColor: "#445bff",
    },

    backgroundColor: "rgb(52, 137, 255)",
    margin: theme.spacing(3, 0, 2),
    WebkitTextFillColor: "#FFF",
    width: "50%",
  },
  powered: {
    color: "white",
  },
  input: {
    "& .MuiOutlinedInput-root": {
      position: "relative",
      borderRadius: "10px",
    },
  },
  logoImg: {
    width: "100%",
    maxWidth: "350px",
    height: "auto",
    maxHeight: "120px",
    margin: "0 auto",
    content: `url(${theme.calculatedLogoLight()})`,
  },
}));

const Login = () => {
  const classes = useStyles();
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin } = useContext(AuthContext);
  const { colorMode } = useContext(ColorModeContext);
  const { appLogoFavicon, appName, mode } = colorMode;
  const [alert, setAlert] = useState({ open: false, message: "", severity: "error" });
  const [isLoading, setIsLoading] = useState(true);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: name === 'email' ? value.toLowerCase() : value });
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handlSubmit = async (e) => {
    e.preventDefault();
    if (!user.email || !user.password) {
      setAlert({
        open: true,
        message: "Por favor, preencha todos os campos.",
        severity: "warning",
      });
      return;
    }
    try {
      await handleLogin(user);
    } catch (error) {
      setAlert({
        open: true,
        message: error.message || "Senha incorreta ou usuário não encontrado.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{appName || ""}</title>
        <link rel="icon" href={appLogoFavicon} />
      </Helmet>
      <div className="geral">
        <CssBaseline />
        <div className={"container-login"}>
          <div className={"container-img"}>
            {isLoading && <div style={{ height: "120px" }} />}
            <img
              className={classes.logoImg}
              alt="logo"
              src={logo}
              onLoad={handleLoad}
              style={{ display: isLoading ? "none" : "block" }}
            />
          </div>
          <div className="container-footer">
            <p>
              Copyright ©{" "}{new Date().getFullYear()}{" "}
              <a href={"/"} target={"_blank"} rel={"noreferrer"}>
                {appName || ""}.
              </a>
            </p>
            <p>
              This site is protected by reCAPTCHA Enterprise and the Google{" "}
              <a href={"https://policies.google.com/privacy"} target={"_blank"} rel={"noreferrer"}>
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href={"https://policies.google.com/terms"} target={"_blank"} rel={"noreferrer"}>
                Terms of Service
              </a>
            </p>
          </div>
        </div>
        <div className={"container-right"}>
          <div className={"box"}>
            <div className={"container-header-box"}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                className={"link-enter"}
                tabIndex={0}
                role={"button"}
                aria-disabled={"false"}
                to="/login"
                style={{ textDecoration: "none", border: "3px solid #fff", backgroundColor: "#0020ff" }}
              >
                <span>Login</span>
              </a>
              <Link
                component={RouterLink}
                className={"link-create-count"}
                tabIndex={0}
                role={"button"}
                aria-disabled={"false"}
                to="/signup"
                style={{ textDecoration: "none" }}
              >
                <span className={"label-text"} style={{paddingTop: "3px"}}>Criar conta</span>
              </Link>
            </div>
            <form className={classes.form} noValidate onSubmit={handlSubmit}>
              {alert.open && (
                <Alert
                  severity={alert.severity}
                  onClose={() => setAlert({ ...alert, open: false })}
                  style={{ marginBottom: "20px" }}
                >
                  <AlertTitle>{alert.severity === "error" ? "Erro" : "Aviso"}</AlertTitle>
                  {alert.message}
                </Alert>
              )}
              <TextField
                className={`${classes.input} custom-input hover-effect`}
                variant="outlined"
                required
                fullWidth
                id="email"
                label={i18n.t("login.form.email")}
                name="email"
                value={user.email}
                onChange={handleChangeInput}
                autoComplete="email"
                autoFocus
                onFocus={() => setFocusedEmail(true)}
                onBlur={() => setFocusedEmail(false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" className={`icone-inicio ${focusedEmail ? "focused" : ""}`}>
                      <EmailOutlinedIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                className={`${classes.input} custom-input hover-effect`}
                variant="outlined"
                required
                fullWidth
                name="password"
                label={i18n.t("login.form.password")}
                type={showPassword ? "text" : "password"}
                id="password"
                value={user.password}
                onChange={handleChangeInput}
                autoComplete="current-password"
                onFocus={() => setFocusedPassword(true)}
                onBlur={() => setFocusedPassword(false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" className={`icone-inicio ${focusedPassword ? "focused" : ""}`}>
                      <VpnKeyOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                {i18n.t("login.buttons.submit")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
