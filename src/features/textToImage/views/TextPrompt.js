import React from 'react';
import clsx from 'clsx';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import {
  Grid,
  Box,
  Button,
  FormHelperText,
  TextField,
  makeStyles,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton, Accordion, AccordionSummary, AccordionDetails
} from '@material-ui/core';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
// import axios from "axios";
import {AxiosInstance2 as axios} from 'src/utils/axios';
import urls from 'src/urls';
import store from "src/store";
import {messagesSlice} from 'src/features/Messages/messagesSlice';
import {imagesSlice} from "../imagesSlice";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {model_options} from "../text2img_models";
import {RunpodClient} from "src/utils/runpod";

const ai_tools_urls = urls.ai_tools;
const initiate_run_url = ai_tools_urls.initiate_run;

const useStyles = makeStyles((theme) => ({
  root: {},
  button: {
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(1),
    },
    whiteSpace: "nowrap",
    marginTop: theme.spacing(1),
  },
  settings: {
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    }
  },
  // select: {
  //   '&:focus': {
  //     backgroundColor: theme.palette.background.paper,
  //   }
  // },
}));

const Prompt = ({ className, ...rest }) => {
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();

  const [expanded, setExpanded] = React.useState(false);

  const handlePanelChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const runpod_client = new RunpodClient();

  const img_size_options = [
    {value: 256, label: '256'},
    {value: 512, label: '512'},
    {value: 768, label: '768'},
    {value: 1024, label: '1024'},
  ]

  const poll_runpod_status = async (runpod_run_id, values) => {
    const delay = 2000;
    let run_status = null;
    let base64ImageString = null;
    while (run_status === null || run_status === 'IN_QUEUE' || run_status === 'IN_PROGRESS') {
      let res = await runpod_client.runpod_get_status(runpod_run_id);
      run_status = res[0];
      base64ImageString = res[1];

      if (run_status === 'COMPLETED') {
        // From the base64 string, create a "data URL" that can be used as the src attribute of an image.
        // A data URL is a URL scheme that allows for the inclusion of small data items as "immediate" data,
        // as if they were being referenced externally. The format of a data URL is data:[<media type>][;base64],<data>
        // data URLs have a limited size (2-3 MB)
        let img_src = "data:image/png;base64," + base64ImageString
        let img_store_obj = {prompt: values.text, img_src: img_src}
        store.dispatch(imagesSlice.actions.addImage(img_store_obj))
        // store.dispatch(messagesSlice.actions.addMessage({text: response.data.prompt, mode: "success", seen: false}))
        break
      }

      await new Promise(resolve => setTimeout(resolve, delay));

    }
    return [run_status, base64ImageString];
  }

  const on_submit = async (values, { setErrors, setStatus, setSubmitting }) => {
    // We send a post request to our pre inference service which initiates a run on runpod and returns the run id.
    // Then we poll the runpod status endpoint from the web client until the run is completed.
    // The run is initiated from the back end to pre-process the request (rate limit etc.)
    try {

      // let runpod_run_input_data = {
      //   'input': {
      //     'prompt': values.text,
      //     'model': values.model,
      //     'seed': values.seed,
      //     'height': values.height,
      //     'width': values.width,
      //     'guidance_scale': values.guidance_scale,
      //     'num_inference_steps': values.num_inference_steps
      //   }
      // }
      let run_data = {
        'prompt': values.text,
        'model': values.model,
        'seed': values.seed,
        'height': values.height,
        'width': values.width,
        'guidance_scale': values.guidance_scale,
        'num_inference_steps': values.num_inference_steps
      }

      const runpod_run_id = await runpod_initiate_run(run_data);

      if (runpod_run_id) {
        let [final_run_status, final_base64ImageString] = await poll_runpod_status(runpod_run_id, values);
      }

      if (isMountedRef.current) {
        setStatus({ success: true });
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      if (isMountedRef.current) {
        setStatus({ success: false });
        setErrors({ submit: err.message });
        setSubmitting(false);
      }
    }
  }

  async function runpod_initiate_run(input_data, run_url = initiate_run_url) {
    const config = {
      params: input_data,
      responseType: "json"
    }
    try{
      const run_response = await axios.post(run_url, null, config);
      console.debug("runpod run id:", run_response.data.run_id);
      return run_response.data.run_id;
    } catch (e) {
      console.error(`Error: ${e}`);
      store.dispatch(messagesSlice.actions.addMessage({text: e.error, mode: "error", seen: false}))
    }

  }

  return (
    <Formik
      initialValues={{
        text: 'a pinochio steampunk robot, bar lighting serving coffee and chips, highly detailed, digital painting, artstation, concept art, sharp focus, cinematic lighting, illustration, artgerm, greg rutkowski, alphonse mucha, cgsociety, octane render, unreal engine 5',
        model: model_options[0].value,
        seed: 1024,
        height: img_size_options[2].value,
        width: img_size_options[1].value,
        guidance_scale: 7.5,
        num_inference_steps: 50,
        submit: null
      }}
      validationSchema={Yup.object().shape({
        text: Yup.string().max(3500).required('Give me an image description!'),
        seed: Yup.number().integer().required('Seed is required'),
        height: Yup.number().integer().required('Height is required'),
        width: Yup.number().integer().required('Width is required'),
        guidance_scale: Yup.number().min(0).required('Guidance scale is required'),
        num_inference_steps: Yup.number().integer().min(1).max(200).required('Number of inference steps is required'),
      })}
      onSubmit={on_submit}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values
      }) => (
        <form noValidate onSubmit={handleSubmit} className={clsx(classes.root, className)} {...rest}>
          <Card id={'prompt-container'} >
            <CardContent >
              <Grid container direction="row" justify="space-between" alignItems="center">
                <Grid item xs={12} md={10}>
                <TextField
                  multiline
                  error={Boolean(touched.text && errors.text)}
                  fullWidth
                  helperText={touched.text && errors.text}
                  label="Text"
                  margin="normal"
                  name="text"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="text"
                  value={values.text}
                  variant="outlined"
              />
                {errors.submit && (
                  <Box mt={3}>
                    <FormHelperText error>
                      {errors.submit}
                    </FormHelperText>
                  </Box>
                )}
                </Grid>
                <Grid item xs={12} md={2}>
              <Box>
                <Button
                  className={classes.button}
                  fullWidth
                  color="secondary"
                  disabled={isSubmitting}
                  size="large"
                  type="submit"
                  variant="contained"
                >
                  <Typography variant={"h3"}>Generate images</Typography>
                </Button>
              </Box>
                </Grid>
              </Grid>
            </CardContent >
          </Card >

          <Box mt={3} id={'settings-container'}>
            <Accordion expanded={expanded === 'panel1'} onChange={handlePanelChange('panel1')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
                <Typography className={classes.heading}>Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container direction="row" justify="space-between" alignItems="center" collapse>
                  <Grid item className={classes.settings} xs={12} md={4} lg={4} >
                    <Typography variant="h3">
                    <TextField
                      select
                      SelectProps={{ native: true }}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ 'aria-label': 'model' }}
                      name="model"
                      label="Model"
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      error={Boolean(touched.model && errors.model)}
                      helperText={touched.model && errors.model}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.model}
                    >
                      {model_options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </TextField>
                      </Typography>
                  </Grid>
                  <Grid item className={classes.settings} xs={6} md={1}>
                  {/*  textfield for height input */}
                    <TextField
                      select
                      SelectProps={{ native: true }}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ 'aria-label': 'model' }}
                      error={Boolean(touched.height && errors.height)}
                      fullWidth
                      helperText={touched.height && errors.height}
                      label="Height"
                      margin="normal"
                      name="height"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="number"
                      value={values.height}
                      variant="outlined"
                    >
                      {img_size_options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item className={classes.settings} xs={6} md={1}>
                  {/*  textfield for width input */}
                    <TextField
                      select
                      SelectProps={{ native: true }}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ 'aria-label': 'model' }}
                      error={Boolean(touched.width && errors.width)}
                      fullWidth
                      helperText={touched.width && errors.width}
                      label="Width"
                      margin="normal"
                      name="width"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      type="number"
                      value={values.width}
                      variant="outlined"
                    >
                      {img_size_options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item className={classes.settings} xs={6} md={2}>
                    <TextField
                      // inputProps={{ type: 'number', pattern: "[0-9]*" }}
                      type="number"
                      error={Boolean(touched.seed && errors.seed)}
                      fullWidth
                      helperText={touched.seed && errors.seed}
                      label="Seed"
                      margin="normal"
                      name="seed"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.seed}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item className={classes.settings} xs={6} md={1}>
                  {/*  textfield for guidance scale input */}
                    <TextField
                      type="number"
                      error={Boolean(touched.guidance_scale && errors.guidance_scale)}
                      fullWidth
                      helperText={touched.guidance_scale && errors.guidance_scale}
                      label="Guidance"
                      margin="normal"
                      name="guidance_scale"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.guidance_scale}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item className={classes.settings} xs={6} md={1}>
                  {/*  textfield for num inference steps input */}
                    <TextField
                      type="number"
                      error={Boolean(touched.num_inference_steps && errors.num_inference_steps)}
                      fullWidth
                      helperText={touched.num_inference_steps && errors.num_inference_steps}
                      label="Steps"
                      margin="normal"
                      name="num_inference_steps"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.num_inference_steps}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>

        </form>
      )}
    </Formik>
  );
};

Prompt.propTypes = {
  className: PropTypes.string,
};

export default Prompt;
