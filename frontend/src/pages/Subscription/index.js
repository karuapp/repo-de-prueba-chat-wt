import React, { useState, useContext, useEffect, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import SubscriptionModal from "../../components/SubscriptionModal";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import moment from "moment";
import { useDate } from "../../hooks/useDate";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const Contacts = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const { returnDays } = useDate();

  const handleOpenContactModal = () => setContactModalOpen(true);
  const handleCloseContactModal = () => setContactModalOpen(false);

  const daysRemaining = returnDays(user?.company?.dueDate);
  const dueDateMessage = useMemo(() => {
    if (daysRemaining === 0) return "Sua licença vence hoje!";
    if (daysRemaining > 0) return `Sua licença vence em ${daysRemaining} dias!`;
    return "Data de vencimento inválida.";
  }, [daysRemaining]);

  return (
    <MainContainer className={classes.mainContainer}>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        contactId={null}
      />
      <MainHeader>
        <Title>Assinatura</Title>
      </MainHeader>
      <Grid item xs={12} sm={4}>
        <Paper className={classes.mainPaper} variant="outlined">
          <TextField
            id="license-period"
            label="Período de Licença"
            defaultValue={dueDateMessage}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
          <TextField
            id="billing-email"
            label="Email de cobrança"
            defaultValue={user?.email}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenContactModal}
            fullWidth
          >
            Assine Agora!
          </Button>
        </Paper>
      </Grid>
    </MainContainer>
  );
};

export default Contacts;
