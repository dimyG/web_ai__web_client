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
  IconButton, Accordion, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Select, MenuItem,
} from '@material-ui/core';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
import axios from "axios";
import urls from 'src/urls';
import store from "../../../store";
import {messagesSlice} from 'src/features/Messages/messagesSlice';
import {imagesSlice} from "../imagesSlice";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {model_options} from "../text2img_models";

const ai_tools_urls = urls.ai_tools;
const text_to_image_url = ai_tools_urls.text_to_img;
const runpod_run_url = ai_tools_urls.runpod_run;
const runpod_status_url = ai_tools_urls.runpod_status;
const runpod_api_key = process.env.REACT_APP_RUNPOD_API_KEY;

// text_to_image_url = 'http://127.0.0.1:8002/' + 'generate_image/'

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

const txt2img_internal = async (url, values) => {
  return await axios.post(url, null, {
    params: {prompt: values.text},
    responseType: "arraybuffer",  // Axios will parse the response as an ArrayBuffer, a low-level representation of binary data in JavaScript
  });
}

const pre_inference_api = async (data, url = text_to_image_url) => {
  // let post_data = data['input']
  return await axios.post(url, null, {
    params: data,
    responseType: "arraybuffer",  // Axios will parse the response as an ArrayBuffer, a low-level representation of binary data in JavaScript
  });
}

async function runpodStatusOutput(id, num_errors=0, status_url=runpod_status_url, runpod_key=runpod_api_key, delay=1500) {
  // in progress run_response:
  // {
  //     "delayTime": 2624,
  //     "id": "c80ffee4-f315-4e25-a146-0f3d98cf024b",
  //     "input": {
  //         "prompt": "a cute magical flying dog, fantasy art drawn by disney concept artists"
  //     },
  //     "status": "IN_PROGRESS"
  // }
  // completed run_response:
  // {
  //   "delayTime": 123456, // (milliseconds) time in queue
  //   "executionTime": 1234, // (milliseconds) time it took to complete the job
  //   "gpu": "24", // gpu type used to run the job
  //   "id": "c80ffee4-f315-4e25-a146-0f3d98cf024b",
  //   "input": {
  //     "prompt": "a cute magical flying dog, fantasy art drawn by disney concept artists"
  //   },
  //   "output": [
  //     {
  //       "image": "https://job.results1",
  //       "seed": 1
  //     },
  //     {
  //       "image": "https://job.results2",
  //       "seed": 2
  //     }
  //   ],
  //   "status": "COMPLETED"
  // }
  const num_retries_on_500 = 2;
  try {
    while (true) {

      const status_response = await axios.get(status_url + id, {
        responseType: "json",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${runpod_key}`
        }
      });

      let http_status = status_response.status;
      console.log(`http status: ${http_status}, status_url response: ${status_response}`);

      let response_500_num = 0;

      if (http_status === 500 && response_500_num < 3) {
        console.log(`http_status: ${http_status}, response_500_num: ${response_500_num}, error response: ${status_response}`)
        response_500_num += 1;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      else if (http_status === 200) {
        console.log(`http_status: ${http_status}, response: ${status_response}`)
        const status = status_response.data.status;
        if (status === "IN_PROGRESS") {
          console.log("IN_PROGRESS");
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (status === "IN_QUEUE") {
          console.log("IN_QUEUE");
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (status === "COMPLETED") {
          console.log("COMPLETED");
          return status_response.data.output;
        } else if (status === "FAILED") {
          console.log("FAILED");
          return null;
        } else {
          console.log(`http_status: ${http_status}, unexpected response: ${status_response}`);
          return null;
        }

      } else {
        console.log(`unexpected http status: ${http_status}, unexpected response: ${status_response}`);
        return null;
      }

    }
  }
  catch (e) {
    console.error(`Unexcpected error: ${e}`);
    // in some cases runpod status returns 500 error, but the job is actually completed. So we retry a few times
    if (num_errors < num_retries_on_500) {
      num_errors += 1;
      return await runpodStatusOutput(id, num_errors);
    } else {
      console.error(`Too many errors: ${num_errors}`);
      return null;
    }
  }
}

const txt2img_runpod = async (
  input_data,
  run_url = runpod_run_url,
  runpod_key = runpod_api_key
) => {

  const run_response = await axios.post(run_url, input_data, {
    responseType: "json",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${runpod_key}`
    }
  });
  // run_response:
  // {
  //     "id": "c80ffee4-f315-4e25-a146-0f3d98cf024b",
  //     "status": "IN_QUEUE"
  // }

  console.log("run_url response:", run_response);
  const run_id = run_response.data.id;
  // const run_status = run_response.data.status;
  const output = await runpodStatusOutput(run_id);
  console.log("status_url response:", output);

  return output;
}

const Prompt = ({ className, ...rest }) => {
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();

  const [expanded, setExpanded] = React.useState(false);
  const handlePanelChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const img_size_options = [
    {value: 256, label: '256'},
    {value: 512, label: '512'},
    {value: 768, label: '768'},
    {value: 1024, label: '1024'},
  ]

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
      onSubmit={async (values, {
        setErrors,
        setStatus,
        setSubmitting
      }) => {

        try {
          // const response = await axios.post(text_to_image_url, null, {
          //   params: {prompt: values.text},
          //   responseType: "arraybuffer",  // Axios will parse the response as an ArrayBuffer, a low-level representation of binary data in JavaScript
          // });

          let runpod_run_input_data = {
            'input': {
              'prompt': values.text,
              'model': values.model,
              'seed': values.seed,
              'height': values.height,
              'width': values.width,
              'guidance_scale': values.guidance_scale,
              'num_inference_steps': values.num_inference_steps
            }
          }

          // console.log("runpod_run_input_data:", runpod_run_input_data)

          const arraybufferResponse = await pre_inference_api(runpod_run_input_data['input']);
          // const base64ImageString = await txt2img_runpod(runpod_run_input_data);

          // const base64ImageString = await runpodStatusOutput('47052042-822a-4644-ad4a-e303a4a74383');  //8966803d-bf3f-438b-994d-5689bfc3e591 88344ebb-2a58-41f1-b551-77201a689d6e 47052042-822a-4644-ad4a-e303a4a74383
          // const base64ImageString = 'debug'

          // const arraybufferResponse = await txt2img_runpod(runpod_run_input_data);  // responseType should be arraybuffer
          // convert the ArrayBuffer to a base64 encoded string

          let base64ImageString = Buffer.from(arraybufferResponse.data, 'binary').toString('base64')

          // From the base64 string, create a "data URL" that can be used as the src attribute of an image.
          // A data URL is a URL scheme that allows for the inclusion of small data items as "immediate" data,
          // as if they were being referenced externally. The format of a data URL is data:[<media type>][;base64],<data>
          // data URLs have a limited size (2-3 MB)
          let img_src = "data:image/png;base64,"+base64ImageString

          let img_store_obj = {prompt: values.text, img_src: img_src}
          store.dispatch(imagesSlice.actions.addImage(img_store_obj))
          // store.dispatch(messagesSlice.actions.addMessage({text: response.data.prompt, mode: "success", seen: false}))

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
      }}
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
            <ExpansionPanel expanded={expanded === 'panel1'} onChange={handlePanelChange('panel1')}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
                <Typography className={classes.heading}>Settings</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
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
              </ExpansionPanelDetails>
            </ExpansionPanel>
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
