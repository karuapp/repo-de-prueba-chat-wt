import React, { useState, useContext, useEffect, useParams } from "react";//import { Link as RouterLink } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid"; 
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";


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

const Survey = () => {
	const classes = useStyles();

	const [backdropColor, setbackdropColor] = useState('');

    const { chavePesquisa } = useParams();
  	const [dadosPesquisa, setDadosPesquisa] = useState([]);
  	const [valorSelecionado, setValorSelecionado] = useState("");

  	useEffect(() => {
    	fetchBackdropBackground();
  	}, []);

  	const fetchBackdropBackground = async () => {
  
 
    try {
    	const response = await api.get("/settings/backgroundPages");
      	const backdropBackground = response.data.value;
      	
      	setbackdropColor(backdropBackground);
    	} catch (error) {
    		console.error('Error retrieving toolbar background color', error);
    	}
  	};

  	const backdropStyle = {
    	background: backdropColor,
  	};


  useEffect(() => {
    // Função para buscar os dados da pesquisa na API
    const buscarPesquisa = async () => {
      try {
        const response = await api.get(`/buscarpesquisa/${chavePesquisa}`);
        setDadosPesquisa(response.data);
      } catch (error) {
        console.error("Erro ao buscar a pesquisa:", error);
      }
    };

    buscarPesquisa();
  }, [chavePesquisa]);

    const logo = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/login.png`;
    const randomValue = Math.random(); // Generate a random number
  
    const logoWithRandom = `${logo}?r=${randomValue}`;

	return (
		<div className={classes.root} style={backdropStyle}>
		<Container component="main" maxWidth="xs">
			<CssBaseline/>
			<div className={classes.paper}>
				<div>
					<img style={{ margin: "0 auto", width: "80%" }} src={logoWithRandom} alt={`${process.env.REACT_APP_NAME_SYSTEM}`} />
				</div>
				{/*<Typography component="h1" variant="h5">
					{i18n.t("survey.title")}
				</Typography>*/}
                
       <FormControl fullWidth>
        <InputLabel>Selecione uma opção</InputLabel>
        <Select
          value={valorSelecionado}
          onChange={(event) => setValorSelecionado(event.target.value)}
        >
          {dadosPesquisa.map((item) => (
            <MenuItem key={item.ratingId} value={item.value}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

			
			</div>
			
			
			<Box mt={8} style={{ color: "white" }}>{ <Copyright /> }</Box>
		</Container>
		</div>
	);
};

export default Survey;