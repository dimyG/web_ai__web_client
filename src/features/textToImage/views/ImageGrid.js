import React, {useEffect, useState} from 'react';
import {Box, Card, CardContent, Grid, GridListTile, makeStyles} from '@material-ui/core';
import {useSelector, useDispatch} from "react-redux";
import {imagesSelector, imagesSlice} from "../imagesSlice";
import CircularProgress from "@material-ui/core/CircularProgress";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  clickedImage: {
    // boxShadow: '0 0 8px rgba(0,0,0,0.4)', // add a box shadow
    border: `2px solid ${theme.palette.primary.main}`, // add a border
    transform: 'scale(1.02)', // scale up the image
    filter: 'brightness(1.1) saturate(1.1)', // add a tint
    boxShadow: 'inset 0 0 20px 10px rgba(159, 68, 255, 0.5)', // add a purple glow effect
  },
  hoveredImage: {
    filter: 'brightness(1.1) saturate(1.1)', // add a tint
  }
}));

const GeneratedImage = ({img_src, id, className, onClick, onHover}) => {
  return (
    <div className={`generated-images__image`}>
      <img
        id={id}
        src={img_src}
        alt="Generated Image"
        style={{ maxWidth: '100%', height: 'auto' }}
        onClick={onClick}
        onMouseEnter={onHover}
        className={className}
      />
    </div>
  );
}


const ImageGrid = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  let images = useSelector(state => imagesSelector(state))
  const [clickedImageId, setClickedImageId] = useState(null);
  const [hoveredImageId, setHoveredImageId] = useState(null);

  // useEffect(() => {}, [images])

  const handleImageClick = (image) => {
    if (clickedImageId === image.id) {
      // if the image is already clicked, then unclick it
      setClickedImageId(null)
      return
    }
    setClickedImageId(image.id)
    dispatch(imagesSlice.actions.updateText2ImgSettings({prompt: image.settings.prompt, seed: image.settings.seed, model: image.settings.model,
      width: image.settings.width, height: image.settings.height, guidance_scale: image.settings.guidance_scale, num_inference_steps: image.settings.num_inference_steps}))
  }

  const handleImageHover = (image) => {
    setHoveredImageId(image.id)
  }

  const renderedImages = [];

  for (let i = images.length - 1; i >= 0; i--) {
    // render the images in reverse order so that the newest image is on top
    const image = images[i];
    const renderedImage = (
      <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
        {image.img_src
          ? <GeneratedImage
            img_src={image.img_src}
            id={image.id}
            className={clsx(clickedImageId === image.id ? classes.clickedImage : "", hoveredImageId === image.id ? classes.hoveredImage : "")}
            onClick={() => handleImageClick(image)}
            onHover={() => handleImageHover(image)}
          />
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
