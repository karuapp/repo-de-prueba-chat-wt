import React from 'react';
import { Backdrop, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import './BackdropLoading.css';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
  logo: {
    marginBottom: theme.spacing(2),
  },
}));

const BackdropLoading = () => {
  const classes = useStyles();

  return (
    <Backdrop className={clsx('BLbackdrop', classes.backdrop)} open={true}>
      <div className="BLsplashScreen">
        <img src="/loading-progress.png" alt="Logo Atevus" className={clsx('BLlogo', classes.logo)} />
        <div className="BLwrapper">
          <div className="BLslide"></div>
          
        </div>
      </div>
    </Backdrop>
  );
};

export default BackdropLoading;
