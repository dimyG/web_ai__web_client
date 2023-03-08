import React, {useEffect} from 'react';
import {Box, Card, CardContent, Grid, GridListTile, makeStyles} from '@material-ui/core';
import {useSelector} from "react-redux";
import {imagesSelector} from "../imagesSlice";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({}));

const GeneratedImage = ({img_src, id}) => {
  return (
    <div className="generated-images__image">
      <img
        id={id}
        src={img_src}
        alt="Generated Image"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}


const ImageGrid = () => {
  const classes = useStyles();
  let images = useSelector(state => imagesSelector(state))

  // useEffect(() => {}, [images])

  const renderedImages = [];

  for (let i = images.length - 1; i >= 0; i--) {
    // render the images in reverse order so that the newest image is on top
    const image = images[i];
    const renderedImage = (
      <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
        {image.img_src
          ? <GeneratedImage img_src={image.img_src} id={image.id} />
          : <Grid container justify="center" alignItems="center" style={{ height: '100%' }}><CircularProgress /></Grid>
        }
      </Grid>
    );
    renderedImages.push(renderedImage);
  }

  return (
    <Box mt={3}>
      <Card id={'imageGrid-card'}>
        <CardContent className={classes.cardContent}>
          <Grid container spacing={2}>
            {renderedImages}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImageGrid;
