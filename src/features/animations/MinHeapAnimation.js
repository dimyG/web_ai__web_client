import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3"
import {
  Box,
  Button,
  Card, CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  makeStyles,
  SvgIcon,
  TextField, Typography, Link
} from "@material-ui/core";
import {Play as PlayIcon, Pause as PauseIcon, FastForward as FastForwardIcon, RefreshCw as RefreshCwIcon} from "react-feather";
import Page from "../../components/Page";
import { useTheme } from "@material-ui/core/styles";
import _ from "lodash";
import {useSelector} from "react-redux";
import {nanoid} from "@reduxjs/toolkit";
import {algorithmByIdSelector, getAllStatusSelector} from "../algorithms/algorithmsSlice";
import BoxedCircularProgress from "../../components/BoxedCircularProgress";

class Queue {
  constructor(items = []) {
    this.items = items
  }
  enqueue = item => {
    return this.items.push(item)
  }
  dequeue = () => {
    return this.items.shift()
  }
  isEmpty = () => {
    return this.items.length === 0
  }
}

// The dataItems object has the items array as an attribute. The items array is composed of the non heap items followed
// by the heap items. The heap items are always the last items in the array.
// There is a fixed number of items in the items array. If the animation continues after the last item, a new random item
// is pushed in the first position of the items array and the last item is removed. This way the items array always has the same length.
// We keep track of the index of the item that is to be compared with the heap head. We store the animation frames for
// each step, in a frame queue attribute of the dataItems object.
class DataItems {
  constructor(items = [], frameQueue = new Queue(), heap = null) {
    this.items = items
    this.frameQueue = frameQueue
    this.heapHeadIndex = nonHeapItemsLength  // the initial heap head is the first item after the non heap items
    this.firstNonHeapItemIndex = 0
    this.lastNonHeapItemIndex = nonHeapItemsLength - 1
  }

  heapHead = () => this.items[this.heapHeadIndex]

  firstNonHeapItem = () => this.items[this.firstNonHeapItemIndex]

  lastNonHeapItem = () => this.items[this.lastNonHeapItemIndex]

  // O(h) space complexity, where h is the number of frames which is equal to the heap's height
  enqueueFrame = (frameData = this.items) => {
    // A frame is the array of items (items have new coordinates in each frame).
    // console.log("  enqueueing frame:", frameData)
    this.frameQueue.enqueue(_.cloneDeep(frameData))  // enqueued data should not change. They should not be references [...frameData] also works
  }

  swap = (index1, index2) => {
    // data is bound to the dom elements by the data id (using d3). This means that d3 will check an item by its data id.
    // if it's x and y coordinates are different it will change its position. To swap two elements, we swap their id and value
    // (keeping the elements in their initial index). d3 sees that these ids have now different x and y coordinates and moves them.
    // This way we also keep the order of the items array intact which means that we can find the heap items by their index [O(1)].
    // console.log("  swapping items:", index1, index2)
    if (index1 === -1 || index2 === -2) return
    let item1 = this.items[index1]
    let item2 = this.items[index2]
    this.items[index1] = {...item1, id: item2.id, value: item2.value}
    this.items[index2] = {...item2, id: item1.id, value: item1.value}
    this.enqueueFrame()
  }

  moveRight = (step = moveXStep) => {
    // move all non heap items to the right by changing their x coordinate
    // todo viewport: This is the slowest part of the animation. It's O(n). it can be improved by moving only the small subset
    // of items that are within the viewport making it a O(1) operation.
    this.items = this.items.map((item, index) => {
      if (!item.heapIndex) return {...item, x: item.x + step}
      return {...item}
    })
    this.enqueueFrame()
  }

  reheap = (itemIndex) => {
    // itemIndex: the index of the item that was just swapped inwards. We want to see if it needs to move further inwards.
    // console.log("re-heaping item:", itemIndex)
    const item = this.items[itemIndex]
    const kidsIndexes = this.kids(item.heapIndex)
    if (!kidsIndexes) return  // item has no kids
    const smallerKidIndex = kidsIndexes[0]
    if (this.items[smallerKidIndex].value > item.value) return  // item is smaller than its kids
    this.swap(itemIndex, smallerKidIndex)
    // "reheap" again starting from the swapped item that took the place of the child
    this.reheap(smallerKidIndex)
  }

  kids = (heapIndex) => {
    // returns the kids' indexes of the item with the given heapIndex sorted by value (heapIndex starts from 1)
    // it assumes that there are always two kids
    if (!heapIndex || heapIndex > heapSize/2) return null  // if item not in heap, or if it is a leaf, it has no kids
    const kid1HeapIndex = heapIndex * 2
    const kid2HeapIndex = heapIndex * 2 + 1
    const kid1Index = nonHeapItemsLength - 1 + kid1HeapIndex
    const kid2Index = nonHeapItemsLength - 1 + kid2HeapIndex
    const kid1 = this.items[kid1Index]
    const kid2 = this.items[kid2Index]
    if (kid1.value <= kid2.value) return [kid1Index, kid2Index]
    return [kid2Index, kid1Index]
  }

  isCompareItemNextToHeapHead = (index) => {
    if (index < 0) return false  // if all items have been compared
    // console.log("Items:", this.items)
    let heapHead = this.heapHead()
    let item = this.items[index]
    // console.log("isCompareItem index:", index, "compareItem:", item)
    return (!item.heapIndex && Math.abs(item.x - heapHead.x) < 1)
  }

  itemByCoords = (x, y) => {
    // get the first Item with the given coordinates
    return this.items.filter(item => item.x === x && item.y === y)[0]
  }

  parentIndex = heapIndex => Math.floor(Math.abs(heapIndex - 1) * 0.5)

  // The first non heap item moved pass the heap's head or the heap's head has already taken the max value
  isSearchComplete = () => {
    const heapHead = this.heapHead()
    return this.firstNonHeapItem().x > heapHead.x || heapHead.value === maxItemValue
  }

  pushNewNonHeapItem = () => {
    // insert new item in the start of the items array
    // console.log("pushing new non heap item")
    const firstNonHeapItemX = this.items[0].x - itemsXDistance
    const newNonHeapItem = {'id': nanoid(), 'x': firstNonHeapItemX, 'y': firstNonHeapItemY, 'value': generateRandomNumber(), 'heapIndex': null}
    this.items.splice(0, 0, newNonHeapItem)
  }

  popLastNonHeapItem = () => {
    // console.log("popping last non heap item")
    const indexToPop = this.lastNonHeapItemIndex + 1  // one item has been added to the start of the array previously, so the array has grown by 1
    this.items.splice(indexToPop, 1)
  }

  pushToAndPopFromItems = () => {
    // if first non heap item x >= viewBox start frame.push(new non heap item)
    if (this.firstNonHeapItem().x === viewBoxStartX - itemsXDistance) {
      // console.log("items:", this.items)
      this.pushNewNonHeapItem()
      // console.log("items after push:", this.items)
      this.popLastNonHeapItem()
      // console.log("items after pop:", this.items)
      // debugger
      return true
    }
  }

}

const svgViewBoxWidth = 100
const svgViewBoxHeight = 45
const heapHeadX = svgViewBoxWidth * 0.5
const heapHeadY = svgViewBoxHeight * 0.55
const circleRadius = svgViewBoxWidth * 0.05
const heapCircleRadius = circleRadius * 0.9
const circleTextSize = circleRadius * 0.8
const itemsXDistance = circleRadius * 2.5
const moveXStep = itemsXDistance
const heapItemsDistance = itemsXDistance * 0.7
const lastNonHeapItemX = heapHeadX - moveXStep
// const firstItemX = heapHeadX - moveXStep * nonHeapItemsLength  // so that the last item is one step before the heap head
const firstNonHeapItemY = heapHeadY + 2.1 * circleRadius
const viewBoxStartX = 0
// const viewBoxEndX = svgViewBoxWidth
const heapSize = 7
const nonHeapItemsInViewBox = Math.floor(svgViewBoxWidth / itemsXDistance) + 1
const nonHeapItemsInFrame = nonHeapItemsInViewBox + heapSize
const nonHeapItemsLength = nonHeapItemsInFrame
const maxItemValue = 100
const heapIndexStart = 1

// const generateRandomArray = (length, maxValue) => [...new Array(length)].map(() => Math.round(Math.random() * maxValue));
const generateRandomNumber = (maxValue = maxItemValue) => Math.round(Math.random() * maxItemValue);

let initialNonHeapItems = Array(nonHeapItemsLength).fill(0).map((item, index) => ({
  // the id is needed so that every item object is unique (and items.indexOf(item) returns always the unique item's index)
  id: index, x: lastNonHeapItemX - index * itemsXDistance, y: firstNonHeapItemY, parent: null, value: generateRandomNumber(), heapIndex: null
}))

// we reverse so that the last non heap item (with the largest x value) is the last one before the heap head in the array.
// We want this, because this is the structure that we use to find the compare item currently.
initialNonHeapItems.reverse()

const initialHeapItems = [
  {id: nonHeapItemsLength, x: heapHeadX, y: heapHeadY, value: 0, heapIndex: heapIndexStart},
  {id: nonHeapItemsLength+1, x: heapHeadX-heapItemsDistance*1.3, y: heapHeadY-heapItemsDistance, value: 0, heapIndex: heapIndexStart+1},
  {id: nonHeapItemsLength+2, x: heapHeadX+heapItemsDistance*1.3, y: heapHeadY-heapItemsDistance, value: 0, heapIndex: heapIndexStart+2},
  {id: nonHeapItemsLength+3, x: heapHeadX-heapItemsDistance*1.3-circleRadius*1.1, y: heapHeadY-heapItemsDistance*2.2, value: 0, heapIndex: heapIndexStart+3},
  {id: nonHeapItemsLength+4, x: heapHeadX-heapItemsDistance*1.3+circleRadius*1.1, y: heapHeadY-heapItemsDistance*2.2, value: 0, heapIndex: heapIndexStart+4},
  {id: nonHeapItemsLength+5, x: heapHeadX+heapItemsDistance*1.3-circleRadius*1.1, y: heapHeadY-heapItemsDistance*2.2, value: 0, heapIndex: heapIndexStart+5},
  {id: nonHeapItemsLength+6, x: heapHeadX+heapItemsDistance*1.3+circleRadius*1.1, y: heapHeadY-heapItemsDistance*2.2, value: 0, heapIndex: heapIndexStart+6},
]

const createInitialHeapItems = (heapSize) => {
  // generate initial heap items for a given heap size
  let items = []
  let x, y
  for (let i=0; i<heapSize; i++){
    let layer  // the layer of the heap (make it a function)
    for (let exp = 0; ; exp++) {
      // console.log("exp:", exp, "i+1/2**exp", i+1/2**exp, "i+1/Math.abs(2**(exp+1))", i+1/Math.abs(2**(exp+1)))
      // if (i/2**exp >= 1 && i/2**(exp+1) < 2 || i === 0) {
      if (2**exp <= i+1 && 2**(exp+1) > i+1 || i === 0) {
        layer = exp + 1
        break
      }
    }
    if (i === 0) {
      x = heapHeadX
      y = heapHeadY
    } else {
      const XDistance = i % 2 === 0 ? heapItemsDistance : - heapItemsDistance
      const YDistance = heapItemsDistance
      const parentIndex = Math.floor(Math.abs(i - 1) * 0.5)
      // todo kid nodes X coordinate isn't calculated properly. Currently they overlap
      x = items[parentIndex].x + XDistance * (1 - (layer - 1) / (5 - 1))
      y = items[parentIndex].y - YDistance
    }
    console.log("index:", i, "layer", layer)
    items.push({
      id: nonHeapItemsLength+1, x: x, y: y, value: 0, heapIndex: i+1
    })
    console.log(items)
  }
  return items
}

const initialItems = initialNonHeapItems.concat(initialHeapItems)

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  action: {
    marginBottom: theme.spacing(1),
    '& + &': {
      marginLeft: theme.spacing(1)
    },
    minWidth: 100,
    '@media (max-width:420px)': {
      minWidth: 70,
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5)
    },
    // another way to control css properties based on size, is by using the built in theme's breakpoints
    // material's UI xs breakpoint is 0-600 px so it doesn't fit for this case.
    // [theme.breakpoints.down('xs')]: {
    //   minWidth: 70,
    // },

    // from the element with class action, select the children elements with class SvgIcon
    '& .SvgIcon': {
      fontSize: '1.2rem',
      '@media (max-width:420px)': {
        fontSize: '0.8rem',
      }
    }
  },
}));

const MinHeapAnimation = ({algorithmId}) => {
  // the first item to be checked for comparison with the heap head, is the last item of the array
  const initialCompareItemIndex = nonHeapItemsLength - 1
  const getAllAlgorithmsStatus = useSelector(state => getAllStatusSelector(state))
  const algorithm = useSelector(state => algorithmByIdSelector(state, algorithmId))
  const classes = useStyles()
  const [frame, setFrame] = useState(initialItems)
  // const [heapData, setHeapData] = useState(initialHeapItems)
  // Maybe use dataItems.items as state and rerender the component whenever dataItems.items change?
  // Notice that if an object of the dataItems.items array changes, the items array itself doesn't
  const [dataItems, setDataItems] = useState(new DataItems(initialItems))
  const [speedMode, setSpeedMode] = useState("Very Fast")
  const [inPlayMode, setInPlayMode] = useState(false)
  const [currentIterationFinished, setCurrentIterationFinished] = useState(true)
  const [compareItemIndex, setCompareItemIndex] = useState(initialCompareItemIndex)
  // const [numIterations, setNumIterations] = useState(0)
  const theme = useTheme()
  const ref = useRef()

  const searchCompleted = dataItems.isSearchComplete()
  let pushToAndPopFromItems = false  //  no reason to add this to the state. It isn't used for rendering. Have in mind that it didn't work as expected when it was in state
  let wasItemCompared = false

  useEffect(() => {
    const circlesTheme = theme.heapCirclesTheme

    const svgElement = d3.select(ref.current)

    const lines = svgElement.selectAll("line")
      .data(initialHeapItems)
      .enter()
      .append("line")

    lines
      .attr("x1", d => d.x)
      .attr("y1", d => d.y)
      .attr("x2", d => {
        const parentIndex = dataItems.parentIndex(d.heapIndex-1)
        return initialHeapItems[parentIndex].x
      })
      .attr("y2", d => {
        const parentIndex = dataItems.parentIndex(d.heapIndex-1)
        return initialHeapItems[parentIndex].y
      })
      .attr("stroke", circlesTheme.lineStroke)
      .attr("stroke-width", 0.1)

    svgElement.selectAll("circle.numberCircle")
      // we change the d3 default "bind by index" method, and bind the dom elements to the data by the id data attribute
      // this way, when we want to swap two elements, we just swap their id and value data attributes. This, in turn,
      // means that the index of the items in the array does not change. This is important because the heap items
      // of the array remain always in their initial known indexes, and we can directly select them instead of searching through the
      // array.
      .data(frame, function(d) { return d ? d.id : this; })
      .join("circle")
      .transition().duration(frameTransitionDuration)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r",  circleRadius)
      .attr("class", "numberCircle")
      // .style("stroke", "red")
      // .style("stroke-width", .01)
      .style("fill-opacity", circlesTheme.circleFillOpacity)
      .style("fill", circlesTheme.circleFill)

    svgElement.selectAll("text.numberValue")
      // we change the d3 default "bind by index" method, and bind the dom elements to the data by the id data attribute
      .data(frame, function(d) { return d ? d.id : this; })
      .join("text")
      .transition().duration(frameTransitionDuration)
      .attr("dx", d => d.x)
      .attr("dy", d => d.y+circleTextSize/4)
      .attr("text-anchor", "middle")
      .attr("class", "numberValue")
      .text(d => d.value)
      .attr('font-size', circleTextSize)
      .style('fill', circlesTheme.circleTextFill)

    svgElement.selectAll("circle.heapCircle")
      .data(initialHeapItems)
      .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r",  heapCircleRadius)
      .attr("class", "heapCircle")
      // .style("stroke", "blue")
      // .style("stroke-width", 0.2)
      .style("fill-opacity", circlesTheme.heapCircleFillOpacity)
      .style("fill", circlesTheme.heapCircleFill)

    // Notice that one movement iteration can contain more than one animation frames. This means that the effect will run
    // for each frame within the same iteration. In these cases we don't want to reiterate. We only want to reiterate
    // when the previous iteration has finished.
    if (!searchCompleted && inPlayMode && currentIterationFinished) moveItems(dataItems, compareItemIndex)

  }, [
    frame, inPlayMode, currentIterationFinished, getAllAlgorithmsStatus,
    theme.name,  // theme.name so that every time the theme changes the effect runs and new circlesTheme is used
  ])

  const initialize = () => {
    setFrame(initialItems)
    // setHeapData(initialHeapItems)
    setDataItems(new DataItems(initialItems))
    setInPlayMode(false)
    setCurrentIterationFinished(true)
    setCompareItemIndex(initialCompareItemIndex)
    pushToAndPopFromItems = false
    wasItemCompared = false
    // setNumIterations(0)
  }

  const speedOptions = ["Slow", "Normal", "Fast", "Very Fast", "Maximum"]
  // const playModeOptions = ["Playing", "Paused"]
  const playButtonText = inPlayMode ? "Pause" : "Play"

  let frameTransitionDuration = 150

  if (speedMode === "Slow"){
    frameTransitionDuration = 1000
  } else if (speedMode === "Normal"){
    frameTransitionDuration = 600
  } else if (speedMode === "Fast"){
    frameTransitionDuration = 350
  } else if (speedMode === "Very Fast"){
    frameTransitionDuration = 150
  } else if (speedMode === "Maximum"){
    frameTransitionDuration = 0
  }

  const generateCurrentStepFrames = (dataItems, compareItemIndex) => {
    // we use the compareItemIndex to get directly the current compare item instead of looping through the items array
    // this improves time complexity from O(n) to O(1)
    // console.log("compareItemIndex", compareItemIndex)
    // console.log("compareItem", dataItems.items[compareItemIndex])
    if (dataItems.isCompareItemNextToHeapHead(compareItemIndex)) {
      wasItemCompared = true
      const item = dataItems.items[compareItemIndex]
      let heapHeadIndex = dataItems.heapHeadIndex
      let heapHead = dataItems.heapHead()
      if (item.value > heapHead.value) {
        dataItems.swap(compareItemIndex, heapHeadIndex)
        // after swapping, the compareItem (it's value and id) is in the heapHeadIndex position, so we pass that to the heapify function
        dataItems.reheap(heapHeadIndex)
        return dataItems.frameQueue
      }
    }
    dataItems.moveRight()
    return dataItems.frameQueue
  }

  const delay = ms => {
    // console.log("  delaying for:", ms)
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const animateQueue = async (frameQueue) => {
    // animate all frames of the queue, waiting between every frame so that d3 completes the animation
    if (!frameQueue.isEmpty()){
      const nextFrame = frameQueue.dequeue()
      setFrame(nextFrame)
      // if (frameQueue.isEmpty()) return
      await delay(frameTransitionDuration * 1.1)  // wait for the d3 frames transition to be completed
      // debugger
      await animateQueue(frameQueue)
    }
    // if (!play) throw "error"
  }

  const updateCompareItemIndex = () => {
    if (wasItemCompared) {
      // if the current item was the item to compare with the heap head, move the compareItemIndex
      // to the next item (which is the previous one in the list)
      setCompareItemIndex(prevIndex => {
        let newIndex = prevIndex - 1
        if (newIndex < 0) newIndex = 0
        return newIndex
      })
    }
    if (pushToAndPopFromItems) {
      // if we have pushed new item to the array, and popped the last non heap item,
      // we have to update the compareItemIndex so that it points to the same item as before the push and pop
      // console.log("increasing compareItemIndex + 1")
      setCompareItemIndex(prevIndex => prevIndex + 1)
    }
  }

  const moveItems = async (dataItems, compareItemIndex) => {
    pushToAndPopFromItems = false
    wasItemCompared = false
    setCurrentIterationFinished(false)
    console.log("Iterating...")
    console.log(dataItems.items)
    // setNumIterations(prevCount => prevCount + 1)
    const frameQueue = generateCurrentStepFrames(dataItems, compareItemIndex)
    // console.log(" Animating queue:", frameQueue)
    const promise = await animateQueue(frameQueue)
    console.log(" Queue animated")
    pushToAndPopFromItems = dataItems.pushToAndPopFromItems()
    updateCompareItemIndex()
    setCurrentIterationFinished(true)
    return promise
  }

  const onNextClick = () => {
    if (!searchCompleted && currentIterationFinished) moveItems(dataItems, compareItemIndex)
  }

  const onPlayClick = () => {
    setInPlayMode(prevPlaying => !prevPlaying)
  }

  const handleSpeedChange = (event) => {
    event.persist();
    setSpeedMode(event.target.value)
  }

  const onRestartClick = () => {
    initialize()
  }

  return (
    <Page
      className={classes.root}
      title="Animation"
    >
      <Container maxWidth="lg">
        <Box mt={1}>
          {getAllAlgorithmsStatus === ("idle") || getAllAlgorithmsStatus === ("loading") ? (
            <BoxedCircularProgress/>
          ) : (
          <Grid container>

            <Grid item xs={12} md={7}>
            <Box m={1}>

    <Card >
      <CardHeader title={algorithm.name + " Animation"}/>
      <Divider/>
      <CardContent>

      <svg
        viewBox={`0 0 ${svgViewBoxWidth} ${svgViewBoxHeight}`}
        ref={ref}
      />

      <Divider/>

      <Box mt={1}>
        <Grid container>
          <Box mb={1} mr={1}><Grid item >
            <Button
              className={classes.action}
              color="secondary"
              variant="contained"
              startIcon={
                <SvgIcon className='SvgIcon'>
                  {inPlayMode ? <PauseIcon /> : <PlayIcon />}
                </SvgIcon>
              }
              disabled={searchCompleted}
              onClick={() => onPlayClick()}
              >
              <Typography variant="h3">{playButtonText}</Typography>
            </Button>

            <Button
              className={classes.action}
              color="secondary"
              variant="contained"
              startIcon={
                <SvgIcon className='SvgIcon'>
                  <FastForwardIcon />
                </SvgIcon>
              }
              disabled={inPlayMode || searchCompleted || currentIterationFinished === false}
              onClick={onNextClick}
              >
              <Typography variant="h3">Next</Typography>
            </Button>

            <Button
              className={classes.action}
              color="secondary"
              variant="contained"
              startIcon={
                <SvgIcon className='SvgIcon'>
                  <RefreshCwIcon />
                </SvgIcon>
              }
              onClick={onRestartClick}
              >
              <Typography variant="h3">Restart</Typography>
            </Button>

          </Grid></Box>
          <Box mb={1}><Grid item >
            <Typography variant="h3">
            <TextField
              className={classes.action}
              variant="outlined"
              size="small"
              label="Speed"
              name="speed"
              onChange={handleSpeedChange}
              select
              SelectProps={{ native: true }}
              value={speedMode}
            >
              {speedOptions.map((speedOption) => (
                <option
                  key={speedOption}
                  value={speedOption}
                >
                  {speedOption}
                </option>
              ))}
            </TextField>
            </Typography>
          </Grid></Box>
        </Grid>
      </Box>

      </CardContent>
    </Card>
</Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box m={1}>
              <Card >
                    <CardHeader title={algorithm.name + " Description"}/>
                    <Divider/>
                    <CardContent>
                      <Typography align={"justify"}>
                        Heap sort is one of the most efficient sorting algorithms.
                        We use a min heap, a binary tree where the parent is smaller than its children and we compare all items of the array with the
                        heap's head, swapping them if the item is bigger. Then we re-heap the min heap so that it remains a min heap. This means
                        that the large item that was just swapped into the heap, will move down the heap to the deepest possible level.
                        We repeat this process until
                        all items of the array have been compared with the heap's head. At the end, we will end up with the largest items
                        of the array inside the min heap. This way we loop through the array one time to compare all items with the heap's head, an operation
                        of O(n) time complexity. If the item is bigger then the heap's head, we have to swap them and eventually re-heap, which is
                        an operation of O(log n) time complexity. So in the worst case scenario where we have a re-heap for every item, the total
                        time complexity is O(n log n). The fastest known sorting algorithm as far as the worst case is concerned.
                        There are a lot of practical applications for this type of sorting, like finding the most popular products on an e-commerce website,
                        the most relevant search results for a given query, the most relevant recommendations based on your interests etc.
                        The animation is performed with the amazing <Link target="_blank" variant="body2" color="secondary" href="https://d3js.org/">D3.js</Link> library.
                      </Typography>
                    </CardContent>
                  </Card>
              </Box>
            </Grid>

          </Grid>
                  )}
        </Box>
      </Container>
    </Page>
  )
}

export default MinHeapAnimation
