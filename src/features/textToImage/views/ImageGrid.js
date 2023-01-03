import React from 'react';
import { Grid, GridListTile } from '@material-ui/core';

const GeneratedImage = ({img_src}) => {
  return (
    <div className="generated-images__image">
      <img
        src={img_src}
        alt="Generated Image"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}


const ImageGrid = () => {
    let images = [
      { img_src: "static/images/A_picture_from_a_japanese_manga_style_comic__showing_a_squirrel_standing_on_kung_fu_pose.png"},
      { img_src: "static/images/A_picture_from_a_japanese_manga_style_comic__showing_a_squirrel_standing_on_kung_fu_pose.png"},
      { img_src: "static/images/A_picture_from_a_japanese_manga_style_comic__showing_a_squirrel_standing_on_kung_fu_pose.png"},
      { img_src: "static/images/A_picture_from_a_japanese_manga_style_comic__showing_a_squirrel_standing_on_kung_fu_pose.png"},
    ]

    return (
      <Grid container spacing={2}>
        {images.map((image) => (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <GeneratedImage img_src={image.img_src} />
          </Grid>
        ))}
      </Grid>
    )
};

export default ImageGrid;
