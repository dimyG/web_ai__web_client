import React, {useEffect, useState} from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  CardHeader,
  Checkbox,
  Divider,
  IconButton,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  makeStyles, Button, CircularProgress, CardContent
} from '@material-ui/core';
import {
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  ArrowRight as ArrowRightIcon
} from 'react-feather';
import Label from 'src/components/Label';
import GenericMoreButton from 'src/components/GenericMoreButton';
import BulkOperations from './BulkOperations';
import {useDispatch, useSelector} from "react-redux";
import {
  deleteAlgorithmThunk,
  deleteAlgorithmsThunk,
  getAllStatusSelector
} from "../algorithmsSlice";
import BoxedCircularProgress from "../../../components/BoxedCircularProgress";
import {csrfSelector} from "../../csrf/csrfSlice";

const getStatusLabel = (paymentStatus) => {
  const map = {
    canceled: {
      text: 'Canceled',
      color: 'error'
    },
    completed: {
      text: 'Completed',
      color: 'success'
    },
    pending: {
      text: 'Pending',
      color: 'warning'
    },
    rejected: {
      text: 'Rejected',
      color: 'error'
    }
  };

  const { text, color } = map[paymentStatus];

  return (
    <Label color={color}>
      {text}
    </Label>
  );
};

const applyPagination = (orders, page, limit) => {
  return orders.slice(page * limit, page * limit + limit);
};

const useStyles = makeStyles(() => ({
  root: {}
}));

const Results = ({ className, items, ...rest }) => {
  const classes = useStyles();
  const dispatch = useDispatch()
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const getAllStatus = useSelector(state => getAllStatusSelector(state))
  const csrfToken = useSelector(state => csrfSelector(state))

  const handleSelectAllOrders = (event) => {
    setSelectedOrders(event.target.checked
      ? items.map((order) => order.id)
      : []);
  };

  const handleSelectOneOrder = (event, orderId) => {
    if (!selectedOrders.includes(orderId)) {
      setSelectedOrders((prevSelected) => [...prevSelected, orderId]);
    } else {
      setSelectedOrders((prevSelected) => prevSelected.filter((id) => id !== orderId));
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value));
  };

  const paginatedOrders = applyPagination(items, page, limit);
  const enableBulkOperations = selectedOrders.length > 0;
  const selectedSomeOrders = selectedOrders.length > 0 && selectedOrders.length < items.length;
  const selectedAllOrders = selectedOrders.length === items.length;

  const onDeletePressed = async id => {
    await dispatch(deleteAlgorithmThunk({"id": id, "csrfToken": csrfToken}))
  }

  const onDeleteManyPressed = async () => {
    await dispatch(deleteAlgorithmsThunk({"ids": selectedOrders, "csrfToken": csrfToken}))
    setSelectedOrders([])  // empty the selected items list state variable so that the Drawer closes
  }

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Card>
        <CardHeader
          // action={<GenericMoreButton />}
          title="Algorithms"
        />
        <Divider />
        <PerfectScrollbar>
          <Box minWidth={350}>
            {getAllStatus === "loading" ? (
              <BoxedCircularProgress/>
              ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedAllOrders}
                      indeterminate={selectedSomeOrders}
                      onChange={handleSelectAllOrders}
                    />
                  </TableCell>
                  <TableCell>
                    Name
                  </TableCell>
                  {/*<TableCell>*/}
                  {/*  Customer*/}
                  {/*</TableCell>*/}
                  {/*<TableCell>*/}
                  {/*  Method*/}
                  {/*</TableCell>*/}
                  {/*<TableCell>*/}
                  {/*  Total*/}
                  {/*</TableCell>*/}
                  {/*<TableCell>*/}
                  {/*  Status*/}
                  {/*</TableCell>*/}
                  <TableCell align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order) => {
                  const isOrderSelected = selectedOrders.includes(order.id);

                  return (
                    <TableRow
                      key={order.id}
                      selected={selectedOrders.indexOf(order.id) !== -1}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isOrderSelected}
                          onChange={(event) => handleSelectOneOrder(event, order.id)}
                          value={isOrderSelected}
                        />
                      </TableCell>
                      <TableCell>
                        {order.name}
                        {/*<Typography*/}
                        {/*  variant="body2"*/}
                        {/*  color="textSecondary"*/}
                        {/*>*/}
                        {/*  {moment(order.createdAt).format('DD MMM YYYY | hh:mm')}*/}
                        {/*</Typography>*/}
                      </TableCell>
                      {/*<TableCell>*/}
                      {/*  {order.customer.name}*/}
                      {/*</TableCell>*/}
                      {/*<TableCell>*/}
                      {/*  {order.paymentMethod}*/}
                      {/*</TableCell>*/}
                      {/*<TableCell>*/}
                      {/*  {numeral(order.totalAmount).format(`${order.currency}0,0.00`)}*/}
                      {/*</TableCell>*/}
                      {/*<TableCell>*/}
                      {/*  {getStatusLabel(order.status)}*/}
                      {/*</TableCell>*/}
                      <TableCell align="right">
                        <IconButton
                          component={RouterLink}
                          to={"/algorithms/"+order.id}
                        >
                          <SvgIcon fontSize="small">
                            <EditIcon />
                          </SvgIcon>
                        </IconButton>
                        <IconButton
                          onClick={() => onDeletePressed(order.id)}
                        >
                          <SvgIcon fontSize="small">
                            <DeleteIcon />
                          </SvgIcon>
                        </IconButton>
                        {/*<IconButton*/}
                        {/*  component={RouterLink}*/}
                        {/*  to="/app/management/items/1"*/}
                        {/*>*/}
                        {/*  <SvgIcon fontSize="small">*/}
                        {/*    <ArrowRightIcon />*/}
                        {/*  </SvgIcon>*/}
                        {/*</IconButton>*/}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
              )}
          </Box>
        </PerfectScrollbar>
        <TablePagination
          component="div"
          count={items.length}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>
      <Typography
        color="textSecondary"
        gutterBottom
        variant="body2"
      >
        {items.length}
        {' '}
        Records found. Page
        {' '}
        {page + 1}
        {' '}
        of
        {' '}
        {Math.ceil(items.length / limit)}
      </Typography>
      <BulkOperations
        open={enableBulkOperations}
        selected={selectedOrders}
        onDelete={() => onDeleteManyPressed()}
      />
    </div>
  );
};

Results.propTypes = {
  className: PropTypes.string,
  orders: PropTypes.array.isRequired
};

Results.defaultProps = {
  orders: []
};

export default Results;
