import React, { useContext } from 'react';
import { Typography, Grid } from '@material-ui/core';
import useStyles from './styles';
import { AuthContext } from "../../../context/Auth/AuthContext";

function PaymentDetails(props) {
  const { formValues } = props;
  const classes = useStyles();
  const { firstName, cpf, address2, city, zipcode, state, country, plan } = formValues;
  const { user } = useContext(AuthContext);

  // Console log para verificar os campos
  console.log("First Name:", firstName);
  console.log("CPF:", cpf);

  const newPlan = JSON.parse(plan);
  const { price } = newPlan;

  return (
    <Grid item container direction="column" xs={6} sm={12}>
      <Typography variant="h6" gutterBottom className={classes.title}>
        Informação de pagamento
      </Typography>
      <Grid container>
        <React.Fragment>
          <Grid item xs={6}>
            <Typography gutterBottom>Email:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>{user.email}</Typography>
          </Grid>
        </React.Fragment>
        <React.Fragment>
          <Grid item xs={6}>
            <Typography gutterBottom>Nome:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>{firstName}</Typography>
          </Grid>
        </React.Fragment>
        <React.Fragment>
          <Grid item xs={6}>
            <Typography gutterBottom>CPF/CNPJ:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>{cpf}</Typography>
          </Grid>
        </React.Fragment>
        <React.Fragment>
          <Grid item xs={6}>
            <Typography gutterBottom>Total:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>
              R${price.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
            </Typography>
          </Grid>
        </React.Fragment>
      </Grid>
    </Grid>
  );
}

export default PaymentDetails;
