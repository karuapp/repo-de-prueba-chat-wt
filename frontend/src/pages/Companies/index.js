import React, { useState, useEffect, useReducer, useContext } from "react";
import qs from 'query-string'
import countries from 'react-select-country-list';

import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import usePlans from "../../hooks/usePlans";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { AuthContext } from "../../context/Auth/AuthContext";

const Copyright = () => {
    return (
        <Typography variant="body2" color="powered" align="center">
            {"Copyright "}

            {new Date().getFullYear()}{" - "}

            {`${process.env.REACT_APP_NAME_SYSTEM}`}
        </Typography>
    );
 };

const countryOptions = countries().getData();


const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%",
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    powered: {
        color: `${process.env.REACT_APP_POWERED_COLOR_SIGNUP}`,
    }
}));

const UserSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Too Short!")
        .max(50, "Too Long!")
        .required("Required"),
    namecomplete: Yup.string()
        .min(2, "Too Short!")
        .max(50, "Too Long!")
        .required("Required"),
    phone: Yup.string()
        .min(8, "Too Short!")
        .max(50, "Too Long!")
        .required("Required"),
    pais: Yup.string()
        .min(2, "Too Short!")
        .max(50, "Too Long!")
        .required("Required"),
    password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
    email: Yup.string().email("Invalid email").required("Required"),
});

const SignUp = () => {
    const classes = useStyles();
    const history = useHistory();
    let companyId = null
    
    const { user } = useContext(AuthContext);

    const [trial, settrial] = useState('3');

    useEffect(() => {
        fetchtrial();
    }, []);

    const fetchtrial = async () => {
  
 
    try {
        const responsevvv = await api.get("/settings/trial");
        const allowtrialX = responsevvv.data.value;
        settrial(allowtrialX);
        } catch (error) {
            console.error('Error retrieving trial', error);
        }
    };

    // trava para nao acessar pagina que não pode  
    useEffect(() => {
      async function fetchData() {
        if (!user.super) {
          toast.error("Sem permissão para acessar!");
          setTimeout(() => {
            history.push(`/`)
          }, 500);
        }
      }
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const params = qs.parse(window.location.search)
    if (params.companyId !== undefined) {
        companyId = params.companyId
    }

    //let refValue = null
    //refValue = params.ref;

    // Initialize the refValue variable with null or an initial value
    const [refValue, setRefValue] = useState(params.ref);

    // Update the refValue variable with the desired value
    const handleRefChange = (event) => {
        setRefValue(params.ref);
    };

    const initialState = { name: "", email: "", password: "", phone: "", pais: "BR", indicator: "", namecomplete: "", planId: "disabled", };

    const [userB] = useState(initialState);
    const dueDate = moment().add(trial, "day").format();
    const handleSignUp = async values => {
        Object.assign(values, { recurrence: "MENSAL" });
        Object.assign(values, { dueDate: dueDate });
        Object.assign(values, { status: "t" });
        Object.assign(values, { campaignsEnabled: true });
        try {
            await api.post("/companies/internal", values);
            toast.success(i18n.t("signup.toasts.success"));

            window.location.reload(); 
        } catch (err) {
            console.log(err);
            toastError(err);
        }
    };

    const [plans, setPlans] = useState([]);
    const { list: listPlans } = usePlans();

    useEffect(() => {
        async function fetchData() {
            const list = await listPlans();
            setPlans(list);
        }
        fetchData();
    }, []);

    const logo = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/signup.png`;
    const randomValue = Math.random(); // Generate a random number
  
    const logoWithRandom = `${logo}?r=${randomValue}`;


    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <div>
                    <center><img style={{ margin: "0 auto", width: "70%" }} src={logo} alt={`${process.env.REACT_APP_NAME_SYSTEM}`} /></center>
                </div>
                {/* <form className={classes.form} noValidate onSubmit={handleSignUp}> */}
                <Formik
                    initialValues={userB}
                    enableReinitialize={true}
                    validationSchema={UserSchema}
                    onSubmit={(values, actions) => {
                    
                        //values.indicator = refValue;
                    
                        setTimeout(() => {
                            handleSignUp(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting }) => (
                        <Form className={classes.form}>
                    
                    <Grid container spacing={2}>
                    
                            <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        autoComplete="namecomplete"
                                        name="namecomplete"
                                        error={touched.namecomplete && Boolean(errors.namecomplete)}
                                        helperText={touched.namecomplete && errors.namecomplete}
                                        variant="outlined"
                                        fullWidth
                                        id="namecomplete"
                                        label="Nome Completo"
                                        required
                                    />
                            </Grid>

                            
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        autoComplete="name"
                                        name="name"
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                        fullWidth
                                        id="name"
                                        label="Empresa"
                                        required
                                    />
                                </Grid>

                                

                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        variant="outlined"
                                        fullWidth
                                        id="email"
                                        label={i18n.t("signup.form.email")}
                                        name="email"
                                        error={touched.email && Boolean(errors.email)}
                                        helperText={touched.email && errors.email}
                                        autoComplete="email"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        variant="outlined"
                                        fullWidth
                                        name="password"
                                        error={touched.password && Boolean(errors.password)}
                                        helperText={touched.password && errors.password}
                                        label={i18n.t("signup.form.password")}
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                        required
                                    />
                                </Grid>



                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        autoComplete="phone"
                                        name="phone"
                                        error={touched.phone && Boolean(errors.phone)}
                                        helperText={touched.phone && errors.phone}
                                        variant="outlined"
                                        fullWidth
                                        type="number"
                                        id="phone"
                                        label="Celular"
                                        required
                                    />
                                </Grid>



                                
                                <Grid item xs={12}>
                                    <InputLabel htmlFor="pais">País</InputLabel>
                                    <Field
                                        as={Select}
                                        variant="outlined"
                                        fullWidth
                                        id="pais"
                                        label="País"
                                        name="pais"
                                        required
                                    >
                                        <MenuItem value="disabled" disabled>
                                            <em>Qual seu País?</em>
                                        </MenuItem>
                                    {countryOptions.map((country, key) => (
                                            <MenuItem key={key} value={country.value}>
                                            {country.label}
                                            </MenuItem>
                                        ))}
                                    </Field>
                                </Grid>


                                <Grid item xs={12}>
                                    <InputLabel htmlFor="plan-selection">Plano</InputLabel>
                                    <Field
                                        as={Select}
                                        variant="outlined"
                                        fullWidth
                                        id="plan-selection"
                                        label="Plano"
                                        name="planId"
                                        required
                                    >
                                        <MenuItem value="disabled" disabled>
                                            <em>Selecione seu plano de assinatura</em>
                                        </MenuItem>
                                        {plans.map((plan, key) => (
                                            <MenuItem key={key} value={plan.id}>
                                                {plan.name} - {plan.connections} WhatsApps - {plan.users} Usuários - R$ {plan.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </MenuItem>
                                        ))}
                                    </Field>
                                </Grid>

                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        autoComplete="off"
                                        name="indicator"
                                        error={touched.indicator && Boolean(errors.indicator)}
                                        helperText={touched.indicator && errors.indicator}
                                        variant="outlined"
                                        fullWidth
                                        id="indicator"
                                        label="Código de Indicação"
                                    />
                                </Grid>




                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                            >
                                {i18n.t("signup.buttons.submit")}
                            </Button>

                        </Form>
                    )}
                </Formik>
            </div>
        </Container>
    );
};

export default SignUp;