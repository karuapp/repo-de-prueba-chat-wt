import React, { useState, useContext, useEffect } from "react";

import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
	backdrop: {
		//background: "linear-gradient(to right, #3c6afb , #3c6afb , #C5AEF2)",
		zIndex: theme.zIndex.drawer + 1,
		color: "#fff",
	},
}));

const BackdropLoading = () => {
	const classes = useStyles();
    const [backdropColor, setbackdropColor] = useState('');

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


	return (
		<Backdrop className={classes.backdrop} open={true} style={backdropStyle}>
			<CircularProgress color="secondary" />
		</Backdrop>
	);
};

export default BackdropLoading;
