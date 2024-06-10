/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Container,
  TableContainer,
  Paper,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardMedia,
  TablePagination,
  Badge,
} from '@mui/material';
import { Menu as MenuIcon, ShoppingBasket as BasketIcon, Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import logo from './assets/federal-svg.svg';
import LoginPage from './LoginPage';
import Board from './Board';
import './App.css';

const UserCreationModal = ({ isOpen, onClose, onSubmit, user }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedUser = Object.fromEntries(formData.entries());
    onSubmit(updatedUser);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{user ? 'Edit User' : 'Create User'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            type="text"
            name="name"
            defaultValue={user ? user.name : ''}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            name="email"
            defaultValue={user ? user.email : ''}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Username"
            type="text"
            name="username"
            defaultValue={user ? user.username : ''}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Phone"
            type="text"
            name="phone"
            defaultValue={user ? user.phone : ''}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Website"
            type="text"
            name="website"
            defaultValue={user ? user.website : ''}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
          <Button type="submit" color="primary">
            {user ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const ProductDetailModal = ({ isOpen, onClose, product, onAddToBasket, onBuy, onIncrement, onDecrement, quantity }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{product?.title}</DialogTitle>
      <DialogContent>
        {product && (
          <>
            <Typography variant="h5">{product.title}</Typography>
            <Typography variant="body1">{product.description}</Typography>
            <Typography variant="body2">Narxi: ${product.price}</Typography>
            <Typography variant="body2">Category: {product.category}</Typography>
            <CardMedia component="img" height="200" image={product.image}  alt={product.title} />
            <DialogActions>
              <IconButton onClick={() => onDecrement(product)} color="primary">
                <RemoveIcon />
              </IconButton>
              <Typography>{quantity}</Typography>
              <IconButton onClick={() => onIncrement(product)} color="primary">
                <AddIcon />
              </IconButton>
              <Button onClick={() => onAddToBasket(product)} color="primary">
                <h4>Savatga {`Qo'shish`}</h4>
              </Button>
             
            </DialogActions>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
        Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const BasketModal = ({ isOpen, onClose, basket, onRemove, onIncrement, onDecrement }) => (
  <Dialog open={isOpen} onClose={onClose}>
    <DialogTitle>Savat</DialogTitle>
    <DialogContent>
      {basket.length === 0 ? (
        <Typography>Sizning Savatingiz {`Bo'sh`}</Typography>
      ) : (
        basket.map((item) => (
          <Card key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6">{item.title}</Typography>
              <Typography variant="body2">Narxi: ${item.price}</Typography>
              <Typography variant="body2">Umumiy son: {item.quantity}</Typography>
              <div>
                <IconButton onClick={() => onDecrement(item)} color="primary">
                  <RemoveIcon />
                </IconButton>
                <Typography>{item.quantity}</Typography>
                <IconButton onClick={() => onIncrement(item)} color="primary">
                  <AddIcon />
                </IconButton>
              </div>
            </CardContent>
            <CardMedia component="img" height="200" image={item.image} alt={item.title} />
            <IconButton onClick={() => onRemove(item)} color="secondary">
              <DeleteIcon />
            </IconButton>
          </Card>
        ))
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
      Yopish
      </Button>
    </DialogActions>
  </Dialog>
);


function App() {
  
  const [data, setData] = useState([]);
  const [searchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(85);
  const [theme, setTheme] = useState('light');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [basket, setBasket] = useState([]);
  const [isBasketModalOpen, setIsBasketModalOpen] = useState(false);
  const [productQuantities, setProductQuantities] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [page, setPage] = useState('');

 

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (page !== 'home') {
      fetchData(page);
    }
  }, [page]);

  const fetchData = (type) => {
    let url = `https://jsonplaceholder.typicode.com/${type}`;
    if (type === 'photos') {
      url = 'https://fakestoreapi.com/products';
    }
    if (searchQuery) {
      url += `?q=${searchQuery}`;
    }
    fetch(url)
      .then((response) => response.json())
      .then((data) => setData(data));
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleProductCardClick = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddToBasket = (product) => {
    setBasket((prevBasket) => {
      const existingProduct = prevBasket.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevBasket.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + productQuantities[product.id] || 1 } : item
        );
      }
      return [...prevBasket, { ...product, quantity: productQuantities[product.id] || 1 }];
    });
    setSnackbarMessage('Mahsulot savatga qo`shildi');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleBuyProduct = (product, quantity) => {
  };

  const handleIncrement = (product) => {
    setProductQuantities((prevQuantities) => ({
      ...prevQuantities,
      [product.id]: (prevQuantities[product.id] || 0) + 1,
    }));
    setBasket((prevBasket) =>
      prevBasket.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrement = (product) => {
    setProductQuantities((prevQuantities) => ({
      ...prevQuantities,
      [product.id]: Math.max((prevQuantities[product.id] || 0) - 1, 0),
    }));
    setBasket((prevBasket) =>
      prevBasket.map((item) =>
        item.id === product.id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const handleRemoveFromBasket = (product) => {
    setBasket((prevBasket) => prevBasket.filter((item) => item.id !== product.id));
    setSnackbarMessage('Product removed from basket');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const renderPage = () => {
    const start = currentPage * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    if (page === 'users') {
      return <Board />;
    } else if (['posts', 'comments', 'albums', 'photos', 'todos'].includes(page)) {
      return (
        <Container sx={{ my: 13, ml: 30 }}>
          <Container sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {paginatedData.map((item) => (
              <Card
                key={item.id}
                sx={{ maxWidth: 350, marginBottom: 2, gap: 2, border: '1px solid #007bff',  cursor: 'pointer' }}
                onClick={() => handleProductCardClick(item)}
              >
                <CardContent>
                  <Typography variant="h5">
                    {page === 'photos'
                      ? item.title
                      : page === 'posts' || page === 'albums' || page === 'todos'
                      ? item.title
                      : item.name}
                  </Typography>
                  {page !== 'photos' && <Typography variant="body1">{item.body}</Typography>}
                  {page === 'comments' && <Typography variant="body2">Email: {item.email}</Typography>}
                  <Typography variant="body2">ID: {item.id}</Typography>
                  {page === 'albums' && <Typography variant="body2">User ID: {item.userId}</Typography>}
                  {page === 'photos' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <Typography variant="body2">Narxi: ${item.price}</Typography>
                      <CardMedia component="img"  sx={{width: "100%"}} height="300" image={item.image} alt={item.title} />
                      <Typography variant="body2">Category: {item.category}</Typography>
                      <Typography variant="body2">Description: {item.description}</Typography>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </Container> 
          <TablePagination
            rowsPerPageOptions={[85, 115, 155]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={currentPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Container>
      );
    }
    return null;
  };

  const handleUserCreation = (user) => {
    if (editingUser) {
      const updatedData = data.map((u) => (u.id === editingUser.id ? { ...u, ...user } : u));
      setData(updatedData);
      setSnackbarMessage('User updated successfully');
      setSnackbarSeverity('success');
    } else {
      const newUser = { ...user, id: data.length + 1 };
      setData([...data, newUser]);
      setSnackbarMessage('User created successfully');
      setSnackbarSeverity('success');
    }
    setPage('users');
    setSnackbarOpen(true);
  };

  const handleDeleteUser = (id) => {
    setData(data.filter((user) => user.id !== id));
    setSnackbarMessage('User deleted successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setSnackbarMessage('Login successful');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
   
      <div>
        <AppBar position="fixed"  > 
          <Toolbar>
            <img src={logo} alt="logo" style={{ height: 40 }} />
            <Container sx={{ml:0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton  edge="start" color="inherit" aria-label="menu" onClick={() => setSidebarVisible(!sidebarVisible)}>
              <MenuIcon />
            </IconButton>
            <div>
              <Button color="inherit" onClick={() => setPage('#')}>
                HOME
              </Button>
              <Button color="inherit" onClick={() => setPage('#')}>
                ABOUT
              </Button>
              <Button color="inherit" onClick={() => setPage('#')}>
                CONTACT US
              </Button>
              <Button color="inherit" onClick={() => setPage('#')}>
                CAREERS
              </Button>
              
              <IconButton color="inherit" onClick={() => setIsBasketModalOpen(true)}>
                <Badge badgeContent={basket.length} color="secondary">
                  <BasketIcon />
                </Badge>
              </IconButton>
            </div>
            </Container>
          </Toolbar>
        </AppBar>
        <Container>
      <Button onClick={() => setSidebarVisible(true)}>Open Sidebar</Button>
      <Drawer variant="persistent" anchor="left" open={sidebarVisible} onClose={() => setSidebarVisible(false)}>
        <List className="list" sx={{marginTop: "50px", width:"200px"}}>
          <ListItem
            button
            onClick={() => {
              setPage('photos');
              fetchData('photos');
            }}
          >
            <ListItemText primary="PRODUCTS" />
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setPage('users');
              fetchData('users');
            }}
          >
            <ListItemText primary="USERS" />
          </ListItem>
        </List>
      </Drawer>
    </Container>

        <UserCreationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleUserCreation}
          user={editingUser}
        />
        <ProductDetailModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          product={selectedProduct}
          onAddToBasket={handleAddToBasket}
          onBuy={handleBuyProduct}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          quantity={productQuantities[selectedProduct?.id] || 0}
        />
        <BasketModal
          isOpen={isBasketModalOpen}
          onClose={() => setIsBasketModalOpen(false)}
          basket={basket}
          onRemove={handleRemoveFromBasket}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />
        <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        {renderPage()}
      </div>
   
  );
}





export default App;
//