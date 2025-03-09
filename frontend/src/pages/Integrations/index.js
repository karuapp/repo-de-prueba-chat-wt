/* eslint-disable no-console */
import React from 'react';

import { Grid } from '@material-ui/core';

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

import { i18n } from "../../translate/i18n";

import hinovaImg from '../../assets/hinova.png';
import siprovImg from '../../assets/siprov.png';
import mikwebImg from '../../assets/mikweb.png';
import asaasImg from '../../assets/asaas.png';
import blingImg from '../../assets/bling.png';
import rdstationImg from '../../assets/rdstation.png';
import perfexImg from '../../assets/perfex.png';
import activeImg from '../../assets/activecampaign.png';
import wpwImg from '../../assets/wpw.png';
import whmcsImg from '../../assets/whmcs.png';
import MainHeader from '../../components/MainHeader';
import Title from '../../components/Title';
import MainContainer from '../Reports/components/MainContainer';
import IntegrationLinkBox from './components/IntegrationLinkBox';

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    paddingBottom: 100
  },
  mainHeader: {
    marginTop: theme.spacing(1),
  },
  elementMargin: {
    marginTop: theme.spacing(2),
  },
  formContainer: {
    maxWidth: 500,
  },
  textRight: {
    textAlign: "right"
  }
}));



const Integrations = () => {

  const classes = useStyles();

  return (
    <MainContainer>
      <MainHeader>
        <Title>Aplicativos & Integrações</Title>
      </MainHeader>
      <Grid container spacing={4} sx={{ overflowY: 'unset' }}>

        {/* HINOVA */}
        {/* <Grid item xs={3}>
          <IntegrationLinkBox
            title="HINOVA"
            link="/integrations/hinova"
            customStyle={{ marginTop: '55px' }}
            img={hinovaImg}
          />
        </Grid> */}

        {/* SIPROV */}
        {/* <Grid item xs={3}>
          <IntegrationLinkBox
            title="SIPROV"
            link="/integrations/siprov"
            customStyle={{ marginTop: '55px' }}
            img={siprovImg}
          />
        </Grid> */}

        <Grid item xs={3}>
          <IntegrationLinkBox
            link="#"
            customStyle={{ marginTop: '42px' }}
            img={rdstationImg}
          />
        </Grid>

        <Grid item xs={3}>
          <IntegrationLinkBox
            link="#"
			customStyle={{ marginTop: '42px' }}
            img={blingImg}
          />
        </Grid>

        <Grid item xs={3}>
          <IntegrationLinkBox
            link="#"
			customStyle={{ marginTop: '42px' }}
            img={activeImg}
          />
        </Grid>

        
        <Grid item xs={3}>
          <IntegrationLinkBox
            link="#"
			customStyle={{ marginTop: '42px' }}
            img={perfexImg}
          />
        </Grid>

		<Grid item xs={3}>
          <IntegrationLinkBox
            link="#"
			customStyle={{ marginTop: '42px' }}
            img={wpwImg}
          />
        </Grid>

		<Grid item xs={3}>
          <IntegrationLinkBox
            link="#"
			customStyle={{ marginTop: '42px' }}
            img={whmcsImg}
          />
        </Grid>

        
         


      </Grid>
    </MainContainer>
  );
};

export default Integrations;
