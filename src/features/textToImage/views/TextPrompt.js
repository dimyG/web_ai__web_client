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
  makeStyles, Typography
} from '@material-ui/core';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
import axios from "axios";
import urls from 'src/urls';

const ai_tools_urls = urls.ai_tools;
const text_to_image_url = ai_tools_urls.text_to_img;

const useStyles = makeStyles((theme) => ({
  root: {},
  button: {
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(1),
    },
    whiteSpace: "nowrap",
    marginTop: theme.spacing(1),
  }
}));

const Prompt = ({ className, ...rest }) => {
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();

  return (
    <Formik
      initialValues={{
        text: 'A picture from a japanese manga style comic, showing a squirrel standing on kung fu pose',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        text: Yup.string().max(3500).required('Give me an image description!'),
      })}
      onSubmit={async (values, {
        setErrors,
        setStatus,
        setSubmitting
      }) => {
        try {
          await axios.post(text_to_image_url, {text: values.text});

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
        <form
          noValidate
          onSubmit={handleSubmit}
          className={clsx(classes.root, className)}
          {...rest}
        >
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
        </form>
      )}
    </Formik>
  );
};

Prompt.propTypes = {
  className: PropTypes.string,
};

export default Prompt;
