import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import Footer from './components/Footer'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import ListShows from './pages/admin/ListShows'
import AddShow from './pages/admin/AddShow'
import ListBookings from './pages/admin/ListBookings'



function App() {

  const isAdmin = useLocation().pathname.startsWith('/admin')
  return (
    <>
    {!isAdmin && <Navbar/>}     {/*dont show for admin*/}
     <Toaster/>
    <Routes>
     <Route path='/' element={<Home/>}/>
     <Route path='/movies' element={<Movies/>}/>
     <Route path='/movies/:id' element={<MovieDetails/>}/>
     <Route path='/movies/:id/:date' element={<SeatLayout/>}/>
     <Route path='/bookings' element={<MyBookings/>}/>
     <Route path='/favorite' element={<Favorite/>}/>
   
    {/*dont show for admin*/}
   <Route path="/admin/*" element={<Layout />}>
  <Route index element={<Dashboard />} />
  <Route path="list-shows" element={<ListShows />} />
  <Route path="add-shows" element={<AddShow />} />
  <Route path="list-bookings" element={<ListBookings />} />
   </Route>

    </Routes>

    <div className='mt-20'>
    {!isAdmin && <Footer/>}     
    </div>
      

    </>
  )
}

export default App
