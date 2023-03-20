import Page from "src/components/Page";
import {
  Box,
  Container,
  Grid,
  makeStyles,
  Card,
  CardContent,
  Typography,
  Divider,
  Link,
  CardHeader
} from "@material-ui/core";
import React, {useEffect} from "react";
// import {Link as RouterLink} from "react-router-dom";
// import Logo from "src/components/Logo";
import TextToImageForm from "./TextToImageForm";
import ImageGrid from "./ImageGrid";
import {useSelector} from "react-redux";
import {imagesSelector, imagesSlice} from "../imagesSlice";
import {useDispatch} from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

const TextToImagePage = () => {
  const classes = useStyles()
  const dispatch = useDispatch();
  let images = useSelector(state => imagesSelector(state))

  // create an effect to run on first mount
  useEffect(() => {
    if (images.length > 0) {
      return
    }
    const renderInitialImages = () => {
      const prompt_01 = 'a stunning, beatiful woman, mia manara, bar lighting serving coffee, highly detailed, digital ' +
        'painting, artstation, concept art, sharp focus, cinematic lighting illustration, artgerm, greg rutkowski, ' +
        'alphonse mucha, cgsociety, octane render, unreal engine 5'
      const prompt_02 = 'Beautiful painting of John Barrymore style Tamara de Lempicka, Thomas Hart Benton, Norman Rockwell, Botticelli,William Morris, close up portrait photo by Annie Leibovitz, film, studio lighting, detailed skin, ultra realistic, bokeh, sharp features'
      const prompt_03 = "gorgeous, very cute  steampunk  playboy princess  beautiful body, highly detailed, octane render, Purity, symmetrical, soft lighting, detailed face, concept art, digital painting, looking into camera, sf, intricate artwork masterpiece, ominous, matte painting movie poster, golden ratio, trending on cgsociety, intricate, epic, trending on artstation, by artgerm, h. r. giger and beksinski, highly detailed, vibrant, " +
      "production cinematic character render, ultra high quality model, unreal engine, greg rutkowski, loish, " +
      "rhads, beeple, makoto shinkai and lois van baarle, ilya kuvshinov, rossdraws, tom bagshaw, alphonse mucha, " +
      "global illumination, detailed and intricate environment, unreal engine, greg rutkowski, loish, rhads, " +
      "beeple, makoto shinkai and lois van baarle, ilya kuvshinov, rossdraws, tom bagshaw, alphonse mucha, " +
      "global illumination, detailed and intricate environment, unreal engine, greg rutkowski, loish, rhads, " +
      "beeple, makoto shinkai and lois van baarle, ilya kuvshinov, rossdraws, tom bagshaw, alphonse mucha, " +
      "global illumination, detailed and intricate environment, unreal engine, greg rutkowski, loish, rhads, " +
      "beeple, makoto shinkai and lois van baarle, ilya kuvshinov, rossdraws, tom bagshaw, alphonse mucha, " +
      "global illumination, detailed and intricate environment, unreal engine, greg rutkowski, loish, rhads, " +
      "beeple, makoto shinkai and lois van baarle, ilya kuvshinov, rossdraws, tom bagshaw, alphonse mucha, " +
      "global illumination, detailed and intricate environment, cinematic, 4k, epic Steven Spielberg movie " +
      "still, sharp focus, emitting diodes, smoke, artillery, sparks, racks, system unit, motherboard, " +
      "by pascal blanche rutkowski repin artstation hyperrealism painting concept art of detailed character " +
      "design matte painting, 4 k resolution blade runner, cinematic, 4k, epic Steven Spielberg movie still, " +
      "sharp focus, emitting diodes, smoke, artillery, sparks, racks, system unit, motherboard, by pascal blanche " +
      "rutkowski repin artstation hyperrealism painting concept art of detailed character design matte painting 4 k resolution blade runner"
      const prompt_merlin = 'Merlin, old and wise, powerful wizard, intense glowing eyes, magical, epic, chiaroscuro, acrylic painting by Edwin Long and Carne Griffiths, trending on ArtStation, trending on CGSociety, dramatic lighting, 16k'
      const prompt_strybk = 'strybk, AK, No one image will be the same. closeup of face beautiful body, looking at the camera, scifi, futuristic, utopian, body parts, highly detailed, octane render, cinematic, ayami kojima, karol bak, greg hildebrandt, and mark brooks, hauntingly surreal, gothic, highly detailed and intricate, rich deep colors., sf, intricate artwork masterpiece, ominous, matte painting movie poster, golden ratio, trending on cgsociety, intricate, epic, trending on artstation, by artgerm, h. r. giger and beksinski, sf, intricate artwork masterpiece, sf, intricate artwork masterpiece, ominous, matte painting movie poster, golden ratio, trending on cgsociety, intricate, epic, trending on artstation, by artgerm, highly detailed, vibrant, production cinematic character render, ultra high quality model, perfect composition, beautiful detailed intricate insanely detailed octane render trending on artstation, 8 k artistic photography, photorealistic concept art, soft natural volumetric cinematic perfect light, chiaroscuro, award - winning photograph, masterpiece, oil on canvas, raphael, caravaggio, greg rutkowski, beeple, beksinski, giger, kids story book style, muted colors, watercolor style'
      const prompt_lushil = 'lushill style, incredibly detailed, 4k resolution, Stanley Lau Artgerm, WLOP, muccia and rockwell'
      const prompt_olp = 'olpntng style, line art, watercolor wash, portrait of a nordic elf paladin with braided blue hair, defender of Gridania, 4k resolution, carl larsson and brian froud and alphonse mucha style, perfect composition, detailed background, 60-30-10 color rule, oil painting, heavy strokes, paint dripping'

      const image_model = {
        id: null,
        img_src: null,
        settings: {
          prompt: null, model: null, seed: null, width: 512, height: 768, guidance_scale: 7.5, num_inference_steps: 50
        }
      }

      const settings1 = { ...image_model.settings, prompt: prompt_01, model: 'CompVis/stable-diffusion-v1-4', seed: 816 }
      const settings2 = { ...image_model.settings, prompt: prompt_01, model: 'stabilityai/stable-diffusion-2-1', seed: 9201 }
      const settings3 = { ...image_model.settings, prompt: prompt_03, model: 'stabilityai/stable-diffusion-2-1', seed: 6767 }
      const settings4 = { ...image_model.settings, prompt: prompt_03, model: 'CompVis/stable-diffusion-v1-4', seed: 1703 }
      const settings5 = { ...image_model.settings, prompt: prompt_02, model: 'stabilityai/stable-diffusion-2-1', seed: 7028 }
      const settings6 = { ...image_model.settings, prompt: prompt_02, model: 'CompVis/stable-diffusion-v1-4', seed: 473 }
      const settings7 = { ...image_model.settings, prompt: prompt_merlin, model: 'stabilityai/stable-diffusion-2-1', seed: 4795 }
      const settings8 = { ...image_model.settings, prompt: prompt_merlin, model: 'stabilityai/stable-diffusion-2-1', seed: 4943 }
      const settings9 = { ...image_model.settings, prompt: prompt_strybk, model: 'stabilityai/stable-diffusion-2-1', seed: 7578 }
      const settings10 = { ...image_model.settings, prompt: prompt_strybk, model: 'stabilityai/stable-diffusion-2-1', seed: 5435 }
      const settings11 = { ...image_model.settings, prompt: prompt_lushil, model: 'stabilityai/stable-diffusion-2-1', seed: 7022 }
      const settings12 = { ...image_model.settings, prompt: prompt_olp, model: 'stabilityai/stable-diffusion-2-1', seed: 2344 }

      const initialImages = [
        {...image_model, id: 2, img_src: '/static/showcase_images/jini02.png', settings: settings1},
        {...image_model, id: 1, img_src: '/static/showcase_images/jini01.png', settings: settings2},
        {...image_model, id: 6, img_src: '/static/showcase_images/jini06.png', settings: settings3},
        {...image_model, id: 5, img_src: '/static/showcase_images/jini05.png', settings: settings4},
        {...image_model, id: 3, img_src: '/static/showcase_images/jini03.png', settings: settings5},
        {...image_model, id: 4, img_src: '/static/showcase_images/jini04b.png', settings: settings6},
        {...image_model, id: 7, img_src: '/static/showcase_images/jini07.png', settings: settings7},
        {...image_model, id: 15, img_src: '/static/showcase_images/jini15.png', settings: settings8},
        {...image_model, id: 8, img_src: '/static/showcase_images/jini08.png', settings: settings9},
        {...image_model, id: 9, img_src: '/static/showcase_images/jini09.png', settings: settings10},
        {...image_model, id: 10, img_src: '/static/showcase_images/jini10.png', settings: settings11},
        {...image_model, id: 11, img_src: '/static/showcase_images/jini11.png', settings: settings12},
        // {...image_model, id: 12, img_src: '/static/showcase_images/jini12.png', prompt: prompt_olp, model: 'stabilityai/stable-diffusion-2-1', seed: 5779},
      ]

      // iterate over initialImages in reverse order so that the first image is the first in the list
      for (let i = initialImages.length - 1; i >= 0; i--) {
        const img = initialImages[i]
        dispatch(imagesSlice.actions.addImage(img))
      }
    }
    renderInitialImages()
  }, [])

  return (
    <Page
      className={classes.root}
      title="Jinifai"
    >
      <Container maxWidth={false}>
        <TextToImageForm />
        {images.length === 0 ? null : (
          <ImageGrid />
        )}
      </Container>
    </Page>
  )
}

export default TextToImagePage
