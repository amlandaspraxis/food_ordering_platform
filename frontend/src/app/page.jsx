"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Star, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [restaurants, setRestaurants] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Breakfast');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const neStates = [
    'Arunachal Pradesh',
    'Assam',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Sikkim',
    'Tripura'
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [resRestaurants, resFood] = await Promise.all([
          api.get('/customer/restaurants'),
          api.get('/customer/food-items').catch(() => ({ data: { data: [] } }))
        ]);
        setRestaurants(resRestaurants.data.data);
        setFoodItems(resFood.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserProfile = async () => {
      if (isAuthenticated && !searchLocation) {
        try {
          const res = await api.get('/customer/profile');
          if (res.data.data.address?.state) {
            setSearchLocation(res.data.data.address.state);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };

    fetchInitialData();
    fetchUserProfile();
  }, [isAuthenticated, searchLocation]);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesLocation = !searchLocation ||
      restaurant.address?.city?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      restaurant.address?.state?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      restaurant.address?.street?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      restaurant.description?.toLowerCase().includes(searchLocation.toLowerCase());

    const matchesSearch = !searchQuery ||
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisines?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesLocation && matchesSearch;
  });

  const getFilteredFoodItems = () => {
    return foodItems.filter(item => {
      const cat = item.category?.toLowerCase() || '';
      switch (activeTab) {
        case 'Breakfast': return cat.includes('breakfast');
        case 'Lunch': return cat.includes('lunch') || cat.includes('main') || cat.includes('salad');
        case 'Dinner': return cat.includes('dinner') || cat.includes('main');
        case 'Snacks': return cat.includes('snack') || cat.includes('starter') || cat.includes('appetizer') || cat.includes('dessert') || cat.includes('beverage');
        default: return true;
      }
    }).slice(0, 8); // Limit to 8 items per tab
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-delfood-dark">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-delfood-blue/80 absolute z-10" />
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            className="w-full h-full bg-[url('https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070')] bg-cover bg-center"
          />
        </div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tight leading-tight font-['Cinzel',serif]">
              Deliciousness <br />
              <span className="text-delfood-yellow">Delivered </span>
              to you
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 font-medium max-w-2xl mx-auto">
              Find the best restaurants, cafes, and bars in your city.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white p-2 md:p-3 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2 max-w-4xl mx-auto"
          >
            <div className="flex-1 flex items-center px-6 py-3 border-b md:border-b-0 md:border-r border-gray-100">
              <Search className="text-delfood-blue w-6 h-6 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Restaurant Name or Cuisine"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-gray-800 focus:outline-none w-full placeholder-gray-400 font-semibold"
              />
            </div>
            <div className="flex-1 flex items-center px-6 py-3">
              <MapPin className="text-delfood-blue w-6 h-6 mr-3 shrink-0" />
              <select
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="bg-transparent border-none text-gray-800 focus:outline-none w-full font-semibold appearance-none cursor-pointer"
              >
                <option value="" disabled className="text-gray-400">Select State</option>
                {neStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                document.getElementById('restaurants').scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-delfood-yellow hover:bg-[#f9c51a] text-delfood-dark font-black px-10 py-4 rounded-xl md:rounded-full transition-all duration-300 shadow-lg uppercase tracking-wider text-base"
            >
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Popular Recipes Section */}
      <section id="recipes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-black mb-4 font-['Cinzel',serif] text-delfood-dark"
          >
            Popular <span className="text-delfood-blue">Recipes</span>
          </motion.h2>
          <div className="h-1 w-24 bg-delfood-yellow mx-auto mb-8" />

          <div className="flex justify-center gap-4 md:gap-8 overflow-x-auto pb-4 no-scrollbar">
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                  ? 'bg-delfood-blue text-white shadow-xl scale-105'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {getFilteredFoodItems().length > 0 ? getFilteredFoodItems().map((recipe, index) => (
            <motion.div
              key={recipe._id || index}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080'}
                  alt={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-delfood-yellow text-delfood-dark font-black px-4 py-2 rounded-xl shadow-lg">
                  ₹{recipe.price}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-delfood-dark mb-1 group-hover:text-delfood-blue transition-colors line-clamp-1">
                  {recipe.name}
                </h3>
                {recipe.restaurantId && (
                  <Link href={`/restaurant/${recipe.restaurantId._id}`} className="text-xs text-delfood-blue font-bold tracking-wider uppercase mb-3 hover:underline">
                    From {recipe.restaurantId.name}
                  </Link>
                )}
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                  {recipe.description || 'Delicious freshly prepared dish.'}
                </p>
                <Link href={`/restaurant/${recipe.restaurantId?._id}`} className="mt-auto block w-full">
                  <button className="w-full bg-gray-50 text-delfood-blue hover:bg-delfood-blue hover:text-white rounded-xl py-3 font-black uppercase text-xs tracking-widest flex items-center justify-center transition-all group-hover:shadow-md">
                    View Menu <Plus className="w-4 h-4 ml-2" />
                  </button>
                </Link>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-gray-50 rounded-3xl border border-gray-100">
              No items found for {activeTab} in your area right now.
            </div>
          )}
        </motion.div>
      </section>

      {/* About Us Section - Guest Only */}
      {!isAuthenticated && (
        <section id="about" className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row-reverse items-center gap-16">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <h2 className="text-5xl md:text-6xl font-black mb-6 font-['Cinzel',serif] text-delfood-dark">
                  About <span className="text-delfood-blue">Us</span>
                </h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  Welcome to <span className="font-bold text-delfood-blue">AHAR</span>, where we believe that great food should be accessible to everyone at any time. We partner with the best local restaurants to bring you a diverse range of cuisines right to your doorstep.
                </p>
                <ul className="space-y-4 mb-10">
                  {['Fresh and healthy food daily', 'Fast and reliable delivery', 'Easy online ordering system'].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-gray-700 font-bold">
                      <div className="w-6 h-6 rounded-full bg-delfood-yellow flex items-center justify-center shrink-0">
                        <Plus className="w-4 h-4 text-delfood-dark" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="bg-delfood-blue text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl">
                  Learn More
                </button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 flex justify-center"
              >
                <motion.img
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072"
                  alt="Floating Burger"
                  className="max-w-sm md:max-w-md drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]"
                />
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Top Restaurants */}
      <section id="restaurants" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50 rounded-[3rem] my-10 border border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-black mb-4 font-['Cinzel',serif] text-delfood-dark">Featured <span className="text-delfood-blue">Restaurants</span></h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Handpicked local favorites updated daily.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-80 animate-pulse bg-white border-none rounded-3xl overflow-hidden shadow-sm">
                <div className="h-48 bg-gray-100 w-full" />
                <div className="p-6">
                  <div className="h-8 bg-gray-100 rounded-lg w-3/4 mb-4" />
                  <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {filteredRestaurants.length > 0 ? filteredRestaurants.map((restaurant) => (
              <motion.div key={restaurant._id} variants={itemVariants}>
                <Link href={`/restaurant/${restaurant._id}`}>
                  <motion.div
                    whileHover={{ y: -12 }}
                    className="group bg-white h-full flex flex-col group cursor-pointer border-none rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 p-0"
                  >
                    <div className="relative h-56 w-full overflow-hidden">
                      <img
                        src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070'}
                        alt={restaurant.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute top-5 left-5 flex gap-2">
                        {restaurant.isCurrentlyOpen ? (
                          <span className="bg-success text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">
                            OPEN
                          </span>
                        ) : (
                          <span className="bg-error text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">
                            CLOSED
                          </span>
                        )}
                        <span className="bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase">
                          {restaurant.deliveryTime} MIN
                        </span>
                      </div>
                    </div>

                    <div className="p-7 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-2xl font-black text-delfood-dark tracking-tight group-hover:text-delfood-blue transition-colors font-['Cinzel',serif]">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center bg-delfood-yellow text-delfood-dark px-2 py-1 rounded-lg text-sm font-black">
                          <span>{restaurant.rating.toFixed(1)}</span>
                          <Star className="w-3.5 h-3.5 ml-1 fill-current" />
                        </div>
                      </div>
                      <p className="text-gray-500 font-medium text-sm mb-6 line-clamp-1">
                        {restaurant.cuisines?.join(' • ')}
                      </p>

                      <div className="mt-auto flex items-center justify-between text-xs font-bold text-gray-400 tracking-wider uppercase border-t border-gray-100 pt-5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-delfood-blue" />
                          <span>Fast Delivery</span>
                        </div>
                        <div className="text-delfood-dark">
                          ${restaurant.deliveryFee.toFixed(2)} Fee
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            )) : (
              <div className="col-span-1 border border-gray-100 rounded-3xl p-8 text-center bg-white">
                <p className="text-gray-500">No restaurants available yet. Be the first to add one!</p>
              </div>
            )}
          </motion.div>
        )}
      </section>
      {/* Latest News Section - Guest Only */}
      {!isAuthenticated && (
        <section id="news" className="py-24 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-6xl font-black mb-4 font-['Cinzel',serif] text-delfood-dark"
              >
                Latest <span className="text-delfood-blue">News</span>
              </motion.h2>
              <div className="h-1 w-24 bg-delfood-yellow mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: 'The Art of Perfect Pizza Crust',
                  date: 'March 04, 2026',
                  image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070',
                  excerpt: 'Discover the secrets behind the most crispy and delicious pizza crusts from our top chefs.'
                },
                {
                  title: 'Top 10 Healthy Breakfast Ideas',
                  date: 'March 02, 2026',
                  image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=2070',
                  excerpt: 'Start your day right with these nutritious and tasty breakfast recipes that are easy to make.'
                },
                {
                  title: 'Sustainable Food Trends in 2026',
                  date: 'Feb 28, 2026',
                  image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2070',
                  excerpt: 'Explore how the culinary world is moving towards more sustainable and eco-friendly practices.'
                }
              ].map((news, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="relative h-64 rounded-3xl overflow-hidden mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-delfood-dark/80 to-transparent">
                      <button className="text-white font-bold text-sm uppercase tracking-widest flex items-center">
                        Read More <Plus className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                  <div className="text-delfood-blue font-bold text-xs uppercase tracking-widest mb-3">
                    {news.date}
                  </div>
                  <h3 className="text-2xl font-black text-delfood-dark mb-4 group-hover:text-delfood-blue transition-colors font-['Cinzel',serif] leading-tight">
                    {news.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed line-clamp-2">
                    {news.excerpt}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
