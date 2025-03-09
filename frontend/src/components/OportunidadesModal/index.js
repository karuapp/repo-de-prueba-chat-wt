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
        .required("Obrigatório")
});

const RatingModal = ({ open, onClose, ticketIform, ticketIdLead, ticket, ratingId, reload }) => {
    const classes = useStyles();

    const initialState = {
        name: "",
        funil: "",
        etapadofunil: "",
        ticketInfo:ticketIform,
        tagId : 0,
        fonte: "",
        userId: "",
        campanha: "",
        datadeida: "",
        datadevolta: "",
        origem: "",
        destino: "",
        valor: "",
        produto: ""

    };


    const { user } = useContext(AuthContext);
    const [rating, setRating] = useState(initialState);
    const [tagLists, setTagLists] = useState([]);
    const companyId = user?.companyId


    useEffect(() => {
        try {
            (async () => {
                if (!ticket) return;
                if (ticket?.oportunidadeId === null) return;


                const { data } = await api.get(`/oportunidade/${ticket.oportunidadeId}`);
                setRating(prevState => {
                    return { ...prevState, ...data };
                });
            })()
        } catch (err) {
            toastError(err);
        }
    }, [open]);

    
    useEffect(() => {
        api.get(`/tags`, { params: { companyId } })
            .then(({ data }) => {
                const fetchedTags = data.tags;
                // Perform any necessary data transformation here
                const formattedTagLists = fetchedTags.filter(tag => tag.kanban === 1).map(tag => ({
                    id: tag.id,
                    name: tag.name
                }));

                setTagLists(formattedTagLists);
            })
            .catch((error) => {
                console.error("Error retrieving tags:", error);
            });
    }, [open])

    const handleClose = () => {
        setRating(initialState);
        onClose();
    };


    const IsNil = (value) => value === undefined || value === null

    const handleSaveOportunidades = async (values) => {
        const oportunidadeData = { ...values, userId: user.id };
        try {
          const endpoint = !IsNil(ticket?.oportunidadeId)
            ? `/oportunidade/${rating?.id}`
            : "/oportunidade";
          const { data } = !IsNil(ticket?.oportunidadeId)
            ? await api.put(endpoint, oportunidadeData)
            : await api.post(endpoint, oportunidadeData);
          if (data?.id) {
            if (!rating?.id) {
              ticket.oportunidadeId = data?.id;
              await api.put(`/tickets/${ticketIdLead}`, ticket);
            }
            await api.put(`/ticket-tags/${ticketIdLead}/${values.tagId}`);
          }
          toast.success(i18n.t("ratingModal.success"));
          if (typeof reload === "function") {
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
                    {(ratingId ? `Editar Oportunidade` : `Adicionar Oportunidade`)}
                </DialogTitle>
                <Formik
                    initialValues={rating}
                    enableReinitialize={true}
                    validationSchema={RatingSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSaveOportunidades(values);
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
                                            label="Nome da Oportunidade"
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
                                            label="Nome Lead"
                                            name="ticketInfo"
                                            variant="outlined"
                                            margin="dense"
                                            value={ticketIform}
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label="Id do ticket"
                                            name="ticketId"
                                            variant="outlined"
                                            margin="dense"
                                            value={ticketIdLead}
                                            fullWidth
                                        />
                                    </Grid>

                                    {/* <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label="Id do Cliente"
                                            name="userId"
                                            error={touched.userId && Boolean(errors.userId)}
                                            helperText={touched.userId && errors.userId}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                    </Grid> */}

                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label="Funil"
                                            name="funil"
                                            error={touched.funil && Boolean(errors.funil)}
                                            helperText={touched.funil && errors.funil}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid xs={12} item>
                                        <FormControl
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        >
                                            <InputLabel id="tagList-selection-label">
                                                {i18n.t("campaigns.dialog.form.tagList")}
                                            </InputLabel>
                                            <Field
                                                as={Select}
                                                label={i18n.t("campaigns.dialog.form.tagList")}
                                                placeholder={i18n.t("campaigns.dialog.form.tagList")}
                                                labelId="tagList-selection-label"
                                                id="tagId"
                                                name="tagId"
                                                error={touched.tagId && Boolean(errors.tagId)}
                                            >
                                                <MenuItem value="">Nenhuma</MenuItem>
                                                {Array.isArray(tagLists) &&
                                                    tagLists.map((tagList) => (
                                                        <MenuItem key={tagList.id} value={tagList.id}>
                                                            {tagList.name}
                                                        </MenuItem>
                                                    ))}
                                            </Field>
                                        </FormControl>
                                    </Grid>
                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label="Etapa do Funil"
                                            name="etapadofunil"
                                            error={touched.etapadofunil && Boolean(errors.etapadofunil)}
                                            helperText={touched.etapadofunil && errors.etapadofunil}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label="Fonte"
                                            name="fonte"
                                            error={touched.fonte && Boolean(errors.fonte)}
                                            helperText={touched.fonte && errors.fonte}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label="Campanha (Ação de Marketing/Venda)"
                                            name="campanha"
                                            error={touched.campanha && Boolean(errors.campanha)}
                                            helperText={touched.campanha && errors.campanha}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label="Data de Ida"
                                            name="datadeida"
                                            error={touched.datadeida && Boolean(errors.datadeida)}
                                            helperText={touched.datadeida && errors.datadeida}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label="Data de Volta"
                                            name="datadevolta"
                                            error={touched.datadevolta && Boolean(errors.datadevolta)}
                                            helperText={touched.datadevolta && errors.datadevolta}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label="Origem"
                                            name="origem"
                                            error={touched.origem && Boolean(errors.origem)}
                                            helperText={touched.origem && errors.origem}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label="Destino"
                                            name="destino"
                                            error={touched.destino && Boolean(errors.destino)}
                                            helperText={touched.destino && errors.destino}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label="Valor"
                                            name="valor"
                                            error={touched.valor && Boolean(errors.valor)}
                                            helperText={touched.valor && errors.valor}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label="Produto"
                                            name="produto"
                                            error={touched.produto && Boolean(errors.produto)}
                                            helperText={touched.produto && errors.produto}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
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