import React, {useEffect} from 'react';
import { Grid, GridListTile } from '@material-ui/core';
import {useSelector} from "react-redux";
import {imagesSelector} from "../imagesSlice";

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
  let images = useSelector(state => imagesSelector(state))

  // useEffect(() => {}, [images])

  return (
    <Grid container spacing={2}>
      {images.map((image) => (
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <GeneratedImage img_src={image.img_src} id={image.id}/>
        </Grid>
      ))}
    </Grid>
  )
};

export default ImageGrid;
