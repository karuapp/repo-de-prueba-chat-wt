import React, { useState, useEffect, useContext } from "react";

import * as Yup from "yup";
import {
    Formik,
    Form,
    Field,
    FieldArray
} from "formik";
import { toast } from "react-toastify";

import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";

import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";

import { makeStyles } from "@material-ui/core/styles";

import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import { green } from "@material-ui/core/colors";

import { i18n } from "../../translate/i18n";
import { head } from "lodash";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    multFieldLine: {
        display: "flex",
        "& > *:not(:last-child)": {
            marginRight: theme.spacing(1),
        },
    },
    textField: {
        marginRight: theme.spacing(1),
        flex: 1,
    },

    extraAttr: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },

    btnWrapper: {
        position: "relative",
    },

    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    colorAdorment: {
        width: 20,
        height: 20,
    },
}));

const RatingSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, "nome muito curto")
        .required("Obrigatório"),
    message: Yup.string()
        .required("Obrigatório")
});

const RatingModal = ({ open, onClose, ratingId, reload }) => {
    const classes = useStyles();
    const { user } = useContext(AuthContext);

    const initialState = {
        name: "",
        message: "",
        geral: ""
    };

    const [rating, setRating] = useState(initialState);

    //console.log(rating);

    useEffect(() => {
        try {
            (async () => {
                if (!ratingId) return;

                const { data } = await api.get(`/ratings/${ratingId}`);
                setRating(prevState => {
                    return { ...prevState, ...data };
                
                // console.log(data);
                
                });
            })()
        } catch (err) {
            toastError(err);
        }
    }, [ratingId, open]);

    const handleClose = () => {
        setRating(initialState);
        onClose();
    };

    const handleSaveRating = async (values) => {
        const ratingData = { ...values, userId: user.id };
        try {
            if (ratingId) {
                await api.put(`/ratings/${ratingId}`, ratingData);
            } else {
                await api.post("/ratings", ratingData);
            }
            toast.success(i18n.t("ratingModal.success"));
            if (typeof reload == 'function') {
                reload();
            }
        } catch (err) {
            toastError(err);
        }
        handleClose();
    };

    return (
        <div className={classes.root}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="xs"
                fullWidth
                scroll="paper">
                <DialogTitle id="form-dialog-title">
                    {(ratingId ? `${i18n.t("ratingModal.title.edit")}` : `${i18n.t("ratingModal.title.add")}`)}
                </DialogTitle>
                <Formik
                    initialValues={rating}
                    enableReinitialize={true}
                    validationSchema={RatingSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSaveRating(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values }) => (
                        <Form>
                            <DialogContent dividers>
                              <Grid spacing={2} container>
                  				<Grid xs={12} item>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("ratingModal.form.name")}
                                        name="name"
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                    />
                                </Grid>
                  				<Grid xs={12} item>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("ratingModal.form.message")}
                                        type="message"
                                        multiline
                                        minRows={5}
                                        fullWidth
                                        name="message"
                                        error={
                                            touched.message && Boolean(errors.message)
                                        }
                                        helperText={
                                            touched.message && errors.message
                                        }
                                        variant="outlined"
                                        margin="dense"
                                    />
                                    </Grid>
				  <Grid xs={12} item>
                    <FormControl variant="outlined" margin="dense" fullWidth>
                      <InputLabel id="geral-selection-label">
                        {i18n.t("ratingModal.form.geral")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("ratingModal.form.geral")}
                        placeholder={i18n.t("ratingModal.form.geral")}
                        labelId="geral-selection-label"
                        id="geral"
                        name="geral"
                        required
                        error={touched.geral && Boolean(errors.geral)}
                      >
                        <MenuItem value={true}>Ativo</MenuItem>
                        <MenuItem value={false}>Inativo</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} item>
                                <Typography
                                    style={{ marginBottom: 8, marginTop: 12 }}
                                    variant="subtitle1"
                                >
                                    {i18n.t("ratingModal.form.options")}
                                </Typography>
                                </Grid>
                                <Grid xs={12} item>
                                <FieldArray name="options">
                                    {({ push, remove }) => (
                                        <>
                                            {values.options &&
                                                values.options.length > 0 &&
                                                values.options.map((info, index) => (
                                                    <div
                                                        className={classes.extraAttr}
                                                        key={`${index}-info`}
                                                    >
                                                        <Field
                                                            as={TextField}
                                                            label={i18n.t("ratingModal.form.extraValue")}
                                                            name={`options[${index}].value`}
                                                            variant="outlined"
                                                            margin="dense"
                                                            className={classes.textField}
                                                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                                            type="number"
                                                        />
                                                        <Field
                                                            as={TextField}
                                                            label={i18n.t("ratingModal.form.extraName")}
                                                            name={`options[${index}].name`}
                                                            variant="outlined"
                                                            margin="dense"
                                                            className={classes.textField}
                                                        />
                                                        
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => remove(index)}
                                                        >
                                                            <DeleteOutlineIcon />
                                                        </IconButton>
                                                    </div>
                                                ))}
                                            <div className={classes.extraAttr}>
                                                <Button
                                                    style={{ flex: 1, marginTop: 8 }}
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => push({ name: "", value: "" })}
                                                >
                                                    {`+ ${i18n.t("ratingModal.buttons.options")}`}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </FieldArray>
                                </Grid>
                              </Grid>   
                              
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isSubmitting}
                                    variant="outlined"
                                >
                                    {i18n.t("ratingModal.buttons.cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                    variant="contained"
                                    className={classes.btnWrapper}
                                >
                                    {ratingId
                                        ? `${i18n.t("ratingModal.buttons.okEdit")}`
                                        : `${i18n.t("ratingModal.buttons.okAdd")}`}
                                    {isSubmitting && (
                                        <CircularProgress
                                            size={24}
                                            className={classes.buttonProgress}
                                        />
                                    )}
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};

export default RatingModal;